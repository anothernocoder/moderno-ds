import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import postcss, { type Declaration, type Rule } from "postcss";

const css = readFileSync(
  fileURLToPath(new URL("../src/styles/components.css", import.meta.url)),
  "utf8",
);
const root = postcss.parse(css);

const decls: Declaration[] = [];
root.walkDecls((d: Declaration) => {
  decls.push(d);
});
const selectors: string[] = [];
root.walkRules((r: Rule) => {
  selectors.push(r.selector);
});

/** Props whose value paints a brand colour — must come from a token, never a literal. */
const COLOR_PROPS = new Set([
  "color",
  "background",
  "background-color",
  "border-color",
  "outline-color",
  "fill",
  "stroke",
]);

describe("@moderno-ui/core components.css — Ark scope/part convention (F1.2)", () => {
  it("targets [data-scope]/[data-part], never component-owned class names", () => {
    expect(selectors.length).toBeGreaterThan(0);
    expect(selectors.some((s) => s.includes("[data-scope") || s.includes("[data-part"))).toBe(true);
    // No bare class-name selectors like `.button` / `.btn`.
    expect(selectors.some((s) => /(^|\s|,)\.[a-z]/i.test(s))).toBe(false);
  });

  it("declares the cascade layers (skeleton: base + components)", () => {
    expect(css).toMatch(/@layer\s+moderno\.base\s*,\s*moderno\.components/);
  });
});

describe("@moderno-ui/core components.css — zero baked brand values (F1.2)", () => {
  it("contains no literal colour values (hex / rgb / hsl / oklch)", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/\b(rgb|rgba|hsl|hsla|oklch|oklab)\(/i);
  });

  /*
   * Non-brand keyword values: not literal colours, so not a contract breach.
   * `currentColor` is the chart pattern — a series <g> sets `color` from a
   * --chart-* slot and its shapes paint with currentColor, so the colour still
   * traces back to a token. `none`/`transparent`/`inherit` carry no brand value.
   */
  const COLOR_KEYWORDS = new Set(["none", "currentcolor", "transparent", "inherit"]);

  it("paints every colour-bearing property from a contract variable or a non-brand keyword", () => {
    for (const d of decls) {
      if (!COLOR_PROPS.has(d.prop)) continue;
      if (COLOR_KEYWORDS.has(d.value.trim().toLowerCase())) continue;
      expect(d.value, `${d.prop}: ${d.value} is not a var(--…) reference`).toMatch(/var\(--/);
    }
  });

  it("derives any border-radius from the --radius contract slot", () => {
    for (const d of decls) {
      if (d.prop !== "border-radius") continue;
      expect(d.value, `border-radius: ${d.value}`).toMatch(/var\(--radius/);
    }
  });

  it("sets font-family from --font-sans / --font-mono, not a literal stack", () => {
    for (const d of decls) {
      if (d.prop !== "font-family") continue;
      expect(d.value, `font-family: ${d.value}`).toMatch(/var\(--font-(sans|mono)\)/);
    }
  });
});

/*
 * Divider's label gap is the one place in the sheet where a flow-relative
 * margin is read under a *rotated* writing mode. `margin-block`/`margin-inline`
 * resolve against the element's own writing mode, and the vertical divider's
 * label is `vertical-rl`, so its inline axis is the page's vertical one:
 * `margin-inline` is the along-the-rule axis in both orientations. Getting this
 * backwards costs nothing at build time and everything at render time — the
 * stroke butts into the caption's glyphs and the rule widens by two spacing
 * steps — so the axis is pinned here rather than left to a screenshot.
 */
describe("@moderno-ui/core components.css — Divider label gap opens along the rule", () => {
  /** Declarations of the `[data-orientation="…"] [data-part="label"]` rule. */
  const labelRule = (orientation: "horizontal" | "vertical"): Declaration[] => {
    const found: Declaration[] = [];
    root.walkRules((r: Rule) => {
      if (!r.selector.includes(`[data-scope="divider"][data-orientation="${orientation}"]`)) return;
      if (!r.selector.includes(`[data-part="label"]`)) return;
      r.walkDecls((d: Declaration) => {
        found.push(d);
      });
    });
    return found;
  };
  const prop = (decls: Declaration[], name: string) => decls.find((d) => d.prop === name)?.value;

  it("rotates the vertical label so its inline axis runs along the rule", () => {
    expect(prop(labelRule("vertical"), "writing-mode")).toBe("vertical-rl");
    expect(prop(labelRule("horizontal"), "writing-mode")).toBeUndefined();
  });

  it("opens the gap with margin-inline in both orientations", () => {
    for (const orientation of ["horizontal", "vertical"] as const) {
      const decls = labelRule(orientation);
      expect(prop(decls, "margin-inline"), `${orientation} label`).toMatch(/var\(--spacing-/);
      // `margin-block` here is the across-the-rule axis: it would pad the
      // label's sides and leave the two halves of the stroke touching it.
      for (const across of ["margin-block", "margin-block-start", "margin-block-end"]) {
        expect(prop(decls, across), `${orientation} label sets ${across}`).toBeUndefined();
      }
    }
  });
});

/*
 * Button is a plain native <button> in every binding — no Ark machine — so two
 * browser defaults leak through unless the sheet overrides them: the UA grey
 * `buttonface` fill (visible on `ghost`, the one variant with no fill of its
 * own), and a native `disabled` that no one turns into `data-disabled`, so the
 * shared base affordance (`[data-disabled]` → dimmed, inert) never reaches it.
 */
describe("@moderno-ui/core components.css — Button overrides the native defaults", () => {
  /** Declarations of the rules whose selector is exactly `selector`. */
  const ruleDecls = (selector: string): Declaration[] => {
    const found: Declaration[] = [];
    root.walkRules((r: Rule) => {
      if (!r.selectors.map((s) => s.trim()).includes(selector)) return;
      r.walkDecls((d: Declaration) => {
        found.push(d);
      });
    });
    return found;
  };
  const prop = (decls: Declaration[], name: string) => decls.find((d) => d.prop === name)?.value;
  const BUTTON = `[data-scope="button"][data-part="root"]`;

  it("clears the UA button fill on the root, so ghost is transparent anywhere", () => {
    expect(prop(ruleDecls(BUTTON), "background-color")).toBe("transparent");
  });

  it("dims and disables a native :disabled button like [data-disabled]", () => {
    const decls = ruleDecls(`${BUTTON}:disabled`);
    expect(prop(decls, "opacity")).toBe("0.5");
    expect(prop(decls, "pointer-events")).toBe("none");
  });
});

/*
 * Toggle's root and ToggleGroup's items are native <button>s too, so the same
 * two browser defaults leak through: the UA `buttonface` fill (a toggle at
 * rest has no fill of its own) and a native `disabled` set without Ark — or
 * before it hydrates — which carries no `data-disabled` for the base layer.
 */
describe("@moderno-ui/core components.css — Toggle and ToggleGroup buttons override the native defaults", () => {
  const ruleDecls = (selector: string): Declaration[] => {
    const found: Declaration[] = [];
    root.walkRules((r: Rule) => {
      if (!r.selectors.map((s) => s.trim()).includes(selector)) return;
      r.walkDecls((d: Declaration) => {
        found.push(d);
      });
    });
    return found;
  };
  const prop = (decls: Declaration[], name: string) => decls.find((d) => d.prop === name)?.value;

  for (const button of [
    `[data-scope="toggle"][data-part="root"]`,
    `[data-scope="toggle-group"][data-part="item"]`,
  ]) {
    it(`clears the UA button fill on ${button}`, () => {
      expect(prop(ruleDecls(button), "background-color")).toBe("transparent");
    });

    it(`dims and disables a native :disabled ${button} like [data-disabled]`, () => {
      const decls = ruleDecls(`${button}:disabled`);
      expect(prop(decls, "opacity")).toBe("0.5");
      expect(prop(decls, "pointer-events")).toBe("none");
    });
  }

  const selectorsInOrder: string[] = [];
  root.walkRules((r: Rule) => {
    selectorsInOrder.push(...r.selectors.map((s) => s.trim()));
  });

  for (const { name, rootSelector, disabledSelector } of [
    {
      name: "Toggle",
      rootSelector: `[data-scope="toggle"][data-part="root"]`,
      disabledSelector: `[data-scope="toggle"][data-part="root"]:disabled`,
    },
    {
      name: "ToggleGroup",
      rootSelector: `[data-scope="toggle-group"][data-part="root"]`,
      disabledSelector: `[data-scope="toggle-group"][data-part="item"]:disabled`,
    },
  ]) {
    it(`dims a disabled ${name} once: its parts are reset after the :disabled rule`, () => {
      const reset = `${rootSelector}[data-disabled] :where([data-part])`;
      expect(prop(ruleDecls(reset), "opacity")).toBe("1");
      expect(selectorsInOrder.indexOf(reset)).toBeGreaterThan(
        selectorsInOrder.indexOf(disabledSelector),
      );
    });
  }
});

/*
 * A Tabs trigger is a native <button role="tab">, so the same two browser
 * defaults leak through: the UA `buttonface` fill (a tab has no fill of its
 * own — the enclosed pill is the indicator behind it) and a native `disabled`
 * set without Ark, or before it hydrates, which carries no `data-disabled`.
 */
describe("@moderno-ui/core components.css — Tabs", () => {
  const ruleDecls = (selector: string): Declaration[] => {
    const found: Declaration[] = [];
    root.walkRules((r: Rule) => {
      if (!r.selectors.map((s) => s.trim().replace(/\s+/g, " ")).includes(selector)) return;
      r.walkDecls((d: Declaration) => {
        found.push(d);
      });
    });
    return found;
  };
  const prop = (decls: Declaration[], name: string) => decls.find((d) => d.prop === name)?.value;
  const TRIGGER = `[data-scope="tabs"][data-part="trigger"]`;

  it("clears the UA button fill on the trigger", () => {
    expect(prop(ruleDecls(TRIGGER), "background-color")).toBe("transparent");
  });

  it("dims and disables a native :disabled trigger like [data-disabled]", () => {
    const decls = ruleDecls(`${TRIGGER}:disabled`);
    expect(prop(decls, "opacity")).toBe("0.5");
    expect(prop(decls, "pointer-events")).toBe("none");
  });

  it("sizes the indicator from the box Ark measures", () => {
    const line = ruleDecls(
      `[data-scope="tabs"][data-part="root"][data-variant="line"] > [data-part="list"] > [data-part="indicator"]`,
    );
    expect(prop(line, "width")).toBe("var(--width)");
    const enclosed = ruleDecls(
      `[data-scope="tabs"][data-part="root"][data-variant="enclosed"] > [data-part="list"] > [data-part="indicator"]`,
    );
    expect(prop(enclosed, "width")).toBe("var(--width)");
    expect(prop(enclosed, "height")).toBe("var(--height)");
  });

  it("reaches the list and its parts through child combinators, so a nested Tabs keeps its own look", () => {
    const variantRules: string[] = [];
    root.walkRules((r: Rule) => {
      for (const s of r.selectors) {
        if (/\[data-scope="tabs"\]\[data-part="root"\]\[data-(variant|size)=/.test(s)) {
          variantRules.push(s.replace(/\s+/g, " "));
        }
      }
    });
    expect(variantRules.length).toBeGreaterThan(0);
    for (const s of variantRules) {
      expect(s, s).not.toMatch(/\] \[data-part/);
    }
  });
});

/*
 * An Accordion trigger is a native <button>, so the same two browser defaults
 * leak through: the UA `buttonface` fill (a trigger has no fill of its own)
 * and a native `disabled` set without Ark, or before it hydrates, which
 * carries no `data-disabled`. Ark stamps `data-disabled` on the item and on
 * its content and indicator too, so the item is dimmed once and its parts
 * reset. The content's height animates from the height Ark measures.
 */
describe("@moderno-ui/core components.css — Accordion", () => {
  const ruleDecls = (selector: string): Declaration[] => {
    const found: Declaration[] = [];
    root.walkRules((r: Rule) => {
      if (!r.selectors.map((s) => s.trim().replace(/\s+/g, " ")).includes(selector)) return;
      r.walkDecls((d: Declaration) => {
        found.push(d);
      });
    });
    return found;
  };
  const prop = (decls: Declaration[], name: string) => decls.find((d) => d.prop === name)?.value;
  const TRIGGER = `[data-scope="accordion"][data-part="item-trigger"]`;
  const CONTENT = `[data-scope="accordion"][data-part="item-content"]`;
  const selectorsInOrder: string[] = [];
  root.walkRules((r: Rule) => {
    selectorsInOrder.push(...r.selectors.map((s) => s.trim().replace(/\s+/g, " ")));
  });

  it("clears the UA button fill on the trigger", () => {
    expect(prop(ruleDecls(TRIGGER), "background-color")).toBe("transparent");
  });

  it("dims and disables a native :disabled trigger like [data-disabled]", () => {
    const decls = ruleDecls(`${TRIGGER}:disabled`);
    expect(prop(decls, "opacity")).toBe("0.5");
    expect(prop(decls, "pointer-events")).toBe("none");
  });

  it("dims a disabled item once: its parts are reset after the :disabled rule", () => {
    const reset = `[data-scope="accordion"][data-part="item"][data-disabled] :where([data-part])`;
    expect(prop(ruleDecls(reset), "opacity")).toBe("1");
    expect(selectorsInOrder.indexOf(reset)).toBeGreaterThan(
      selectorsInOrder.indexOf(`${TRIGGER}:disabled`),
    );
  });

  it("animates the content's height from the height Ark measures, both ways", () => {
    expect(prop(ruleDecls(CONTENT), "overflow")).toBe("hidden");
    expect(prop(ruleDecls(`${CONTENT}[data-state="open"]`), "animation")).toMatch(
      /^moderno-accordion-expand var\(--motion-normal\)/,
    );
    expect(prop(ruleDecls(`${CONTENT}[data-state="closed"]`), "animation")).toMatch(
      /^moderno-accordion-collapse var\(--motion-normal\)/,
    );
    const keyframes: Record<string, string[]> = {};
    root.walkAtRules("keyframes", (at) => {
      if (!at.params.startsWith("moderno-accordion-")) return;
      keyframes[at.params] = [];
      at.walkDecls("height", (d) => {
        keyframes[at.params]!.push(d.value);
      });
    });
    expect(keyframes).toEqual({
      "moderno-accordion-expand": ["0", "var(--height)"],
      "moderno-accordion-collapse": ["var(--height)", "0"],
    });
  });

  it("drops the animation under reduced motion", () => {
    let dropped = false;
    root.walkAtRules("media", (at) => {
      if (!at.params.includes("prefers-reduced-motion")) return;
      at.walkRules((r) => {
        if (r.selector === `${CONTENT}[data-state]`) {
          r.walkDecls("animation", (d) => {
            dropped = d.value === "none";
          });
        }
      });
    });
    expect(dropped).toBe(true);
  });

  it("reaches the items and their parts through child combinators, so a nested Accordion keeps its own look", () => {
    const variantRules = selectorsInOrder.filter((s) =>
      /\[data-scope="accordion"\]\[data-part="root"\](\[data-(variant|size)=[^\]]+\])+ /.test(s),
    );
    expect(variantRules.length).toBeGreaterThan(0);
    for (const s of variantRules) {
      expect(s, s).not.toMatch(/\] \[data-part/);
    }
  });
});

/*
 * Progress takes its percentage from Ark inline (the range's width, the
 * circle-range's stroke offset) and its circle's geometry from --size and
 * --thickness, which Ark reads and the stylesheet sets. A null value is
 * indeterminate: Ark sets no width, so the stylesheet must animate one.
 */
describe("@moderno-ui/core components.css — Progress", () => {
  const ruleDecls = (selector: string): Declaration[] => {
    const found: Declaration[] = [];
    root.walkRules((r: Rule) => {
      if (!r.selectors.map((s) => s.trim().replace(/\s+/g, " ")).includes(selector)) return;
      r.walkDecls((d: Declaration) => {
        found.push(d);
      });
    });
    return found;
  };
  const prop = (decls: Declaration[], name: string) => decls.find((d) => d.prop === name)?.value;
  const ROOT = `[data-scope="progress"][data-part="root"]`;
  const RANGE = `[data-scope="progress"][data-part="range"]`;
  const CIRCLE_RANGE = `[data-scope="progress"][data-part="circle-range"]`;

  it("sets the circle's --size and --thickness from spacing slots at every size", () => {
    const circles = [
      `[data-scope="progress"][data-part="circle"]`,
      `${ROOT}[data-size="sm"] > [data-part="circle"]`,
      `${ROOT}[data-size="lg"] > [data-part="circle"]`,
    ];
    for (const selector of circles) {
      const decls = ruleDecls(selector);
      expect(prop(decls, "--size"), selector).toMatch(/var\(--spacing-/);
      expect(prop(decls, "--thickness"), selector).toMatch(/var\(--spacing-/);
    }
  });

  it("gives an indeterminate range a width of its own and an endless animation", () => {
    const linear = ruleDecls(`${RANGE}[data-state="indeterminate"]`);
    expect(prop(linear, "width")).toBeDefined();
    expect(prop(linear, "animation")).toMatch(/^moderno-progress-slide .* infinite$/);
    const circular = ruleDecls(`${CIRCLE_RANGE}[data-state="indeterminate"]`);
    expect(prop(circular, "stroke-dasharray")).toMatch(/var\(--circumference\)/);
    expect(prop(circular, "animation")).toMatch(/^moderno-progress-spin .* infinite$/);
  });

  it("mirrors the indeterminate slide in right-to-left instead of replaying it backwards", () => {
    const translateX = (name: string, step: "from" | "to") => {
      let value: string | undefined;
      root.walkAtRules("keyframes", (at) => {
        if (at.params !== name) return;
        at.walkRules((r) => {
          if (r.selector === step) value = prop(r.nodes as Declaration[], "translate");
        });
      });
      return value?.split(/\s+/)[0];
    };
    const mirrored = (x: string | undefined) => (x?.startsWith("-") ? x.slice(1) : `-${x}`);

    const rtl = ruleDecls(
      `${RANGE}[data-orientation="horizontal"][data-state="indeterminate"][dir="rtl"]`,
    );
    expect(prop(rtl, "animation-name")).toBe("moderno-progress-slide-rtl");
    expect(prop(rtl, "animation-direction")).toBeUndefined();
    for (const step of ["from", "to"] as const) {
      const ltrX = translateX("moderno-progress-slide", step);
      expect(ltrX, step).toBeDefined();
      expect(translateX("moderno-progress-slide-rtl", step), step).toBe(mirrored(ltrX));
    }
  });

  it("slows the indeterminate animations under reduced motion instead of stopping them", () => {
    const slowed: string[] = [];
    root.walkAtRules("media", (at) => {
      if (!at.params.includes("prefers-reduced-motion")) return;
      at.walkRules((r) => {
        if (!r.selector.includes('[data-scope="progress"]')) return;
        r.walkDecls((d) => {
          if (d.prop === "animation" && d.value === "none") slowed.push(`stopped: ${r.selector}`);
          if (d.prop === "animation-duration") slowed.push(r.selector);
        });
      });
    });
    expect(slowed).toEqual([
      `${RANGE}[data-state="indeterminate"]`,
      `${CIRCLE_RANGE}[data-state="indeterminate"]`,
    ]);
  });

  it("reaches its parts through child combinators", () => {
    const sizeRules: string[] = [];
    root.walkRules((r: Rule) => {
      for (const s of r.selectors) {
        if (s.includes(`${ROOT}[data-size=`)) sizeRules.push(s.replace(/\s+/g, " "));
      }
    });
    expect(sizeRules.length).toBeGreaterThan(0);
    for (const s of sizeRules) {
      expect(s, s).not.toMatch(/\] \[data-part/);
    }
  });
});

/*
 * Slider takes every position from Ark inline: the range's inset, each
 * thumb's and marker's offset along the track, and a centring `transform`.
 * The stylesheet must centre the thumb across the track without touching
 * that transform, and bring the dragging indicator back onto its own thumb.
 */
describe("@moderno-ui/core components.css — Slider", () => {
  const ruleDecls = (selector: string): Declaration[] => {
    const found: Declaration[] = [];
    root.walkRules((r: Rule) => {
      if (!r.selectors.map((s) => s.trim().replace(/\s+/g, " ")).includes(selector)) return;
      r.walkDecls((d: Declaration) => {
        found.push(d);
      });
    });
    return found;
  };
  const prop = (decls: Declaration[], name: string) => decls.find((d) => d.prop === name)?.value;
  const ROOT = `[data-scope="slider"][data-part="root"]`;
  const THUMB = `[data-scope="slider"][data-part="thumb"]`;
  const sliderRules = () => {
    const rules: Rule[] = [];
    root.walkRules((r: Rule) => {
      if (r.selector.includes('[data-scope="slider"]')) rules.push(r);
    });
    return rules;
  };

  it("never sets transform, so Ark's inline centring along the track holds", () => {
    for (const rule of sliderRules()) {
      rule.walkDecls((d) => {
        expect(d.prop, rule.selector).not.toBe("transform");
      });
    }
  });

  it("centres the thumb across the track with translate, in both orientations", () => {
    expect(prop(ruleDecls(THUMB), "translate")).toBe("0 -50%");
    expect(prop(ruleDecls(`${THUMB}[data-orientation="vertical"]`), "translate")).toBe("-50% 0");
  });

  it("puts the dragging indicator back on its own thumb, for both thumbs of a range", () => {
    const decls = ruleDecls(`[data-scope="slider"][data-part="dragging-indicator"]`);
    expect(prop(decls, "--slider-thumb-offset-0")).toBe("50%");
    expect(prop(decls, "--slider-thumb-offset-1")).toBe("50%");
  });

  it("sizes the thumb from spacing slots at every size", () => {
    const thumbs = [
      THUMB,
      `${ROOT}[data-size="sm"] > [data-part="control"] > [data-part="thumb"]`,
      `${ROOT}[data-size="lg"] > [data-part="control"] > [data-part="thumb"]`,
    ];
    for (const selector of thumbs) {
      const decls = ruleDecls(selector);
      expect(prop(decls, "width"), selector).toMatch(/^var\(--spacing-\d\)$/);
      expect(prop(decls, "height"), selector).toBe(prop(decls, "width"));
    }
  });

  it("dims a disabled slider once: its parts are reset", () => {
    expect(prop(ruleDecls(`${ROOT}[data-disabled] :where([data-part])`), "opacity")).toBe("1");
  });

  it("reaches its parts through child combinators", () => {
    const sizeRules: string[] = [];
    for (const r of sliderRules()) {
      for (const s of r.selectors) {
        if (s.includes(`${ROOT}[data-size=`)) sizeRules.push(s.replace(/\s+/g, " "));
      }
    }
    expect(sizeRules.length).toBeGreaterThan(0);
    for (const s of sizeRules) {
      expect(s, s).not.toMatch(/\] \[data-part/);
    }
  });
});
