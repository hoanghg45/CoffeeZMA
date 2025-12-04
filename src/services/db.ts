import { Pool } from "@neondatabase/serverless";

// Note: In a real production app, use environment variables.
// For ZMP, these would likely be injected at build time or fetched from a secure backend.
const CONNECTION_STRING = "postgresql://neondb_owner:npg_isULh8uRDq7j@ep-broad-frost-a1qj1k5d-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

export const pool = new Pool({
  connectionString: CONNECTION_STRING,
});

