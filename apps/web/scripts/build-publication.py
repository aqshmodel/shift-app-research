"""Build immutable, versioned public projections without changing research records."""
import hashlib,json,sqlite3,sys,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
PKG=ROOT/'Aqsh_Shift_Research_v2_Batch02_DB_20261011'
sys.path.insert(0,str(PKG/'tools'))
from research_db import connect,fingerprint,literal,stats
out=ROOT/'apps/web/data';out.mkdir(exist_ok=True)
def dumps(v): return json.dumps(v,ensure_ascii=False,separators=(',',':'),sort_keys=True)
def norm(v): return unicodedata.normalize('NFKC',v).lower()
# Explicit editorial membership. It describes a documented target audience, not
# conformance to all healthcare regulation or automatic generation capabilities.
members={
 'medical': ['JP01','JP04','JP07','JP08','JP09','JP10','JP11','JP12','JP13','JP19','JP20','JP21','JP26']+['US%02d'%i for i in [1,2,3,4,8,11,12,13,14,15,16,17]],
 'care':['JP01','JP03','JP04','JP05','JP06','JP07','JP08','JP13','JP15','JP19','JP22','JP25','JP26'],
 'general':['JP02','JP05','JP06','JP14','JP16','JP17','JP18','JP23','JP24','JP25','JP26','JP27']+['US%02d'%i for i in [5,6,7,9,18,19,20,21,22]],
 'api':['JP28','US10']}
with connect() as c:
 stat=stats(c);version=stat['latest_batch']+'-pub2';research_hash=fingerprint(c)
 scope=dict(snapshot_id=version,as_of_date='2026-10-11',research_sha256=research_hash,products=stat['products'],offerings=stat['offerings'],document_observations=stat['document_observations'],research_documents=stat['research_documents'],price_components=stat['tables']['price_components'],logos=stat['tables']['brand_assets'],reference_regulations=stat['tables']['regulations'],benchmark_runs=stat['benchmark_runs'],independent_tests_performed=False,
  priority_open=c.execute("select count(*) from research_tasks where priority=1 and task_state!='done'").fetchone()[0],
  limitations=['公開資料の確認で、実動作・性能・個別契約の保証ではありません。','記載未確認は非対応を意味しません。','医療制度の参照と各製品の実装確認は別です。'],
  criteria=[dict(x) for x in c.execute("select criterion_id,label_ja from criteria where research_stage='L1_common' order by criterion_id")],
  regulations=[dict(x) for x in c.execute('select g.regulation_id,g.title,g.version_label,g.applicability_json,r.retrieval_url,r.retrieved_on from regulations g join source_revisions r using(revision_id) order by regulation_id')])
 rows=[];membership=[]
 for p in c.execute('select * from v_product_coverage order by canonical_name'):
  pid=p['product_id'];oid=p['offering_id'];product=dict(c.execute('select * from products where product_id=?',(pid,)).fetchone())
  observations=[dict(x) for x in c.execute("select * from v_current_observations where offering_id=? and current_evidence_role!='rejected' order by criterion_id,observation_id desc,evidence_id",(oid,))]
  grouped={}
  for o in observations:
   key=o['observation_id'];role=o['current_evidence_role']
   if key not in grouped:
    grouped[key]=dict(id=key,criterion=o['criterion_id'],label=o['label_ja'],summary=o['paraphrase'] or o['summary_ja'] or o['unknown_reason'],state=o['value_state'],support=o['support_status'],delivery=o['delivery_mode'],verification=o['verification_stage'],evidence_role=role,scope=json.loads(o['applicability_json'] or '{}'),limitations=o['limitations'],sources=[])
   grouped[key]['sources'].append(dict(url=o['canonical_url'],title=o['title'],locator=o['locator'],retrieved_on=o['retrieved_on']))
  facts=list(grouped.values())
  assessments=[]
  # Include common40 and deep research, with adopted observations and exact URLs.
  common=[dict(x) for x in c.execute('select * from v_current40 where offering_id=? order by criterion_id',(oid,))]
  criterion_ids=sorted({x['criterion_id'] for x in common}|{x['criterion'] for x in facts})
  for cid in criterion_ids:
   selected=[x for x in facts if x['criterion']==cid and x['evidence_role'] in ('accepted','conflicting')]
   contexts=[x for x in facts if x['criterion']==cid and x['evidence_role']=='context']
   meta=c.execute('select * from criteria where criterion_id=?',(cid,)).fetchone()
   current=c.execute('select * from v_latest_resolutions where offering_id=? and criterion_id=?',(oid,cid)).fetchone()
   status='disputed' if any(x['state']=='disputed' for x in selected) else 'planned' if selected and all('提供予定' in dumps(x['scope']) or '提供前' in x['summary'] or '未リリース' in x['summary'] for x in selected) else 'documented' if any(x['state']=='known' for x in selected) else 'unknown'
   rationale=current['rationale'] if current else 'この設問を確定する資料はまだありません。'
   if pid=='JP27' and cid=='B01':
    status='unknown';rationale='業務の自動割当は確認したが、勤務表そのものの自動割当は記載未確認。別機能の説明を勤務表自動作成の確認に含めない。'
   assessments.append(dict(id=cid,label=meta['label_ja'],status=status,rationale=rationale,findings=selected,context_count=len(contexts)))
  core=[x for x in facts if x['criterion']=='B01' and x['evidence_role'] in ('accepted','conflicting')]
  target=[x for x in facts if x['criterion']=='A04' and x['evidence_role']=='accepted']
  intro=(core[0]['summary'] if core else target[0]['summary'] if target else '公開資料で提供範囲を調査しているサービスです。')
  cats=[k for k,v in members.items() if pid in v]
  logo=c.execute('select * from v_preferred_brand_assets where product_id=?',(pid,)).fetchone()
  aliases=[x[0] for x in c.execute('select alias from product_aliases where product_id=?',(pid,))]
  official=product['official_url'];official_note='各社の公開案内'
  # Initial catalog had a customer help page as official_url. Preserve that
  # research source, but publish Oracle's own current operations page instead.
  if pid=='US15': official='https://www.oracle.com/health/clinical-operations/';official_note='Oracle Health公式。現行名・個別契約の対応関係は未確認。'
  summary=dict(id=oid,product_id=pid,slug=pid.lower(),name=p['canonical_name'],vendor=p['legal_name'],region=p['market_region'],kind=p['product_kind'],aliases=aliases,summary=intro,categories=cats,official_url=official,official_note=official_note,
   logo=dict(url=logo['asset_url'],kind=logo['logo_kind'],brand=logo['brand_name'],source_url=logo['source_page_url'],rights=logo['rights_status']) if logo else None,
   features=[dict(id=x['id'],status=x['status']) for x in assessments if x['id'] in ['B01','J05','J06','N02','M08']],
   record_count=len(facts),as_of_date='2026-10-11',snapshot_id=version)
  prices=[]
  for price in c.execute('select * from v_price_details where offering_id=? order by component_id',(oid,)):
   row=dict(price); row['conditions']=json.loads(row.pop('conditions_json') or '{}')
   row['plan_conditions']=dict(c.execute('select commitment_months,billing_period_months,prepayment,min_billable_units,terms_note from plans where plan_id=?',(row['plan_id'],)).fetchone())
   prices.append(row)
  offering=dict(c.execute('select * from offerings where offering_id=?',(oid,)).fetchone())
  questions=[dict(x) for x in c.execute("select criterion_id,question,required_method,priority from research_tasks where offering_id=? and task_state!='done' and priority=1 order by criterion_id,task_id",(oid,))]
  detail={**summary,'offering':offering,'assessments':assessments,'prices':prices,'open_questions':questions,'independent_tests_performed':False}
  rows.append(dict(id=oid,slug=pid.lower(),search=norm(' '.join([p['canonical_name'],p['legal_name'] or '',*aliases,intro,*[x['summary'] or '' for x in facts]])),summary=summary,detail=detail))
  for cat in cats:
   membership.append(dict(category=cat,id=oid,provenance=dict(basis='公開資料の対象業態と提供形態を編集分類。分類は制度適合の認定ではない。',observations=[x['id'] for x in target],research_kind=p['product_kind'],scope='らくしふの医療分類は別サービス オートメーションの説明を含む。' if pid=='JP26' else '採用された出典の対象範囲を参照。')))
 payload=dumps(dict(scope=scope,products=rows,membership=membership));content_hash=hashlib.sha256(payload.encode()).hexdigest()
 scope['content_sha256']=content_hash
 sql=['-- Apply migration 0001 first. Research import is only for an empty DB.']
 sql.append('INSERT OR IGNORE INTO web_snapshots(snapshot_id,as_of_date,research_sha256,content_sha256,scope_json) VALUES('+','.join(map(literal,[version,'2026-10-11',research_hash,content_hash,dumps(scope)]))+');')
 for row in rows:
  sql.append('INSERT OR IGNORE INTO web_products VALUES('+','.join(map(literal,[version,row['id'],row['slug'],row['search'],dumps(row['summary']),dumps(row['detail'])]))+');')
 for m in membership:sql.append('INSERT OR IGNORE INTO web_categories VALUES('+','.join(map(literal,[version,m['category'],m['id'],dumps(m['provenance'])]))+');')
 # Publish only after every product exists; a failed insert cannot activate a
 # partial snapshot. Existing published versions remain available for rollback.
 sql.append('INSERT INTO web_live(id,snapshot_id) SELECT 1,snapshot_id FROM web_snapshots WHERE snapshot_id='+literal(version)+' AND content_sha256='+literal(content_hash)+' AND (SELECT count(*) FROM web_products WHERE snapshot_id='+literal(version)+')=50 AND (SELECT count(*) FROM web_categories WHERE snapshot_id='+literal(version)+')='+str(len(membership))+' ON CONFLICT(id) DO UPDATE SET snapshot_id=excluded.snapshot_id;')
 (out/'publication.sql').write_text('\n'.join(sql)+'\n')
 (out/'manifest.json').write_text(json.dumps(dict(snapshot_id=version,research_sha256=research_hash,content_sha256=content_hash,products=50,category_memberships=len(membership),maximum_statement_bytes=max(len(x.encode()) for x in sql),scope=scope),ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({k:v for k,v in json.loads((out/'manifest.json').read_text()).items() if k!='scope'},ensure_ascii=False))
