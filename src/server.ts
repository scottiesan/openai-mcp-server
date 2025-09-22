import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

type Item = { id: string; title: string; url?: string; content: string };

const loadCorpus = async (): Promise<Item[]> => {
  const file = path.join(process.cwd(), "data", "corpus.json");
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as Item[];
};

const server = new Server(
  { name: "mcp-search-fetch", version: "0.1.0" },
  {
    capabilities: {
      tools: {}
    }
  }
);

const SearchInput = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().optional()
});

const SearchResult = z.object({
  id: z.string(),
  title: z.string(),
  snippet: z.string().optional(),
  url: z.string().url().optional()
});

const SearchOutput = z.object({
  results: z.array(SearchResult),
  next_cursor: z.string().optional()
});

const FetchInput = z.object({
  id: z.string().min(1)
});

const FetchOutput = z.object({
  id: z.string(),
  title: z.string().optional(),
  content: z.string(),
  url: z.string().url().optional(),
  metadata: z.record(z.any()).optional()
});

server.tool(
  "search",
  "Find items by keyword and return IDs to pass to `fetch`.",
  SearchInput,
  SearchOutput,
  async ({ input }) => {
    const { query, limit = 10 } = input;
    const corpus = await loadCorpus();

    const q = query.toLowerCase();
    const scored = corpus
      .map((it) => {
        const hay = `${it.title}\n${it.content}`.toLowerCase();
        const score =
          (hay.includes(q) ? 10 : 0) +
          (it.title.toLowerCase().includes(q) ? 5 : 0);
        if (score <= 0) return null;
        const idx = hay.indexOf(q);
        const start = Math.max(0, idx - 40);
        const end = Math.min(hay.length, idx + 80);
        const snippet =
          idx >= 0
            ? `${it.content.substring(start, end).replace(/\s+/g, " ").trim()}`
            : undefined;
        return { item: it, score, snippet };
      })
      .filter(Boolean) as { item: Item; score: number; snippet?: string }[]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const results = scored.map(({ item, snippet }) => ({
      id: item.id,
      title: item.title,
      snippet,
      url: item.url
    }));

    return { results };
  }
);

server.tool(
  "fetch",
  "Return full content for a prior search result.",
  FetchInput,
  FetchOutput,
  async ({ input }) => {
    const corpus = await loadCorpus();
    const found = corpus.find((it) => it.id === input.id);
    if (!found) {
      throw new Error(`No item with id '${input.id}'`);
    }
    return {
      id: found.id,
      title: found.title,
      content: found.content,
      url: found.url,
      metadata: {
        source_type: "demo",
        length: found.content.length
      }
    };
  }
);

const transport = new StdioServerTransport();
server.connect(transport).catch((err) => {
  console.error("Fatal server error:", err);
  process.exit(1);
});
