# genui playground

An agentic chat built on `@moderno-ui/genui`. You type, the dev server answers with `generateUI`, and the reply shows up as text or as a widget. A button in a widget sends its message back into the thread as your next turn.

```sh
pnpm --filter @moderno-ui/genui dev
```

Then try "ventas del mes", "confirma mi pedido", "quiero jugar un chance" or "hola". The toolbar switches between theme-moderno and theme-contrast, light and dark (`?brand=contrast&mode=dark` on load).

## Fixture mode

With no keys set, the demo runs offline: a canned System One server picks the Surface and a canned LLM streams a fixed answer.

- "ventas del mes" shows the `StatRow` Block and a card with a bar chart.
- "confirma mi pedido" shows the `OrderSummary` Block with cancel and confirm buttons. They post back to the thread.
- "quiero jugar un chance" shows the `FormLayout` Block with a field, a select and a number input. Its submit sends their values.
- Anything else gets a text reply.

## Blocks

`blocks.ts` imports the Blocks from `registry/blocks/*/react` and passes them to `<GenUI blocks>`; the chat route offers the same names to `generateUI({ blocks })`. Their Tailwind utilities are compiled over the moderno preset by the docs' compiler (`tailwind.ts`). To add one, import it in `blocks.ts`.

## QA script

```sh
pnpm --filter @moderno-ui/genui e2e                  # fixture mode
GENUI_REAL=1 pnpm --filter @moderno-ui/genui e2e     # real mode, keys from .env.local
```

Each QA message runs in all four themes, at desktop and 375px: it types, picks, submits, and checks layout, control heights and the console. `QA_SHOTS=<dir>` saves a screenshot of each chat.

Set `GENUI_FIXTURES=1` to force fixture mode when keys are set.

## Real mode

Real mode is turned on by env vars only. Put them in `.env.local` at the repo root; the dev server reads it at start. The terminal prints which router and LLM it uses.

```sh
# Stop OpenUI from sending telemetry.
OPENUI_TELEMETRY_DISABLED=1

# The router: Jev on TypeSafe…
JEV_API_KEY=...

# …or Nimble on a local Ollama, with no key. When set, this wins over JEV_API_KEY.
SYSTEMONE_BASE_URL=http://localhost:11434
SYSTEMONE_MODEL=nimble

# The LLM: OpenRouter. The model is optional.
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=anthropic/claude-sonnet-5.5
```

Each piece falls back to its fixture on its own: a router key with no `OPENROUTER_API_KEY` uses the real router and the canned LLM.

### Nimble on Ollama

Nimble needs Ollama 0.35 or later, which serves `POST /v1/systemone`.

```sh
ollama pull nimble
ollama serve
```

Then set `SYSTEMONE_BASE_URL` and `SYSTEMONE_MODEL` as above and restart the dev server.
