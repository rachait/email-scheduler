import { Queue, JobsOptions } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const emailQueue = new Queue('email', { connection });

export const addEmailJob = async (
  data: {
    to: string;
    subject: string;
    text: string;
    sender: string;
    dbId: number;
    userId: number;
  },
  opts: JobsOptions
) => {
  // Use jobId for idempotency - prevents duplicate jobs
  const jobId = `email-${data.dbId}`;
  try {
    await emailQueue.add('sendEmail', data, {
      ...opts,
      jobId,
      removeOnComplete: true,
      removeOnFail: false,
    });
    console.log(`📬 Job queued: ${jobId}`);
  } catch (error) {
    console.error(`Failed to queue job ${jobId}:`, error);
    throw error;
  }
};
