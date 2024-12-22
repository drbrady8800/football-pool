import 'server-only';

import { pgEnum } from 'drizzle-orm/pg-core';
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const getDb = () => {
  if (process.env.NODE_ENV === "development") {
    const drizzleNodePostgres = require("drizzle-orm/node-postgres");
    const pg = require("pg");

    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    return drizzleNodePostgres.drizzle({ client: pool });
  } else {
    const vercelPostgres = require("@vercel/postgres");
    const drizzleVercelPostgres = require("drizzle-orm/vercel-postgres");

    return drizzleVercelPostgres.drizzle(vercelPostgres.sql);
  }
}

export const db = getDb();

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);
