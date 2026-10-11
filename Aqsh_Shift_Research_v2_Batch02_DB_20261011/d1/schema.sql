CREATE TABLE assessment_resolutions (
 batch_id TEXT REFERENCES research_batches(batch_id), resolution_order INTEGER NOT NULL CHECK(resolution_order>0 AND resolution_order<9007199254740992),
 
 resolution_id TEXT PRIMARY KEY, offering_id TEXT NOT NULL REFERENCES offerings(offering_id),
 criterion_id TEXT NOT NULL REFERENCES criteria(criterion_id), as_of_date TEXT NOT NULL,
 decision TEXT NOT NULL CHECK(decision IN ('accepted','unresolved','outdated','not_applicable')),
 rationale TEXT NOT NULL, reviewer TEXT NOT NULL
);

CREATE TABLE asset_evidence (
 asset_id TEXT NOT NULL REFERENCES research_assets(asset_id),
 revision_id TEXT NOT NULL REFERENCES source_revisions(revision_id),
 locator TEXT NOT NULL, evidence_note TEXT,
 PRIMARY KEY(asset_id,revision_id,locator)
);

CREATE TABLE audit_issues (
 issue_id TEXT PRIMARY KEY, topic TEXT NOT NULL, legacy_location TEXT NOT NULL,
 finding TEXT NOT NULL, action TEXT NOT NULL, status TEXT NOT NULL, design_reference_url TEXT
);

CREATE TABLE batch_product_membership(batch_id TEXT REFERENCES research_batches(batch_id),product_id TEXT REFERENCES products(product_id),action TEXT NOT NULL,PRIMARY KEY(batch_id,product_id));

CREATE TABLE benchmark_runs (
 run_id TEXT PRIMARY KEY, offering_id TEXT NOT NULL REFERENCES offerings(offering_id),
 scenario_id TEXT NOT NULL REFERENCES benchmark_scenarios(scenario_id),
 input_hash TEXT NOT NULL CHECK(length(input_hash)=64),
 evaluator_version TEXT NOT NULL, solver_version TEXT,
 config_json TEXT NOT NULL CHECK(json_valid(config_json)),
 hardware_json TEXT NOT NULL CHECK(json_valid(hardware_json)),
 time_limit_s REAL CHECK(time_limit_s IS NULL OR time_limit_s>0), random_seed INTEGER,
 solver_status_raw TEXT,
 solution_state TEXT NOT NULL CHECK(solution_state IN
 ('feasible_validated','feasible_unvalidated','infeasible_proven','unknown','invalid_input','validation_failed')),
 termination_reason TEXT NOT NULL CHECK(termination_reason IN
 ('completed','time_limit','memory_limit','cancelled','error','unknown')),
 result_artifact_path TEXT, tested_on TEXT NOT NULL, tested_by TEXT NOT NULL
);

CREATE TABLE benchmark_scenario_criteria (
 scenario_id TEXT NOT NULL REFERENCES benchmark_scenarios(scenario_id),
 criterion_id TEXT NOT NULL REFERENCES criteria(criterion_id),
 PRIMARY KEY(scenario_id,criterion_id)
);

CREATE TABLE benchmark_scenarios (
 scenario_id TEXT PRIMARY KEY, name TEXT NOT NULL, employees INTEGER, units INTEGER,
 horizon TEXT, shift_context TEXT, acceptance TEXT NOT NULL,
 dataset_state TEXT NOT NULL CHECK(dataset_state IN ('protocol_only','synthetic_ready','public_ready','consented_ready')),
 dataset_hash TEXT, note TEXT,
 CHECK(dataset_hash IS NULL OR length(dataset_hash)=64)
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

CREATE TABLE classification_corrections (
 correction_id TEXT PRIMARY KEY,
 batch_id TEXT NOT NULL REFERENCES research_batches(batch_id),
 original_observation_id TEXT NOT NULL REFERENCES observations(observation_id),
 corrected_observation_id TEXT NOT NULL UNIQUE REFERENCES observations(observation_id),
 rationale TEXT NOT NULL,
 recorded_on TEXT NOT NULL
);

CREATE TABLE cost_requirements (
 cost_scenario_id TEXT NOT NULL REFERENCES cost_scenarios(cost_scenario_id),
 criterion_id TEXT NOT NULL REFERENCES criteria(criterion_id),
 PRIMARY KEY(cost_scenario_id,criterion_id)
);

CREATE TABLE cost_scenarios (
 cost_scenario_id TEXT PRIMARY KEY, name TEXT NOT NULL,
 staff_count INTEGER NOT NULL CHECK(staff_count>0),
 facility_count INTEGER NOT NULL CHECK(facility_count>0),
 unit_count INTEGER NOT NULL CHECK(unit_count>0),
 currency_policy TEXT NOT NULL,
 cost_horizons_months_json TEXT NOT NULL CHECK(json_valid(cost_horizons_months_json)),
 billing_variants_json TEXT NOT NULL CHECK(json_valid(billing_variants_json)),
 notes TEXT NOT NULL
);

CREATE TABLE criteria (
 criterion_id TEXT PRIMARY KEY, field_key TEXT NOT NULL UNIQUE,
 domain_id TEXT NOT NULL REFERENCES domains(domain_id),
 label_ja TEXT NOT NULL, definition TEXT NOT NULL,
 data_type TEXT NOT NULL CHECK(data_type IN ('text','enum','enum_set','record','capability','measurement')),
 research_stage TEXT NOT NULL CHECK(research_stage IN ('L1_common','L2_deep','L3_test','META')),
 applicability TEXT NOT NULL, required_evidence TEXT NOT NULL,
 design_reference_urls_json TEXT NOT NULL CHECK(json_valid(design_reference_urls_json)),
 schema_version TEXT NOT NULL
);

CREATE TABLE current_assessments (
 offering_id TEXT NOT NULL REFERENCES offerings(offering_id),
 criterion_id TEXT NOT NULL REFERENCES criteria(criterion_id),
 resolution_id TEXT NOT NULL UNIQUE REFERENCES assessment_resolutions(resolution_id),
 PRIMARY KEY(offering_id,criterion_id)
);

CREATE TABLE domains (
 domain_id TEXT PRIMARY KEY, name TEXT NOT NULL, purpose TEXT NOT NULL,
 default_applicability TEXT NOT NULL, recommended_evidence TEXT NOT NULL
);

CREATE TABLE legacy_feature_map (
 legacy_feature_id TEXT NOT NULL, legacy_label TEXT NOT NULL,
 criterion_id TEXT NOT NULL REFERENCES criteria(criterion_id), new_label TEXT NOT NULL, migration_rule TEXT NOT NULL,
 PRIMARY KEY(legacy_feature_id,criterion_id)
);

CREATE TABLE metric_catalog (
 metric_id TEXT PRIMARY KEY, field_key TEXT NOT NULL UNIQUE, unit TEXT NOT NULL,
 preferred_direction TEXT NOT NULL, definition TEXT NOT NULL
);

CREATE TABLE observation_evidence (
 observation_id TEXT NOT NULL REFERENCES observations(observation_id),
 revision_id TEXT NOT NULL REFERENCES source_revisions(revision_id),
 evidence_id TEXT PRIMARY KEY, locator TEXT NOT NULL, short_excerpt TEXT,
 paraphrase TEXT, stance TEXT NOT NULL CHECK(stance IN ('supports','refutes','context')),
 method TEXT NOT NULL, checked_on TEXT NOT NULL
);

CREATE TABLE observations (
 batch_id TEXT NOT NULL REFERENCES research_batches(batch_id), record_category TEXT NOT NULL CHECK(record_category IN ('document_observation','price_component_observation','coverage_placeholder')), summary_ja TEXT GENERATED ALWAYS AS (json_extract(value_json,'$.summary_ja')) VIRTUAL,
 
 observation_id TEXT PRIMARY KEY, offering_id TEXT NOT NULL REFERENCES offerings(offering_id),
 criterion_id TEXT NOT NULL REFERENCES criteria(criterion_id),
 value_state TEXT NOT NULL CHECK(value_state IN
 ('known','not_researched','not_found','not_disclosed','inaccessible','not_applicable','disputed')),
 value_json TEXT CHECK(value_json IS NULL OR json_valid(value_json)),
 support_status TEXT NOT NULL CHECK(support_status IN
 ('supported','limited','unsupported','planned','unknown','not_applicable')),
 delivery_mode TEXT NOT NULL CHECK(delivery_mode IN
 ('native','addon','third_party','custom','managed_service','unknown','not_applicable')),
 verification_stage TEXT NOT NULL CHECK(verification_stage IN
 ('not_checked','documented','demo_observed','independently_tested','production_observed')),
 assertion_kind TEXT NOT NULL DEFAULT 'source_statement'
 CHECK(assertion_kind IN ('source_statement','measured','inference','hypothesis')),
 applicability_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(applicability_json)),
 limitations TEXT, unknown_reason TEXT, valid_from TEXT, valid_to TEXT,
 recorded_on TEXT NOT NULL, reviewed_by TEXT, supersedes_observation_id TEXT REFERENCES observations(observation_id),
 CHECK((value_state='known' AND value_json IS NOT NULL) OR
       (value_state<>'known' AND value_json IS NULL)),
 CHECK(value_state='known' OR length(trim(coalesce(unknown_reason,'')))>0),
 CHECK(valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from),
 CHECK(support_status NOT IN ('supported','limited','unsupported','planned') OR value_state='known'),
 CHECK(support_status<>'limited' OR length(trim(coalesce(limitations,'')))>0)
);

CREATE TABLE offerings (
 offering_id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(product_id),
 edition TEXT, module_name TEXT, sales_region TEXT, deployment_mode TEXT,
 release_version TEXT, scope_note TEXT NOT NULL,
 effective_from TEXT, effective_to TEXT,
 CHECK(effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from)
);

CREATE TABLE plans (
 plan_id TEXT PRIMARY KEY, offering_id TEXT NOT NULL REFERENCES offerings(offering_id),
 plan_name TEXT NOT NULL, commitment_months INTEGER CHECK(commitment_months IS NULL OR commitment_months>=0),
 billing_period_months INTEGER CHECK(billing_period_months IS NULL OR billing_period_months>0),
 prepayment TEXT NOT NULL DEFAULT 'unknown' CHECK(prepayment IN ('yes','no','unknown')),
 min_billable_units INTEGER CHECK(min_billable_units IS NULL OR min_billable_units>=0),
 valid_from TEXT, valid_to TEXT, terms_note TEXT,
 CHECK(valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
);

CREATE TABLE price_components (
 component_id TEXT PRIMARY KEY, plan_id TEXT NOT NULL REFERENCES plans(plan_id),
 component_name TEXT NOT NULL, charge_type TEXT NOT NULL,
 currency TEXT, tax_status TEXT NOT NULL CHECK(tax_status IN ('inclusive','exclusive','unknown','not_applicable')),
 amount_status TEXT NOT NULL CHECK(amount_status IN ('known','unknown','quote_required','disputed')),
 unit_amount_decimal TEXT, billable_unit TEXT, quantity_definition TEXT,
 recurrence_months INTEGER CHECK(recurrence_months IS NULL OR recurrence_months>0),
 min_quantity INTEGER, max_quantity INTEGER,
 requirement TEXT NOT NULL CHECK(requirement IN ('required','optional','scenario_dependent','unknown')),
 price_observation_id TEXT REFERENCES observations(observation_id),
 valid_from TEXT, valid_to TEXT, conditions_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(conditions_json)),
 CHECK((amount_status='known' AND unit_amount_decimal IS NOT NULL AND currency IS NOT NULL)
 OR (amount_status<>'known' AND unit_amount_decimal IS NULL)),
 CHECK(max_quantity IS NULL OR min_quantity IS NULL OR max_quantity>=min_quantity),
 CHECK(valid_to IS NULL OR valid_from IS NULL OR valid_to>=valid_from)
);

CREATE TABLE product_aliases (
 product_id TEXT NOT NULL REFERENCES products(product_id),
 alias TEXT NOT NULL,
 normalized_alias TEXT NOT NULL,
 PRIMARY KEY(product_id,normalized_alias)
);

CREATE TABLE products (
 market_region TEXT NOT NULL DEFAULT 'unknown' CHECK(market_region IN ('domestic','overseas','unknown')),
 
 product_id TEXT PRIMARY KEY, vendor_id TEXT REFERENCES vendors(vendor_id),
 canonical_name TEXT NOT NULL, aliases_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(aliases_json)),
 official_url TEXT, product_kind TEXT NOT NULL DEFAULT 'unknown',
 parent_product_id TEXT REFERENCES products(product_id),
 legacy_product_id TEXT, review_state TEXT NOT NULL DEFAULT 'not_researched',
 CHECK(parent_product_id IS NULL OR parent_product_id <> product_id)
);

CREATE TABLE regulation_support (
 offering_id TEXT NOT NULL REFERENCES offerings(offering_id),
 regulation_id TEXT NOT NULL REFERENCES regulations(regulation_id),
 observation_id TEXT NOT NULL REFERENCES observations(observation_id),
 PRIMARY KEY(offering_id,regulation_id,observation_id)
);

CREATE TABLE regulations (
 regulation_id TEXT PRIMARY KEY, title TEXT NOT NULL,
 authority_type TEXT NOT NULL CHECK(authority_type IN
 ('law','reimbursement_rule','professional_guideline','labor_agreement','workplace_rule','individual_condition','unknown')),
 jurisdiction TEXT NOT NULL, applicability_json TEXT NOT NULL CHECK(json_valid(applicability_json)),
 version_label TEXT, effective_from TEXT, effective_to TEXT,
 revision_id TEXT REFERENCES source_revisions(revision_id),
 CHECK(effective_to IS NULL OR effective_from IS NULL OR effective_to>=effective_from)
);

CREATE TABLE research_assets (
 asset_id TEXT PRIMARY KEY, asset_type TEXT NOT NULL CHECK(asset_type IN ('technology','study','patent','dataset')),
 title TEXT NOT NULL, version_label TEXT, maturity TEXT, attributes_json TEXT NOT NULL CHECK(json_valid(attributes_json)),
 notes TEXT
);

CREATE TABLE research_batches(
 ingest_sha256 TEXT CHECK(ingest_sha256 IS NULL OR length(ingest_sha256)=64), method_note TEXT,
 batch_id TEXT PRIMARY KEY,as_of_date TEXT NOT NULL,description TEXT NOT NULL,prior_batch TEXT);

CREATE TABLE research_task_updates(update_id TEXT PRIMARY KEY,task_id TEXT REFERENCES research_tasks(task_id),batch_id TEXT REFERENCES research_batches(batch_id),note TEXT NOT NULL,recorded_on TEXT NOT NULL);

CREATE TABLE research_tasks (
 priority INTEGER NOT NULL DEFAULT 3 CHECK(priority BETWEEN 1 AND 3), required_method TEXT NOT NULL DEFAULT 'unknown' CHECK(required_method IN ('unknown','public_document','vendor_document','vendor_quote','demo','synthetic_test','independent_source')), last_checked_on TEXT,
 
 task_id TEXT PRIMARY KEY, offering_id TEXT REFERENCES offerings(offering_id),
 criterion_id TEXT REFERENCES criteria(criterion_id),
 task_state TEXT NOT NULL CHECK(task_state IN ('not_started','in_progress','blocked','done','not_applicable')),
 question TEXT NOT NULL, evidence_needed TEXT, owner TEXT, next_review_on TEXT, block_reason TEXT
);

CREATE TABLE resolution_evidence (
 resolution_id TEXT NOT NULL REFERENCES assessment_resolutions(resolution_id),
 observation_id TEXT NOT NULL REFERENCES observations(observation_id),
 role TEXT NOT NULL CHECK(role IN ('accepted','rejected','conflicting','context')),
 PRIMARY KEY(resolution_id,observation_id)
);

CREATE TABLE retrieval_checks(check_id TEXT PRIMARY KEY,batch_id TEXT REFERENCES research_batches(batch_id),product_id TEXT REFERENCES products(product_id),url TEXT NOT NULL,result TEXT NOT NULL,notes TEXT NOT NULL,checked_on TEXT NOT NULL);

CREATE TABLE run_metrics (
 run_id TEXT NOT NULL REFERENCES benchmark_runs(run_id),
 metric_id TEXT NOT NULL REFERENCES metric_catalog(metric_id),
 value_numeric REAL, value_state TEXT NOT NULL CHECK(value_state IN ('known','not_measured','not_applicable','censored')),
 numerator REAL, denominator REAL, observation_note TEXT,
 PRIMARY KEY(run_id,metric_id),
 CHECK((value_state='known' AND value_numeric IS NOT NULL) OR
       (value_state<>'known' AND value_numeric IS NULL))
);

CREATE TABLE schema_info (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE source_archives (
 revision_id TEXT PRIMARY KEY REFERENCES source_revisions(revision_id),
 relative_path TEXT NOT NULL,
 sha256 TEXT NOT NULL CHECK(length(sha256)=64),
 media_type TEXT NOT NULL,
 page_count INTEGER CHECK(page_count IS NULL OR page_count>0)
);

CREATE TABLE source_documents (
 document_id TEXT PRIMARY KEY,
 normalized_url TEXT NOT NULL UNIQUE,
 normalization_version TEXT NOT NULL DEFAULT 'url-v1'
);

CREATE TABLE source_method_attributes(revision_id TEXT PRIMARY KEY REFERENCES source_revisions(revision_id),origin_kind TEXT NOT NULL,web_reference TEXT,full_text_archived INTEGER NOT NULL DEFAULT 0,scope_note TEXT NOT NULL);

CREATE TABLE source_revisions (
 retrieval_url TEXT, title_at_retrieval TEXT,
 
 revision_id TEXT PRIMARY KEY, source_id TEXT NOT NULL REFERENCES sources(source_id),
 published_on TEXT, updated_on TEXT, retrieved_on TEXT NOT NULL,
 version_label TEXT, snapshot_path TEXT, content_hash TEXT, scope_note TEXT,
 CHECK(content_hash IS NULL OR length(content_hash)=64)
);

CREATE TABLE sources (
 document_id TEXT NOT NULL REFERENCES source_documents(document_id),
 
 source_id TEXT PRIMARY KEY, source_type TEXT NOT NULL, publisher TEXT,
 canonical_url TEXT NOT NULL, title TEXT NOT NULL,
 access_scope TEXT NOT NULL DEFAULT 'public' CHECK(access_scope IN ('public','internal','restricted','unknown')),
 reuse_permission TEXT
);

CREATE TABLE vendors (
 vendor_id TEXT PRIMARY KEY, legal_name TEXT NOT NULL, official_url TEXT,
 notes TEXT
);

CREATE INDEX aliases_lookup ON product_aliases(normalized_alias,product_id);

CREATE INDEX brand_assets_selection ON brand_assets(product_id,verification_state,logo_kind,verified_on DESC);

CREATE INDEX evidence_observation ON observation_evidence(observation_id,evidence_id);

CREATE INDEX evidence_revision ON observation_evidence(revision_id,observation_id);

CREATE INDEX observations_batch ON observations(batch_id,record_category,observation_id);

CREATE INDEX observations_criterion ON observations(criterion_id,offering_id);

CREATE INDEX observations_offering ON observations(offering_id,record_category,recorded_on,observation_id);

CREATE INDEX offerings_product ON offerings(product_id,offering_id);

CREATE INDEX plans_offering ON plans(offering_id,plan_id);

CREATE INDEX prices_plan ON price_components(plan_id,component_id);

CREATE INDEX products_region ON products(market_region,product_id);

CREATE INDEX resolution_evidence_observation ON resolution_evidence(observation_id,resolution_id);

CREATE INDEX resolutions_latest ON assessment_resolutions(offering_id,criterion_id,as_of_date DESC,resolution_order DESC);

CREATE UNIQUE INDEX resolutions_order ON assessment_resolutions(resolution_order);

CREATE INDEX revisions_source_date ON source_revisions(source_id,retrieved_on,revision_id);

CREATE INDEX sources_document ON sources(document_id);

CREATE INDEX tasks_queue ON research_tasks(task_state,priority,required_method,task_id);

CREATE INDEX tasks_scope ON research_tasks(offering_id,criterion_id,task_id);

CREATE INDEX updates_task ON research_task_updates(task_id,recorded_on,update_id);

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

CREATE TRIGGER resolution_no_delete BEFORE DELETE ON assessment_resolutions
BEGIN SELECT RAISE(ABORT,'resolutions are append-only; insert a new resolution'); END;

CREATE TRIGGER resolution_no_update BEFORE UPDATE ON assessment_resolutions
BEGIN SELECT RAISE(ABORT,'resolutions are append-only; insert a new resolution'); END;

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

CREATE VIEW v_common40 AS SELECT * FROM v_current40;

CREATE VIEW v_current40 AS SELECT * FROM v_assessments WHERE research_stage='L1_common';

CREATE VIEW v_current_observations AS SELECT * FROM v_observations_with_sources
 WHERE current_evidence_role IN ('accepted','conflicting','context');

CREATE VIEW v_latest_resolutions AS
 SELECT r.*,1 AS rn FROM current_assessments c JOIN assessment_resolutions r USING(resolution_id);

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

CREATE VIEW v_open_questions AS
 SELECT t.task_id,f.offering_id,p.product_id,p.canonical_name,t.criterion_id,t.task_state,t.priority,
 t.required_method,t.question,t.evidence_needed,t.last_checked_on,t.block_reason
 FROM research_tasks t LEFT JOIN offerings f USING(offering_id) LEFT JOIN products p USING(product_id)
 WHERE t.task_state NOT IN ('done','not_applicable');

CREATE VIEW v_preferred_brand_assets AS
 SELECT * FROM (
  SELECT b.*,ROW_NUMBER() OVER (PARTITION BY product_id
   ORDER BY CASE logo_kind WHEN 'service' THEN 0 ELSE 1 END,
   selection_rank DESC,verified_on DESC,asset_id DESC) AS preference_order
  FROM brand_assets b WHERE verification_state='verified'
 ) WHERE preference_order=1;

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

CREATE VIEW v_product_catalog AS
 SELECT f.offering_id,p.product_id,p.canonical_name,p.market_region,p.product_kind,p.review_state,
 p.official_url,p.aliases_json,v.legal_name,f.edition,f.module_name,f.sales_region,f.deployment_mode,
 f.release_version,f.scope_note,
 (SELECT COUNT(*) FROM current_assessments c JOIN assessment_resolutions r USING(resolution_id)
  WHERE c.offering_id=f.offering_id AND r.decision='accepted') AS accepted_criteria
 FROM offerings f JOIN products p USING(product_id) LEFT JOIN vendors v USING(vendor_id);

CREATE VIEW v_product_coverage AS
 SELECT f.offering_id,p.product_id,p.canonical_name,p.product_kind,p.review_state,p.market_region,
 v.legal_name,p.official_url,
 SUM(v40.documented_scope) AS documented_common_scopes,COUNT(*) AS common_slots,
 SUM(COALESCE(v40.updated_in_b02,0)) AS b02_updated_common_scopes,
 SUM(COALESCE(v40.updated_in_b03,0)) AS b03_updated_common_scopes
 FROM offerings f JOIN products p USING(product_id) LEFT JOIN vendors v USING(vendor_id)
 JOIN v_current40 v40 USING(offering_id) GROUP BY f.offering_id;

CREATE VIEW v_unresolved40 AS SELECT * FROM v_current40 WHERE documented_scope=0;
