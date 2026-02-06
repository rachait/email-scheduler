// Load environment variables FIRST
import './env';

import express from 'express';
import cors from 'cors';
import { prisma } from './prismaClient';
import { addEmailJob } from './queue';
import { startEmailWorker } from './emailWorker';

const app = express();
app.use(express.json());

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL, // Set in production environment
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches vercel.app domain
    if (allowedOrigins.includes(origin) || origin.includes('.vercel.app') || origin.includes('.railway.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true
}));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'ReachBox Email Scheduler API', status: 'running' });
});

// Auth: Generate token (mock for now - will use Google OAuth in production)
app.post('/auth/token', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: name || email.split('@')[0] },
      });
    }

    res.json({
      token: Buffer.from(`${user.id}:${user.email}`).toString('base64'),
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ error: 'Auth failed' });
  }
});

// Get current user (requires auth)
const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const [userId] = Buffer.from(token, 'base64').toString().split(':');
    req.userId = parseInt(userId);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/auth/me', authMiddleware, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Schedule single email
app.post('/emails', authMiddleware, async (req: any, res) => {
  const { to, subject, body, sender, scheduledAt } = req.body;
  if (!to || !subject || !body || !sender || !scheduledAt) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, body, sender, scheduledAt' });
  }

  try {
    const scheduled = new Date(scheduledAt);
    if (scheduled < new Date()) {
      return res.status(400).json({ error: 'scheduledAt must be in the future' });
    }

    const email = await prisma.scheduledEmail.create({
      data: {
        to,
        subject,
        body,
        sender,
        scheduledAt: scheduled,
        userId: req.userId,
        status: 'scheduled',
      },
    });

    const delay = scheduled.getTime() - Date.now();
    await addEmailJob(
      { to, subject, text: body, sender, dbId: email.id, userId: req.userId },
      { delay }
    );

    res.status(201).json(email);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to schedule email' });
  }
});

// Bulk schedule emails from CSV
app.post('/emails/bulk', authMiddleware, async (req: any, res) => {
  const { recipients, subject, body, sender, scheduledAt, delayBetween } = req.body;
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'recipients must be a non-empty array' });
  }
  if (!subject || !body || !sender || !scheduledAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const scheduled = new Date(scheduledAt);
    if (scheduled < new Date()) {
      return res.status(400).json({ error: 'scheduledAt must be in the future' });
    }

    const baseDelay = scheduled.getTime() - Date.now();
    const delayBetweenEmails = delayBetween || 0;
    const emails = [];

    for (let i = 0; i < recipients.length; i++) {
      const to = recipients[i];
      const emailScheduledAt = new Date(baseDelay + i * delayBetweenEmails);

      const email = await prisma.scheduledEmail.create({
        data: {
          to,
          subject,
          body,
          sender,
          scheduledAt: emailScheduledAt,
          userId: req.userId,
          status: 'scheduled',
        },
      });

      const delay = emailScheduledAt.getTime() - Date.now();
      await addEmailJob(
        { to, subject, text: body, sender, dbId: email.id, userId: req.userId },
        { delay: Math.max(0, delay) }
      );

      emails.push(email);
    }

    res.status(201).json({ count: emails.length, emails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to schedule bulk emails' });
  }
});

// Get scheduled emails for user
app.get('/emails/scheduled', authMiddleware, async (req: any, res) => {
  try {
    const emails = await prisma.scheduledEmail.findMany({
      where: { userId: req.userId },
      orderBy: { scheduledAt: 'asc' },
    });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scheduled emails' });
  }
});

// Get sent emails for user
app.get('/emails/sent', authMiddleware, async (req: any, res) => {
  try {
    const emails = await prisma.sentEmail.findMany({
      where: { userId: req.userId },
      orderBy: { sentAt: 'desc' },
    });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sent emails' });
  }
});

// Cancel scheduled email
app.delete('/emails/:id', authMiddleware, async (req: any, res) => {
  try {
    const email = await prisma.scheduledEmail.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!email || email.userId !== req.userId) {
      return res.status(404).json({ error: 'Email not found' });
    }
    if (email.status !== 'scheduled') {
      return res.status(400).json({ error: 'Can only cancel scheduled emails' });
    }

    await prisma.scheduledEmail.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'cancelled' },
    });

    res.json({ message: 'Email cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel email' });
  }
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 ReachBox Email Scheduler running on port ${PORT}`);
});

// Start email worker
startEmailWorker();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    prisma.$disconnect();
    process.exit(0);
  });
});
