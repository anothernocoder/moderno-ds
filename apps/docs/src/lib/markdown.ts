/**
 * MDX → plain Markdown, for the "copy as Markdown" button, the per-component
 * `.md` files, and the `llms.txt` index — one set per locale. The transform is
 * deliberately heuristic: docs bodies are prose + fenced code + a handful of
 * docs components, so it drops `import`/`export` lines and turns each
 * component tag (single- or multi-line) into the Markdown it stands for:
 *
 * - `<Preview examples={{ react: x, … }}>…</Preview>` → the React example's
 *   source as a fenced block (when a `resolve.raw` reader is given; the demo
 *   island and markup inside the Preview never leak). The legacy
 *   `code={`…`}` form is unwrapped the same way.
 * - `<ForFramework fw="vue">…</ForFramework>` → a bold framework label above
 *   the block it wraps, so the four Usage snippets read as four labelled ones.
 * - `<PropsTable component="X" />` → a Prop | Type | Default | Description
 *   table (when a `resolve.props` reader is given).
 * - `<ContractTable table="X" />` → the same slot table as Markdown (when a
 *   `resolve.contractTable` reader is given).
 * - `<Install pkg|item … />` → the npm command.
 * - Anything else (`<FrameworkSelect>`, islands) is dropped.
 *
 * Fenced code is passed through untouched.
 */

export interface PropRow {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description?: string;
}

/** Side-effectful lookups the page route supplies; the transform stays pure without them. */
export interface MarkdownResolvers {
  /** Contents of a `?raw` import, by the import specifier as written in the MDX. */
  raw?: (specifier: string) => string | undefined;
  /** Generated props of a component, by name. */
  props?: (component: string) => PropRow[] | undefined;
  /** A token-contract slot table as Markdown, by its `table` name. */
  contractTable?: (table: string) => string | undefined;
}

const FRAMEWORK_LABEL: Record<string, string> = {
  react: "React",
  vue: "Vue",
  svelte: "Svelte",
  solid: "Solid",
};
const BINDINGS = ["react", "vue", "svelte", "solid"];

/** Convert legacy `<Preview code={`…`}>…</Preview>` blocks into fenced code examples. */
function unwrapPreviews(body: string): string {
  const re = /<Preview\b[^>]*?code=\{`([\s\S]*?)`\}[\s\S]*?<\/Preview>/g;
  return body.replace(re, (_match, code: string) => `\`\`\`tsx\n${code.trim()}\n\`\`\``);
}

/** `import foo from "../x.tsx?raw";` → { foo: "../x.tsx?raw" } */
function defaultImports(body: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of body.matchAll(
    /^\s*import\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["'];?\s*$/gm,
  )) {
    map.set(m[1]!, m[2]!);
  }
  return map;
}

/**
 * Index just past the `>` that closes the JSX tag starting at `start` (which
 * points at `<`), skipping `{…}` expressions and quoted strings; -1 if the tag
 * never closes.
 */
function tagEnd(text: string, start: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = start + 1; i < text.length; i++) {
    const c = text[i]!;
    if (quote) {
      if (c === quote && text[i - 1] !== "\\") quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return i + 1;
  }
  return -1;
}

function attr(tag: string, name: string): string | undefined {
  return new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1];
}

function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n+/g, " ");
}

export function propsMarkdown(rows: PropRow[]): string {
  const hasDescription = rows.some((r) => r.description);
  const head = hasDescription
    ? "| Prop | Type | Default | Description |\n| --- | --- | --- | --- |"
    : "| Prop | Type | Default |\n| --- | --- | --- |";
  const lines = rows.map((r) => {
    const cells = [
      `\`${r.name}\`${r.required ? " (required)" : ""}`,
      `\`${escapeCell(r.type)}\``,
      r.default ? `\`${escapeCell(r.default)}\`` : "—",
    ];
    if (hasDescription) cells.push(escapeCell(r.description ?? ""));
    return `| ${cells.join(" | ")} |`;
  });
  return [head, ...lines].join("\n");
}

function installMarkdown(tag: string): string | undefined {
  const pkg = attr(tag, "pkg");
  const item = attr(tag, "item");
  if (item) return `\`\`\`sh\nnpx @moderno-ui/cli add ${item}-react\n\`\`\``;
  if (!pkg) return undefined;
  const binding = BINDINGS.includes(pkg.slice(pkg.lastIndexOf("/") + 1));
  const command = attr(tag, "mode") === "cli" ? `npx ${pkg}` : `npm install ${pkg}`;
  const note = binding
    ? "\n\n(Vue, Svelte and Solid: `@moderno-ui/vue`, `@moderno-ui/svelte`, `@moderno-ui/solid`.)"
    : "";
  return `\`\`\`sh\n${command}\n\`\`\`${note}`;
}

/** Markdown for one opening/self-closing component tag, or "" to drop it. */
function componentMarkdown(
  tag: string,
  imports: Map<string, string>,
  resolve: MarkdownResolvers,
): string {
  const name = /^<([A-Z][\w.]*)/.exec(tag)?.[1] ?? "";
  if (name === "Preview") {
    const ident = /\breact\s*:\s*([A-Za-z_$][\w$]*)/.exec(tag)?.[1];
    const spec = ident ? imports.get(ident) : undefined;
    const code = spec && resolve.raw ? resolve.raw(spec) : undefined;
    return code ? `\`\`\`tsx\n${code.trim()}\n\`\`\`` : "";
  }
  if (name === "ForFramework") {
    const fw = attr(tag, "fw") ?? "";
    return `**${FRAMEWORK_LABEL[fw] ?? fw}**`;
  }
  if (name === "PropsTable") {
    const component = attr(tag, "component");
    const rows = component && resolve.props ? resolve.props(component) : undefined;
    return rows && rows.length > 0 ? propsMarkdown(rows) : "";
  }
  if (name === "ContractTable") {
    const table = attr(tag, "table");
    return (table && resolve.contractTable?.(table)) ?? "";
  }
  if (name === "Install") return installMarkdown(tag) ?? "";
  return "";
}

/** Strip MDX scaffolding from a body, turning docs components into Markdown. */
export function mdxToMarkdown(body: string, resolve: MarkdownResolvers = {}): string {
  const source = unwrapPreviews(body);
  const imports = defaultImports(source);
  const lines = source.split("\n");
  const kept: string[] = [];
  let inFence = false;
  // Inside a <Preview>…</Preview>: its children are the live demo, never prose.
  let inPreview = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^\s*```/.test(line) && !inPreview) {
      inFence = !inFence;
      kept.push(line.replace(/^\s+/, ""));
      continue;
    }
    if (inFence) {
      kept.push(line);
      continue;
    }
    const trimmed = line.trim();
    if (inPreview) {
      if (/^<\/Preview>/.test(trimmed)) inPreview = false;
      continue;
    }
    if (/^import\s/.test(trimmed)) continue;
    if (/^export\s/.test(trimmed)) continue;
    if (/^<\/[A-Z][\w.]*>$/.test(trimmed)) continue;

    if (/^<[A-Z]/.test(trimmed)) {
      // Gather the whole tag, however many lines it spans.
      let text = trimmed;
      let end = tagEnd(text, 0);
      while (end === -1 && i + 1 < lines.length) {
        text += `\n${lines[++i]!.trim()}`;
        end = tagEnd(text, 0);
      }
      const tag = end === -1 ? text : text.slice(0, end);
      const selfClosing = /\/>$/.test(tag);
      kept.push(componentMarkdown(tag, imports, resolve));
      if (/^<Preview\b/.test(tag) && !selfClosing) {
        // A one-line `<Preview …>…</Preview>` closes on the same line.
        inPreview = !/<\/Preview>/.test(text.slice(end));
      }
      continue;
    }
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
  resolve?: MarkdownResolvers;
}

/** A full page rendered as Markdown: H1 + description + cleaned body. */
export function pageMarkdown({ title, description, body, resolve }: PageInput): string {
  return `# ${title}\n\n${description}\n\n${mdxToMarkdown(body, resolve)}\n`;
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
