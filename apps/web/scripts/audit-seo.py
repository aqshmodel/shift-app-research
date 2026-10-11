"""Audit public, server-rendered URLs from the sitemap without executing JavaScript."""
import argparse
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
import urllib.request
import xml.etree.ElementTree as ET


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta, self.links, self.titles, self.schemas = {}, {}, [], []
        self.h1 = 0
        self.capture = None
        self.buffer = []
        self.lang = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': self.lang = a.get('lang')
        if tag == 'h1': self.h1 += 1
        if tag == 'meta': self.meta[a.get('name') or a.get('property')] = a.get('content')
        if tag == 'link': self.links[a.get('rel')] = a.get('href')
        if tag == 'title' or (tag == 'script' and a.get('type') == 'application/ld+json'):
            self.capture, self.buffer = tag, []

    def handle_data(self, data):
        if self.capture: self.buffer.append(data)

    def handle_endtag(self, tag):
        if tag != self.capture: return
        value = ''.join(self.buffer)
        if tag == 'title': self.titles.append(value)
        else: self.schemas.append(json.loads(value))
        self.capture = None


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Aqsh-public-SEO-audit/1.0'})
    with urllib.request.urlopen(request, timeout=30) as r:
        return r.status, r.geturl(), {k.lower(): v for k, v in r.headers.items()}, r.read().decode('utf-8')


def audit(url):
    status, final_url, headers, html = fetch(url)
    page = Page()
    page.feed(html)
    issues = []
    for valid, label in [(status == 200, 'status'), (final_url == url, 'redirect'),
                         (page.lang == 'ja', 'language'), (len(page.titles) == 1, 'title count'),
                         (page.h1 == 1, 'h1 count'), (page.links.get('canonical') == url, 'canonical'),
                         ('noindex' not in page.meta.get('robots', ''), 'meta noindex'),
                         ('noindex' not in headers.get('x-robots-tag', ''), 'header noindex'),
                         (page.meta.get('og:url') == url, 'og:url'), (bool(page.schemas), 'JSON-LD')]:
        if not valid: issues.append(label)
    for name in ['description', 'og:title', 'og:description', 'og:image', 'og:image:alt',
                 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']:
        if not page.meta.get(name): issues.append('missing ' + name)
    ids = [item.get('@id') for schema in page.schemas for item in schema.get('@graph', []) if item.get('@id')]
    if len(ids) != len(set(ids)): issues.append('duplicate schema ID')
    return {'url': url, 'status': status, 'title': page.titles[0] if page.titles else '',
            'description': page.meta.get('description'), 'h1_count': page.h1, 'issues': issues}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', default='https://shift.aqsh.co.jp')
    parser.add_argument('--output', required=True)
    parser.add_argument('--baseline', action='store_true')
    args = parser.parse_args()
    status, _, _, xml = fetch(args.base.rstrip('/') + '/sitemap.xml')
    urls = [x.text for x in ET.fromstring(xml).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    with ThreadPoolExecutor(max_workers=4) as pool: pages = list(pool.map(audit, urls))
    for field in ['title', 'description']:
        groups = defaultdict(list)
        for p in pages: groups[p[field]].append(p)
        for value, group in groups.items():
            if len(group) > 1:
                for p in group: p['issues'].append('duplicate ' + field)
    report = {'checked_at': datetime.now(timezone.utc).isoformat(), 'sitemap_status': status,
              'url_count': len(urls), 'unique_urls': len(set(urls)),
              'issue_count': sum(len(p['issues']) for p in pages), 'pages': pages}
    Path(args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k != 'pages'}, ensure_ascii=False))
    if not args.baseline and (report['issue_count'] or len(urls) != len(set(urls))): raise SystemExit(1)
