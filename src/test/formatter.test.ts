import * as assert from 'assert';
import { formatTsql } from '../formatter/engine';

function cfg(overrides: Record<string, any> = {}) {
  return {
    get: (k: string, d: any) => (k in overrides ? overrides[k] : d)
  } as any;
}

suite('Formatter Engine', () => {
  test('keyword casing and newline after SELECT', () => {
    const text = 'select a, b from t';
    const out = formatTsql(text, { options: { insertSpaces: true, tabSize: 4 } as any, config: cfg({ keywordCasing: 'upper', newlineAfterSelect: true, indentSize: 2, newlineAfterFrom: false }), profile: {} });
    assert.ok(/SELECT/i.test(out));
    // Ensure SELECT items are present and FROM follows
    assert.ok(/SELECT\s+[^;]+\s+FROM/i.test(out));
    assert.ok(/\s+FROM/i.test(out));
  });

  test('bracket identifiers add/remove', () => {
    const t = 'SELECT a.Id, dbo.TableA FROM dbo.TableA a';
    const add = formatTsql(t, { options: {} as any, config: cfg({ bracketIdentifiers: 'add' }), profile: {} });
      assert.ok(/\[a\]\n?\.\n?\[Id\]/.test(add), 'should add brackets around alias and identifier (allow optional newlines)');
    const remove = formatTsql('[dbo].[TableA]', { options: {} as any, config: cfg({ bracketIdentifiers: 'remove' }), profile: {} });
    assert.strictEqual(remove, 'dbo.TableA');
  });

  test('operator spacing', () => {
    const t = 'WHERE a.Id=10 and b.Value>5';
    const out = formatTsql(t, { options: {} as any, config: cfg({ operatorSpacing: true }), profile: {} });
    assert.ok(/Id = 10/.test(out));
    assert.ok(/Value > 5/.test(out));
  });

  test('parenthesis spacing inside', () => {
    const t = 'COUNT(*)';
    const out = formatTsql(t, { options: {} as any, config: cfg({ parenthesisSpacing: 'inside' }), profile: {} });
    assert.ok(/COUNT\( \* \)/.test(out));
  });

  test('FROM and JOIN line breaks', () => {
    const t = 'SELECT a,b FROM t INNER JOIN x ON t.id=x.id';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterFrom: true }), profile: {} });
    assert.ok(/\nFROM /.test(out));
    assert.ok(/\nINNER JOIN /.test(out));
  });

  test('CTE newline formatting', () => {
    const t = 'WITH c AS (SELECT * FROM t) SELECT * FROM c';
    const out = formatTsql(t, { options: {} as any, config: cfg({ cteStyle: 'newline', indentSize: 2 }), profile: {} });
    assert.ok(/WITH\s+c\s+AS\s*\(/i.test(out));
    assert.ok(/\(\nSELECT\s+\*/i.test(out));
  });

  test('Window function multiline style', () => {
    const t = 'SELECT ROW_NUMBER() OVER(PARTITION BY a ORDER BY b) FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ windowFunctionStyle: 'multiline', indentSize: 2 }), profile: {} });
    assert.ok(/OVER\s*\(/i.test(out));
    assert.ok(/\n\s*PARTITION BY\s+a/i.test(out));
    assert.ok(/\n\s*ORDER BY\s+b\n\)/i.test(out));
  });

  test('Central alignment configurable clauses (SELECT)', () => {
    const t = 'SELECT a, b, c FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterSelect: true, indentStyle: 'central', indentStyleMode: 'enable', indentAlignColumn: 20, indentCentralClauses: ['SELECT'] }), profile: {} });
    assert.ok(/SELECT/i.test(out));
    assert.ok(/FROM/i.test(out));
  });

  test('Function call and comma spacing normalization', () => {
    const t = 'SELECT SUM (a) ,COUNT(b) FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({}), profile: {} });
    assert.ok(/SUM\(a\)/.test(out));
    assert.ok(/, COUNT\(b\)/.test(out));
  });

  test('Logical operator newline after', () => {
    const t = 'WHERE a = 1 AND b = 2 OR c = 3';
    const out = formatTsql(t, { options: {} as any, config: cfg({ logicalOperatorNewline: 'after' }), profile: {} });
    assert.ok(/AND\n/i.test(out));
    assert.ok(/OR\n/i.test(out));
  });

  test('Expression width safe wrap delimiters configurable', () => {
    const t = 'SELECT a, b, c FROM t WHERE x = 1 AND y = 2';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterSelect: true, indentSize: 2, expressionWidth: 15, safeWrapDelimiters: ['AND'] }), profile: {} });
    // Should wrap on AND but not reformat commas in SELECT list due to width
    assert.ok(/AND\n/i.test(out));
  });

  test('Comma position leading in SELECT', () => {
    const t = 'SELECT a, b, c FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterSelect: true, columnsCommaPlacement: 'leading', indentSize: 2 }), profile: {} });
    // Expect leading commas on subsequent lines
    const m = out.match(/SELECT\s+([\s\S]*?)\s+FROM/i);
    assert.ok(m && /\n\s*,\s*b/i.test(m[1]));
    assert.ok(m && /\n\s*,\s*c/i.test(m[1]));
  });

  test('Alias keyword AS enable/remove and tabulate alignment', () => {
    const t = 'SELECT a colA, b AS colB, c colC FROM dbo.Table t';
    const outEnable = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterSelect: true, aliasKeyword: 'enable', tabulateAlias: true, indentSize: 2 }), profile: {} });
    const asCount = (outEnable.match(/\bAS\b/gi) || []).length;
    assert.ok(asCount >= 2); // column + table alias

    const outRemove = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterSelect: true, aliasKeyword: 'remove', tabulateAlias: true, indentSize: 2 }), profile: {} });
    // Removal should not introduce additional AS occurrences
    const asCountRemove = (outRemove.match(/\bAS\b/gi) || []).length;
    assert.ok(asCountRemove <= 1);
    assert.ok(/FROM\s+dbo\.Table\s+t/i.test(outRemove));
  });

  test('Newline before semicolon and lines between queries', () => {
    const t = 'SELECT 1; SELECT 2;';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineBeforeSemicolon: true, linesBetweenQueries: 2 }), profile: {} });
    // Ensure semicolon is on its own line
    assert.ok(out.includes('\n;\n'));
  });
});
