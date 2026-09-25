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

describe("pageMarkdown — docs components become Markdown, never raw JSX", () => {
  const body = [
    'import Preview from "../../../components/Preview.astro";',
    'import ButtonDemo from "../../../examples/button/button.svelte";',
    'import baseReact from "../../../examples/button/react.tsx?raw";',
    'import baseVue from "../../../examples/button/vue.vue?raw";',
    "",
    '<FrameworkSelect locale="en" />',
    "",
    "<Preview",
    "  examples={{ react: baseReact, vue: baseVue }}",
    '  layout="fill"',
    ">",
    "  <ButtonDemo client:visible />",
    '  <div class="demo-row">x</div>',
    "</Preview>",
    "",
    "## Installation",
    "",
    '<Install pkg="@moderno-ui/react" />',
    "",
    '<Install pkg="@moderno-ui/cli" mode="cli" />',
    "",
    "## Usage",
    "",
    '<ForFramework fw="vue">',
    "",
    "```vue",
    '<Button variant="secondary">Save</Button>',
    "```",
    "",
    "</ForFramework>",
    "",
    "## API Reference",
    "",
    '<PropsTable component="Button" />',
  ].join("\n");

  const md = pageMarkdown({
    title: "Button",
    description: "x",
    body,
    resolve: {
      raw: (spec) => (spec.endsWith("react.tsx?raw") ? "export const A = 1;\n" : undefined),
      props: (name) =>
        name === "Button"
          ? [{ name: "size", type: '"sm" | "md"', required: true, default: '"md"' }]
          : undefined,
    },
  });

  it("drops multi-line component tags and the preview's demo markup", () => {
    expect(md).not.toMatch(
      /<Preview|<ButtonDemo|client:visible|examples=|demo-row|<FrameworkSelect/,
    );
  });

  it("shows a Preview as its React example's source", () => {
    expect(md).toContain("```tsx\nexport const A = 1;\n```");
  });

  it("labels each ForFramework block and keeps its fenced code", () => {
    expect(md).toContain('**Vue**\n\n```vue\n<Button variant="secondary">Save</Button>\n```');
    expect(md).not.toContain("ForFramework");
  });

  it("renders Install as the npm command, framework-agnostic packages unchanged", () => {
    expect(md).toContain("```sh\nnpm install @moderno-ui/react\n```");
    expect(md).toContain("```sh\nnpx @moderno-ui/cli\n```");
  });

  it("renders PropsTable as a Markdown table with escaped unions", () => {
    expect(md).toContain("| Prop | Type | Default |");
    expect(md).toContain('| `size` (required) | `"sm" \\| "md"` | `"md"` |');
  });
});

describe("pageMarkdown — ContractTable", () => {
  it("renders a ContractTable through its resolver, and drops it without one", () => {
    const body = 'Slots.\n\n<ContractTable table="color" />\n';
    const resolve = { contractTable: (t: string) => `| table ${t} |` };
    expect(pageMarkdown({ title: "T", description: "D", body, resolve })).toContain(
      "| table color |",
    );
    expect(pageMarkdown({ title: "T", description: "D", body })).not.toContain("ContractTable");
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
