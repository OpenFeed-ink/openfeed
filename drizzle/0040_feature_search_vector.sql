-- Tracks the search infrastructure that duplicate-feature detection
-- (db/utils.ts smartRankedQuery) depends on. This previously lived only in
-- an untracked drizzle/custom/search_vector.sql that migrateToLatest() never
-- ran — a fresh environment would fail with "column search_vector does not
-- exist" the first time someone submitted a feature request.
--
-- This is a hand-authored ("custom") migration, deliberately not modeled as
-- a column in db/schema.ts: tsvector generated columns aren't representable
-- through Drizzle's schema builder, and custom SQL migrations are invisible
-- to `drizzle-kit generate`'s diffing — so a future `generate` run can never
-- mistake this for a dropped column and try to remove it.
--
-- Guarded with IF NOT EXISTS throughout so this is safe to run against an
-- environment (like current prod) where it may already have been applied
-- by hand.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE feature
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'B')
) STORED;

-- For full text search
CREATE INDEX IF NOT EXISTS feature_search_idx
ON feature
USING GIN (search_vector);

-- For trigram similarity on title/description, and as a side effect this also
-- lets Postgres use an index for the dashboard's plain
-- ilike(title/description, '%q%') search instead of a sequential scan.
CREATE INDEX IF NOT EXISTS feature_title_trgm_idx
ON feature
USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS feature_description_trgm_idx
ON feature
USING GIN (description gin_trgm_ops);
