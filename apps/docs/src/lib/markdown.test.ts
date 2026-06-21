import { describe, expect, it } from "vitest";
import { llmsIndex, pageMarkdown } from "./markdown.ts";

describe("pageMarkdown — page → plain Markdown", () => {
  const body = [
    'import { Preview } from "../../components/Preview.astro";',
    "",
    "Buttons trigger an action.",
    "",
    "<PropsTable component={Button} />",
    "",
    "```tsx",
    "<Button>Save</Button>",
    "```",
    "",
  ].join("\n");

  it("emits an H1 + description, then the prose and code", () => {
    const md = pageMarkdown({ title: "Button", description: "The reference primitive.", body });
    expect(md).toMatch(/^# Button\n/);
    expect(md).toContain("The reference primitive.");
    expect(md).toContain("Buttons trigger an action.");
    expect(md).toContain("```tsx");
    expect(md).toContain("<Button>Save</Button>");
  });

  it("drops MDX import lines and bare component tags", () => {
    const md = pageMarkdown({ title: "Button", description: "x", body });
    expect(md).not.toContain("import {");
    expect(md).not.toContain("<PropsTable");
  });

  it("unwraps a <Preview> block into a fenced code example", () => {
    const previewBody = [
      "Intro.",
      "",
      "<Preview code={`<Button>Save</Button>",
      "<Button>Cancel</Button>`}>",
      "  <ButtonDemo client:visible />",
      "</Preview>",
      "",
      "Outro.",
    ].join("\n");
    const md = pageMarkdown({ title: "Button", description: "x", body: previewBody });
    expect(md).not.toContain("<Preview");
    expect(md).not.toContain("<ButtonDemo");
    expect(md).not.toContain("client:visible");
    expect(md).toContain("```tsx\n<Button>Save</Button>\n<Button>Cancel</Button>\n```");
    expect(md).toContain("Outro.");
  });
});

describe("llmsIndex — per-locale llms.txt", () => {
  it("lists every page as an absolute link with its description", () => {
    const txt = llmsIndex({
      siteName: "Moderno",
      baseUrl: "https://moderno.style",
      locale: "en",
      pages: [
        { slug: "button", title: "Button", description: "The reference primitive." },
        { slug: "select", title: "Select", description: "A styled select." },
      ],
    });
    expect(txt).toMatch(/^# Moderno/);
    expect(txt).toContain("[Button](https://moderno.style/en/button): The reference primitive.");
    expect(txt).toContain("[Select](https://moderno.style/en/select): A styled select.");
  });
});
