ALTER TABLE feature
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'B')
) STORED;

-- For full text search
CREATE INDEX feature_search_idx
ON feature
USING GIN (search_vector);

-- For trigram similarity on title
CREATE INDEX feature_title_trgm_idx
ON feature
USING GIN (title gin_trgm_ops);

CREATE INDEX feature_description_trgm_idx
ON feature
USING GIN (description gin_trgm_ops);
