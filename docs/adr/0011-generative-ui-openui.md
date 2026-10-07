---
status: accepted
---

# Generative UI is OpenUI, routed by System One, with a library derived from the agent manifest

Extends [ADR-0003](0003-agentic-mcp.md) (agents learn the components from
`moderno.agent.json`) and follows
[ADR-0009](0009-one-file-per-component-generated-shared-lists.md) (no
hand-written lists of components).

## Context

Epic #310 lets an agent answer with live UI built from moderno components: a
card with a chart, a confirm card with buttons, an alert. The UI must use the
theme the consuming project installed, with no extra code. Every ticket in the
epic writes into one new package, so the format, the routing and the source of
the component list are decided once, here.

## Decision

1. **The generative format is Thesys OpenUI** (MIT): the LLM writes **OpenUI
   Lang**, and OpenUI's `<Renderer>` draws it with `@moderno-ui/react`.
   OpenUI adds no styles, so the theme's CSS variables do all the styling.
2. **A System One model routes each message.** One call to Jev (TypeSafe,
   `jev-latest`) or Nimble (Ollama, local) over `POST /v1/systemone` decides
   the **surface** (`text` | `widget` | `screen` | `dashboard`) and which
   primitives are relevant. Both servers expose the same endpoint, so one HTTP
   client serves both, configured by `baseUrl`, `model` and an optional
   `apiKey`.
3. **The component library is derived from `moderno.agent.json`**, the
   manifest props-doc writes for each framework package. The LLM then gets a
   **sub-library**: only the components the router picked, so the prompt is
   smaller, faster and cheaper.
4. **One package, `@moderno-ui/genui`**, built with tsup like
   `@moderno-ui/mcp`. It has two entry points: `./server` (the library, the
   prompt and the router, no React) and `./react` (the renderer).
5. **A form compound is one Simple form** in the library (#331). A Select,
   a NumberInput or a Field needs ids, values and a collection that OpenUI
   Lang cannot express, so the model writes plain arguments
   (`Select(label, options, placeholder?)`, `NumberInput(label, min?, max?,
   step?, defaultValue?)`) and the adapter renders the full anatomy from the
   docs example. Its parts are not in the library. Overlays, toasts, app-shell
   layouts and in-place editors (`Dialog`, `Toast`, `Splitter`, `Editable`…)
   are left out: they do not belong inside an answer. A part the examples
   only self-close (`<Avatar.Image />`) takes no children, so a void element
   never gets any. A contract test renders a program for every component the
   library exposes and fails on a render error or a component without one.

### Rejected: Vercel json-render

It covers Solid, which OpenUI does not. It was rejected because its JSON
output costs more tokens per response than OpenUI Lang, and every token is
latency and money in a chat.

### Rejected: a System One model generating the UI

It cannot. System One models return typed judgments only (a choice, a noul, a
score), never free text or code. They are good at routing, so that is their
job here.

### Rejected: a hand-written component library

A second list of components, props and descriptions next to the real ones
drifts from them as soon as a prop changes. The manifest is already generated
from the components and checked for drift (`pnpm agent:check-drift`).

## Consequences

- **No Solid in v1.** OpenUI has React, Vue and Svelte renderers; Solid would
  need a renderer on `@openuidev/lang-core`. React ships first; the other
  frameworks are later epics.
- **Zod 4 schemas through `zod/v4`.** OpenUI rejects classic Zod 3 schemas.
  The repo stays on `zod` `^3.25`, which ships Zod 4 at `zod/v4`, so the
  lockfile keeps one copy of `zod` for the MCP server and OpenUI alike.
- **OpenUI's telemetry is off.** It sends telemetry from a postinstall script
  and at runtime. CI sets `OPENUI_TELEMETRY_DISABLED=1`, and
  `pnpm-workspace.yaml` denies `@openuidev/lang-core` its build script, so the
  postinstall never runs here. A consuming app sets the variable itself.
- **OpenUI is pinned to 0.3.x** (`~0.3.1`): it is pre-1.0, so a minor can
  break the API.
- **`@openuidev/react-headless` stays out of the package.** It peers `ai@6+`
  and `zustand`; only the demo chat uses it.
- `react` and `@moderno-ui/react` are peers of `@moderno-ui/genui`, so the
  app's copy of React and of the components is the one that renders.
- **The router makes two calls, ten questions in all** (#321). One Noul per
  primitive cost Nimble ~0.2 s each, so the first call asks the surface and
  the kind of UI (chart, form, confirm…), the library is ranked locally
  against that kind's keywords with the scoring `search_components` uses, and
  the second call asks a Noul for the top 8 only. A doubtful `text` surface
  is treated as UI, since inline mode lets the LLM answer in text anyway.
- A component that fails to render reaches `<GenUI onError>` as
  `runtime/render-error`, like a parse error, so the host retries or answers
  in text instead of showing a silent hole.
