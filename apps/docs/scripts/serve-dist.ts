#!/usr/bin/env node
/**
 * Serve `dist/` over HTTP, exactly as a static host would.
 *
 * The visual suite compares the *built* docs, not `astro dev`: the Pagefind
 * bundle, the hashed asset URLs and the pre-rendered HTML only exist after
 * `pnpm build`, and the search UI silently no-ops without them — which would
 * make the baselines a picture of a page nobody ever sees. Astro's own
 * `preview` is unavailable here because the Vercel adapter emits the Build
 * Output API tree rather than a plain servable `dist/`, so this is the
 * smallest thing that serves what the deploy serves.
 *
 * Directory URLs resolve to `index.html`, matching the trailing-slash routing
 * Astro's `directory` build format produces. Started by Playwright's
 * `webServer` (see `playwright.config.ts`); run it directly to poke at the
 * built site by hand.
 */
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = resolve(fileURLToPath(import.meta.url), "..");
const root = resolve(here, "../dist");
const port = Number(process.env.PORT ?? 4321);
const host = process.env.HOST ?? "127.0.0.1";

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

/**
 * Map a request path to a file inside `dist/`, or `undefined` when it escapes
 * the root or names nothing. Directories (and extensionless paths) fall back to
 * their `index.html`.
 */
async function resolveFile(pathname: string): Promise<string | undefined> {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return undefined;
  }
  const candidate = resolve(root, `.${normalize(decoded)}`);
  if (candidate !== root && !candidate.startsWith(root + sep)) return undefined;

  const direct = await stat(candidate).catch(() => undefined);
  if (direct?.isFile()) return candidate;
  if (direct?.isDirectory()) {
    const index = join(candidate, "index.html");
    return (await stat(index).catch(() => undefined))?.isFile() ? index : undefined;
  }
  return undefined;
}

const server = createServer((req, res) => {
  const pathname = new URL(req.url ?? "/", `http://${host}:${port}`).pathname;
  void resolveFile(pathname).then((file) => {
    if (!file) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }
    res.writeHead(200, {
      "content-type": CONTENT_TYPES[extname(file)] ?? "application/octet-stream",
      // Baselines must never be compared against a stale response.
      "cache-control": "no-store",
    });
    createReadStream(file).pipe(res);
  });
});

server.listen(port, host, () => {
  console.log(`✓ serving ${root} on http://${host}:${port}`);
});
