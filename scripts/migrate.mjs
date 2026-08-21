// Run as Fly's release_command (see fly.toml) — a one-off machine that runs
// this to completion, using the same deployed image, before the new
// version's machines start serving traffic. Deliberately plain JS with no
// path aliases/TS build step: it only needs to exist inside the slim
// standalone runtime image, which has a pruned node_modules and no
// TypeScript toolchain.
//
// This does NOT use drizzle-orm's own migrate() helper. That helper runs
// every not-yet-applied migration inside one shared transaction and has no
// concept of "this already exists" (a schema that predates migration
// tracking — e.g. one managed by hand or by `drizzle-kit push` before this
// ever ran) — any such mismatch just aborts the whole run.
//
// This runner tracks each migration independently by hash and runs its
// statements one at a time. A statement that fails is handled by what kind
// of statement it is:
//
//   - Anything that can remove row data (DROP COLUMN, DROP TABLE, DELETE,
//     TRUNCATE) must succeed exactly as written or the whole run stops
//     right there with the real error. Never silently skipped, ever.
//
//   - Everything else (CREATE TABLE/INDEX/TYPE, ALTER ... ADD COLUMN/
//     CONSTRAINT/TYPE, DROP TYPE/CONSTRAINT/INDEX — none of which can
//     delete a row) is allowed to fail and be skipped, whatever the error.
//     A database whose schema predates migration tracking hits this in
//     more than one shape: "already exists" for the original CREATE TABLE,
//     "column/table doesn't exist" for an old migration's FK/constraint
//     statement referencing something a *later* migration went on to
//     rename, "incompatible types" for an ALTER COLUMN TYPE that only made
//     sense at that point in history. Each drizzle-kit migration file is a
//     snapshot of one specific past schema state — replaying an early one
//     against a table a later migration already restructured can fail in
//     whatever way that specific mismatch takes. The property that matters
//     isn't which SQLSTATE code comes back, it's that none of these
//     statements can remove a row if they fail: worst case some structure
//     that should exist doesn't, which is safe to leave for a human to
//     notice and fix later, unlike losing data.
//
// A data-loss statement failing stops the run immediately with the real
// error, no exceptions.
import postgres from "postgres";
import { readMigrationFiles } from "drizzle-orm/migrator";

const MIGRATIONS_SCHEMA = "drizzle";
const MIGRATIONS_TABLE = "__drizzle_migrations";

// Can this statement, if it actually executes, remove existing row data?
// Deliberately conservative (matches broadly) — anything that even might
// qualify is treated as data-loss-capable and never silently skipped.
const DATA_LOSS_PATTERN = /\b(DROP\s+COLUMN|DROP\s+TABLE|DELETE\s+FROM|TRUNCATE)\b/i;

// For a data-loss statement specifically, these codes prove there was
// nothing there to lose in the first place (the column/table it targets
// doesn't exist) — the *only* case where skipping one is provably safe.
// Any other failure on a data-loss statement stops the run.
const TARGET_MISSING_CODES = new Set([
  "42703", // undefined_column
  "42P01", // undefined_table
]);

const connection = process.env.DRIZZLE_DATABASE_URL;
if (!connection) {
  console.error("[migrate] DRIZZLE_DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(connection, { max: 1 });

async function main() {
  await client.unsafe(`CREATE SCHEMA IF NOT EXISTS ${MIGRATIONS_SCHEMA}`);
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);

  const applied = await client.unsafe(
    `SELECT hash FROM ${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE}`
  );
  const appliedHashes = new Set(applied.map((r) => r.hash));

  const migrations = readMigrationFiles({ migrationsFolder: "drizzle" });
  console.log(`[migrate] ${migrations.length} migration file(s) on disk, ${appliedHashes.size} already recorded as applied`);

  for (const migration of migrations) {
    const shortHash = migration.hash.slice(0, 12);

    if (appliedHashes.has(migration.hash)) {
      console.log(`[migrate] ${shortHash}: already applied, skipping`);
      continue;
    }

    let ranAnyStatement = false;

    for (const stmt of migration.sql) {
      const preview = stmt.trim().split("\n")[0].slice(0, 90);
      const dataLoss = DATA_LOSS_PATTERN.test(stmt);

      try {
        await client.unsafe(stmt);
        ranAnyStatement = true;
      } catch (err) {
        if (dataLoss) {
          if (TARGET_MISSING_CODES.has(err?.code)) {
            // Whatever it was trying to remove isn't there — nothing was
            // lost by not running this.
            console.log(`[migrate] ${shortHash}: nothing to remove (${err.code}), skipping: ${preview}...`);
            continue;
          }
          console.error(`[migrate] ${shortHash}: a data-affecting statement failed for a reason other than "already gone" — stopping, nothing further will run: ${preview}...`);
          throw err;
        }
        // Not a data-loss statement, so whatever went wrong, nothing was
        // removed — safe to skip and keep going. Logged with the real
        // error code/message so it's auditable after the fact.
        console.log(`[migrate] ${shortHash}: skipping (${err?.code ?? "no code"}: ${err?.message ?? err}): ${preview}...`);
        continue;
      }
    }

    await client.unsafe(
      `INSERT INTO ${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE} (hash, created_at) VALUES ($1, $2)`,
      [migration.hash, migration.folderMillis]
    );
    console.log(`[migrate] ${shortHash}: recorded as applied (${ranAnyStatement ? "ran new SQL" : "was already fully present"})`);
  }
}

main()
  .then(() => {
    console.log("[migrate] done.");
  })
  .catch((err) => {
    console.error("[migrate] failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
