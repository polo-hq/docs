# Polo docs

This repo contains the Mintlify documentation site for `@polo/core`.

## Local development

1. Install the Mintlify CLI:

```bash
npm i -g mint
```

2. Start local preview from this directory:

```bash
mint dev
```

3. Open `http://localhost:3000`.

## Validation

Run these checks before opening a PR:

```bash
mint broken-links
mint validate
```

## Docs structure

- `getting-started/` for installation and quickstart
- `concepts/` for runtime behavior and mental model
- `guides/` for practical workflows
- `reference/` for API-level docs

Starter-kit files were moved to `archive/starter-kit/` and excluded via `.mintignore`.
