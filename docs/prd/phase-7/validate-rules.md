# Moderno validate rules — starter set

The deterministic AST rule engine authored once and exposed twice: as the
`validate_usage` MCP tool and as `@moderno/lint` (ESLint plugin + CLI). Same
rules, same verdicts, for agents, humans, and CI. No LLM-judge — every rule is a
static check so it can gate a build. Rules consult the aggregated
`moderno.agent.json` (component APIs + parts + variants) and the `contract`
manifest from `@moderno/tokens` (slots + golden rules).

## Rule shape

```ts
interface Rule {
  id: string;                       // moderno/<name>
  severity: "error" | "warn";
  frameworks: Framework[] | "all";  // some checks are markup-specific
  /** Pure: given a parsed source + the manifests, return findings. */
  check(ctx: RuleContext): Finding[];
  fixable?: boolean;                // ESLint autofix / MCP suggested patch
}

interface Finding {
  ruleId: string;
  severity: "error" | "warn";
  loc: { line: number; col: number };
  message: string;                  // what + why, one line
  suggestion?: string;              // the correct Moderno move
}
```

`validate_usage` returns `Finding[]` (empty = green). `@moderno/lint` maps the
same findings to ESLint messages. A shared `@moderno/lint-core` holds the rules;
the two faces are thin adapters.

## The rules

### 1. `moderno/no-hardcoded-color` — error, fixable

Flags color literals (`#rgb`/`#rrggbb`, `rgb()`, `hsl()`, `oklch()`) in `style`
props, inline CSS, `class`/`className` arbitrary values (`bg-[#…]`), and `.css`
authored for a Moderno scope. Must reference a contract color slot instead.

- Consults: `contract.slots.color`.
- Suggestion: nearest slot, e.g. `#000 → var(--foreground)` / Tailwind `bg-primary`.
- Why: the theming model breaks the moment a raw color bypasses a slot — the
  golden rule.

### 2. `moderno/no-hardcoded-dimension` — error, fixable

Flags hardcoded `border-radius` (px/rem) and animation/transition durations (ms)
where a contract slot exists; also raw spacing where `--spacing-*` applies.

- Consults: `contract.slots.radius`, `contract.slots.motion`, `contract.slots.spacing`.
- Suggestion: `border-radius: 6px → var(--radius)`, `200ms → var(--motion-fast)`.

### 3. `moderno/valid-props` — error

For any Moderno component usage, every prop/attribute must exist in that
component's manifest `props`, and enum-valued props (`variant`, `size`, …) must
be one of the manifest `variants` values.

- Consults: component `props` + `variants`.
- Catches: `<Button variant="primaryy">`, `<Button loud>`, misspelled props —
  the hallucinated-API failure mode, deterministically.
- Suggestion: closest valid value / prop by edit distance.

### 4. `moderno/no-raw-ark` — error, fixable

Flags direct imports from `@ark-ui/*` (or `@zag-js/*`) when a `@moderno/*`
primitive wraps the same component.

- Suggestion: the `import` string from the component manifest.
- Why: raw Ark skips the shared stylesheet + recipe → off-contract, un-themed UI.

### 5. `moderno/no-reimplemented-primitive` — warn

Heuristic: a hand-rolled control that a Moderno primitive already provides —
signals like a native `<dialog>` / `role="dialog"` + focus-trap code (→ Dialog),
a `<select>` or a listbox built from scratch (→ Select), a bare `<button>` with
manual variant classes (→ Button).

- Consults: component `scope` + `guidance.intent` for the match.
- `warn` not `error`: intentional one-offs exist; nudge, don't block.
- Suggestion: the primitive + its `import`.

### 6. `moderno/valid-data-part-override` — error

CSS (or arbitrary selectors) targeting `[data-scope="x"][data-part="y"]` must use
a real `(scope, part)` pair from the manifest.

- Consults: component `scope` + `parts`.
- Catches: `[data-part="header"]` on dialog (no such part; it's `title`).
- Suggestion: list the valid parts for that scope.

### 7. `moderno/no-component-css-in-consumer` — warn

Consumer authoring per-component class rules or editing an installed primitive's
markup (the golden rule: theme via variables, vary via props, don't edit).
Lower-confidence, so `warn`; points at the props/variable path or `eject` as the
explicit escape hatch.

## v1 rule coverage

Errors 1–4 and 6 are the high-signal core (token discipline + API validity +
part validity) — ship as `error`. Rules 5 and 7 ship as `warn` (heuristic).
Autofix on 1, 2, 4 where the mapping is unambiguous.

## Build order (de-risk the "everything at once" scope)

Freeze the `Finding`/`Rule` contract and rules 1, 3, 4 against the vertical slice
(Button/Field/Dialog/Select) first — they exercise every consulted manifest
field (slots, props, variants, parts, import). Once green there, the remaining
rules and full-primitive fan-out are mechanical.
