import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

let _sql: NeonQueryFunction<false, false> | undefined;
let _db: NeonHttpDatabase<typeof schema> | undefined;

function init() {
  if (_db) return { sql: _sql!, db: _db };
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is required");
  _sql = neon(url);
  _db = drizzle({ client: _sql, schema });
  return { sql: _sql, db: _db };
}

export function getDb() {
  return init().db;
}

export function getSql() {
  return init().sql;
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop) {
    return (init().db as any)[prop];
  },
});
