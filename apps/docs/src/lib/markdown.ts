/**
 * MDX → plain Markdown, for the "copy as Markdown" button, the per-component
 * `.md` files, and the `llms.txt` index — one set per locale. The transform is
 * deliberately heuristic: docs bodies are mostly prose + fenced code with a few
 * island tags (`<Preview>`, `<PropsTable>`), so dropping `import` lines and
 * standalone JSX tags yields clean Markdown an LLM (or a human) can read.
 */

/** Convert `<Preview code={`…`}>…</Preview>` blocks into fenced code examples. */
function unwrapPreviews(body: string): string {
  const re = /<Preview\b[^>]*?code=\{`([\s\S]*?)`\}[\s\S]*?<\/Preview>/g;
  return body.replace(re, (_match, code: string) => `\`\`\`tsx\n${code.trim()}\n\`\`\``);
}

/** Strip MDX scaffolding (imports, bare component tags) from a body. */
export function mdxToMarkdown(body: string): string {
  const lines = unwrapPreviews(body).split("\n");
  const kept: string[] = [];
  let inFence = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      kept.push(line);
      continue;
    }
    if (inFence) {
      kept.push(line);
      continue;
    }
    const trimmed = line.trim();
    if (/^import\s.+from\s.+$/.test(trimmed)) continue;
    if (/^export\s/.test(trimmed)) continue;
    // A line that is only a JSX tag (open, close, or self-closing component).
    if (/^<\/?[A-Z][\w.]*(\s[^>]*)?\/?>$/.test(trimmed)) continue;
    kept.push(line);
  }

  return kept
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface PageInput {
  title: string;
  description: string;
  body: string;
}

/** A full page rendered as Markdown: H1 + description + cleaned body. */
export function pageMarkdown({ title, description, body }: PageInput): string {
  return `# ${title}\n\n${description}\n\n${mdxToMarkdown(body)}\n`;
}

export interface LlmsInput {
  siteName: string;
  baseUrl: string;
  locale: string;
  pages: { slug: string; title: string; description: string }[];
}

/** The `llms.txt` index for one locale (the llmstxt.org convention). */
export function llmsIndex({ siteName, baseUrl, locale, pages }: LlmsInput): string {
  const header = `# ${siteName} (${locale})\n\n> Framework-agnostic design system. Component reference and usage, ${locale} locale.\n`;
  const links = pages
    .map((p) => `- [${p.title}](${baseUrl}/${locale}/${p.slug}): ${p.description}`)
    .join("\n");
  return `${header}\n## Components\n\n${links}\n`;
}
