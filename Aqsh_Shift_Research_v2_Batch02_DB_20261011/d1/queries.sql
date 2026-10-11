-- Application read queries. Use bind parameters in Workers, not string interpolation.
-- 1. Offering catalog, stable cursor pagination (cap page size at 50).
SELECT * FROM v_product_catalog
WHERE offering_id > ?1 AND (?2 IS NULL OR market_region=?2)
ORDER BY offering_id LIMIT ?3;

-- 2. Current common comparison: two to four offering IDs, at most 160 cells.
SELECT * FROM v_current40
WHERE offering_id IN (?1,?2,?3,?4)
ORDER BY criterion_id,offering_id;

-- 3. Document history with provenance, one row per evidence link.
-- Group by observation_id in the API; preserve all evidence links.
SELECT * FROM v_observations_with_sources
WHERE offering_id=?1 AND record_category='document_observation'
ORDER BY criterion_id,batch_id DESC,observation_id,evidence_id;

-- 4. Accepted/conflicting current evidence only. Context is shown separately.
SELECT * FROM v_current_observations
WHERE offering_id=?1 AND current_evidence_role IN ('accepted','conflicting')
ORDER BY criterion_id,observation_id,evidence_id;

-- 5. Price components; never sum different plans, regions, commitments or optional costs.
SELECT * FROM v_price_details WHERE offering_id=?1
ORDER BY plan_id,component_id;

-- 6. Work queue ordered by priority. Keep unknown separate from unsupported.
SELECT * FROM v_open_questions
WHERE (?1 IS NULL OR offering_id=?1) AND (?2 IS NULL OR required_method=?2)
ORDER BY priority,task_id LIMIT ?3;

-- 7. Indexed exact alias lookup; normalize NFKC + casefold in authoring/API.
SELECT p.* FROM product_aliases a JOIN products p USING(product_id)
WHERE a.normalized_alias=?1;

-- 8. Bound substring search for this 50-offering corpus. Leading wildcards do not
-- use a B-tree text index. Escape % and _ if the UI promises literal search.
SELECT DISTINCT c.* FROM v_product_catalog c
WHERE c.canonical_name LIKE ?1 ESCAPE '\'
 OR EXISTS (SELECT 1 FROM observations o WHERE o.offering_id=c.offering_id
  AND o.record_category='document_observation' AND o.summary_ja LIKE ?1 ESCAPE '\')
ORDER BY c.offering_id LIMIT ?2;

-- Preferred logos: verified service logos take priority over company logos.
SELECT p.product_id,p.canonical_name,b.logo_kind,b.brand_name,b.asset_url,b.source_page_url,b.verified_on,b.notes
FROM products p LEFT JOIN v_preferred_brand_assets b USING(product_id)
ORDER BY p.product_id;

-- Classification audit without replacing historical observations.
SELECT x.*,o.criterion_id AS original_criterion,n.criterion_id AS corrected_criterion
FROM classification_corrections x
JOIN observations o ON o.observation_id=x.original_observation_id
JOIN observations n ON n.observation_id=x.corrected_observation_id
ORDER BY x.recorded_on,x.correction_id;

-- Reference formulas and conditions have independent provenance.
-- Their presence never establishes vendor implementation. Dates may be NULL.
SELECT g.regulation_id,g.title,g.authority_type,g.version_label,
 g.effective_from,g.effective_to,
 json_extract(g.applicability_json,'$.summary_ja') AS summary_ja,
 json_extract(g.applicability_json,'$.formula') AS formula,
 json_extract(g.applicability_json,'$.rounding') AS rounding,
 json_extract(g.applicability_json,'$.locator') AS locator,
 g.applicability_json,r.retrieval_url,r.retrieved_on
FROM regulations g JOIN source_revisions r USING(revision_id)
WHERE g.jurisdiction=?1 ORDER BY g.regulation_id;

-- Deep research for formulas, MFA and full exit exports is outside the common
-- 40-item comparison; retain contradictions and missing documentation.
SELECT * FROM v_observations_with_sources
WHERE offering_id=?1 AND criterion_id IN ('J05','N02','M08','N06','P08')
 AND record_category='document_observation'
ORDER BY criterion_id,batch_id DESC,observation_id,evidence_id;
