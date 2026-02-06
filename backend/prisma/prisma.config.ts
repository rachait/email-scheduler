import { defineConfig } from '@prisma/cli';
import path from 'path';
import dotenv from 'dotenv';

// Load env first
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const config = defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://reachbox:reachbox123@localhost:5432/reachbox',
    },
  },
});

export default config;
