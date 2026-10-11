#!/usr/bin/env python3
"""Regenerate CSV indexes and batch counts from the canonical research DB."""
import csv,json
from collections import Counter
from research_db import ROOT,connect,stats

def write_csv(name,rows):
    if not rows:return
    with (ROOT/'reports'/name).open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)

with connect() as c:
    s=stats(c);batch=s['latest_batch']
    p=json.loads((ROOT/'batches'/(batch+'.json')).read_text())
    s['latest_batch_details']={'batch_id':batch,'new_document_findings':len(p['findings']),
      'editorial_corrections':len(p.get('reclassifications',[])),'new_price_components':len(p.get('prices',[])),
      'reference_regulations':len(p.get('regulations',[])),
      'source_retrievals':len(p['sources']),'functional_research_sources':len([x for x in p['sources'] if not x['key'].startswith('logo-')]),
      'functional_research_products':len({f['product'] for f in p['findings']}),
      'products_including_classification_corrections':c.execute('SELECT COUNT(*) FROM batch_product_membership WHERE batch_id=?',(batch,)).fetchone()[0],
      'finding_states':dict(Counter(f.get('state','known') for f in p['findings']))}
    s['schema_objects']=dict(c.execute("SELECT type,COUNT(*) FROM sqlite_master WHERE type IN ('table','view') GROUP BY type"))
    s['research_task_states']=dict(c.execute('SELECT task_state,COUNT(*) FROM research_tasks GROUP BY task_state'))
    s['by_product']=[dict(r) for r in c.execute('SELECT product_id,canonical_name,COUNT(*) AS document_records FROM observations JOIN offerings USING(offering_id) JOIN products USING(product_id) WHERE record_category=\'document_observation\' AND batch_id=? GROUP BY product_id ORDER BY product_id',(batch,))]
    (ROOT/'reports/research_stats.json').write_text(json.dumps(s,ensure_ascii=False,indent=2))
    write_csv('priority_followups.csv',[dict(r) for r in c.execute('SELECT * FROM v_open_questions WHERE priority=1 ORDER BY product_id,criterion_id,task_id')])
    write_csv('source_index.csv',[dict(r) for r in c.execute('SELECT r.revision_id,s.document_id,s.publisher,r.title_at_retrieval AS title,r.retrieval_url,r.retrieved_on,r.published_on,r.updated_on,a.origin_kind,a.full_text_archived,ar.relative_path,ar.sha256 FROM source_revisions r JOIN sources s USING(source_id) LEFT JOIN source_method_attributes a USING(revision_id) LEFT JOIN source_archives ar USING(revision_id) WHERE r.revision_id LIKE ? ORDER BY r.revision_id',(batch+'%',))])
    write_csv('logo_index.csv',[dict(r) for r in c.execute('SELECT product_id,logo_kind,brand_name,asset_url,source_page_url,verified_on,media_type,http_status,rights_status,notes FROM v_preferred_brand_assets ORDER BY product_id')])
    write_csv('classification_corrections.csv',[dict(r) for r in c.execute('SELECT x.correction_id,x.original_observation_id,o.criterion_id AS original_criterion,x.corrected_observation_id,n.criterion_id AS corrected_criterion,x.rationale,x.recorded_on FROM classification_corrections x JOIN observations o ON o.observation_id=x.original_observation_id JOIN observations n ON n.observation_id=x.corrected_observation_id ORDER BY x.correction_id')])
    write_csv('regulation_index.csv',[dict(r) for r in c.execute('SELECT g.regulation_id,g.title,g.authority_type,g.jurisdiction,g.version_label,g.effective_from,g.effective_to,json_extract(g.applicability_json,\'$.summary_ja\') AS summary_ja,json_extract(g.applicability_json,\'$.formula\') AS formula,json_extract(g.applicability_json,\'$.locator\') AS locator,g.applicability_json,r.retrieval_url,r.retrieved_on FROM regulations g JOIN source_revisions r USING(revision_id) ORDER BY g.regulation_id')])
    print(json.dumps(s['latest_batch_details'],ensure_ascii=False))
