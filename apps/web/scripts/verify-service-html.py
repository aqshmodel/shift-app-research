"""Verify all canonical service HTML against the published research source."""
import argparse,json,sqlite3,time,urllib.request,xml.etree.ElementTree as ET
from datetime import datetime,timezone,date
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
PKG=ROOT/'Aqsh_Shift_Research_v2_Batch02_DB_20261011'
class Page(HTMLParser):
 def __init__(self):
  super().__init__();self.records=[];self.meta={};self.canonical=[];self.schemas=[];self.titles=[];self.h1_count=0;self.capture=None;self.buffer=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag=='article' and 'record' in attrs.get('class','').split():self.records.append(attrs.get('data-observation-id'))
  if tag=='meta':self.meta[attrs.get('name')]=attrs.get('content','')
  if tag=='link' and attrs.get('rel')=='canonical':self.canonical.append(attrs.get('href'))
  if tag=='h1':self.h1_count+=1
  if tag=='title' or (tag=='script' and attrs.get('type')=='application/ld+json'):self.capture=tag;self.buffer=[]
 def handle_data(self,text):
  if self.capture:self.buffer.append(text)
 def handle_endtag(self,tag):
  if self.capture!=tag:return
  text=''.join(self.buffer)
  if tag=='title':self.titles.append(text)
  else:self.schemas.append(json.loads(text))
  self.capture=None

def fetch(base,path):
 request=urllib.request.Request(base.rstrip('/')+path,headers={'User-Agent':'Aqsh-public-SEO-audit/1.0'})
 started=time.monotonic()
 with urllib.request.urlopen(request,timeout=30) as response:
  return response.status,dict(response.headers),response.read().decode('utf-8'),round((time.monotonic()-started)*1000,1)

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--base',required=True);parser.add_argument('--output',required=True,type=Path);parser.add_argument('--staging',action='store_true');args=parser.parse_args()
 expected=json.loads((ROOT/'apps/web/data/manifest.json').read_text())
 status,_,text,_=fetch(args.base,'/api/scope/');assert status==200 and json.loads(text)==expected['scope'],'Scope differs from selected publication'
 status,_,text,_=fetch(args.base,'/sitemap.xml');assert status==200
 entries={url.find('{*}loc').text:url.findtext('{*}lastmod') for url in ET.fromstring(text)};assert len(entries)==62
 canonical=sqlite3.connect(f'file:{PKG / "research.sqlite3"}?mode=ro',uri=True)
 projection=sqlite3.connect(':memory:');projection.executescript((ROOT/'apps/web/migrations/0001_publication.sql').read_text());projection.executescript((ROOT/'apps/web/data/publication.sql').read_text())
 details=[json.loads(row[0]) for row in projection.execute('SELECT detail_json FROM web_products WHERE snapshot_id=? ORDER BY slug',(expected['snapshot_id'],))];assert len(details)==50
 checks=[];all_records=[]
 for product in details:
  path='/products/'+product['slug']+'/';url='https://shift.aqsh.co.jp'+path;status,headers,html,elapsed=fetch(args.base,path);page=Page();page.feed(html)
  source=[r[0] for r in canonical.execute("SELECT DISTINCT observation_id FROM v_current_observations WHERE offering_id=? AND record_category='document_observation'",(product['id'],))]
  assert status==200 and page.canonical==[url] and page.h1_count==1,path
  assert len(page.titles)==1 and product['name'] in page.titles[0],path
  assert 'noindex' not in page.meta.get('robots',''),path
  header_robots=next((v for k,v in headers.items() if k.lower()=='x-robots-tag'),'')
  assert ('noindex' in header_robots)==args.staging,path
  assert len(page.records)==len(set(page.records))==len(source) and set(page.records)==set(source),'Missing or extra HTML records: '+path
  assert url in entries and entries[url] and date.fromisoformat(entries[url]),path
  graph=[node for schema in page.schemas for node in schema.get('@graph',[])];webpage=next(node for node in graph if node.get('@type')=='WebPage');assert webpage['dateModified']==entries[url],path
  assert '<details class="record-archive"' in html and 'load-evidence' not in html,path
  checks.append({'id':product['id'],'name':product['name'],'url':url,'http_status':status,'html_records':len(page.records),'all_visible_source_records_match':True,'date_modified':entries[url],'html_bytes':len(html.encode()),'elapsed_ms':elapsed,'server_timing':next((v for k,v in headers.items() if k.lower()=='server-timing'),'')});all_records+=page.records
 assert len(all_records)==len(set(all_records))==canonical.execute("SELECT count(DISTINCT observation_id) FROM v_current_observations WHERE record_category='document_observation'").fetchone()[0]
 result={'status':'passed','checked_at':datetime.now(timezone.utc).isoformat(),'base':args.base,'snapshot_id':expected['snapshot_id'],'services':50,'sitemap_urls':len(entries),'server_rendered_records':len(all_records),'excluded_history_preserved':expected['scope']['document_observations']-len(all_records),'research_sha256':expected['research_sha256'],'content_sha256':expected['content_sha256'],'checks':checks}
 args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='checks'},ensure_ascii=False))
if __name__=='__main__':main()
