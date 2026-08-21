// Run as Fly's release_command (see fly.toml) — a one-off machine that runs
// this to completion, using the same deployed image, before the new
// version's machines start serving traffic. Deliberately plain JS with no
// path aliases/TS build step: it only needs to exist inside the slim
// standalone runtime image, which has a pruned node_modules and no
// TypeScript toolchain.
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const connection = process.env.DRIZZLE_DATABASE_URL;
if (!connection) {
  console.error("[migrate] DRIZZLE_DATABASE_URL is not set");
  process.exit(1);
}

// A single short-lived connection is correct here, unlike the main app —
// this process runs one batch of migrations and exits.
const client = postgres(connection, { max: 1 });
const db = drizzle(client);

console.log("[migrate] running pending migrations...");
try {
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("[migrate] done.");
} catch (err) {
  console.error("[migrate] failed:", err);
  process.exitCode = 1;
} finally {
  await client.end();
}
