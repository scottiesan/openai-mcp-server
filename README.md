# Generic MCP Search-Fetch Server

A generic MCP server that provides OpenAI-compliant `search` and `fetch` tools without any external API dependencies. This server can be easily customized to work with any data source.

## Features

- **OpenAI Compliant**: Implements the exact tool specifications required for ChatGPT connectors and deep research
- **No External Dependencies**: Works with local data sources without requiring API keys
- **Easy Customization**: Simple to adapt for different data backends (database, API, vector store, etc.)
- **TypeScript Implementation**: Modern, type-safe codebase

## Quick Start

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build and run
npm run build
npm start
```

## ChatGPT Connector Setup

When adding this MCP server in ChatGPT → Settings → Connectors:

- **Command:** `node`
- **Arguments:** `dist/server.js` (or `npm run dev` for development)

## Tools

### `search` Tool
Searches through the data corpus and returns matching results.

**Input:**
```typescript
{
  query: string,      // Search query
  limit?: number,     // Maximum results (default: 10, max: 50)
  cursor?: string     // Pagination cursor (optional)
}
```

**Output:**
```typescript
{
  results: [{
    id: string,       // Unique identifier for fetching
    title: string,    // Human-readable title
    snippet?: string, // Preview snippet
    url?: string      // Source URL for citation
  }],
  next_cursor?: string // For pagination
}
```

### `fetch` Tool
Retrieves complete document content by ID.

**Input:**
```typescript
{
  id: string  // Document ID from search results
}
```

**Output:**
```typescript
{
  id: string,           // Document ID
  title?: string,       // Document title
  content: string,      // Full document content
  url?: string,         // Source URL
  metadata?: object     // Additional metadata
}
```

## Customization

### Data Source
Replace the data in `data/corpus.json` with your own content. The file structure should be:

```json
[
  {
    "id": "unique_id",
    "title": "Document Title",
    "url": "https://example.com/source",
    "content": "Full document content here..."
  }
]
```

### Backend Integration
To connect to a different data source (database, API, etc.), modify the `loadCorpus()` function in `src/server.ts` and the search logic to match your backend.

## Development

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## License

MIT License - Feel free to customize for your specific use case.
