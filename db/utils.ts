import { sql } from "drizzle-orm";
import { databaseDrizzle } from ".";

// ALTER TABLE feature
// ADD COLUMN search_vector tsvector
// GENERATED ALWAYS AS (
//   setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
//   setweight(to_tsvector('simple', coalesce(description, '')), 'B')
// ) STORED;

// -- For full text search
// CREATE INDEX feature_search_idx
// ON feature
// USING GIN (search_vector);

// -- For trigram similarity on title
// CREATE INDEX feature_title_trgm_idx
// ON feature
// USING GIN (title gin_trgm_ops);

// CREATE INDEX feature_description_trgm_idx
// ON feature
// USING GIN (description gin_trgm_ops);

export const smartRankedQuery = async (inputText: string, projectId: string) => {
  return await databaseDrizzle.execute(sql`
  SELECT 
    id,
    title,
    description,
    "upvotes_count",
    status,
    ts_rank(search_vector, plainto_tsquery('simple', ${inputText})) AS rank,
    similarity(title, ${inputText}) AS title_sim,
    similarity(description, ${inputText}) AS desc_sim
  FROM feature
  WHERE "project_id" = ${projectId}
  AND (
    search_vector @@ plainto_tsquery('simple', ${inputText})
    OR similarity(title, ${inputText}) > 0.3
    OR similarity(description, ${inputText}) > 0.3
  )
  ORDER BY (
      ts_rank(search_vector, plainto_tsquery('simple', ${inputText})) * 0.5
    + similarity(title, ${inputText}) * 0.3
    + similarity(description, ${inputText}) * 0.2
  ) DESC
  LIMIT 6
`);
}
