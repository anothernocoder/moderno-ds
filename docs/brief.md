# Prompt: Construir un Design System agnóstico de framework

> Copia este documento completo como prompt para una AI de código (Claude Code, etc.).
> Está escrito como instrucciones directas a esa AI.

---

## Rol y objetivo

Eres un ingeniero senior de design systems. Vas a construir, desde cero, un **design system agnóstico de framework** distribuido como monorepo. El sistema debe verse **idéntico** y comportarse **idéntico** en Astro, React 19, Vue, Svelte y SolidJS, ser mantenible por **una sola persona**, y consumirse con una DX estilo **shadcn**.

No improvises arquitectura: las decisiones técnicas ya están tomadas (abajo) y tienen justificación. Si algo no está especificado, pregunta antes de inventar. Procede **por fases** y confirma el contrato de tokens antes de escribir componentes.

---

## Requisitos duros (no negociables)

1. **Mismo look y mismo comportamiento** en todos los frameworks.
2. **SSR** en todos.
3. **Rápido**: bundles pequeños, tree-shakeable, cero runtime CSS innecesario.
4. **Charts custom** (no librería de charts batteries-included).
5. **Un solo maintainer**: minimizar duplicación; la lógica y el estilo se escriben una vez.
6. **DX tipo shadcn**: fácil de instalar y usar.
7. **CLI** para instalar y **actualizar**.
8. **Primitivas y blocks**.
9. Instalable con **bun, pnpm y npm**.
10. **Sitio de documentación / component library** en **Astro**, minimalista, con: preview + code, botón copy, copy-as-markdown, tablas de props, ejemplos, instalación por package manager.
11. **Theming por proyecto/marca** sin editar componentes.

---

## Stack obligatorio

- **Comportamiento:** **Ark UI** (headless, construido sobre Zag.js). La máquina de estado se define una vez y corre igual en los 4 frameworks. Esta es la garantía de "mismo comportamiento". Paquetes: `@ark-ui/react`, `@ark-ui/vue`, `@ark-ui/svelte`, `@ark-ui/solid`.
- **Estilo:** **Tailwind v4** (config CSS-first con `@theme inline`) + **design tokens como CSS variables** (formato DTCG, colores en **OKLCH**). El estilo se aplica vía utilities que resuelven a variables semánticas.
- **Hook de estilo cross-framework:** usar los atributos `data-scope` / `data-part` que expone Ark para escribir **un solo stylesheet** que aplica idéntico en todos los frameworks. Esta es la garantía de "se ve igual".
- **Charts (custom):** **solo la capa matemática de D3** → `d3-scale`, `d3-shape`, `d3-array`, `d3-path` (funciones puras, sin DOM, SSR-safe). El `<svg>` se renderiza con el templating nativo de cada framework. Los elementos SVG leen las mismas CSS variables del theme. **Prohibido** `d3-selection`/`d3-transition`.
- **Distribución:** registry estilo **shadcn** + su CLI. Items versionados.
- **Docs:** **Astro plano + MDX + Content Collections**. Previews vivas como **islas Svelte o Solid** (runtime liviano). **Prohibido Starlight.**

---

## Modelo de distribución (decisión tomada)

**Híbrido:**

- **Primitivas → paquetes npm versionados.** Una por framework: `@moderno/react`, `@moderno/vue`, `@moderno/svelte`, `@moderno/solid`. Fuente única de verdad, updates por `npm/pnpm/bun update`. Semver + changelog.
- **Blocks (composiciones) → registry/copy.** Items que el consumidor copia con el CLI y modifica libremente.
- **Themes → archivos CSS, distribuidos como items del registry** (ej: `theme-moderno`, `theme-contrast`).
- **CSS entrypoint único → `@moderno/css`.** Re-exporta tokens + stylesheet de componentes. El consumidor no importa rutas internas (`dist/`, subpaths de core).
- **Escape hatch:** exponer también las primitivas en el registry como "eject" para cuando un proyecto necesite poseer el markup de un componente puntual.

---

## Modelo de theming (decisión tomada)

**El brand vive 100% en las CSS variables, nunca dentro de los componentes.**

- **Dos niveles de token:** primitivos (paleta cruda, ramps OKLCH) y **semánticos** (el contrato del theme: `--primary`, `--background`, `--radius`, etc.). **Los componentes solo referencian semánticos.**
- **Tailwind v4:** las variables swappable viven en `:root` / `.dark` / `[data-brand="..."]`; `@theme inline` mapea las utilities a esas variables (`--color-primary: var(--primary)`) para que el override en runtime funcione.
- **Re-tematizar = redefinir variables**, jamás editar componentes:
  - Theme por proyecto → editar/sustituir el `tokens.css`.
  - Varias marcas en una app → scope por `[data-brand="..."]`.
  - Dark mode → scope por `.dark`. Compone con brand.
  - Override puntual de un componente → CSS por `[data-brand] [data-scope][data-part]`.
- **Regla de oro escrita en DESIGN.md:** *los componentes no se editan; se tematizan por variables y se varían por props.* Esto es lo que permite que el `update` del CLI sobreescriba primitivas sin conflicto.

**Contrato mínimo de tokens semánticos** (defínelos todos en OKLCH, con variante dark):
`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`, `--radius`, `--font-sans`, `--font-mono`, y `--chart-1`…`--chart-5`.

---

## Estructura del monorepo (objetivo)

```
moderno-ds/
├── packages/
│   ├── tokens/            # @moderno/tokens — tokens DTCG → CSS vars + preset Tailwind v4
│   ├── core/              # @moderno/core — CVA, utils, styles/components.css
│   ├── css/               # @moderno/css — entrypoint único (re-export tokens + components)
│   ├── charts-core/       # @moderno/charts-core — d3-math puro
│   ├── react/             # @moderno/react — primitivas React 19 (Ark) + charts SVG
│   ├── vue/               # @moderno/vue
│   ├── svelte/            # @moderno/svelte — runtime de islas en docs/Astro
│   └── solid/             # @moderno/solid
├── registry/
│   ├── blocks/            # composiciones (copy items), una variante por framework
│   ├── themes/            # theme-*.css (registry items)
│   └── registry.json      # items versionados + registryDependencies
├── apps/
│   └── docs/              # Astro plano + MDX (component library)
├── tooling/
│   └── cli/               # @moderno/cli — init / add / update / diff + manifest
├── CONTEXT.md             # glosario del dominio
├── DESIGN.md              # contrato técnico: tokens + reglas + data-part (no guía de marca)
├── pnpm-workspace.yaml
└── package.json
```

---

## Alcance de componentes

**Primitivas (paquete, vía Ark)** — empieza con: Button, Input, Field/Label, Textarea, Checkbox, Radio Group, Switch, Select, Combobox, Menu, Dialog, Drawer, Popover, Tooltip, Tabs, Accordion, Slider, Toast, Avatar, Badge, Card, Separator, Progress, Tags Input, Date Picker, Pagination, Toggle, Toggle Group.

**Primitivas puras (solo clase CSS, sin componente)** — Typography, surfaces, utility layout. Usables en cualquier framework y en `.astro` sin duplicar.

**Charts (custom, d3-math + SVG)** — empieza con: line, area, bar, scatter. Cada uno: capa matemática en `@moderno/charts-core` (pura) + render SVG por framework. Tematizados por `--chart-*`.

**Blocks (registry/copy)** — ejemplos: auth (login/signup), pricing, dashboard shell, data table, checkout, settings, empty states.

---

## Sitio de documentación (Astro)

Astro plano + MDX + Content Collections. Construye estos componentes propios:

- `<Preview>` — isla (Svelte o Solid) que renderiza el componente real, interactivo.
- `<Code>` — bloque de código con botón **copy**.
- Tabs **Preview / Code**.
- `<PropsTable>` — autogenerada desde los tipos del componente.
- **Copy-as-markdown** por página + un `llms.txt` y un `.md` por componente (para consumo por LLMs).
- **Copy component** — botón que entrega el comando de instalación (`bunx`/`pnpm dlx`/`npx`) y/o el source.
- Bloque de instalación con tabs **bun / pnpm / npm**.
- Estética minimalista (referencia: shadcn). Sin chrome de framework de docs.

---

## CLI

Basado en el **registry + CLI de shadcn** (no construyas un CLI desde cero salvo el wrapper). Paquete: `@moderno/cli`.

- `init` — scaffolda CSS y config en el proyecto consumidor. Crea `src/styles/moderno.css`:
  ```css
  @import "@moderno/css";
  @import "./theme-moderno.css"; /* tras add theme */
  ```
  El usuario importa un solo archivo en su layout: `import "@/styles/moderno.css"`.
- `add` — instala blocks/themes (y permite eject de primitivas).
- `update` / `diff` — actualiza items copiados; requiere **items versionados en el registry** + un **manifest** (`.moderno/manifest.json`) que registre versiones instaladas.
- Compatible con **bun, pnpm y npm** como runners.

## DX del consumidor (CSS)

El consumidor **nunca** importa rutas internas (`@moderno/tokens/dist/...`, `@moderno/core/styles/...`).

| Capa | Import | Quién lo gestiona |
|---|---|---|
| Base DS (tokens + component styles) | `@moderno/css` | npm package |
| Marca | `./theme-moderno.css` | CLI `add theme-moderno` (copy) |
| App | `@/styles/moderno.css` | CLI `init` (scaffold) |

`@moderno/css` es un paquete delgado cuyo `index.css` re-exporta `@moderno/tokens/css` + `@moderno/core/css` vía `package.json` exports.

---

## Guardrails (errores a NO cometer)

- **NO** uses Starlight ni un framework de docs genérico. Astro plano + MDX.
- **NO** uses una librería de charts (Unovis, Recharts, etc.) para los charts custom. Solo d3-math + SVG propio. (Unovis solo si más adelante se pide un chart genérico no-custom.)
- **NO** uses `d3-selection`/`d3-transition`.
- **NO** uses Zag.js directo salvo opt-out puntual por bundle en un componente específico; usa Ark.
- **NO** uses Panda CSS salvo que se pida explícitamente slot recipes tipados; usa Tailwind v4.
- **NO** hornees colores, radios ni fuentes dentro de los componentes. Solo referencias a tokens semánticos.
- **NO** hagas que personalizar requiera editar el archivo del componente. Personalización = props + CSS variables + CSS por `data-part`.
- **NO** dupliques primitivas en `.astro`: en Astro reusa el componente Svelte/Solid renderizado server-only (sin directiva `client:`) → HTML estático, cero JS.
- En Astro, usa **un solo** framework de isla para todo el DS (Svelte o Solid) para no cargar dos runtimes.

---

## Plan por fases (procede en orden, confirma al final de cada una)

- **Fase 0 — Fundación:** monorepo (pnpm workspaces), `@moderno/tokens` + `@moderno/css` (entrypoint), tokens DTCG en OKLCH → CSS vars + preset Tailwind v4, y **DESIGN.md** con el contrato de tokens y las reglas. *Confirma el contrato de tokens conmigo antes de seguir.*
- **Fase 1 — Core:** `@moderno/core` (utils, CVA, helpers, components.css) y `@moderno/charts-core` (d3-math puro).
- **Fase 2 — Implementación de referencia (React 19):** Button, Field, Dialog y Select end-to-end, con el stylesheet único basado en `data-part`. Valida SSR y theming por variables.
- **Fase 3 — Port:** Vue, Svelte, Solid de esos mismos componentes, reusando el stylesheet. Demuestra paridad de look y comportamiento.
- **Fase 4 — Charts:** line/area/bar/scatter (math en core + SVG por framework), tematizados por `--chart-*`, con SSR.
- **Fase 5 — Distribución:** registry.json versionado, `@moderno/cli` (init/add/update/diff + manifest), blocks de ejemplo y 2 themes (`theme-moderno` + `theme-contrast`) para probar el switch por `[data-brand]`.
- **Fase 6 — Docs:** sitio Astro con Preview/Code, copy, copy-as-markdown, PropsTable e instalación bun/pnpm/npm.

---

## Criterios de aceptación

- Un mismo componente se ve y se comporta idéntico en los 5 targets.
- Cambiar de marca = cambiar variables CSS, sin tocar componentes.
- `update` del CLI sobreescribe una primitiva no-editada sin conflicto.
- Todo SSR-ea sin errores de hidratación.
- Charts custom controlados al 100% (SVG propio) y tematizados por tokens.
- Instalación funciona con bun, pnpm y npm.
- Docs minimalista con preview/code, copy y copy-as-markdown operativos.

---

**Empieza por la Fase 0 y muéstrame el DESIGN.md con el contrato de tokens antes de escribir componentes.**