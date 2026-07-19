import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AGENTS_MD, CLAUDE_MD, writeAgentsStanza } from "../src/agents-md.ts";

let project: string;
beforeEach(async () => {
  project = await mkdtemp(join(tmpdir(), "moderno-proj-"));
});
afterEach(async () => {
  await rm(project, { recursive: true, force: true });
});

describe("writeAgentsStanza", () => {
  it("creates AGENTS.md with the golden rules and MCP instructions when none exists", async () => {
    const { files } = await writeAgentsStanza({ projectDir: project });
    expect(files).toEqual([AGENTS_MD]);

    const content = await readFile(join(project, AGENTS_MD), "utf8");
    expect(content).toContain("Components are never edited");
    expect(content).toContain("npx @moderno/mcp");
    expect(content).toContain("validate_usage");
    expect(content).toContain("<!-- moderno:agents:start -->");
    expect(content).toContain("<!-- moderno:agents:end -->");
  });

  it("appends the stanza to an existing AGENTS.md without touching prior content", async () => {
    await writeFile(join(project, AGENTS_MD), "# My project\n\nSome existing instructions.\n");
    await writeAgentsStanza({ projectDir: project });

    const content = await readFile(join(project, AGENTS_MD), "utf8");
    expect(content).toContain("# My project");
    expect(content).toContain("Some existing instructions.");
    expect(content).toContain("Components are never edited");
  });

  it("updates the stanza in place on repeat runs instead of duplicating it", async () => {
    await writeAgentsStanza({ projectDir: project });
    await writeAgentsStanza({ projectDir: project });

    const content = await readFile(join(project, AGENTS_MD), "utf8");
    expect(content.split("<!-- moderno:agents:start -->").length - 1).toBe(1);
    expect(content.split("<!-- moderno:agents:end -->").length - 1).toBe(1);
  });

  it("preserves surrounding content when updating an existing stanza", async () => {
    await writeFile(
      join(project, AGENTS_MD),
      "# Before\n\n<!-- moderno:agents:start -->\nstale content\n<!-- moderno:agents:end -->\n\n# After\n",
    );
    await writeAgentsStanza({ projectDir: project });

    const content = await readFile(join(project, AGENTS_MD), "utf8");
    expect(content).toContain("# Before");
    expect(content).toContain("# After");
    expect(content).not.toContain("stale content");
    expect(content).toContain("Components are never edited");
  });

  it("does not write CLAUDE.md unless requested", async () => {
    await writeAgentsStanza({ projectDir: project });
    await expect(readFile(join(project, CLAUDE_MD), "utf8")).rejects.toThrow();
  });

  it("writes a CLAUDE.md twin when claude is true", async () => {
    const { files } = await writeAgentsStanza({ projectDir: project, claude: true });
    expect(files).toEqual([AGENTS_MD, CLAUDE_MD]);

    const content = await readFile(join(project, CLAUDE_MD), "utf8");
    expect(content).toContain("Components are never edited");
    expect(content).toContain("npx @moderno/mcp");
  });

  it("does not clobber surrounding content when the start marker is orphaned (no matching end)", async () => {
    await writeFile(
      join(project, AGENTS_MD),
      "# Before\n\n<!-- moderno:agents:start -->\n\n# After\n",
    );
    await writeAgentsStanza({ projectDir: project });

    const content = await readFile(join(project, AGENTS_MD), "utf8");
    expect(content).toContain("# Before");
    expect(content).toContain("# After");
    expect(content.split("<!-- moderno:agents:start -->").length - 1).toBe(1);

    // A second run must stay stable — no content between the orphan and the
    // freshly appended stanza should ever be deleted.
    await writeAgentsStanza({ projectDir: project });
    const second = await readFile(join(project, AGENTS_MD), "utf8");
    expect(second).toContain("# Before");
    expect(second).toContain("# After");
  });

  it("does not clobber surrounding content when the end marker is orphaned (no matching start)", async () => {
    await writeFile(
      join(project, AGENTS_MD),
      "# Before\n\n<!-- moderno:agents:end -->\n\n# After\n",
    );
    await writeAgentsStanza({ projectDir: project });

    const content = await readFile(join(project, AGENTS_MD), "utf8");
    expect(content).toContain("# Before");
    expect(content).toContain("# After");
  });

  it("recovers from markers in the wrong order without losing content", async () => {
    await writeFile(
      join(project, AGENTS_MD),
      "# Before\n\n<!-- moderno:agents:end -->\nmid\n<!-- moderno:agents:start -->\n\n# After\n",
    );
    await writeAgentsStanza({ projectDir: project });

    const content = await readFile(join(project, AGENTS_MD), "utf8");
    expect(content).toContain("# Before");
    expect(content).toContain("mid");
    expect(content).toContain("# After");
  });

  it("dedupes if duplicate well-formed stanza blocks are somehow present", async () => {
    const stanzaOnly = (await writeAgentsStanza({ projectDir: project })).files;
    expect(stanzaOnly).toEqual([AGENTS_MD]);
    const once = await readFile(join(project, AGENTS_MD), "utf8");
    await writeFile(join(project, AGENTS_MD), once + "\n" + once);

    await writeAgentsStanza({ projectDir: project });
    const deduped = await readFile(join(project, AGENTS_MD), "utf8");
    expect(deduped.split("<!-- moderno:agents:start -->").length - 1).toBe(1);
  });
});
