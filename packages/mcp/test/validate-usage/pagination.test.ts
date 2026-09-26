import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Pagination", () => {
  it("accepts real Pagination usage and knows its Ark anatomy", () => {
    const code = [
      'import { Pagination } from "@moderno-ui/react";',
      "",
      '<Pagination.Root size="sm" count={200} pageSize={20} defaultPage={3}>',
      "  <Pagination.PrevTrigger>‹</Pagination.PrevTrigger>",
      "  <Pagination.Context>",
      "    {(pagination) =>",
      "      pagination.pages.map((page, index) =>",
      '        page.type === "page" ? (',
      "          <Pagination.Item key={index} {...page}>{page.value}</Pagination.Item>",
      "        ) : (",
      "          <Pagination.Ellipsis key={index} index={index}>…</Pagination.Ellipsis>",
      "        ),",
      "      )",
      "    }",
      "  </Pagination.Context>",
      "  <Pagination.NextTrigger>›</Pagination.NextTrigger>",
      "</Pagination.Root>",
      "",
      '[data-scope="pagination"][data-part="item"][data-selected] { color: var(--primary); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<Pagination.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="pagination"][data-part="page"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"page" is not a real part of Pagination');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Pagination } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Pagination } from "@moderno-ui/react"');
  });
});
