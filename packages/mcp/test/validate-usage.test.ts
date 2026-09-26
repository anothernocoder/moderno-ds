import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { discoverManifests, type AggregatedManifests } from "@moderno-ui/lint-core";
import { ModernoMcpError } from "../src/tools/shared.ts";
import { validateUsage } from "../src/tools/validate-usage.ts";
import {
  createConsumerFixture,
  type ConsumerFixture,
} from "../../lint-core/test/helpers/consumer-fixture.ts";

let fixture: ConsumerFixture;
let manifests: AggregatedManifests;

beforeAll(() => {
  fixture = createConsumerFixture();
  manifests = discoverManifests(fixture.dir);
});

afterAll(() => {
  fixture.cleanup();
});

describe("validateUsage", () => {
  it("catches a hardcoded color, an invalid prop, and a raw-Ark import in one snippet (issue #43 AC)", () => {
    const code = [
      'import { Dialog } from "@ark-ui/react";',
      '<Button variant="primaryy" style={{ color: "#ff0000" }}>Save</Button>',
    ].join("\n");
    const { findings } = validateUsage(manifests, { code, framework: "react" });
    expect(findings.map((f) => f.ruleId).sort()).toEqual([
      "moderno/no-hardcoded-color",
      "moderno/no-raw-ark",
      "moderno/valid-props",
    ]);
  });

  it("flags a data-part override that doesn't exist on the target primitive (issue #43 AC)", () => {
    const { findings } = validateUsage(manifests, {
      framework: "react",
      code: '[data-scope="dialog"][data-part="header"] { color: var(--foreground); }',
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: "moderno/valid-data-part-override" });
  });

  it("flags a hand-rolled reimplementation of an existing primitive (issue #43 AC)", () => {
    const { findings } = validateUsage(manifests, {
      framework: "react",
      code: '<dialog role="dialog">...</dialog>',
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "moderno/no-reimplemented-primitive",
      severity: "warn",
    });
  });

  it("accepts a Checkbox's own props and parts, and steers raw Ark to the wrapper", () => {
    // The manifest knows Checkbox (props + variants + parts), so real usage is
    // clean while the off-contract moves around it are still caught.
    expect(
      validateUsage(manifests, {
        framework: "react",
        code: '<Checkbox size="md">Email me updates</Checkbox>',
      }).findings,
    ).toHaveLength(0);

    const badSize = validateUsage(manifests, {
      framework: "react",
      code: '<Checkbox size="huge" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests, {
      framework: "react",
      code: '[data-scope="checkbox"][data-part="box"] { color: var(--foreground); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]).toMatchObject({ ruleId: "moderno/valid-data-part-override" });
    expect(badPart[0]!.message).toContain("root, control, indicator, label");

    const rawArk = validateUsage(manifests, {
      framework: "react",
      code: 'import { Checkbox } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Checkbox } from "@moderno-ui/react"');
  });

  it("accepts a real PinInput usage and its own data-part overrides", () => {
    const code = [
      'import { PinInput } from "@moderno-ui/react";',
      "",
      '<PinInput.Root count={6} otp size="lg">',
      "  <PinInput.Control>",
      "    <PinInput.Input index={0} />",
      "  </PinInput.Control>",
      "</PinInput.Root>",
      "",
      '[data-scope="pin-input"][data-part="control"] { gap: var(--spacing-3); }',
    ].join("\n");
    expect(validateUsage(manifests, { code, framework: "react" }).findings).toHaveLength(0);
  });

  it("flags a data-part the PinInput anatomy doesn't have", () => {
    const { findings } = validateUsage(manifests, {
      framework: "react",
      code: '[data-scope="pin-input"][data-part="cell"] { color: var(--foreground); }',
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: "moderno/valid-data-part-override" });
    expect(findings[0]!.message).toContain('"cell" is not a real part of PinInput');
  });

  it("accepts a real Avatar usage and knows its Ark anatomy", () => {
    const code = [
      'import { Avatar } from "@moderno-ui/react";',
      "",
      '<Avatar.Root size="lg" shape="square">',
      "  <Avatar.Fallback>AL</Avatar.Fallback>",
      '  <Avatar.Image src="/ada.png" alt="Ada Lovelace" />',
      "</Avatar.Root>",
      "",
      '[data-scope="avatar"][data-part="fallback"] { font-weight: var(--font-weight-semibold); }',
    ].join("\n");
    expect(validateUsage(manifests, { code, framework: "react" }).findings).toHaveLength(0);

    const badShape = validateUsage(manifests, {
      framework: "react",
      code: '<Avatar.Root shape="rounded" />',
    }).findings;
    expect(badShape).toHaveLength(1);
    expect(badShape[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badShape[0]!.message).toContain("circle, square");

    const badPart = validateUsage(manifests, {
      framework: "react",
      code: '[data-scope="avatar"][data-part="initials"] { color: var(--foreground); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"initials" is not a real part of Avatar');
  });

  it("accepts a real Callout usage and knows its anatomy", () => {
    const code = [
      'import { Callout } from "@moderno-ui/react";',
      "",
      '<Callout.Root variant="warning">',
      "  <Callout.Content>",
      "    <Callout.Title>Renaming breaks old links</Callout.Title>",
      "    <Callout.Description>Share the new address with your team.</Callout.Description>",
      "  </Callout.Content>",
      "</Callout.Root>",
      "",
      '[data-scope="callout"][data-part="title"] { font-weight: var(--font-weight-bold); }',
    ].join("\n");
    expect(validateUsage(manifests, { code, framework: "react" }).findings).toHaveLength(0);

    const badVariant = validateUsage(manifests, {
      framework: "react",
      code: '<Callout.Root variant="tip" />',
    }).findings;
    expect(badVariant).toHaveLength(1);
    expect(badVariant[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badVariant[0]!.message).toContain("info, success, warning, error");

    const badProp = validateUsage(manifests, {
      framework: "react",
      code: '<Callout.Root tone="soft" />',
    }).findings;
    expect(badProp).toHaveLength(1);
    expect(badProp[0]!.message).toContain('Unknown prop "tone"');

    const badPart = validateUsage(manifests, {
      framework: "react",
      code: '[data-scope="callout"][data-part="action"] { color: var(--foreground); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"action" is not a real part of Callout');
  });

  it("accepts a real Switch usage and knows its Ark anatomy", () => {
    const code = [
      'import { Switch } from "@moderno-ui/react";',
      "",
      '<Switch.Root size="sm" defaultChecked onCheckedChange={save}>',
      "  <Switch.Control>",
      "    <Switch.Thumb />",
      "  </Switch.Control>",
      "  <Switch.Label>Email notifications</Switch.Label>",
      "  <Switch.HiddenInput />",
      "</Switch.Root>",
      "",
      '[data-scope="switch"][data-part="thumb"] { box-shadow: var(--shadow-md); }',
    ].join("\n");
    expect(validateUsage(manifests, { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests, {
      framework: "react",
      code: '<Switch.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests, {
      framework: "react",
      code: '[data-scope="switch"][data-part="track"] { background: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"track" is not a real part of Switch');

    const rawArk = validateUsage(manifests, {
      framework: "react",
      code: 'import { Switch } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Switch } from "@moderno-ui/react"');
  });

  it("accepts a real RadioGroup usage and knows its Ark anatomy", () => {
    const code = [
      'import { RadioGroup } from "@moderno-ui/react";',
      "",
      '<RadioGroup.Root size="sm" orientation="horizontal" defaultValue="standard" onValueChange={save}>',
      "  <RadioGroup.Label>Shipping</RadioGroup.Label>",
      '  <RadioGroup.Item value="standard">',
      "    <RadioGroup.ItemControl />",
      "    <RadioGroup.ItemText>",
      "      Standard",
      "      <RadioGroup.ItemDescription>3–5 business days</RadioGroup.ItemDescription>",
      "    </RadioGroup.ItemText>",
      "    <RadioGroup.ItemHiddenInput />",
      "  </RadioGroup.Item>",
      "</RadioGroup.Root>",
      "",
      '[data-scope="radio-group"][data-part="item-description"] { color: var(--foreground); }',
    ].join("\n");
    expect(validateUsage(manifests, { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests, {
      framework: "react",
      code: '<RadioGroup.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests, {
      framework: "react",
      code: '[data-scope="radio-group"][data-part="radio"] { border-color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"radio" is not a real part of RadioGroup');

    const rawArk = validateUsage(manifests, {
      framework: "react",
      code: 'import { RadioGroup } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { RadioGroup } from "@moderno-ui/react"');
  });

  it("accepts real Toggle and ToggleGroup usage and knows their Ark anatomy", () => {
    const code = [
      'import { Toggle, ToggleGroup } from "@moderno-ui/react";',
      "",
      '<Toggle.Root variant="outline" size="sm" defaultPressed onPressedChange={save}>',
      '  <Toggle.Indicator fallback="☆">★</Toggle.Indicator>',
      "  Favorite",
      "</Toggle.Root>",
      "",
      '<ToggleGroup.Root variant="outline" multiple defaultValue={["bold"]} aria-label="Text style">',
      '  <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>',
      '  <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>',
      "</ToggleGroup.Root>",
      "",
      '[data-scope="toggle-group"][data-part="item"][data-state="on"] { color: var(--foreground); }',
    ].join("\n");
    expect(validateUsage(manifests, { code, framework: "react" }).findings).toHaveLength(0);

    const badVariant = validateUsage(manifests, {
      framework: "react",
      code: '<Toggle.Root variant="solid" />',
    }).findings;
    expect(badVariant).toHaveLength(1);
    expect(badVariant[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badVariant[0]!.message).toContain("ghost, outline");

    const badPart = validateUsage(manifests, {
      framework: "react",
      code: '[data-scope="toggle-group"][data-part="button"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"button" is not a real part of ToggleGroup');

    const rawArk = validateUsage(manifests, {
      framework: "react",
      code: 'import { ToggleGroup } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { ToggleGroup } from "@moderno-ui/react"');
  });

  it("accepts real Tabs usage and knows its Ark anatomy", () => {
    const code = [
      'import { Tabs } from "@moderno-ui/react";',
      "",
      '<Tabs.Root variant="enclosed" size="sm" defaultValue="account" onValueChange={save}>',
      '  <Tabs.List aria-label="Settings">',
      '    <Tabs.Trigger value="account">Account</Tabs.Trigger>',
      '    <Tabs.Trigger value="password">Password</Tabs.Trigger>',
      "    <Tabs.Indicator />",
      "  </Tabs.List>",
      '  <Tabs.Content value="account">Account settings</Tabs.Content>',
      '  <Tabs.Content value="password">Password settings</Tabs.Content>',
      "</Tabs.Root>",
      "",
      '[data-scope="tabs"][data-part="trigger"][data-selected] { color: var(--foreground); }',
    ].join("\n");
    expect(validateUsage(manifests, { code, framework: "react" }).findings).toHaveLength(0);

    const badVariant = validateUsage(manifests, {
      framework: "react",
      code: '<Tabs.Root variant="pill" />',
    }).findings;
    expect(badVariant).toHaveLength(1);
    expect(badVariant[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badVariant[0]!.message).toContain("line, enclosed");

    const badPart = validateUsage(manifests, {
      framework: "react",
      code: '[data-scope="tabs"][data-part="tab"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"tab" is not a real part of Tabs');

    const rawArk = validateUsage(manifests, {
      framework: "react",
      code: 'import { Tabs } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Tabs } from "@moderno-ui/react"');
  });

  it("accepts real Accordion usage and knows its Ark anatomy", () => {
    const code = [
      'import { Accordion } from "@moderno-ui/react";',
      "",
      '<Accordion.Root variant="enclosed" size="sm" defaultValue={["shipping"]} multiple>',
      '  <Accordion.Item value="shipping">',
      "    <Accordion.ItemTrigger>",
      "      Shipping",
      "      <Accordion.ItemIndicator>⌄</Accordion.ItemIndicator>",
      "    </Accordion.ItemTrigger>",
      "    <Accordion.ItemContent>Three to five working days.</Accordion.ItemContent>",
      "  </Accordion.Item>",
      "</Accordion.Root>",
      "",
      '[data-scope="accordion"][data-part="item-trigger"][data-state="open"] { color: var(--foreground); }',
    ].join("\n");
    expect(validateUsage(manifests, { code, framework: "react" }).findings).toHaveLength(0);

    const badVariant = validateUsage(manifests, {
      framework: "react",
      code: '<Accordion.Root variant="card" />',
    }).findings;
    expect(badVariant).toHaveLength(1);
    expect(badVariant[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badVariant[0]!.message).toContain("line, enclosed");

    const badPart = validateUsage(manifests, {
      framework: "react",
      code: '[data-scope="accordion"][data-part="panel"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"panel" is not a real part of Accordion');

    const rawArk = validateUsage(manifests, {
      framework: "react",
      code: 'import { Accordion } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Accordion } from "@moderno-ui/react"');
  });

  it("accepts real Progress usage and knows its Ark anatomy", () => {
    const code = [
      'import { Progress } from "@moderno-ui/react";',
      "",
      '<Progress.Root size="sm" value={40}>',
      "  <Progress.Label>Uploading</Progress.Label>",
      "  <Progress.ValueText />",
      "  <Progress.Track>",
      "    <Progress.Range />",
      "  </Progress.Track>",
      "</Progress.Root>",
      "",
      "<Progress.Root value={null}>",
      "  <Progress.Circle>",
      "    <Progress.CircleTrack />",
      "    <Progress.CircleRange />",
      "  </Progress.Circle>",
      "</Progress.Root>",
      "",
      '[data-scope="progress"][data-part="range"][data-state="complete"] { background-color: var(--success); }',
    ].join("\n");
    expect(validateUsage(manifests, { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests, {
      framework: "react",
      code: '<Progress.Root size="xl" />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests, {
      framework: "react",
      code: '[data-scope="progress"][data-part="bar"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"bar" is not a real part of Progress');

    const rawArk = validateUsage(manifests, {
      framework: "react",
      code: 'import { Progress } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Progress } from "@moderno-ui/react"');
  });

  it("returns no findings for clean, valid usage", () => {
    const { findings } = validateUsage(manifests, {
      framework: "react",
      code: '<Button variant="primary">Save</Button>',
    });
    expect(findings).toHaveLength(0);
  });

  it("accepts a compound primitive's props on its Root, and catches a wrong one", () => {
    const valid = validateUsage(manifests, {
      framework: "react",
      code: [
        '<Card.Root variant="outline" size="md">',
        "  <Card.Header>",
        "    <Card.Title>Monthly report</Card.Title>",
        "    <Card.Description>Revenue across every channel.</Card.Description>",
        "  </Card.Header>",
        "  <Card.Content>Up 12% on last month.</Card.Content>",
        "  <Card.Footer>Export</Card.Footer>",
        "</Card.Root>",
      ].join("\n"),
    });
    expect(valid.findings).toHaveLength(0);

    const invalid = validateUsage(manifests, {
      framework: "react",
      code: '<Card.Root elevation="high">…</Card.Root>',
    });
    expect(invalid.findings).toHaveLength(1);
    expect(invalid.findings[0]).toMatchObject({ ruleId: "moderno/valid-props" });
  });

  it("throws a ModernoMcpError for a framework that isn't installed", () => {
    expect(() => validateUsage(manifests, { code: "<Button />", framework: "solid" })).toThrow(
      ModernoMcpError,
    );
  });
});
