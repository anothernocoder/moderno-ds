---
# Generated from the theme's tokens (tokens.dtcg.json) by Moderno's theme compiler. Change a value there or in the Theme Builder and regenerate; never edit this block.
version: alpha
name: "Contrast"
description: "A synthetic maximum-contrast brand of pure black and white, square-cornered and outlined, that demonstrates the multi-brand switch."
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0 0 0)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0 0 0)"
  popover: "oklch(1 0 0)"
  popover-foreground: "oklch(0 0 0)"
  primary: "oklch(0 0 0)"
  primary-foreground: "oklch(1 0 0)"
  secondary: "oklch(1 0 0)"
  secondary-foreground: "oklch(0 0 0)"
  accent: "oklch(0 0 0)"
  accent-foreground: "oklch(1 0 0)"
  muted: "oklch(1 0 0)"
  muted-foreground: "oklch(0 0 0)"
  destructive: "oklch(0.45 0.3 27)"
  destructive-foreground: "oklch(1 0 0)"
  info: "oklch(0.35 0.2 264)"
  info-foreground: "oklch(1 0 0)"
  success: "oklch(0.35 0.14 152)"
  success-foreground: "oklch(1 0 0)"
  warning: "oklch(0.45 0.16 75)"
  warning-foreground: "oklch(1 0 0)"
  border: "oklch(0 0 0)"
  input: "oklch(0 0 0)"
  ring: "oklch(0 0 0)"
  chart-1: "oklch(0 0 0)"
  chart-2: "oklch(0.3 0 0)"
  chart-3: "oklch(0.5 0 0)"
  chart-4: "oklch(0.45 0.3 27)"
  chart-5: "oklch(0.45 0.25 264)"
  overlay: "oklch(0 0 0 / 0.32)"
  dark-background: "oklch(0 0 0)"
  dark-foreground: "oklch(1 0 0)"
  dark-card: "oklch(0 0 0)"
  dark-card-foreground: "oklch(1 0 0)"
  dark-popover: "oklch(0 0 0)"
  dark-popover-foreground: "oklch(1 0 0)"
  dark-primary: "oklch(1 0 0)"
  dark-primary-foreground: "oklch(0 0 0)"
  dark-secondary: "oklch(0 0 0)"
  dark-secondary-foreground: "oklch(1 0 0)"
  dark-accent: "oklch(1 0 0)"
  dark-accent-foreground: "oklch(0 0 0)"
  dark-muted: "oklch(0 0 0)"
  dark-muted-foreground: "oklch(1 0 0)"
  dark-destructive: "oklch(0.7 0.25 27)"
  dark-destructive-foreground: "oklch(0 0 0)"
  dark-info: "oklch(0.8 0.16 264)"
  dark-info-foreground: "oklch(0 0 0)"
  dark-success: "oklch(0.85 0.18 152)"
  dark-success-foreground: "oklch(0 0 0)"
  dark-warning: "oklch(0.85 0.16 75)"
  dark-warning-foreground: "oklch(0 0 0)"
  dark-border: "oklch(1 0 0)"
  dark-input: "oklch(1 0 0)"
  dark-ring: "oklch(1 0 0)"
  dark-chart-1: "oklch(1 0 0)"
  dark-chart-2: "oklch(0.8 0 0)"
  dark-chart-3: "oklch(0.6 0 0)"
  dark-chart-4: "oklch(0.7 0.25 27)"
  dark-chart-5: "oklch(0.7 0.2 264)"
  dark-overlay: "oklch(0 0 0 / 0.6)"
typography:
  ui-xs:
    fontFamily: "ui-sans-serif"
    fontSize: 0.75rem
    lineHeight: 1rem
  ui-sm:
    fontFamily: "ui-sans-serif"
    fontSize: 0.8125rem
    lineHeight: 1.125rem
  ui-md:
    fontFamily: "ui-sans-serif"
    fontSize: 0.875rem
    lineHeight: 1.25rem
  ui-lg:
    fontFamily: "ui-sans-serif"
    fontSize: 0.9375rem
    lineHeight: 1.375rem
  body:
    fontFamily: "ui-sans-serif"
    fontSize: 1rem
    lineHeight: 1.5rem
  body-lg:
    fontFamily: "ui-sans-serif"
    fontSize: 1.125rem
    lineHeight: 1.75rem
  heading-sm:
    fontFamily: "ui-sans-serif"
    fontSize: 1.25rem
    lineHeight: 1.75rem
  heading:
    fontFamily: "ui-sans-serif"
    fontSize: 1.5rem
    lineHeight: 2rem
  heading-lg:
    fontFamily: "ui-sans-serif"
    fontSize: 2.25rem
    lineHeight: 2.5rem
rounded:
  base: 0rem
  full: 9999px
spacing:
  "1": 0.25rem
  "2": 0.5rem
  "3": 0.75rem
  "4": 1rem
  "5": 1.25rem
  "6": 1.5rem
  "7": 1.75rem
  "8": 2rem
---

<!-- Generated from the theme's tokens (tokens.dtcg.json) and the Moderno token contract by Moderno's theme compiler. Only the brand notes are hand-written: edit them between the markers below; everything outside the markers is regenerated. -->

## Overview

`theme-contrast` is a branded theme: it paints under `[data-brand="contrast"]`, composed with `.dark`, beside the project's default theme. Everything inside an element with `data-brand="contrast"` takes this brand.

The front matter holds the theme's values, and every slot the theme leaves out appears at the neutral default it inherits. The sections after this one are the rules every Moderno theme shares, derived from the token contract (`CONTRACT.md`): they name slots and never restate values. What sets this theme apart is in its brand notes, below.

<!-- brand-notes:start -->

### Brand

A synthetic brand: it exists to demonstrate the multi-brand switch, and to show how far the contract stretches toward maximum contrast. It paints only under `[data-brand="contrast"]`, so a page opts a subtree into it while the default brand paints the rest.

### Aesthetic

Pure black and pure white, nothing in between on any surface. Light is black ink on white; the dark scope swaps the two. Hierarchy has no grey tier to lean on, so it comes from size, weight, spacing, and filled versus outlined surfaces.

- **Color.** `muted` is the page itself and `muted-foreground` is full ink: there is no subdued text, so secondary information must read as secondary through the type scale. `accent` is a full inverse fill, so a highlighted menu item or row is a solid block. `border`, `input`, and `ring` are all full ink.
- **Status and charts.** Status hues are deep in light and bright in dark, the only color in the theme, so meaning never depends on hue alone: pair it with an icon or a label. The chart series start with black and greys and add a red and a blue.
- **Type.** The system font stack, with no display face of its own.
- **Shape.** Sharp: every surface and control is square-cornered; only `rounded.full` rounds.
- **Depth.** No soft shadows. Overlays lift on solid outline rings that thicken with each shadow step.

<!-- brand-notes:end -->

## Colors

Paint from contract slots, never from a raw color value. The front matter lists the light scope under the slot names and the dark scope as `dark-*`; code names the slot once and the scope follows `.dark`.

- **Surfaces** (the page, raised surfaces and floating surfaces): `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`.
- **Brand** (actions, from the primary fill to the quieter ones): `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `accent`, `accent-foreground`.
- **Support** (recessed wells, the destructive action, status, lines and focus): `muted`, `muted-foreground`, `destructive`, `destructive-foreground`, `info`, `info-foreground`, `success`, `success-foreground`, `warning`, `warning-foreground`, `border`, `input`, `ring`.
- **Charts** (data-viz series, in order): `chart-1`, `chart-2`, `chart-3`, `chart-4`, `chart-5`.
- **Extended** (optional in a theme, with a neutral default): `overlay`.

Every `*-foreground` is paired with one surface and sits on that surface only, with one exception: `muted-foreground` is the subdued text of the whole page, meant for `background`, `card` and `muted` alike. `theme-compile` checks each pair for WCAG AA (4.5:1) in both scopes:

- `foreground` on `background`
- `card-foreground` on `card`
- `popover-foreground` on `popover`
- `primary-foreground` on `primary`
- `secondary-foreground` on `secondary`
- `accent-foreground` on `accent`
- `muted-foreground` on `muted`
- `destructive-foreground` on `destructive`
- `info-foreground` on `info`
- `success-foreground` on `success`
- `warning-foreground` on `warning`

Roles:

- `primary` is the main action: primary button fills and emphasized controls. `destructive` is reserved for irreversible actions, and error states reuse it so an error and a destructive action speak with one voice.
- `muted-foreground` is subdued text on `background`, `card` or `muted`, never on a filled `primary` or `secondary`.
- `info`, `success` and `warning` carry the hue of a state, not of an action: a status surface tints itself with them against `card`.
- Status hues and `chart-1`, `chart-2`, `chart-3`, `chart-4`, `chart-5` carry meaning. Never use them for decoration.
- `border` separates, `input` strokes form controls, and `ring` is the focus indicator.
- `overlay` is the scrim behind a dialog or command palette, painted over a blur of the page. Never mix it from `foreground`.

## Typography

`font-sans` sets the interface and running text, and is the `fontFamily` of every style in the front matter. `font-serif` is the display face for headings and pull quotes when the brand has one. `font-mono` sets code.

The type scale is a size and a line height per step (`--text-<step>`, `--leading-<step>`), in two ramps:

- **Interface** (`ui-xs`, `ui-sm`, `ui-md`, `ui-lg`): a component's `sm`/`md`/`lg` sizes read `ui-sm`, `ui-md`, `ui-lg`, so controls grow one step at a time. `ui-md` is the default text of the interface, and `ui-xs` carries ticks and helper text.
- **Content** (`body`, `body-lg`, `heading-sm`, `heading`, `heading-lg`): running text, lead paragraphs and titles.

Weights (`--font-weight-*`):

- `font-weight-normal`: running text.
- `font-weight-medium`: controls and labels.
- `font-weight-semibold`: titles.
- `font-weight-bold`: strong emphasis, sparingly.

Use a step and a weight, never a raw size or weight. A size the scale lacks is a change to the contract, not a local exception.

## Layout

Spacing uses the contract's scale, `spacing-1` to `spacing-8` (the front matter's `spacing`). Component heights and gaps compose from the same steps.

- Reference the scale by step, never a raw length.
- Do not introduce one-off spacing exceptions.
- Blocks and screens respond to the width of their container, never the viewport: `container-sm`, `container-md`, `container-lg`, as the `@sm:`/`@md:`/`@lg:` container variants.
- Only a primitive that changes shape on a small screen (a dialog presented as a bottom sheet) may use a viewport media query.

## Elevation & Depth

Resting surfaces separate by fill and a `border`, not by shadow: `muted` recesses, `card` sits at page level. Shadows (`shadow-sm`, `shadow-md`, `shadow-lg`) are for overlays only (popover, menu, drawer, toast), one step per layer of float. The dark scope carries its own shadows, since a light-mode shadow disappears on a dark surface.

Motion durations:

- `motion-instant`: hover and focus feedback.
- `motion-fast`: reveals (menus, tooltips).
- `motion-normal`: panels and sheets.

## Shapes

`rounded.base` (`radius`) shapes buttons, inputs, cards and surfaces. `rounded.full` (`radius-full`) is for pills, badges, avatars and status dots. Never set a corner radius by hand.

## Components

Components are never edited: they are themed through the contract slots and varied through props, which resolve to `data-*` attributes on the root part.

- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Interactive components must document keyboard, pointer, and touch behavior.
- Include long-content, overflow, and empty-state handling.
- Component behavior should specify responsive and edge-case handling.

Key patterns:

- **Button**: `primary` fill with `primary-foreground` text for the main action. `secondary` and `outline` are the quieter actions, and `destructive` is reserved for irreversible ones. Sizes step through `ui-sm`/`ui-md`/`ui-lg`.
- **Card**: a `card` fill with a `border`. `muted` is the recessed well, and `ghost` keeps the anatomy with no surface of its own.
- **Field**: an `input` stroke that turns to `ring` on hover and to `destructive` when invalid, with a `ring` outline on focus. Label and helper text follow the field's size step.
- **Dialog**: an overlay over the `overlay` scrim, titled in `body-lg`.

## Do's and Don'ts

- **Do** use semantic tokens, not raw color values, in component guidance and code.
- **Do** define states for default, hover, focus-visible, active, disabled, loading, and error on every component.
- **Do** document keyboard, pointer, and touch behavior for interactive components.
- **Do** make accessibility acceptance criteria testable in implementation.
- **Do** change a value in the theme's tokens (`tokens.dtcg.json`) or in the Theme Builder, then regenerate. Never edit the front matter or `theme.css`.
- **Don't** allow low-contrast text or hidden focus indicators.
- **Don't** introduce one-off spacing or typography exceptions.
- **Don't** use ambiguous labels or non-descriptive actions.
- **Don't** ship component guidance without explicit state rules.
- **Don't** put a `*-foreground` on any surface but its own; only `muted-foreground` also reads on `background` and `card`.

## Accessibility

- Target: WCAG 2.2 AA.
- Keyboard-first interactions required.
- Focus must be visible: every focusable element shows the `ring` on `:focus-visible`.
- Contrast constraints required: text uses only the foreground/surface pairs listed under Colors.

## Guideline Authoring

### Workflow

1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

### Required Output Structure

- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

### Quality Gates

- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
