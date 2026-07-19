import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectRunner, readComponentsConfig, resolveRegistrySource } from "../src/config.ts";
import { DEFAULT_REGISTRY_URL } from "../src/registry.ts";
import { initProject } from "../src/operations.ts";

let project: string;
beforeEach(async () => {
  project = await mkdtemp(join(tmpdir(), "moderno-proj-"));
});
afterEach(async () => {
  await rm(project, { recursive: true, force: true });
});

describe("initProject", () => {
  it("scaffolds components.json and a single-import moderno.css", async () => {
    await initProject({ projectDir: project });
    const css = await readFile(join(project, "src/styles/moderno.css"), "utf8");
    expect(css).toContain('@import "@moderno/css";');

    const config = await readComponentsConfig(project);
    expect(config?.registry).toBe(DEFAULT_REGISTRY_URL);
    expect(config?.stylesEntry).toBe("src/styles/moderno.css");
  });

  it("writes an AGENTS.md stanza with the golden rules and MCP instructions", async () => {
    const { agentsFiles } = await initProject({ projectDir: project });
    expect(agentsFiles).toEqual(["AGENTS.md"]);

    const agents = await readFile(join(project, "AGENTS.md"), "utf8");
    expect(agents).toContain("Components are never edited");
    expect(agents).toContain("npx @moderno/mcp");
    expect(agents).toContain("validate_usage");
  });

  it("preserves existing AGENTS.md content outside the stanza", async () => {
    await writeFile(join(project, "AGENTS.md"), "# Team conventions\n\nUse pnpm.\n");
    await initProject({ projectDir: project });

    const agents = await readFile(join(project, "AGENTS.md"), "utf8");
    expect(agents).toContain("# Team conventions");
    expect(agents).toContain("Use pnpm.");
    expect(agents).toContain("Components are never edited");
  });

  it("also writes a CLAUDE.md twin when claude is true", async () => {
    const { agentsFiles } = await initProject({ projectDir: project, claude: true });
    expect(agentsFiles).toEqual(["AGENTS.md", "CLAUDE.md"]);

    const claude = await readFile(join(project, "CLAUDE.md"), "utf8");
    expect(claude).toContain("Components are never edited");
  });

  it("does not overwrite an existing moderno.css", async () => {
    await initProject({ projectDir: project });
    await writeFile(join(project, "src/styles/moderno.css"), "/* mine */\n");
    await initProject({ projectDir: project });
    expect(await readFile(join(project, "src/styles/moderno.css"), "utf8")).toBe("/* mine */\n");
  });
});

describe("resolveRegistrySource — override precedence", () => {
  it("falls back to the default URL with no config or env", async () => {
    expect(await resolveRegistrySource({ projectDir: project, env: {} })).toBe(
      DEFAULT_REGISTRY_URL,
    );
  });

  it("prefers MODERNO_REGISTRY_URL over the default", async () => {
    const src = await resolveRegistrySource({
      projectDir: project,
      env: { MODERNO_REGISTRY_URL: "https://x/r.json" },
    });
    expect(src).toBe("https://x/r.json");
  });

  it("prefers components.json registry over the env var", async () => {
    await writeFile(
      join(project, "components.json"),
      JSON.stringify({ registry: "https://from-config/r.json" }),
    );
    const src = await resolveRegistrySource({
      projectDir: project,
      env: { MODERNO_REGISTRY_URL: "https://from-env/r.json" },
    });
    expect(src).toBe("https://from-config/r.json");
  });

  it("prefers an explicit override over everything", async () => {
    await writeFile(
      join(project, "components.json"),
      JSON.stringify({ registry: "https://from-config/r.json" }),
    );
    const src = await resolveRegistrySource({
      projectDir: project,
      env: { MODERNO_REGISTRY_URL: "https://from-env/r.json" },
      override: "/local/registry",
    });
    expect(src).toBe("/local/registry");
  });
});

describe("detectRunner", () => {
  it("detects pnpm from a lockfile", async () => {
    await writeFile(join(project, "pnpm-lock.yaml"), "");
    expect(await detectRunner(project)).toBe("pnpm");
  });

  it("detects bun from a lockfile", async () => {
    await writeFile(join(project, "bun.lockb"), "");
    expect(await detectRunner(project)).toBe("bun");
  });

  it("defaults to npm when no lockfile is present and no runner user-agent", async () => {
    expect(await detectRunner(project, {})).toBe("npm");
  });

  it("falls back to the invoking runner's user-agent when no lockfile is present", async () => {
    expect(
      await detectRunner(project, { npm_config_user_agent: "pnpm/9.0.0 npm/? node/v22" }),
    ).toBe("pnpm");
  });
});
