import type * as vscode from 'vscode';

type EngineConfig = {
  options: vscode.FormattingOptions;
  config: any;
  profile?: any;
};

export function formatTsql(text: string, { options, config, profile }: EngineConfig): string {
  // Minimal placeholder: normalize keyword casing and basic indentation.
  // TODO: Implement full T-SQL parser/formatter with rules.
  const ignoreTabSettings = config.get?.('ignoreTabSettings', false);
  const indentSize = ignoreTabSettings ? (config.get?.('tabSizeOverride', 4) ?? 4) : (config.get?.('indentSize', 4) ?? options.tabSize ?? 4);
  const insertSpaces = ignoreTabSettings ? (config.get?.('insertSpacesOverride', true) ?? true) : (options.insertSpaces ?? true);
  const keywordCasing = config.get?.('keywordCasing', 'upper') ?? 'upper';
  const indentStyle = config.get?.('indentStyle', 'standard');
  const indentStyleMode = config.get?.('indentStyleMode', 'ignore');
  const indentAlignColumn = config.get?.('indentAlignColumn', 40);
  const indentCentralClauses: string[] = config.get?.('indentCentralClauses', ['ON', 'SET']);
  const operatorSpacingEnabled = config.get?.('operatorSpacing', true);
  const denseOperators = config.get?.('denseOperators', false);
  const parenthesisSpacing = config.get?.('parenthesisSpacing', 'none');
  const newlineAfterFrom = config.get?.('newlineAfterFrom', true);
  const joinAlignment = config.get?.('joinAlignment', 'indent');
  const logicalOpBreak = config.get?.('logicalOperatorNewline', 'after');
  const tabulateAlias = config.get?.('tabulateAlias', false);
  const aliasKeyword = config.get?.('aliasKeyword', 'ignore');
  const columnsCommaPlacement = config.get?.('columnsCommaPlacement', 'trailing');
  const expressionWidth = config.get?.('expressionWidth', 0);
  const safeWrapDelims: string[] = config.get?.('safeWrapDelimiters', ['comma', 'AND', 'OR']);
  const linesBetweenQueries = config.get?.('linesBetweenQueries', 1);
  const cteStyle = config.get?.('cteStyle', 'newline');
  const windowFunctionStyle = config.get?.('windowFunctionStyle', 'compact');
  const newlineBeforeSemicolon = config.get?.('newlineBeforeSemicolon', false);

  const keywords = [
    'select','from','where','group','by','order','inner','left','right','full','join','on','with','cte','over','partition','insert','into','update','delete','create','alter','drop','table','view','function','procedure'
  ];

  const kw = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  let out = text.replace(kw, (m) => keywordCasing === 'upper' ? m.toUpperCase() : keywordCasing === 'lower' ? m.toLowerCase() : m);

  // Basic line cleanup
  out = out.replace(/[\t ]+/g, ' ');
  out = out.replace(/\r?\n[\s]+/g, '\n');

  // Operator spacing vs dense operators
  if (denseOperators) {
    out = out.replace(/\s*([=<>!]+|[+\-*\/])\s*/g, '$1');
  } else if (operatorSpacingEnabled) {
    out = out.replace(/\s*([=<>!]+|[+\-*\/])\s*/g, ' $1 ');
  }

  // Parenthesis spacing
  if (parenthesisSpacing === 'inside') {
    out = out.replace(/\(\s*/g, '( ').replace(/\s*\)/g, ' )');
  } else if (parenthesisSpacing === 'outside') {
    out = out.replace(/\s*\(/g, ' (').replace(/\)\s*/g, ') ');
  }

  // Simple formatting: put each select item on new line if configured
  const newlineAfterSelect = config.get?.('newlineAfterSelect', true);
  if (newlineAfterSelect) {
    out = out.replace(/SELECT\s+([^;]+?)\s+FROM/gi, (m, p1) => {
      const items = p1.split(',').map((s: string) => s.trim());
      const indent = insertSpaces ? ' '.repeat(indentSize) : '\t';
      let lines: string[] = items.map((i: string) => i);
      // Normalize alias AS keyword per setting
      if (aliasKeyword === 'enable') {
        lines = lines.map((l: string) => {
          if (/\s+AS\s+\w+$/i.test(l)) { return l; }
          const m = l.match(/^(.*\S)\s+(\w+)$/i);
          if (m) {
            const expr = m[1];
            const alias = m[2];
            return `${expr} AS ${alias}`;
          }
          return l;
        });
      } else if (aliasKeyword === 'remove') {
        // Remove alias AS keyword from items before further processing
        const processedItems = lines.map((l: string) => {
          return l.replace(/\s+AS\s+(\w+)\s*(,)?\s*$/i, ' $1$2');
        });
      }
      if (columnsCommaPlacement !== 'ignore') {
        if (columnsCommaPlacement === 'leading') {
          lines = (aliasKeyword === 'remove' ? processedItems : lines).map((i: string, idx: number) => (idx === 0 ? i : `, ${i}`));
        } else {
          lines = (aliasKeyword === 'remove' ? processedItems : lines).map((i: string, idx: number) => (idx < (aliasKeyword === 'remove' ? processedItems.length : lines.length) - 1 ? `${i},` : i));
        }
      } else {
        // Preserve original items order without altering comma positions
        lines = (aliasKeyword === 'remove' ? processedItems : lines).map((i: string) => i);
      // Alias tabulation (simple: align AS or alias start)
      if (tabulateAlias) {
        // compute display length up to alias start (including space + optional AS)
        const aliasStart = (l: string) => {
          const m = l.match(/\s+AS\s+\w+$/i);
          if (m) { return l.indexOf(m[0]); }
          const m2 = l.match(/\s+\w+$/i);
          return m2 ? l.indexOf(m2[0]) : l.length;
        };
        const maxLen = Math.max(...lines.map(aliasStart));
        lines = lines.map((l: string) => {
          const start = aliasStart(l);
          const pad = ' '.repeat(Math.max(0, maxLen - start));
          return `${l.slice(0, start)}${pad}${l.slice(start)}`;
        });
      }
      // Wrap by expression width if set
      if (expressionWidth && expressionWidth > 0) {
        lines = lines.flatMap((l: string) => {
          if (l.length <= expressionWidth) { return [l]; }
          const result: string[] = [];
          let current = l.trim();
          const includeComma = safeWrapDelims.includes('comma');
          const includeAnd = safeWrapDelims.some(d => d.toUpperCase() === 'AND');
          const includeOr = safeWrapDelims.some(d => d.toUpperCase() === 'OR');
          const splitPattern = new RegExp([
            includeComma ? '\\s*,\\s*' : '',
            includeAnd ? '\\s+AND\\s+' : '',
            includeOr ? '\\s+OR\\s+' : ''
          ].filter(Boolean).join('|'), 'i');
          while (current.length > expressionWidth) {
            // find the last safe split before width
            const segment = current.slice(0, expressionWidth + 1);
            const splits = segment.split(splitPattern);
            if (splits.length > 1) {
              const keep = splits.slice(0, -1).join(', '); // rejoin
              result.push(keep.trim());
              current = current.slice(keep.length).replace(/^\s*(,|AND|OR)\s*/i, '$1 ');
              continue;
            }
            break; // no safe split; stop wrapping
          }
          result.push(current.trim());
          return result;
        });
      }
      return `SELECT\n${indent}${lines.join(`\n${indent}`)} FROM`;
    });
  }

  // Apply comma placement to GROUP BY and ORDER BY lists similarly
  if (columnsCommaPlacement !== 'ignore') {
    const applyListPlacement = (list: string) => {
      const items = list.split(',').map((s: string) => s.trim());
      if (columnsCommaPlacement === 'leading') {
        return items.map((i: string, idx: number) => (idx === 0 ? i : `, ${i}`)).join(' ');
      }
      return items.map((i: string, idx: number) => (idx < items.length - 1 ? `${i},` : i)).join(' ');
    };
    out = out.replace(/GROUP\s+BY\s+([^;\n]+)(?=\s*(?:ORDER\s+BY|HAVING|UNION|INTERSECT|EXCEPT|\)|;|$))/gi, (m, p1) => {
      const placed = applyListPlacement(p1);
      return `GROUP BY ${placed}`;
    });
    out = out.replace(/ORDER\s+BY\s+([^;\n]+)(?=\s*(?:UNION|INTERSECT|EXCEPT|\)|;|$))/gi, (m, p1) => {
      const placed = applyListPlacement(p1);
      return `ORDER BY ${placed}`;
    });
  }

  // FROM/JOIN line breaks and alignment
  if (newlineAfterFrom) {
    // Put JOINs on their own line
    out = out.replace(/\s+(INNER|LEFT|RIGHT|FULL)\s+JOIN\s+/gi, (m) => `\n${m.trim()} `);
    // Put FROM on its own line from SELECT
    out = out.replace(/\s+FROM\s+/gi, (m) => `\nFROM `);

    if (joinAlignment === 'left') {
      // Ensure JOIN keywords start at line's left
      out = out.replace(/\n\s+(INNER|LEFT|RIGHT|FULL)\s+JOIN/gi, (m) => `\n${m.trim()}`);
    }
  }

  // Alias keyword handling for table/subquery aliases in FROM/JOIN clauses
  if (aliasKeyword !== 'ignore') {
    if (aliasKeyword === 'enable') {
      // Add AS between object and alias when missing: e.g., FROM dbo.Table t -> FROM dbo.Table AS t
      out = out.replace(/\b(FROM|JOIN)\s+([\w\[\]\.]+|\([^\)]*\))\s+(?:AS\s+)?([A-Za-z_][A-Za-z0-9_]*)\b/gi, (m, kwd, obj, alias) => `${kwd} ${obj} AS ${alias}`);
    } else if (aliasKeyword === 'remove') {
      // Remove AS in table/subquery aliases: FROM dbo.Table AS t -> FROM dbo.Table t
      out = out.replace(/\b(FROM|JOIN)\s+([\w\[\]\.]+|\([^\)]*\))\s+AS\s+([A-Za-z_][A-Za-z0-9_]*)\b/gi, (m, kwd, obj, alias) => `${kwd} ${obj} ${alias}`);
    }
  }

  // CTE formatting (WITH ... AS (SELECT ...))
  if (cteStyle === 'newline') {
    out = out.replace(/WITH\s+([A-Za-z_][A-Za-z0-9_]*)\s+AS\s*\(/gi, (m, name) => `WITH ${name} AS (\n`);
    // Place SELECT of CTE on next line if not already
    out = out.replace(/AS\s*\(\s*SELECT/gi, 'AS (\nSELECT');
  }

  // Window function formatting: OVER (PARTITION BY ... ORDER BY ...)
  if (windowFunctionStyle === 'multiline') {
    out = out.replace(/OVER\s*\(([^\)]*)\)/gi, (m, inner) => {
      const indent = ' '.repeat(indentSize);
      const parts = inner
        .replace(/\s+/g, ' ')
        .replace(/PARTITION BY /i, `\n${indent}PARTITION BY `)
        .replace(/ORDER BY /i, `\n${indent}ORDER BY `)
        .trim();
      return `OVER (\n${indent}${parts}\n)`;
    });
  } else {
    // Compact style: normalize single spaces
    out = out.replace(/OVER\s*\(([^\)]*)\)/gi, (m, inner) => `OVER (${inner.replace(/\s+/g, ' ').trim()})`);
  }

  // Function call spacing: ensure no space before '(' and single space after comma
  out = out.replace(/([A-Za-z_][A-Za-z0-9_]*)\s*\(/g, '$1(');
  // Preserve leading comma style when columnsCommaPlacement=ignore by avoiding global comma fix in lists
  out = out.replace(/,\s*/g, ', ');

  // Logical operator newline (WHERE/HAVING clauses)
  if (logicalOpBreak === 'before') {
    out = out.replace(/\s+(AND|OR)\s+/gi, (m) => `\n${m.trim()} `);
  } else if (logicalOpBreak === 'after') {
    out = out.replace(/\s+(AND|OR)\s+/gi, (m) => `${m.trim()}\n`);
  }

  // Lines between queries: normalize semicolons and insert blank lines
  if (newlineBeforeSemicolon) {
    out = out.replace(/\s*;\s*/g, '\n;\n');
  } else {
    out = out.replace(/\s*;\s*/g, ';\n');
  }
  if (linesBetweenQueries && linesBetweenQueries > 0) {
    const blanks = '\n'.repeat(linesBetweenQueries);
    // Normalize spaces after semicolons to configured blank lines
    out = out.replace(/;\n+/g, `;${blanks}`);
    out = out.replace(/\n;\n+/g, `\n;${blanks}`);
  }

  // Central indent alignment for selected clauses: pad to target column
  if (indentStyle === 'central' && indentStyleMode === 'enable') {
    const target = Math.max(0, indentAlignColumn);
    const alignLine = (line: string) => {
      const trimmed = line.trimStart();
      const leading = line.length - trimmed.length;
      const needed = Math.max(0, target - trimmed.length);
      return (insertSpaces ? ' '.repeat(leading + needed) : '\t') + trimmed;
    };
    const clauseMatcher = new RegExp(`^(${indentCentralClauses.join('|')})\\b`, 'i');
    out = out.split('\n').map((ln: string) => (clauseMatcher.test(ln) ? alignLine(ln) : ln)).join('\n');
    // Optionally align SELECT items if requested
    if (indentCentralClauses.map(c => c.toUpperCase()).includes('SELECT')) {
      out = out.replace(/SELECT\s+([\s\S]*?)\s+FROM/gi, (m, list) => {
        const lines = list.split(/\n+/);
        const aligned = lines.map((l: string) => alignLine(l));
        return `SELECT\n${aligned.join('\n')} FROM`;
      });
    }
  }

  // DDL: align CREATE TABLE column definitions (basic)
  const alignCols = config.get?.('alignColumnDefinitions', true);
  if (alignCols) {
    out = out.replace(/CREATE\s+TABLE\s+([\s\S]*?)\(([\s\S]*?)\)/gi, (m, tbl, cols) => {
      const lines = cols.split(',').map((s: string) => s.trim());
      const maxName = Math.max(...lines.map((l: string) => (l.split(/\s+/)[0] || '').length));
      const padded = lines.map((l: string) => {
        const [name, ...rest] = l.split(/\s+/);
        const pad = ' '.repeat(Math.max(0, maxName - name.length));
        return `${name}${pad} ${rest.join(' ')}`;
      });
      return `CREATE TABLE ${tbl.trim()} (\n  ${padded.join(',\n  ')}\n)`;
    });
  }

  // Identifier brackets handling: add/remove [identifier]
  const bracketMode = config.get?.('bracketIdentifiers', 'ignore');
  if (bracketMode === 'add') {
    // Add brackets to unbracketed identifiers following common SQL patterns.
    // Simplistic approach: wrap bare identifiers in SELECT lists and FROM/JOIN aliases.
    out = out.replace(/\b([A-Za-z_][A-Za-z0-9_]*)(\s*\.\s*([A-Za-z_][A-Za-z0-9_]*))*/g, (m) => {
      // Skip keywords already uppercased and numbers
      if (/^(SELECT|FROM|WHERE|GROUP|BY|ORDER|INNER|LEFT|RIGHT|FULL|JOIN|ON|WITH|OVER|PARTITION|INSERT|INTO|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|VIEW|FUNCTION|PROCEDURE)$/i.test(m)) {
        return m;
      }
      // Skip function calls and parameters (e.g., COUNT( * ))
      if (/^[A-Za-z_][A-Za-z0-9_]*\s*\(/.test(m)) {
        return m;
      }
      // Already bracketed
      if (/^\[[^\]]+\]$/.test(m)) {
        return m;
      }
      // For schema.object or alias patterns, bracket each segment
      const parts = m.split('.').map(p => p.trim());
      return parts.map(p => /^\[[^\]]+\]$/.test(p) ? p : `[${p}]`).join('.');
    });
  } else if (bracketMode === 'remove') {
    // Remove brackets
    out = out.replace(/\[([^\]]+)\]/g, '$1');
  }

  return out;
}
