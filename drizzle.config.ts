import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load the .env.local file
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: './db/schema/*.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!
  }
});
