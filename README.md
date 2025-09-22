# OpenAI MCP Server

An OpenAI-compliant MCP server that implements the search and fetch tools required for ChatGPT integration, following OpenAI's MCP specification.

## Overview

This MCP server is designed to work with ChatGPT's chat and deep research features, providing search and document retrieval capabilities through OpenAI's vector stores.

## Features

- **Search Tool**: Search through OpenAI vector stores for relevant documents
- **Fetch Tool**: Retrieve complete document content by ID
- **OpenAI Compliance**: Follows OpenAI's MCP specification exactly
- **SSE Transport**: Supports server-sent events for remote access

## Quick Start

### Prerequisites

- Python 3.8+
- OpenAI API key
- Vector store ID (created in OpenAI dashboard)

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY="your-openai-api-key"
export VECTOR_STORE_ID="your-vector-store-id"

# Run the server
python openai_mcp_server.py
```

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `VECTOR_STORE_ID`: ID of your OpenAI vector store (required)

## Usage

### Running the Server

```bash
python openai_mcp_server.py
```

The server will start on `0.0.0.0:8000` and be accessible via SSE transport.

### ChatGPT Integration

When adding this MCP server in ChatGPT → Settings → Connectors:

- **Server URL**: `http://your-server-url:8000/sse/`
- **Tools**: `search`, `fetch`

### API Integration

You can also use this server with OpenAI's Responses API:

```json
{
  "model": "o4-mini-deep-research",
  "tools": [
    {
      "type": "mcp",
      "server_label": "your-server",
      "server_url": "http://your-server-url:8000/sse/",
      "allowed_tools": ["search", "fetch"],
      "require_approval": "never"
    }
  ]
}
```

## Tools

### Search Tool

```python
search(query: str) -> Dict[str, List[Dict[str, Any]]]
```

Searches the vector store for documents matching the query. Returns a list of results with IDs, titles, and snippets.

### Fetch Tool

```python
fetch(id: str) -> Dict[str, Any]
```

Retrieves complete document content by ID, including full text, metadata, and citation URL.

## Development

### Testing

To test the server locally, you can use curl or any HTTP client that supports SSE:

```bash
# Test search functionality
curl -X POST http://localhost:8000/sse/ \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/call", "params": {"name": "search", "arguments": {"query": "your search query"}}}'
```

### Deployment

For production deployment, consider using:
- **Replit**: Easy deployment with built-in environment variable support
- **Docker**: Containerized deployment
- **Cloud Platforms**: AWS, GCP, Azure, etc.

## Security Considerations

- Only connect to trusted MCP servers
- Be cautious with sensitive data in search queries
- Use proper authentication for production deployments
- Monitor server logs for suspicious activity

## License

MIT License
