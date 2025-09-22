import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

type CorpusItem = { id: string; title: string; content: string; url?: string };

const loadCorpus = async () => {
  const file = path.join(process.cwd(), "data", "corpus.json");
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as CorpusItem[];
};

export async function runStdio(): Promise<void> {
  const server = new McpServer({
    name: "generic-mcp-search-fetch",
    version: "1.0.5",
  });

  // Zod schemas
  const SearchInput = z.object({
    query: z.string().min(1),
    limit: z.number().int().min(1).max(50).optional(),
    cursor: z.string().optional(),
  });

  const SearchResult = z.object({
    id: z.string(),
    title: z.string(),
    snippet: z.string().optional(),
    url: z.string().url().optional(),
  });

  const SearchOutput = z.object({
    results: z.array(SearchResult),
    next_cursor: z.string().optional(),
  });

  const FetchInput = z.object({ id: z.string().min(1) });

  const FetchOutput = z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.string(),
    url: z.string().url().optional(),
    metadata: z.record(z.any()).optional(),
  });

  // Tools (pass ZodRawShape via .shape)
  server.registerTool(
    "search",
    {
      title: "Keyword search",
      description: "Find items by keyword and return IDs to pass to `fetch`.",
      inputSchema: SearchInput.shape,
      outputSchema: SearchOutput.shape,
    },
    async ({ query, limit = 10 }) => {
      const corpus = await loadCorpus();
      const q = query.toLowerCase();

      const scored = corpus
        .map((item) => {
          const hay = `${item.title}\n${item.content}`.toLowerCase();
          const score =
            (hay.includes(q) ? 10 : 0) +
            (item.title.toLowerCase().includes(q) ? 5 : 0);
          if (score <= 0) return null;
          const idx = hay.indexOf(q);
          const start = Math.max(0, idx - 40);
          const end = Math.min(hay.length, idx + 80);
          const snippet =
            idx >= 0
              ? item.content.substring(start, end).replace(/\s+/g, " ").trim()
              : undefined;
          return { item, score, snippet };
        })
        .filter(Boolean) as Array<{ item: CorpusItem; score: number; snippet?: string }>;

      const results = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ item, snippet }) => ({
          id: item.id,
          title: item.title,
          snippet,
          url: item.url,
        }));

      // Return both structured and text for broad client compatibility
      return {
        content: [{ type: "text", text: JSON.stringify({ results }) }],
        structuredContent: { results },
      };
    }
  );

  server.registerTool(
    "fetch",
    {
      title: "Fetch by ID",
      description: "Return full content for a prior search result.",
      inputSchema: FetchInput.shape,
      outputSchema: FetchOutput.shape,
    },
    async ({ id }) => {
      const corpus = await loadCorpus();
      const found = corpus.find((it) => it.id === id);
      if (!found) {
        return {
          content: [{ type: "text", text: `No item with id '${id}'` }],
          isError: true,
        };
      }
      const payload = {
        id: found.id,
        title: found.title,
        content: found.content,
        url: found.url,
        metadata: { source_type: "demo", length: found.content.length },
      };
      return {
        content: [{ type: "text", text: JSON.stringify(payload) }],
        structuredContent: payload,
      };
    }
  );

  // STDIO handshake
  await server.connect(new StdioServerTransport());
}
