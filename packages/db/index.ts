import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection string from your .env file
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in your .env file!");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });

// Export the db instance with the schema attached for type-safe queries
export const db = drizzle(client, { schema });

// Export all the schema definitions so other packages can use them
export * from './schema';