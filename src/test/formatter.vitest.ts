import { describe, it, expect } from 'vitest';
import { formatTsql } from '../formatter/engine';

function cfg(overrides: Record<string, any> = {}) {
  return {
    get: (k: string, d: any) => (k in overrides ? overrides[k] : d)
  } as any;
}

describe('Formatter Engine (Vitest)', () => {
  it('keyword casing and newline after SELECT', () => {
    const text = 'select a, b from t';
    const out = formatTsql(text, { options: { insertSpaces: true, tabSize: 4 } as any, config: cfg({ keywordCasing: 'upper', newlineAfterSelect: true, indentSize: 2, newlineAfterFrom: false }), profile: {} });
    expect(/SELECT/i.test(out)).toBe(true);
    expect(/SELECT\s+[^;]+\s+FROM/i.test(out)).toBe(true);
    expect(/\s+FROM/i.test(out)).toBe(true);
  });

  it('bracket identifiers add/remove', () => {
    const t = 'SELECT a.Id, dbo.TableA FROM dbo.TableA a';
    const add = formatTsql(t, { options: {} as any, config: cfg({ bracketIdentifiers: 'add' }), profile: {} });
    expect(/\[a\]\.\[Id\]/.test(add)).toBe(true);
    const remove = formatTsql('[dbo].[TableA]', { options: {} as any, config: cfg({ bracketIdentifiers: 'remove' }), profile: {} });
    expect(remove).toBe('dbo.TableA');
  });

  it('operator spacing', () => {
    const t = 'WHERE a.Id=10 and b.Value>5';
    const out = formatTsql(t, { options: {} as any, config: cfg({ operatorSpacing: true }), profile: {} });
    expect(/Id = 10/.test(out)).toBe(true);
    expect(/Value > 5/.test(out)).toBe(true);
  });

  it('parenthesis spacing inside', () => {
    const t = 'COUNT(*)';
    const out = formatTsql(t, { options: {} as any, config: cfg({ parenthesisSpacing: 'inside' }), profile: {} });
    expect(/COUNT\( \* \)/.test(out)).toBe(true);
  });

  it('FROM and JOIN line breaks', () => {
    const t = 'SELECT a,b FROM t INNER JOIN x ON t.id=x.id';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterFrom: true }), profile: {} });
    expect(/\nFROM /.test(out)).toBe(true);
    expect(/\nINNER JOIN /.test(out)).toBe(true);
  });

  it('CTE newline formatting', () => {
    const t = 'WITH c AS (SELECT * FROM t) SELECT * FROM c';
    const out = formatTsql(t, { options: {} as any, config: cfg({ cteStyle: 'newline', indentSize: 2 }), profile: {} });
    expect(/WITH\s+c\s+AS\s*\(/i.test(out)).toBe(true);
    expect(/\(\nSELECT\s+\*/i.test(out)).toBe(true);
  });

  it('Window function multiline style', () => {
    const t = 'SELECT ROW_NUMBER() OVER(PARTITION BY a ORDER BY b) FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ windowFunctionStyle: 'multiline', indentSize: 2 }), profile: {} });
    expect(/OVER\s*\(/i.test(out)).toBe(true);
    expect(/\n\s*PARTITION BY\s+a/i.test(out)).toBe(true);
    expect(/\n\s*ORDER BY\s+b\n\)/i.test(out)).toBe(true);
  });

  it('Function call and comma spacing normalization', () => {
    const t = 'SELECT SUM (a) ,COUNT(b) FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({}), profile: {} });
    expect(/SUM\(a\)/.test(out)).toBe(true);
    expect(/, COUNT\(b\)/.test(out)).toBe(true);
  });

  it('Logical operator newline after', () => {
    const t = 'WHERE a = 1 AND b = 2 OR c = 3';
    const out = formatTsql(t, { options: {} as any, config: cfg({ logicalOperatorNewline: 'after' }), profile: {} });
    expect(/AND\n/i.test(out)).toBe(true);
    expect(/OR\n/i.test(out)).toBe(true);
  });

  it('Columns comma placement leading in SELECT', () => {
    const t = 'SELECT a, b, c FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterSelect: true, columnsCommaPlacement: 'leading', indentSize: 2 }), profile: {} });
    const m = out.match(/SELECT\s+([\s\S]*?)\s+FROM/i);
    expect(m && /\n\s*,\s*b/i.test(m[1]!)).toBe(true);
    expect(m && /\n\s*,\s*c/i.test(m[1]!)).toBe(true);
  });

  it('Alias keyword enable/remove and table alias handling', () => {
    const t = 'SELECT a colA, b AS colB, c colC FROM dbo.Table t';
    const outEnable = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterSelect: true, aliasKeyword: 'enable', indentSize: 2 }), profile: {} });
    const asCount = (outEnable.match(/\bAS\b/gi) || []).length;
    expect(asCount).toBeGreaterThanOrEqual(2);

    const outRemove = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterSelect: true, aliasKeyword: 'remove', indentSize: 2 }), profile: {} });
    const asCountRemove = (outRemove.match(/\bAS\b/gi) || []).length;
    expect(asCountRemove).toBeLessThanOrEqual(1);
    expect(/FROM\s+dbo\.Table\s+t/i.test(outRemove)).toBe(true);
  });

  it('Newline before semicolon and lines between queries', () => {
    const t = 'SELECT 1; SELECT 2;';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineBeforeSemicolon: true, linesBetweenQueries: 2 }), profile: {} });
    expect(out.includes('\n;\n')).toBe(true);
  });

  it('dense operators', () => {
    const t = 'WHERE a = 10 AND b > 5';
    const out = formatTsql(t, { options: {} as any, config: cfg({ denseOperators: true }), profile: {} });
    expect(out).toBe('WHERE a=10AND\nb>5');
  });

  it('parenthesis spacing outside', () => {
    const t = 'COUNT(*)';
    const out = formatTsql(t, { options: {} as any, config: cfg({ parenthesisSpacing: 'outside' }), profile: {} });
    expect(out).toBe('COUNT( * ) ');
  });

  it('join alignment left', () => {
    const t = 'SELECT a FROM t INNER JOIN x ON t.id=x.id';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterFrom: true, joinAlignment: 'left' }), profile: {} });
    expect(/\nINNER JOIN /.test(out)).toBe(true);
  });

  it('logical operator newline before', () => {
    const t = 'WHERE a = 1 AND b = 2';
    const out = formatTsql(t, { options: {} as any, config: cfg({ logicalOperatorNewline: 'before' }), profile: {} });
    expect(/\nAND /.test(out)).toBe(true);
  });

  it('alias keyword enable for table aliases', () => {
    const t = 'SELECT a FROM dbo.Table t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ aliasKeyword: 'enable' }), profile: {} });
    expect(out).toBe('SELECT\n    a\nFROM dbo.TABLE AS t');
  });

  it('columns comma placement ignore', () => {
    const t = 'SELECT a, b, c FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterSelect: true, columnsCommaPlacement: 'ignore' }), profile: {} });
    expect(/SELECT\n\s+a\n\s+b\n\s+c\nFROM/.test(out)).toBe(true);
  });

  it('expression width wrapping', () => {
    const t = 'SELECT verylongcolumnname, anotherverylongcolumnname FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterSelect: true, expressionWidth: 20, safeWrapDelimiters: ['comma'] }), profile: {} });
    expect(out.includes('\n')).toBe(true);
  });

  it('cte style inline', () => {
    const t = 'WITH c AS (SELECT * FROM t) SELECT * FROM c';
    const out = formatTsql(t, { options: {} as any, config: cfg({ cteStyle: 'inline' }), profile: {} });
    expect(out).toBe('WITH c AS(SELECT\n    *\nFROM t) SELECT\n    *\nFROM c');
  });

  it('window function compact style', () => {
    const t = 'SELECT ROW_NUMBER() OVER(PARTITION BY a ORDER BY b) FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ windowFunctionStyle: 'compact' }), profile: {} });
    expect(/OVER\(PARTITION BY a ORDER BY b\)/.test(out)).toBe(true);
  });

  it('align column definitions false', () => {
    const t = 'CREATE TABLE t (id INT, name VARCHAR(50))';
    const out = formatTsql(t, { options: {} as any, config: cfg({ alignColumnDefinitions: false }), profile: {} });
    expect(out).toBe('CREATE TABLE t(id INT, name VARCHAR(50))');
  });

  it('bracket identifiers ignore', () => {
    const t = 'SELECT a FROM [dbo].[Table]';
    const out = formatTsql(t, { options: {} as any, config: cfg({ bracketIdentifiers: 'ignore' }), profile: {} });
    expect(out).toBe('SELECT\n    a\nFROM [dbo].[TABLE]');
  });

  it('tabulate alias', () => {
    const t = 'SELECT a AS alias, verylongcolumn AS longer FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterSelect: true, tabulateAlias: true }), profile: {} });
    expect(out).toBe('SELECT\n    a AS alias, verylongcolumn AS longer\nFROM t');
  });

  it('expression width wrapping without delimiters', () => {
    const t = 'SELECT verylongcolumnnamethatexceeds FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterSelect: true, expressionWidth: 20 }), profile: {} });
    expect(out.includes('\n')).toBe(true);
  });

  it('alias keyword remove for table aliases', () => {
    const t = 'SELECT a FROM dbo.Table AS t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ aliasKeyword: 'remove' }), profile: {} });
    expect(out).toBe('SELECT\n    a\nFROM dbo.TABLE t');
  });

  it('central indent alignment', () => {
    const t = 'SELECT a FROM t\nWHERE b = 1';
    const out = formatTsql(t, { options: {} as any, config: cfg({ indentStyle: 'central', indentStyleMode: 'enable', indentAlignColumn: 20, indentCentralClauses: ['WHERE'] }), profile: {} });
    expect(out.includes('         WHERE')).toBe(true);
  });

  it('central indent alignment select', () => {
    const t = 'SELECT a, b FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ newlineAfterSelect: true, indentStyle: 'central', indentStyleMode: 'enable', indentAlignColumn: 10, indentCentralClauses: ['SELECT'] }), profile: {} });
    // Verify SELECT items are split and aligned consistently.
    expect(/SELECT\s*\n\s+a,\n\s+b\s+FROM/.test(out)).toBe(true);
  });

  it('window function multiline style', () => {
    const t = 'SELECT ROW_NUMBER() OVER(PARTITION BY a ORDER BY b) FROM t';
    const out = formatTsql(t, { options: {} as any, config: cfg({ windowFunctionStyle: 'multiline' }), profile: {} });
    expect(/OVER\s*\(\s*\n\s*PARTITION BY/.test(out)).toBe(true);
  });

  it('align column definitions true', () => {
    const t = 'CREATE TABLE t (id INT, name VARCHAR(50))';
    const out = formatTsql(t, { options: {} as any, config: cfg({ alignColumnDefinitions: true }), profile: {} });
    console.log('align-cols OUT:\n' + out);
    expect(out).toBe('CREATE TABLE t (\n  id   INT,\n  name VARCHAR(50)\n)');
  });

  it('bracket identifiers remove', () => {
    const t = 'SELECT [a] FROM [t]';
    const out = formatTsql(t, { options: {} as any, config: cfg({ bracketIdentifiers: 'remove' }), profile: {} });
    expect(out).toBe('SELECT\n    a\nFROM t');
  });
});
