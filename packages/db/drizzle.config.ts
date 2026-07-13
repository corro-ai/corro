import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Tell dotenv to look two folders up for the .env file
dotenv.config({ path: '../../.env' });

export default defineConfig({
  schema: './schema.ts',
  out: '../../supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});