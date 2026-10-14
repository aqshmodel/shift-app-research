// Join the current resolution by its indexed offering/criterion key. The old
// view materialized every product's resolutions even for a ten-record page.
export function evidenceQuery(withCriterion=false) {
  return `SELECT o.observation_id,o.criterion_id,cq.label_ja,o.value_state,
    o.summary_ja,o.unknown_reason,o.limitations,o.applicability_json,o.verification_stage,
    e.evidence_id,e.locator,e.paraphrase,COALESCE(sr.retrieval_url,s.canonical_url) AS canonical_url,
    COALESCE(sr.title_at_retrieval,s.title) AS title,sr.retrieved_on,re.role AS current_evidence_role
    FROM observations o JOIN criteria cq USING(criterion_id)
    JOIN current_assessments ca ON ca.offering_id=o.offering_id AND ca.criterion_id=o.criterion_id
    JOIN resolution_evidence re ON re.resolution_id=ca.resolution_id AND re.observation_id=o.observation_id
    LEFT JOIN observation_evidence e ON e.observation_id=o.observation_id
    LEFT JOIN source_revisions sr ON sr.revision_id=e.revision_id
    LEFT JOIN sources s ON s.source_id=sr.source_id
    WHERE re.role IN ('accepted','conflicting','context') AND o.observation_id IN (
      SELECT observation_id FROM observations WHERE record_category='document_observation'
      AND offering_id=? ${withCriterion?'AND criterion_id=?':''} ORDER BY observation_id DESC LIMIT ? OFFSET ?)
    ORDER BY o.observation_id DESC,e.evidence_id`;
}
