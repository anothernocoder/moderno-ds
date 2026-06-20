---
version: alpha
name: Moderno Design System
description: Implementation-ready, token-driven UI guidance for Moderno — the ui design stack for modern founders — optimized for consistency, accessibility, and fast delivery products.
colors:
  primary: "#fafafa"
  on-primary: "#18181b"
  text-primary: "#fafafa"
  text-secondary: "#616161"
  text-tertiary: "#121212"
  text-inverse: "#18181b"
  surface-base: "#0d0d0d"
  surface-muted: "#000000"
  border-default: "#1c1c1c"
typography:
  display:
    fontFamily: Hedvig Letters Sans
    fontSize: 96px
    fontWeight: 400
    lineHeight: 104px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hedvig Letters Sans
    fontSize: 24px
    fontWeight: 400
    lineHeight: 32px
  headline-md:
    fontFamily: Hedvig Letters Sans
    fontSize: 20px
    fontWeight: 400
    lineHeight: 28px
  body-lg:
    fontFamily: Hedvig Letters Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
  body-md:
    fontFamily: Hedvig Letters Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  body-sm:
    fontFamily: Hedvig Letters Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  label-md:
    fontFamily: Hedvig Letters Sans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  label-sm:
    fontFamily: Hedvig Letters Sans
    fontSize: 10px
    fontWeight: 400
    lineHeight: 14px
rounded:
  none: 0px
  full: 9999px
spacing:
  "1": 4px
  "2": 6px
  "3": 8px
  "4": 12px
  "5": 14px
  "6": 16px
  "7": 20px
  "8": 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 12px
    height: 40px
  button-primary-hover:
    backgroundColor: "#e5e5e5"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 12px
    height: 40px
  button-secondary-hover:
    backgroundColor: "{colors.border-default}"
  card:
    backgroundColor: "{colors.surface-base}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 24px
  input-field:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 12px
    height: 40px
  text-muted:
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-sm}"
  badge-inverse:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.text-tertiary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 4px
  tooltip:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.text-inverse}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: 8px
---

## Overview

- Product/brand: Moderno — The design system stack for modern founders
- Audience: designers and developers
- Product surface: dashboard web app, landing pages
- Visual style: clean, functional, implementation-oriented

This file is the **source of truth for Moderno's default theme** (`theme-moderno`): its token values and the rationale for applying them. The neutral, brand-agnostic technical contract every component obeys — semantic slots, theming rules, `data-scope`/`data-part`, guardrails — lives in [`CONTRACT.md`](CONTRACT.md). This document supplies the _values_; `CONTRACT.md` defines the _names and rules_.

**Mission:** Create implementation-ready, token-driven UI guidance for Moderno that is optimized for consistency, accessibility, and fast delivery across the dashboard web app.

The aesthetic is a near-black, monochrome workspace: dense data surfaces, sharp corners, and a single high-contrast off-white that serves both as primary text and as the primary action color. There is no decorative accent hue — hierarchy is built entirely from contrast, spacing, and weight.

## Colors

The palette is monochrome and dark-first. Token mapping from the extracted source:

| Source token           | DESIGN.md token                    | Value     |
| ---------------------- | ---------------------------------- | --------- |
| `color.text.primary`   | `text-primary` (also `primary`)    | `#fafafa` |
| `color.text.secondary` | `text-secondary`                   | `#616161` |
| `color.text.tertiary`  | `text-tertiary`                    | `#121212` |
| `color.text.inverse`   | `text-inverse` (also `on-primary`) | `#18181b` |
| `color.surface.base`   | `surface-base`                     | `#0d0d0d` |
| `color.surface.muted`  | `surface-muted`                    | `#000000` |
| `color.border.default` | `border-default`                   | `#1c1c1c` |

- `primary` (#fafafa) is the brand/action color: primary button fills, emphasized text, and inverse surfaces (tooltips, badges).
- `text-tertiary` (#121212) and `text-inverse` (#18181b) are dark values intended **only on light/inverse surfaces** (e.g. on a `#fafafa` button or tooltip). Never place them on `surface-base` or `surface-muted`.
- `text-secondary` (#616161) fails WCAG AA (≈3.1:1) against `surface-base`; restrict it to large text (≥24px / 19px bold) or non-essential decorative metadata, and prefer it on light surfaces (≈5.9:1 on #fafafa).
- Use semantic tokens, not raw hex values, in component guidance.

## Typography

Single-family system: **Hedvig Letters Sans**, with stack `Hedvig Letters Sans, system-ui, arial`. Base: 16px / 24px line-height / weight 400.

Scale mapping from the extracted source (line-heights other than `body-md` are derived defaults):

| Source token    | DESIGN.md token  | Size |
| --------------- | ---------------- | ---- |
| `font.size.4xl` | `display`        | 96px |
| `font.size.3xl` | `headline-lg`    | 24px |
| `font.size.2xl` | `headline-md`    | 20px |
| `font.size.xl`  | `body-lg`        | 18px |
| `font.size.lg`  | `body-md` (base) | 16px |
| `font.size.md`  | `body-sm`        | 14px |
| `font.size.sm`  | `label-md`       | 12px |
| `font.size.xs`  | `label-sm`       | 10px |

Note the deliberate gap between 24px and 96px: `display` is reserved for hero/marketing moments; everything inside the dashboard lives at 24px and below.

## Layout

Spacing scale (4–24px, dense dashboard rhythm): `1=4px, 2=6px, 3=8px, 4=12px, 5=14px, 6=16px, 7=20px, 8=24px`.

- Do not introduce one-off spacing or typography exceptions.
- Component spacing references the scale by step, never raw pixel values.

## Elevation & Depth

Depth on the near-black canvas comes from **surface steps and 1px borders, not shadows**: `surface-muted` (#000000) sits lowest (inputs, wells), `surface-base` (#0d0d0d) is the page/card level, and `border-default` (#1c1c1c) draws the edges between them.

Motion tokens: `motion.duration.instant=150ms`, `motion.duration.fast=200ms`, `motion.duration.normal=300ms`. Use `instant` for hover/focus feedback, `fast` for reveals (menus, tooltips), `normal` for panels and sheets.

## Shapes

The shape language is sharp: `rounded.none` (0px) for buttons, inputs, cards, and surfaces. The single exception is `rounded.full` (9999px) for pills, badges, and status dots.

> Note: the extracted source labeled this token `radius.xs=9999px`; the value is a full/pill radius and is exposed here as `rounded.full`.

## Components

- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Interactive components must document keyboard, pointer, and touch behavior.
- Include long-content, overflow, and empty-state handling.
- Component behavior should specify responsive and edge-case handling.
- Known page component density: links (236), buttons (20), cards (4), inputs (2), tables (2), navigation (1).

Key patterns:

- **button-primary** — inverse fill: `primary` background with `on-primary` text, square corners, 40px height. Hover dims the fill slightly (#e5e5e5); focus-visible draws a 2px `primary` outline offset 2px from the edge.
- **button-secondary** — transparent fill with `text-primary` label and a 1px `border-default` outline; hover fills with `border-default`.
- **card** — `surface-base` fill with a 1px `border-default` outline; no shadow, no radius.
- **input-field** — sits on `surface-muted` with a 1px `border-default` stroke; focus-visible switches the stroke to `primary`.
- **badge-inverse / tooltip** — light surfaces (`text-primary` fill) carrying dark text (`text-tertiary` / `text-inverse`); the only places dark text tokens appear.

## Do's and Don'ts

- **Do** use semantic tokens, not raw hex values, in component guidance.
- **Do** define states for default, hover, focus-visible, active, disabled, loading, and error on every component.
- **Do** document keyboard, pointer, and touch behavior for interactive components.
- **Do** make accessibility acceptance criteria testable in implementation.
- **Don't** allow low-contrast text or hidden focus indicators.
- **Don't** introduce one-off spacing or typography exceptions.
- **Don't** use ambiguous labels or non-descriptive actions.
- **Don't** ship component guidance without explicit state rules.
- **Don't** place `text-tertiary`, `text-inverse`, or `on-primary` on dark surfaces.

## Accessibility

- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone

Concise, confident, implementation-focused.

## Guideline Authoring Workflow

1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure

- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Quality Gates

- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
