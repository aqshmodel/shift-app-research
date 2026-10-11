CREATE TABLE IF NOT EXISTS web_snapshots (
 snapshot_id TEXT PRIMARY KEY,
 as_of_date TEXT NOT NULL,
 research_sha256 TEXT NOT NULL,
 content_sha256 TEXT NOT NULL,
 scope_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS web_live (
 id INTEGER PRIMARY KEY CHECK(id=1),
 snapshot_id TEXT NOT NULL REFERENCES web_snapshots(snapshot_id)
);
CREATE TABLE IF NOT EXISTS web_products (
 snapshot_id TEXT NOT NULL REFERENCES web_snapshots(snapshot_id),
 offering_id TEXT NOT NULL REFERENCES offerings(offering_id),
 slug TEXT NOT NULL,
 search_text TEXT NOT NULL,
 summary_json TEXT NOT NULL,
 detail_json TEXT NOT NULL,
 PRIMARY KEY(snapshot_id,offering_id),
 UNIQUE(snapshot_id,slug)
);
CREATE TABLE IF NOT EXISTS web_categories (
 snapshot_id TEXT NOT NULL REFERENCES web_snapshots(snapshot_id),
 category_id TEXT NOT NULL,
 offering_id TEXT NOT NULL REFERENCES offerings(offering_id),
 provenance_json TEXT NOT NULL,
 PRIMARY KEY(snapshot_id,category_id,offering_id)
);
CREATE INDEX IF NOT EXISTS web_category_lookup ON web_categories(snapshot_id,category_id);
