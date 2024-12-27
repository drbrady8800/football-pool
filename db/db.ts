import 'server-only';

import schema from '@/db/schema';
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const getDb = () => {
  if (process.env.VERCEL_ENV === "development") {
    const { drizzle } = require("drizzle-orm/node-postgres");
    const { Pool } = require("pg");

    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL
    });
    return drizzle(pool, { schema });
  } else {
    const { sql } = require("@vercel/postgres");
    const { drizzle } = require("drizzle-orm/vercel-postgres");

    return drizzle(sql, { schema });
  }
}

const db = getDb();

export default db;
