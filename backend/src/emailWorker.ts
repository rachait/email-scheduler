import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { prisma } from './prismaClient';

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const startEmailWorker = () => {
  const worker = new Worker(
    'email',
    async (job) => {
      const { to, subject, text, sender, dbId } = job.data;

      try {
        // Check rate limit
        const sender_normalized = sender.toLowerCase();
        const hourWindow = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
        const key = `email_rate:${sender_normalized}:${hourWindow}`;
        const maxPerHour = Number(process.env.MAX_EMAILS_PER_HOUR) || 200;

        const count = await redisClient.incr(key);
        await redisClient.expire(key, 3600); // 1 hour expiry

        if (count > maxPerHour) {
          // Rate limit exceeded - reschedule for next hour
          const now = new Date();
          const nextHour = new Date(now.getTime() + 3600000);
          nextHour.setMinutes(0, 0, 0);

          // BullMQ 5+ expects timestamp as number for moveToDelayed
          await job.moveToDelayed(nextHour.getTime(), 0 as any);
          await redisClient.decr(key);
          return;
        }

        // Apply delay between emails
        const delayMs = Number(process.env.EMAIL_SEND_DELAY) || 2000;
        await sleep(delayMs);

        // Send email
        const info = await transporter.sendMail({
          from: sender,
          to,
          subject,
          text,
          html: `<p>${text}</p>`,
        });

        console.log(`✓ Email sent: ${info.messageId} to ${to}`);

        // Update database
        await Promise.all([
          prisma.scheduledEmail.update({
            where: { id: dbId },
            data: { status: 'sent' },
          }),
          prisma.sentEmail.create({
            data: {
              userId: job.data.userId,
              to,
              subject,
              body: text,
              sender,
              sentAt: new Date(),
              status: 'sent',
            },
          }),
        ]);
      } catch (error) {
        console.error(`✗ Failed to send email to ${to}:`, error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        await Promise.all([
          prisma.scheduledEmail.update({
            where: { id: dbId },
            data: { status: 'failed' },
          }),
          prisma.sentEmail.create({
            data: {
              userId: job.data.userId,
              to,
              subject,
              body: text,
              sender,
              sentAt: new Date(),
              status: 'failed',
              error: errorMessage,
            },
          }),
        ]);

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: Number(process.env.WORKER_CONCURRENCY) || 5,
    }
  );

  worker.on('completed', (job) => {
    console.log(`✓ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`✗ Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  console.log('📧 Email worker started with concurrency:', Number(process.env.WORKER_CONCURRENCY) || 5);

  return worker;
};
