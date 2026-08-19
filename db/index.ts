import 'dotenv/config';
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "./schema";

const connection = process.env.DRIZZLE_DATABASE_URL as string;
// `max: 1` capped the entire app to a single Postgres connection, serializing
// every concurrent query across every request onto it — including the
// Promise.all()s used throughout the app, which only parallelize if there's
// more than one connection to run on. Production talks to Neon's pooler
// (already multiplexes upstream), so this is just the app's own client-side
// pool for a long-lived `next start` server, not a serverless cold-start guard.
const queryClient = postgres(connection, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});
export const databaseDrizzle = drizzle(queryClient, { schema });
export const migrateToLatest = async () => {
  await migrate(databaseDrizzle, { migrationsFolder: "drizzle" });
};
