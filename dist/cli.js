#!/usr/bin/env node
import { runStdio } from "./server.js";
const args = process.argv.slice(2);
const wantsStdio = args.includes("--stdio") ||
    (args.includes("--transport") && args.includes("stdio"));
if (!wantsStdio) {
    args.push("--stdio");
}
runStdio().catch((err) => {
    console.error(err instanceof Error ? err.stack ?? err.message : err);
    process.exit(1);
});
