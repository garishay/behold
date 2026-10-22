-- The count service's one table (#7): each count's total for the day, in UTC, its beacons came, by
-- its name, its case, and its detail (`src/beacon.ts`). Nothing else is kept. Made once, by hand,
-- from this folder: npx wrangler d1 execute behold-counts --remote --file=schema.sql
CREATE TABLE IF NOT EXISTS counts (
  day TEXT NOT NULL,
  name TEXT NOT NULL,
  at TEXT NOT NULL,
  detail TEXT NOT NULL,
  n INTEGER NOT NULL,
  PRIMARY KEY (day, name, at, detail)
) WITHOUT ROWID;
