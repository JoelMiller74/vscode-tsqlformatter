# Configuration

All settings are under `tsqlformatter.*`.

- `tsqlformatter.aliasKeyword`: `enable` | `remove` | `ignore` AS keyword handling across aliased items (columns, tables, etc.).
- `tsqlformatter.alignColumnDefinitions`: Align CREATE TABLE columns.
- `tsqlformatter.cteStyle`: `newline` | `inline` formatting of CTEs.
- `tsqlformatter.columnsCommaPlacement`: `leading` | `trailing` | `ignore` for column lists in SELECT/ORDER BY/GROUP BY and similar.
- `tsqlformatter.denseOperators`: Strip whitespace around operators.
- `tsqlformatter.expressionWidth`: Max characters per line before wrap; wraps only at safe delimiters (commas, AND/OR).
- `tsqlformatter.identifierCasing`: `upper` | `lower` | `original`.
- `tsqlformatter.ignoreTabSettings`: Ignore VS Code tab/space settings.
- `tsqlformatter.insertSpacesOverride`: Override insertSpaces when ignoring settings.
- `tsqlformatter.indentSize`: Spaces per indentation level.
- `tsqlformatter.indentStyle`: `standard` | `central`.
- `tsqlformatter.indentStyleMode`: `ignore` | `enable` (apply central alignment).
- `tsqlformatter.indentAlignColumn`: Target column for central alignment.
- `tsqlformatter.indentCentralClauses`: Array of clauses to align centrally when enabled (e.g., `SELECT`, `WHERE`, `ON`, `SET`).
- `tsqlformatter.joinAlignment`: `left` | `indent` alignment of JOIN.
- `tsqlformatter.keywordCasing`: `upper` | `lower` | `original`.
- `tsqlformatter.linesBetweenQueries`: Blank lines between statements.
- `tsqlformatter.logicalOperatorNewline`: `before` | `after` | `none`.
- `tsqlformatter.newlineAfterSelect`: New line per SELECT item.
- `tsqlformatter.newlineAfterFrom`: New line for FROM/JOIN.
- `tsqlformatter.newlineBeforeSemicolon`: Place semicolon on its own line.
- `tsqlformatter.operatorSpacing`: Add spaces around operators.
- `tsqlformatter.parenthesisSpacing`: `none` | `inside` | `outside` spacing.
- `tsqlformatter.safeWrapDelimiters`: Delimiters allowed for wrapping when enforcing `expressionWidth`.
- `tsqlformatter.profile`: Active profile name to use.
- `tsqlformatter.tabSizeOverride`: Override tab size when ignoring settings.
- `tsqlformatter.tabulateAlias`: Align aliases in SELECT.
- `tsqlformatter.windowFunctionStyle`: `compact` | `multiline`.
