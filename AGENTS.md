# Documentation project instructions

## About this project

- This is the Mintlify docs site for `@polo/core`.
- Pages are MDX files with YAML frontmatter.
- Site configuration lives in `docs.json`.
- Use `mint dev` for local preview.
- Run `mint broken-links` and `mint validate` before finalizing edits.

## Terminology

- Use `task` for a `polo.define(...)` definition.
- Use `source` for context producers (`fromInput`, `value`, `chunks`).
- Use `source set` for `polo.sourceSet(...)` outputs.
- Use `registry` for `registerSources(...)` output.
- Use `context` for resolved runtime data.
- Use `trace` for execution metadata returned by `polo.resolve(...)`.
- Use `budget` for token constraints and chunk selection.

## Style preferences

- Use active voice and second person ("you").
- Keep sentences concise. One idea per sentence.
- Keep tone userland-friendly and practical.
- Prefer short, direct headings in sentence case.
- Include code samples whenever behavior or usage is explained.
- Use realistic domain values (`accountId`, `transcript`, `recentTickets`).
- Bold only for UI labels. Use code formatting for identifiers, commands, paths, and types.

## Content boundaries

- Keep the site focused on `@polo/core` only.
- Do not add docs for future packages unless explicitly requested.
- Avoid Mintlify starter/template content in active navigation.
- Archived starter pages live in `archive/starter-kit/` and should remain excluded.
- Do not document internal implementation details unless they affect public behavior.
