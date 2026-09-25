---
# Generated from the theme's tokens (tokens.dtcg.json) by Moderno's theme compiler. Change a value there or in the Theme Builder and regenerate; never edit this block.
version: alpha
name: "Moderno"
description: "Moderno's default brand: a near-black monochrome workspace with sharp corners, in light and dark."
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.205 0 0)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.205 0 0)"
  popover: "oklch(1 0 0)"
  popover-foreground: "oklch(0.205 0 0)"
  primary: "oklch(0.205 0 0)"
  primary-foreground: "oklch(0.985 0 0)"
  secondary: "oklch(0.97 0 0)"
  secondary-foreground: "oklch(0.205 0 0)"
  accent: "oklch(0.97 0 0)"
  accent-foreground: "oklch(0.205 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.505 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  destructive-foreground: "oklch(0.985 0 0)"
  info: "oklch(0.52 0.16 255)"
  info-foreground: "oklch(0.985 0 0)"
  success: "oklch(0.5 0.13 152)"
  success-foreground: "oklch(0.985 0 0)"
  warning: "oklch(0.75 0.15 75)"
  warning-foreground: "oklch(0.145 0 0)"
  border: "oklch(0.922 0 0)"
  input: "oklch(0.922 0 0)"
  ring: "oklch(0.205 0 0)"
  chart-1: "oklch(0.646 0.222 41.116)"
  chart-2: "oklch(0.6 0.118 184.704)"
  chart-3: "oklch(0.398 0.07 227.392)"
  chart-4: "oklch(0.828 0.189 84.429)"
  chart-5: "oklch(0.769 0.188 70.08)"
  overlay: "oklch(0 0 0 / 0.32)"
  dark-background: "oklch(0.16 0 0)"
  dark-foreground: "oklch(0.985 0 0)"
  dark-card: "oklch(0.205 0 0)"
  dark-card-foreground: "oklch(0.985 0 0)"
  dark-popover: "oklch(0.205 0 0)"
  dark-popover-foreground: "oklch(0.985 0 0)"
  dark-primary: "oklch(0.985 0 0)"
  dark-primary-foreground: "oklch(0.205 0 0)"
  dark-secondary: "oklch(0.269 0 0)"
  dark-secondary-foreground: "oklch(0.985 0 0)"
  dark-accent: "oklch(0.269 0 0)"
  dark-accent-foreground: "oklch(0.985 0 0)"
  dark-muted: "oklch(0.269 0 0)"
  dark-muted-foreground: "oklch(0.708 0 0)"
  dark-destructive: "oklch(0.704 0.191 22.216)"
  dark-destructive-foreground: "oklch(0.145 0 0)"
  dark-info: "oklch(0.72 0.13 255)"
  dark-info-foreground: "oklch(0.145 0 0)"
  dark-success: "oklch(0.72 0.15 152)"
  dark-success-foreground: "oklch(0.145 0 0)"
  dark-warning: "oklch(0.8 0.15 75)"
  dark-warning-foreground: "oklch(0.145 0 0)"
  dark-border: "oklch(0.27 0 0)"
  dark-input: "oklch(0.27 0 0)"
  dark-ring: "oklch(0.985 0 0)"
  dark-chart-1: "oklch(0.488 0.243 264.376)"
  dark-chart-2: "oklch(0.696 0.17 162.48)"
  dark-chart-3: "oklch(0.769 0.188 70.08)"
  dark-chart-4: "oklch(0.627 0.265 303.9)"
  dark-chart-5: "oklch(0.645 0.246 16.439)"
  dark-overlay: "oklch(0 0 0 / 0.6)"
typography:
  ui-xs:
    fontFamily: "Hedvig Letters Sans"
    fontSize: 0.75rem
    lineHeight: 1rem
  ui-sm:
    fontFamily: "Hedvig Letters Sans"
    fontSize: 0.8125rem
    lineHeight: 1.125rem
  ui-md:
    fontFamily: "Hedvig Letters Sans"
    fontSize: 0.875rem
    lineHeight: 1.25rem
  ui-lg:
    fontFamily: "Hedvig Letters Sans"
    fontSize: 0.9375rem
    lineHeight: 1.375rem
  body:
    fontFamily: "Hedvig Letters Sans"
    fontSize: 1rem
    lineHeight: 1.5rem
  body-lg:
    fontFamily: "Hedvig Letters Sans"
    fontSize: 1.125rem
    lineHeight: 1.75rem
  heading-sm:
    fontFamily: "Hedvig Letters Sans"
    fontSize: 1.25rem
    lineHeight: 1.75rem
  heading:
    fontFamily: "Hedvig Letters Sans"
    fontSize: 1.5rem
    lineHeight: 2rem
  heading-lg:
    fontFamily: "Hedvig Letters Sans"
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

`theme-moderno` is a brand-less theme: it paints `:root` (light) and `.dark` (dark) and replaces the neutral defaults of `@moderno-ui/css`, so a project installs one such theme.

The front matter holds the theme's values, and every slot the theme leaves out appears at the neutral default it inherits. The sections after this one are the rules every Moderno theme shares: the slots and their roles come from the token contract (`@moderno-ui/css/contract`), the rules from `CONTRACT.md`, and they name slots without restating values. What sets this theme apart is in its brand notes, below.

<!-- brand-notes:start -->

### Brand

- Product/brand: Moderno — the design system stack for modern founders.
- Audience: designers and developers.
- Product surface: dashboard web app, landing pages.
- Visual style: clean, functional, implementation-oriented.

**Mission:** Create implementation-ready, token-driven UI guidance for Moderno that is optimized for consistency, accessibility, and fast delivery across the dashboard web app.

### Aesthetic

A monochrome workspace with sharp corners. A near-black ink carries both the text and the primary action on a white page. The dark scope inverts that into an off-white on a near-black canvas. There is no decorative accent hue: hierarchy comes from contrast, spacing, and weight.

- **Color.** `primary` is the ink, and it also draws the focus `ring`. Status hues and `chart-*` are the only chroma in the theme.
- **Type.** Hedvig Letters Sans carries the whole interface, with Hedvig Letters Serif for display moments. Hedvig Letters Sans ships a single 400 face, so the heavier weights are synthesized by the browser.
- **Shape.** Sharp: buttons, inputs, cards, and surfaces are square-cornered. Only `rounded.full` rounds, for pills, badges, avatars, and status dots.
- **Depth.** Each shadow step pairs a hairline ring with a soft drop, so an overlay still reads against the near-black canvas.
- **Button.** The primary button is the ink fill with `primary-foreground` text.

### Writing tone

Concise, confident, implementation-focused.

<!-- brand-notes:end -->

## Colors

Paint from contract slots, never from a raw color value. The front matter lists the light scope under the slot names and the dark scope as `dark-*`; code names the slot once and the scope follows `.dark`.

- **Surfaces** (the page, raised surfaces and floating surfaces):
  - `background`: the page surface.
  - `foreground`: text and icons on `background`.
  - `card`: a raised surface: cards and panels.
  - `card-foreground`: text and icons on `card`.
  - `popover`: a floating surface: popovers, menus and select lists.
  - `popover-foreground`: text and icons on `popover`.
- **Brand** (actions, from the primary fill to the quieter ones):
  - `primary`: the main action: primary button fills and emphasized controls.
  - `primary-foreground`: text and icons on `primary`.
  - `secondary`: a quieter action than `primary`.
  - `secondary-foreground`: text and icons on `secondary`.
  - `accent`: the hover and highlight surface of quiet controls and list items.
  - `accent-foreground`: text and icons on `accent`.
- **Support** (recessed wells, the destructive action, status, lines and focus):
  - `muted`: a recessed surface: wells and quiet backgrounds.
  - `muted-foreground`: subdued text on `background`, `card` or `muted`.
  - `destructive`: irreversible actions, and the error state.
  - `destructive-foreground`: text and icons on `destructive`.
  - `info`: the hue of an informational status.
  - `info-foreground`: text and icons on `info`.
  - `success`: the hue of a positive status.
  - `success-foreground`: text and icons on `success`.
  - `warning`: the hue of a cautionary status.
  - `warning-foreground`: text and icons on `warning`.
  - `border`: borders and separators.
  - `input`: the stroke of form controls.
  - `ring`: the focus indicator.
- **Charts** (data-viz series, in order):
  - `chart-1`: data-viz series 1.
  - `chart-2`: data-viz series 2.
  - `chart-3`: data-viz series 3.
  - `chart-4`: data-viz series 4.
  - `chart-5`: data-viz series 5.
- **Extended** (optional in a theme, with a neutral default):
  - `overlay`: the scrim behind a dialog or command palette.

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

Rules:

- `destructive` is reserved for irreversible actions, and error states reuse it so an error and a destructive action speak with one voice.
- `muted-foreground` never sits on a filled `primary` or `secondary`.
- `info`, `success` and `warning` carry the hue of a state, not of an action: a status surface tints itself with them against `card`.
- Status hues and `chart-1`, `chart-2`, `chart-3`, `chart-4`, `chart-5` carry meaning. Never use them for decoration.
- `overlay` is painted over a blur of the page. Never mix it from `foreground`.

## Typography

- `font-sans`: the interface and running text.
- `font-serif`: the display face for headings and pull quotes, when the brand has one.
- `font-mono`: code.

`font-sans` is the `fontFamily` of every style in the front matter.

The type scale is a size and a line height per step (`--text-<step>`, `--leading-<step>`), in two ramps:

- **Interface** (`ui-xs`, `ui-sm`, `ui-md`, `ui-lg`): a component's `sm`/`md`/`lg` sizes read `ui-sm`/`ui-md`/`ui-lg`, so controls grow one step at a time.
  - `ui-xs`: the smallest interface text: ticks and helper text.
  - `ui-sm`: a component's `sm` size.
  - `ui-md`: a component's `md` size, and the default text of the interface.
  - `ui-lg`: a component's `lg` size.
- **Content** (`body`, `body-lg`, `heading-sm`, `heading`, `heading-lg`): running text, lead paragraphs and titles.
  - `body`: running text.
  - `body-lg`: lead paragraphs and dialog titles.
  - `heading-sm`: small titles.
  - `heading`: section titles.
  - `heading-lg`: page titles.

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

Resting surfaces separate by fill and a `border`, not by shadow: `muted` recesses, `card` sits at page level. Shadows are for overlays only, one step per layer of float. The dark scope carries its own shadows, since a light-mode shadow disappears on a dark surface.

- `shadow-sm`: the lowest float: tooltips and small overlays.
- `shadow-md`: menus, select lists and popovers.
- `shadow-lg`: the highest float: dialogs, drawers and toasts.

Motion durations:

- `motion-instant`: hover and focus feedback.
- `motion-fast`: reveals: menus and tooltips.
- `motion-normal`: panels and sheets.

## Shapes

- `rounded.base` (`radius`): the base corner radius: buttons, inputs, cards and surfaces.
- `rounded.full` (`radius-full`): fully rounded ends: pills, badges, avatars and status dots.

Never set a corner radius by hand.

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
