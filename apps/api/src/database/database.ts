import { mkdirSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { env } from "../config/env.js";

const MIGRATIONS_FOLDER = path.join(import.meta.dirname, "../../drizzle");

mkdirSync(path.dirname(env.DATABASE_FILE), { recursive: true });

const sqlite = new Database(env.DATABASE_FILE);

sqlite.pragma("foreign_keys = ON");

export const database = drizzle({ client: sqlite });

migrate(database, { migrationsFolder: MIGRATIONS_FOLDER });
