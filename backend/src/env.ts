// Must be at the very top to load environment variables before anything else
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Set defaults if not in .env
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://reachbox:reachbox123@localhost:5432/reachbox';
}
if (!process.env.REDIS_HOST) {
  process.env.REDIS_HOST = 'localhost';
}
if (!process.env.REDIS_PORT) {
  process.env.REDIS_PORT = '6379';
}

// Debug: log environment
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
