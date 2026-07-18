import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readAgentGuidance, readFrontmatter } from "../src/mdx-frontmatter.ts";

const dirs: string[] = [];
function fixture(mdx: string): string {
  const dir = mkdtempSync(join(tmpdir(), "moderno-mdx-"));
  dirs.push(dir);
  const file = join(dir, "page.mdx");
  writeFileSync(file, mdx);
  return file;
}

afterEach(() => {
  while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true });
});

describe("readFrontmatter", () => {
  it("parses the YAML block between the --- fences", () => {
    const file = fixture("---\ntitle: Button\norder: 10\n---\n\nBody text.\n");
    expect(readFrontmatter(file)).toEqual({ title: "Button", order: 10 });
  });

  it("returns an empty object when there is no front-matter", () => {
    const file = fixture("Just body text, no fences.\n");
    expect(readFrontmatter(file)).toEqual({});
  });
});

describe("readAgentGuidance", () => {
  it("extracts the agent: block, including nested whenNotToUse pairs", () => {
    const file = fixture(
      [
        "---",
        "title: Button",
        "agent:",
        "  intent: A single click action.",
        "  whenNotToUse:",
        "    - case: Navigation to a URL",
        "      use: an anchor",
        "  gotchas:",
        '    - "Do not add className color overrides."',
        "---",
        "",
        "Body.",
        "",
      ].join("\n"),
    );
    expect(readAgentGuidance(file)).toEqual({
      intent: "A single click action.",
      whenNotToUse: [{ case: "Navigation to a URL", use: "an anchor" }],
      gotchas: ["Do not add className color overrides."],
    });
  });

  it("is undefined when the page has no agent: block yet", () => {
    const file = fixture("---\ntitle: Line Chart\n---\n\nBody.\n");
    expect(readAgentGuidance(file)).toBeUndefined();
  });
});

describe("the real vertical-slice docs pages", () => {
  const docsEn = (slug: string) =>
    new URL(`../../../apps/docs/src/content/docs/en/${slug}.mdx`, import.meta.url).pathname;

  it.each(["button", "field", "dialog", "select"])("%s.mdx has an agent: intent", (slug) => {
    const guidance = readAgentGuidance(docsEn(slug));
    expect(guidance?.intent, `${slug}.mdx is missing agent.intent`).toBeTruthy();
  });
});
