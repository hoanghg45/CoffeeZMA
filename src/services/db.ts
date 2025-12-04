import { Pool } from "@neondatabase/serverless";

// Database connection string from environment variable
// Set VITE_DATABASE_URL in your .env file
const CONNECTION_STRING = import.meta.env.VITE_DATABASE_URL;

if (!CONNECTION_STRING) {
  throw new Error(
    "VITE_DATABASE_URL environment variable is required. Please set it in your .env file."
  );
}

export const pool = new Pool({
  connectionString: CONNECTION_STRING,
});

