# T-SQL Formatter

![CI](https://github.com/JoelMiller74/vscode-tsqlformatter/actions/workflows/ci.yml/badge.svg)
![codecov](https://codecov.io/gh/JoelMiller74/vscode-tsqlformatter/branch/main/graph/badge.svg)

Rich T‑SQL formatter for `.sql` files with extensive options and sharable profiles.

## Features

- Document formatter for `.sql` files only.
- Configurable rules: keyword casing, indent size, line breaks, JOIN alignment, operator spacing, and more.
- Profiles: save, load, export, and import formatting rule sets.
  

## Requirements

- VS Code 1.190+
  

## Extension Settings

Key settings under `tsqlformatter.*`:
- `tsqlformatter.profile`: active profile name.
- `tsqlformatter.keywordCasing`: upper/lower/original.
- `tsqlformatter.indentSize`: spaces per indent.
- `tsqlformatter.newlineAfterSelect`, `tsqlformatter.newlineAfterFrom`, `tsqlformatter.joinAlignment`, etc.
- `tsqlformatter.columnsCommaPlacement`: `leading` | `trailing` | `ignore` to control comma placement in column lists (SELECT/ORDER BY/GROUP BY).
- `tsqlformatter.aliasKeyword`: `enable` | `remove` | `ignore` to add/remove the `AS` keyword for aliased items (columns and table/subquery aliases).
- `tsqlformatter.safeWrapDelimiters`: array of delimiters (`comma`, `AND`, `OR`) considered safe for expression wrapping when `expressionWidth` is set.
- `tsqlformatter.indentStyle`: `standard` | `central` with `tsqlformatter.indentStyleMode`: `ignore` | `enable` and `tsqlformatter.indentAlignColumn` for target column.
- `tsqlformatter.indentCentralClauses`: array of clauses to centrally align (e.g., `["ON", "SET", "SELECT"]`).

### Quick Settings Reference

- `tsqlformatter.columnsCommaPlacement`: leading | trailing | ignore — comma placement for column lists (SELECT/ORDER BY/GROUP BY).
- `tsqlformatter.aliasKeyword`: enable | remove | ignore — add/remove/ignore `AS` for aliased columns and table/subquery aliases.
- `tsqlformatter.safeWrapDelimiters`: [comma, AND, OR] — delimiters considered safe for wrapping with `expressionWidth`.
- `tsqlformatter.expressionWidth`: number (0 disables) — wrap long expressions at safe delimiters.
- `tsqlformatter.indentStyle`: standard | central — indent strategy.
- `tsqlformatter.indentStyleMode`: ignore | enable — enable central alignment when using `central`.
- `tsqlformatter.indentAlignColumn`: number — target column for central alignment.
- `tsqlformatter.indentCentralClauses`: [SELECT, WHERE, ON, SET] — clauses to align centrally.

## Known Issues

- Initial formatter is minimal and will expand over time.

## Release Notes

### 0.0.1

Initial scaffold: formatter provider, settings, profiles, samples, tests.

---

## Usage

1. Open a `.sql` file and run Format Document.
2. Configure `tsqlformatter.*` settings in VS Code.
3. Save/export/import profiles via commands.

See `CONFIG.md` for detailed options and `PROFILES.md` for sharing.

## Examples

- Columns comma placement

	- Trailing commas:

		```sql
		-- settings: columnsCommaPlacement=trailing, newlineAfterSelect=true
		SELECT
			a,
			b,
			c
		FROM t
		```

	- Leading commas:

		```sql
		-- settings: columnsCommaPlacement=leading, newlineAfterSelect=true
		SELECT
			a
		, b
		, c
		FROM t
		```

	- Ignore (preserve):

		```sql
		-- settings: columnsCommaPlacement=ignore
		SELECT a,b ,  c FROM t
		```

- Alias keyword handling

	- Enable `AS` for column and table aliases:

		```sql
		-- settings: aliasKeyword=enable
		SELECT a AS colA, SUM(b) AS total
		FROM dbo.Table AS t
		```

	- Remove `AS`:

		```sql
		-- settings: aliasKeyword=remove
		SELECT a colA, SUM(b) total
		FROM dbo.Table t
		```

- Safe wrap delimiters

	```sql
	-- settings: expressionWidth=20, safeWrapDelimiters=["AND"]
	WHERE a = 1 AND
				b = 2
	```

- Central alignment

	```sql
	-- settings: indentStyle=central, indentStyleMode=enable, indentAlignColumn=40, indentCentralClauses=["ON", "SET"]
	SELECT a, b
	FROM t
	LEFT JOIN x
																				ON t.id = x.id
	SET                                    @x = 1
	```

## Demo

Follow these quick steps to see the formatter in action. (GIF placeholders below — replace with recordings when ready.)

- Open sample:
	- Use `samples/sample.sql` and open the file in VS Code.

- Configure settings:
	- Open VS Code Settings and search for `tsqlformatter`.
	- Toggle `columnsCommaPlacement` (e.g., `leading`) and `aliasKeyword` (e.g., `enable`).

- Run the formatter:
	- Execute `Format Document` (right-click or `Shift+Alt+F`).
	- Observe updated comma placement and alias keyword behavior.

- Profiles:
	- Run `T-SQL Formatter: Save Active Profile` to capture current settings.
	- Run `T-SQL Formatter: Export Active Profile` and share the JSON.
	- Run `T-SQL Formatter: Import Profile` to apply a profile.

	Settings prefix note: all settings moved from `sqlFormatter.*` to `tsqlformatter.*` to avoid collisions and better reflect the extension’s purpose. VS Code will treat them as new settings; update your profiles accordingly.

### GIF placeholders (replace later)

- Comma placement demo: `docs/media/commas.gif`
- Alias keyword demo: `docs/media/alias.gif`
- Central alignment demo: `docs/media/central.gif`

## Testing

- Unit tests (Vitest):

	- Run all:

		```pwsh
		npm run test:unit
		```

	- Watch mode:

		```pwsh
		npm run test:watch
		```

	- Coverage:

		```pwsh
		npm run coverage
		```

	- VS Code Testing view:
		- Install the “Vitest” VS Code extension to auto-discover and run tests inline.
		- Tests are under `src/test/**/*.vitest.ts`.

- Extension E2E tests:
	- `npm test` runs the existing integration tests via `@vscode/test-electron`.
	- This spins up a VS Code instance and validates provider registration and formatter behavior.

### Badges

- CI status badge uses the workflow at `.github/workflows/ci.yml`.
- Coverage badge reflects Codecov-hosted results; set `CODECOV_TOKEN` in repository secrets for private repos (not needed for public). Alternative providers like Coveralls can be used if preferred.

### Coverage Gates

- PRs will fail if overall coverage or patch coverage drops below 80% (configured in `codecov.yml`). Adjust thresholds as needed.

	- Shields with GitHub Workflow Status:

		`![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/OWNER/REPO/ci.yml?branch=main)`
