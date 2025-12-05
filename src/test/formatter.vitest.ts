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
    expect(/\[a\]\n?\.\n?\[Id\]/.test(add)).toBe(true);
    const remove = formatTsql('[dbo].[TableA]', { options: {} as any, config: cfg({ bracketIdentifiers: 'remove' }), profile: {} });
    expect(remove).toBe('dbo.TableA');
  });

  it('operator spacing', () => {
    const t = 'WHERE a.Id=10 and b.Value>5';
    const out = formatTsql(t, { options: {} as any, config: cfg({ operatorSpacing: true }), profile: {} });
    expect(/Id \= 10/.test(out)).toBe(true);
    expect(/Value \> 5/.test(out)).toBe(true);
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
});
