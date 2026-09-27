import { describe, expect, it } from "vitest";
import { validateUsage } from "../../src/tools/validate-usage.ts";
import { useConsumerManifests } from "../helpers/consumer-manifests.ts";

const manifests = useConsumerManifests();

describe("validateUsage on Carousel", () => {
  it("accepts real Carousel usage and knows its Ark anatomy", () => {
    const code = [
      'import { Carousel } from "@moderno-ui/react";',
      "",
      '<Carousel.Root size="sm" slideCount={3} slidesPerPage={1} loop autoplay>',
      "  <Carousel.ItemGroup>",
      "    {slides.map((slide, index) => (",
      "      <Carousel.Item key={slide.id} index={index}>{slide.title}</Carousel.Item>",
      "    ))}",
      "  </Carousel.ItemGroup>",
      "  <Carousel.Control>",
      "    <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>",
      "    <Carousel.IndicatorGroup>",
      "      {slides.map((slide, index) => (",
      "        <Carousel.Indicator key={slide.id} index={index} />",
      "      ))}",
      "    </Carousel.IndicatorGroup>",
      "    <Carousel.NextTrigger>›</Carousel.NextTrigger>",
      "  </Carousel.Control>",
      "</Carousel.Root>",
      "",
      '[data-scope="carousel"][data-part="indicator"][data-current]::before { background-color: var(--accent-foreground); }',
    ].join("\n");
    expect(validateUsage(manifests(), { code, framework: "react" }).findings).toHaveLength(0);

    const badSize = validateUsage(manifests(), {
      framework: "react",
      code: '<Carousel.Root size="xl" slideCount={3} />',
    }).findings;
    expect(badSize).toHaveLength(1);
    expect(badSize[0]).toMatchObject({ ruleId: "moderno/valid-props" });
    expect(badSize[0]!.message).toContain("sm, md, lg");

    const badPart = validateUsage(manifests(), {
      framework: "react",
      code: '[data-scope="carousel"][data-part="slide"] { color: var(--primary); }',
    }).findings;
    expect(badPart).toHaveLength(1);
    expect(badPart[0]!.message).toContain('"slide" is not a real part of Carousel');

    const rawArk = validateUsage(manifests(), {
      framework: "react",
      code: 'import { Carousel } from "@ark-ui/react";',
    }).findings;
    expect(rawArk).toHaveLength(1);
    expect(rawArk[0]!.suggestion).toContain('import { Carousel } from "@moderno-ui/react"');
  });
});
