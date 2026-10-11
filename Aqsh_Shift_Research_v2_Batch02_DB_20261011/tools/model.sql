-- D1/SQLite: selection is per offering, not per product. History is append-only.
CREATE TABLE source_documents (
 document_id TEXT PRIMARY KEY,
 normalized_url TEXT NOT NULL UNIQUE,
 normalization_version TEXT NOT NULL DEFAULT 'url-v1'
);

CREATE TABLE current_assessments (
 offering_id TEXT NOT NULL REFERENCES offerings(offering_id),
 criterion_id TEXT NOT NULL REFERENCES criteria(criterion_id),
 resolution_id TEXT NOT NULL UNIQUE REFERENCES assessment_resolutions(resolution_id),
 PRIMARY KEY(offering_id,criterion_id)
);

CREATE TABLE product_aliases (
 product_id TEXT NOT NULL REFERENCES products(product_id),
 alias TEXT NOT NULL,
 normalized_alias TEXT NOT NULL,
 PRIMARY KEY(product_id,normalized_alias)
);

CREATE TABLE classification_corrections (
 correction_id TEXT PRIMARY KEY,
 batch_id TEXT NOT NULL REFERENCES research_batches(batch_id),
 original_observation_id TEXT NOT NULL REFERENCES observations(observation_id),
 corrected_observation_id TEXT NOT NULL UNIQUE REFERENCES observations(observation_id),
 rationale TEXT NOT NULL,
 recorded_on TEXT NOT NULL
);

CREATE TABLE source_archives (
 revision_id TEXT PRIMARY KEY REFERENCES source_revisions(revision_id),
 relative_path TEXT NOT NULL,
 sha256 TEXT NOT NULL CHECK(length(sha256)=64),
 media_type TEXT NOT NULL,
 page_count INTEGER CHECK(page_count IS NULL OR page_count>0)
);

CREATE TABLE brand_assets (
 asset_id TEXT PRIMARY KEY,
 product_id TEXT NOT NULL REFERENCES products(product_id),
 batch_id TEXT NOT NULL REFERENCES research_batches(batch_id),
 revision_id TEXT NOT NULL REFERENCES source_revisions(revision_id),
 logo_kind TEXT NOT NULL CHECK(logo_kind IN ('service','company')),
 brand_name TEXT NOT NULL,
 asset_url TEXT NOT NULL CHECK(length(asset_url)>0),
 source_page_url TEXT NOT NULL,
 locator TEXT NOT NULL,
 verification_state TEXT NOT NULL CHECK(verification_state IN ('verified','candidate','unavailable')),
 verified_on TEXT NOT NULL,
 selection_rank INTEGER NOT NULL DEFAULT 0,
 media_type TEXT,
 http_status INTEGER,
 rights_status TEXT NOT NULL DEFAULT 'unknown' CHECK(rights_status IN ('unknown','permitted','restricted')),
 notes TEXT NOT NULL
);
CREATE INDEX brand_assets_selection ON brand_assets(product_id,verification_state,logo_kind,verified_on DESC);

CREATE VIEW v_preferred_brand_assets AS
 SELECT * FROM (
  SELECT b.*,ROW_NUMBER() OVER (PARTITION BY product_id
   ORDER BY CASE logo_kind WHEN 'service' THEN 0 ELSE 1 END,
   selection_rank DESC,verified_on DESC,asset_id DESC) AS preference_order
  FROM brand_assets b WHERE verification_state='verified'
 ) WHERE preference_order=1;

CREATE TRIGGER resolution_select_current AFTER INSERT ON assessment_resolutions
BEGIN
 INSERT INTO current_assessments(offering_id,criterion_id,resolution_id)
 VALUES(NEW.offering_id,NEW.criterion_id,NEW.resolution_id)
 ON CONFLICT(offering_id,criterion_id) DO UPDATE SET resolution_id=excluded.resolution_id
 WHERE EXISTS (
  SELECT 1 FROM assessment_resolutions old WHERE old.resolution_id=current_assessments.resolution_id
  AND (NEW.as_of_date>old.as_of_date OR (NEW.as_of_date=old.as_of_date AND NEW.resolution_order>old.resolution_order))
 );
END;

CREATE TRIGGER resolution_no_update BEFORE UPDATE ON assessment_resolutions
BEGIN SELECT RAISE(ABORT,'resolutions are append-only; insert a new resolution'); END;
CREATE TRIGGER resolution_no_delete BEFORE DELETE ON assessment_resolutions
BEGIN SELECT RAISE(ABORT,'resolutions are append-only; insert a new resolution'); END;

CREATE TRIGGER current_scope_insert BEFORE INSERT ON current_assessments
WHEN NOT EXISTS (SELECT 1 FROM assessment_resolutions r WHERE r.resolution_id=NEW.resolution_id
 AND r.offering_id=NEW.offering_id AND r.criterion_id=NEW.criterion_id)
BEGIN SELECT RAISE(ABORT,'current assessment scope mismatch'); END;
CREATE TRIGGER current_scope_update BEFORE UPDATE ON current_assessments
WHEN NOT EXISTS (SELECT 1 FROM assessment_resolutions r WHERE r.resolution_id=NEW.resolution_id
 AND r.offering_id=NEW.offering_id AND r.criterion_id=NEW.criterion_id)
BEGIN SELECT RAISE(ABORT,'current assessment scope mismatch'); END;

CREATE TRIGGER evidence_scope_insert BEFORE INSERT ON resolution_evidence
WHEN NOT EXISTS (SELECT 1 FROM assessment_resolutions r JOIN observations o
 ON r.offering_id=o.offering_id AND r.criterion_id=o.criterion_id
 WHERE r.resolution_id=NEW.resolution_id AND o.observation_id=NEW.observation_id)
BEGIN SELECT RAISE(ABORT,'resolution evidence scope mismatch'); END;
CREATE TRIGGER evidence_scope_update BEFORE UPDATE ON resolution_evidence
WHEN NOT EXISTS (SELECT 1 FROM assessment_resolutions r JOIN observations o
 ON r.offering_id=o.offering_id AND r.criterion_id=o.criterion_id
 WHERE r.resolution_id=NEW.resolution_id AND o.observation_id=NEW.observation_id)
BEGIN SELECT RAISE(ABORT,'resolution evidence scope mismatch'); END;

CREATE INDEX sources_document ON sources(document_id);
CREATE INDEX revisions_source_date ON source_revisions(source_id,retrieved_on,revision_id);
CREATE INDEX evidence_observation ON observation_evidence(observation_id,evidence_id);
CREATE INDEX evidence_revision ON observation_evidence(revision_id,observation_id);
CREATE INDEX observations_offering ON observations(offering_id,record_category,recorded_on,observation_id);
CREATE INDEX observations_batch ON observations(batch_id,record_category,observation_id);
CREATE INDEX observations_criterion ON observations(criterion_id,offering_id);
CREATE INDEX offerings_product ON offerings(product_id,offering_id);
CREATE INDEX products_region ON products(market_region,product_id);
CREATE INDEX aliases_lookup ON product_aliases(normalized_alias,product_id);
CREATE INDEX resolutions_latest ON assessment_resolutions(offering_id,criterion_id,as_of_date DESC,resolution_order DESC);
CREATE UNIQUE INDEX resolutions_order ON assessment_resolutions(resolution_order);
CREATE INDEX resolution_evidence_observation ON resolution_evidence(observation_id,resolution_id);
CREATE INDEX plans_offering ON plans(offering_id,plan_id);
CREATE INDEX prices_plan ON price_components(plan_id,component_id);
CREATE INDEX tasks_queue ON research_tasks(task_state,priority,required_method,task_id);
CREATE INDEX tasks_scope ON research_tasks(offering_id,criterion_id,task_id);
CREATE INDEX updates_task ON research_task_updates(task_id,recorded_on,update_id);

CREATE VIEW v_latest_resolutions AS
 SELECT r.*,1 AS rn FROM current_assessments c JOIN assessment_resolutions r USING(resolution_id);

CREATE VIEW v_assessments AS
 SELECT f.offering_id,p.product_id,p.canonical_name,p.market_region,
 cq.criterion_id,cq.label_ja,cq.research_stage,
 COALESCE(ar.decision,'unresolved') AS decision,
 COALESCE(ar.rationale,'未調査。非対応とは判断しない。') AS rationale,
 COALESCE(GROUP_CONCAT(DISTINCT o.value_state),'not_researched') AS value_states,
 COALESCE(GROUP_CONCAT(DISTINCT o.support_status),'unknown') AS support_states,
 COALESCE(GROUP_CONCAT(DISTINCT COALESCE(o.summary_ja,o.unknown_reason)),'未調査') AS finding,
 GROUP_CONCAT(DISTINCT s.source_id) AS source_ids,
 GROUP_CONCAT(DISTINCT COALESCE(sr.retrieval_url,s.canonical_url)) AS source_urls,
 CASE WHEN ar.decision='accepted' AND SUM(CASE WHEN o.value_state='known'
  AND o.verification_stage='documented' THEN 1 ELSE 0 END)>0 THEN 1 ELSE 0 END AS documented_scope,
 MAX(CASE WHEN o.batch_id='B02-20261011' THEN 1 ELSE 0 END) AS updated_in_b02,
 MAX(CASE WHEN o.batch_id='B03-20261011' THEN 1 ELSE 0 END) AS updated_in_b03,
 MAX(CASE WHEN o.batch_id=(SELECT value FROM schema_info WHERE key='latest_batch') THEN 1 ELSE 0 END) AS updated_in_latest_batch,
 ar.as_of_date,ar.resolution_id,ar.resolution_order
 FROM offerings f JOIN products p USING(product_id) CROSS JOIN criteria cq
 LEFT JOIN v_latest_resolutions ar ON ar.offering_id=f.offering_id AND ar.criterion_id=cq.criterion_id
 LEFT JOIN resolution_evidence re ON re.resolution_id=ar.resolution_id AND re.role IN ('accepted','conflicting')
 LEFT JOIN observations o ON o.observation_id=re.observation_id
 LEFT JOIN observation_evidence e ON e.observation_id=o.observation_id
 LEFT JOIN source_revisions sr ON sr.revision_id=e.revision_id
 LEFT JOIN sources s ON s.source_id=sr.source_id
 GROUP BY f.offering_id,cq.criterion_id;

CREATE VIEW v_current40 AS SELECT * FROM v_assessments WHERE research_stage='L1_common';
CREATE VIEW v_common40 AS SELECT * FROM v_current40;
CREATE VIEW v_unresolved40 AS SELECT * FROM v_current40 WHERE documented_scope=0;

CREATE VIEW v_observations_with_sources AS
 SELECT f.offering_id,p.product_id,p.canonical_name,cq.criterion_id,cq.label_ja,cq.research_stage,
 o.observation_id,o.batch_id,o.record_category,o.value_state,o.support_status,o.delivery_mode,
 o.verification_stage,o.assertion_kind,o.summary_ja,o.unknown_reason,o.limitations,o.applicability_json,
 s.source_id,s.document_id,COALESCE(sr.retrieval_url,s.canonical_url) AS canonical_url,
 COALESCE(sr.title_at_retrieval,s.title) AS title,e.evidence_id,e.locator,e.paraphrase,sr.retrieved_on,
 ar.decision AS resolution_decision,sr.published_on,sr.updated_on,
 CASE WHEN re.observation_id IS NOT NULL THEN re.role ELSE 'historical_only' END AS current_evidence_role
 FROM observations o JOIN offerings f USING(offering_id) JOIN products p USING(product_id)
 JOIN criteria cq USING(criterion_id)
 LEFT JOIN observation_evidence e USING(observation_id)
 LEFT JOIN source_revisions sr USING(revision_id) LEFT JOIN sources s USING(source_id)
 LEFT JOIN v_latest_resolutions ar ON ar.offering_id=o.offering_id AND ar.criterion_id=o.criterion_id
 LEFT JOIN resolution_evidence re ON re.resolution_id=ar.resolution_id AND re.observation_id=o.observation_id;
CREATE VIEW v_current_observations AS SELECT * FROM v_observations_with_sources
 WHERE current_evidence_role IN ('accepted','conflicting','context');

CREATE VIEW v_price_details AS
 SELECT f.offering_id,p.product_id,p.canonical_name,pl.plan_name,pc.*,
 s.canonical_url,s.title,o.recorded_on AS price_checked_on,o.batch_id AS observation_batch,
 COALESCE(re.role,'historical_only') AS current_evidence_role
 FROM price_components pc JOIN plans pl USING(plan_id) JOIN offerings f USING(offering_id)
 JOIN products p USING(product_id) LEFT JOIN observations o ON o.observation_id=pc.price_observation_id
 LEFT JOIN observation_evidence e ON e.evidence_id=(
  SELECT e2.evidence_id FROM observation_evidence e2 WHERE e2.observation_id=pc.price_observation_id
  ORDER BY e2.checked_on DESC,e2.evidence_id DESC LIMIT 1)
 LEFT JOIN source_revisions sr USING(revision_id) LEFT JOIN sources s USING(source_id)
 LEFT JOIN v_latest_resolutions ar ON ar.offering_id=o.offering_id AND ar.criterion_id=o.criterion_id
 LEFT JOIN resolution_evidence re ON re.resolution_id=ar.resolution_id AND re.observation_id=o.observation_id;

CREATE VIEW v_product_coverage AS
 SELECT f.offering_id,p.product_id,p.canonical_name,p.product_kind,p.review_state,p.market_region,
 v.legal_name,p.official_url,
 SUM(v40.documented_scope) AS documented_common_scopes,COUNT(*) AS common_slots,
 SUM(COALESCE(v40.updated_in_b02,0)) AS b02_updated_common_scopes,
 SUM(COALESCE(v40.updated_in_b03,0)) AS b03_updated_common_scopes
 FROM offerings f JOIN products p USING(product_id) LEFT JOIN vendors v USING(vendor_id)
 JOIN v_current40 v40 USING(offering_id) GROUP BY f.offering_id;

CREATE VIEW v_product_catalog AS
 SELECT f.offering_id,p.product_id,p.canonical_name,p.market_region,p.product_kind,p.review_state,
 p.official_url,p.aliases_json,v.legal_name,f.edition,f.module_name,f.sales_region,f.deployment_mode,
 f.release_version,f.scope_note,
 (SELECT COUNT(*) FROM current_assessments c JOIN assessment_resolutions r USING(resolution_id)
  WHERE c.offering_id=f.offering_id AND r.decision='accepted') AS accepted_criteria
 FROM offerings f JOIN products p USING(product_id) LEFT JOIN vendors v USING(vendor_id);

CREATE VIEW v_open_questions AS
 SELECT t.task_id,f.offering_id,p.product_id,p.canonical_name,t.criterion_id,t.task_state,t.priority,
 t.required_method,t.question,t.evidence_needed,t.last_checked_on,t.block_reason
 FROM research_tasks t LEFT JOIN offerings f USING(offering_id) LEFT JOIN products p USING(product_id)
 WHERE t.task_state NOT IN ('done','not_applicable');
