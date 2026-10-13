"""Bounded, replay-safe SQL for immutable public product rows."""
MAX_STATEMENT_BYTES = 100_000
STAGING_PREFIX = '_aqsh_building_'

def literal(value):
    return "'" + value.replace("'", "''") + "'"

def chunks(value, limit):
    chunk = []
    size = 0
    for char in value:
        cost = len(char.encode('utf-8')) * (2 if char == "'" else 1)
        if chunk and size + cost > limit:
            yield ''.join(chunk)
            chunk, size = [], 0
        chunk.append(char)
        size += cost
    if chunk:
        yield ''.join(chunk)

def product_statements(snapshot, offering, slug, search, summary, detail):
    values = [snapshot, offering, slug, search, summary, detail]
    ordinary = 'INSERT OR IGNORE INTO web_products VALUES(' + ','.join(map(literal, values)) + ');'
    if len(ordinary.encode('utf-8')) <= MAX_STATEMENT_BYTES:
        return [ordinary]
    # A provisional slug gates assembly and never matches a completed row.
    # SQLite/D1 text concatenation preserves the original JSON bytes exactly.
    staged_slug = STAGING_PREFIX + offering
    statements = ['INSERT OR IGNORE INTO web_products VALUES(' + ','.join(map(literal, [snapshot, offering, staged_slug, '', '', ''])) + ');']
    predicate = 'snapshot_id=' + literal(snapshot) + ' AND offering_id=' + literal(offering) + ' AND slug=' + literal(staged_slug)
    fields = [('search_text', search), ('summary_json', summary), ('detail_json', detail)]
    for field, value in fields:
        offset = 0
        for part in chunks(value, MAX_STATEMENT_BYTES // 2):
            statements.append('UPDATE web_products SET ' + field + '=' + field + '||' + literal(part) + ' WHERE ' + predicate + ' AND length(' + field + ')=' + str(offset) + ';')
            offset += len(part)
    complete = ' AND '.join('length(' + field + ')=' + str(len(value)) for field, value in fields)
    statements.append('UPDATE web_products SET slug=' + literal(slug) + ' WHERE ' + predicate + ' AND ' + complete + ' AND json_valid(summary_json) AND json_valid(detail_json);')
    if any(len(statement.encode('utf-8')) > MAX_STATEMENT_BYTES for statement in statements):
        raise ValueError('Publication SQL statement exceeds bounded limit')
    return statements

def complete_product_filter(snapshot):
    return 'snapshot_id=' + literal(snapshot) + ' AND substr(slug,1,' + str(len(STAGING_PREFIX)) + ')!=' + literal(STAGING_PREFIX) + ' AND json_valid(summary_json) AND json_valid(detail_json)'
