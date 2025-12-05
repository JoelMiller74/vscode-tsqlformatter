# Profiles

You can save and share formatting profiles:

- Save: `T-SQL Formatter: Save Active Profile`.
- Load/apply to workspace: `T-SQL Formatter: Load Profile for Workspace`.
- Export: `T-SQL Formatter: Export Active Profile`.
- Import: `T-SQL Formatter: Import Profile`.

Exported profiles are JSON files that can be shared and imported by others.

## Example profiles using new options

### Comma placement and alias keyword

```json
{
	"tsqlformatter": {
		"profile": "commas-trailing-with-as",
		"columnsCommaPlacement": "trailing",
		"aliasKeyword": "enable",
		"newlineAfterSelect": true
	}
}
```

```json
{
	"tsqlformatter": {
		"profile": "commas-leading-no-as",
		"columnsCommaPlacement": "leading",
		"aliasKeyword": "remove",
		"newlineAfterSelect": true
	}
}
```

### Safe wrap delimiters

```json
{
	"tsqlformatter": {
		"profile": "wrap-on-and",
		"expressionWidth": 80,
		"safeWrapDelimiters": ["AND"]
	}
}
```

### Central alignment

```json
{
	"tsqlformatter": {
		"profile": "central-joins",
		"indentStyle": "central",
		"indentStyleMode": "enable",
		"indentAlignColumn": 40,
		"indentCentralClauses": ["ON", "SET"]
	}
}
```

## Exporting and importing

Use the commands:
- `SQL Formatter: Save Active Profile`
- `SQL Formatter: Export Active Profile`
- `SQL Formatter: Import Profile`

These will serialize and load the above settings into your workspace or user settings.

## Quick Settings Reference

| Setting | Values | Purpose |
| --- | --- | --- |
| `tsqlformatter.columnsCommaPlacement` | `leading` | `trailing` | `ignore` | Control comma placement for column lists (SELECT/ORDER BY/GROUP BY). |
| `tsqlformatter.aliasKeyword` | `enable` | `remove` | `ignore` | Add/remove/ignore `AS` for aliased columns and table/subquery aliases. |
| `tsqlformatter.safeWrapDelimiters` | Array of `comma`, `AND`, `OR` | Delimiters considered safe when wrapping expressions with `expressionWidth`. |
| `tsqlformatter.expressionWidth` | number (0 disables) | Wrap long expressions at safe delimiters. |
| `tsqlformatter.indentStyle` | `standard` | `central` | Select indent strategy. |
| `tsqlformatter.indentStyleMode` | `ignore` | `enable` | Enable central alignment when using `central`. |
| `tsqlformatter.indentAlignColumn` | number | Target column for central alignment. |
| `tsqlformatter.indentCentralClauses` | Array of `SELECT`, `WHERE`, `ON`, `SET` | Clauses to align centrally. |