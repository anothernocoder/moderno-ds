import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Toast", () => {
  it("accepts real Toast usage and knows its Ark anatomy", () => {
    const code = [
      'import { Button, Toast, Toaster, createToaster } from "@moderno-ui/react";',
      "",
      'const toaster = createToaster({ placement: "bottom-end" });',
      "",
      "<>",
      '  <Button onClick={() => toaster.success({ title: "Saved" })}>Save</Button>',
      "  <Toaster toaster={toaster}>",
      "    {(toast) => (",
      '      <Toast.Root size="sm">',
      "        <Toast.Title>{toast.title}</Toast.Title>",
      "        <Toast.Description>{toast.description}</Toast.Description>",
      "        {toast.action && <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>}",
      '        <Toast.CloseTrigger aria-label="Dismiss">×</Toast.CloseTrigger>',
      "      </Toast.Root>",
      "    )}",
      "  </Toaster>",
      "</>",
      "",
      '[data-scope="toast"][data-part="root"][data-type="success"] { color: var(--popover-foreground); }',
      '[data-scope="toast"][data-part="action-trigger"] { color: var(--primary); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<Toast.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="toast"][data-part="icon"] { color: var(--popover-foreground); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"icon" is not a real part of Toast');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Toast } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Toast } from "@moderno-ui/react"');
  });
});
