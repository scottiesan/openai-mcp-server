# mcp-search-fetch

A minimal MCP server that exposes only two tools required by ChatGPT's Search integration: **`search`** and **`fetch`**.

## Quick start

```bash
pnpm i         # or npm i / yarn
pnpm dev       # run via tsx for development
pnpm build && pnpm start  # compile and run
```

### Development Command (Connectors)

When adding the MCP server in ChatGPT → Settings → Connectors:

- **Command:** `node`
- **Arguments:** `dist/server.js`  (or `tsx src/server.ts` while developing)

## Tools

- `search({ query, limit? }) -> { results: [{ id, title, snippet?, url? }], next_cursor? }`
- `fetch({ id }) -> { id, title?, content, url?, metadata? }`

Replace `data/corpus.json` and the search logic in `src/server.ts` with your own backend (DB/API/vector index).

