# Moderno Design System

Monorepo de design system agnóstico de framework: primitivas versionadas por npm, blocks/themes vía registry estilo shadcn, documentación en Astro.

## Language

**Design System (DS)**:
El producto completo: tokens, primitivas, charts, blocks, themes, CLI y docs.
_Avoid_: UI kit, component library (cuando se refiere al producto entero)

**Primitiva**:
Componente headless + estilos compartidos, distribuido como paquete npm versionado (`@moderno/react`, etc.). No se copia al proyecto consumidor salvo eject explícito.
_Avoid_: Component, widget

**Block**:
Composición de primitivas (ej. login form, pricing table) que el consumidor copia con el CLI y puede modificar libremente.
_Avoid_: Template, pattern, organism

**Theme**:
Archivo CSS de variables que define la apariencia de una marca. El brand vive 100% en CSS variables, nunca dentro de los componentes.
_Avoid_: Skin, palette file

**Registry**:
Catálogo versionado de items instalables vía CLI (blocks, themes, primitivas en modo eject).
_Avoid_: Catalog, manifest (cuando se refiere al catálogo completo)

**Eject**:
Copiar el source de una primitiva al proyecto consumidor para poseer el markup. Escape hatch, no el camino default.
_Avoid_: Fork, vendor

**DESIGN.md**:
Contrato técnico del DS: tokens semánticos, reglas de theming, mapeo `data-scope`/`data-part`, y guardrails de implementación. No es guía de marca.
_Avoid_: Brand guide, style guide

**Brand guidelines**:
Documentación de identidad visual de una marca concreta (tipografía, tono, anti-patterns estéticos). Vive fuera de DESIGN.md, referenciada desde docs.
_Avoid_: DESIGN.md (para contenido de marca)

**Contrato de tokens**:
El set mínimo de variables semánticas shadcn-style (`--primary`, `--background`, …) que todo componente referencia. Definido en DESIGN.md, implementado en CSS por cada theme.
_Avoid_: Token spec, design tokens file

**Token de marca (brand primitive)**:
Variable CSS con prefijo de marca (ej. `--mod-surface-base`) que captura un valor crudo de la identidad visual. Vive en el theme, no en componentes.
_Avoid_: Raw token, primitive (sin calificar — colisiona con Primitiva)

**Alias semántico**:
Mapping en el theme de un slot del contrato a un token de marca (`--background: var(--mod-surface-base)`). Puente entre contrato shadcn y estética de marca.
_Avoid_: Semantic token (usar solo en docs técnicos; en CONTEXT preferir "alias semántico")

**@moderno/tokens**:
Paquete npm que genera el contrato de slots shadcn, defaults neutros OKLCH, preset Tailwind v4 y CSS vars. No contiene identidad de marca.
_Avoid_: Theme package, tokens.json (como nombre de producto)

**@moderno/css**:
Entrypoint CSS único que re-exporta tokens + stylesheet de componentes. API pública del consumidor; oculta rutas internas a `dist/`.
_Avoid_: globals bundle, styles entry (sin calificar)

**Init**:
Comando CLI (`@moderno/cli init`) que scaffolda `src/styles/moderno.css` en el proyecto consumidor con los imports correctos. El usuario no configura CSS manualmente.
_Avoid_: Setup, bootstrap (como término de dominio)

**Default neutro**:
Valores placeholder en `@moderno/tokens` (grises OKLCH, system font stack) que permiten desarrollar y previsualizar componentes sin instalar un theme de marca.
_Avoid_: Base theme, fallback theme

**Runtime de islas**:
El único framework de componentes usado en docs Astro y render estático `.astro`. Elegido: **Svelte**. React/Vue/Solid siguen como paquetes npm; Svelte es además el target de islas.
_Avoid_: Preview framework, docs framework

**Modo oscuro**:
Convención shadcn: `:root` = light, `.dark` = dark. Apps Moderno montan `<html class="dark">` por defecto. `theme-moderno.css` define valores de marca en ambos scopes.
_Avoid_: Dark-first inversion, data-theme attribute

**Stylesheet de componentes**:
Un solo CSS compartido basado en `[data-scope]` / `[data-part]` de Ark. Vive en `@moderno/core/styles/components.css`. Importado por todos los paquetes de framework y docs.
_Avoid_: Per-framework CSS, styled-components layer

**Theme item**:
Unidad del registry que entrega CSS de marca + assets asociados (fuentes self-hosted, etc.). Instalable vía CLI. Ejemplo: `theme-moderno` incluye `theme-moderno.css`, `.woff2` y `@font-face`.
_Avoid_: Theme package, skin bundle

**Multi-brand**:
Capacidad de scopear themes por `[data-brand="…"]` compuesto con `.dark`. Arquitectura desde Fase 0; segundo theme sintético (`theme-contrast`) en Fase 5 para demostrar el switch en docs.
_Avoid_: Multi-tenant theming, white-label mode

**Namespace npm**:
Prefijo de paquetes publicados: `@moderno/*` (`@moderno/tokens`, `@moderno/react`, `@moderno/core`, …). CLI: `@moderno/cli`.
_Avoid_: @ds/*, moderno-ds/* (como scope npm)

**Contrato extendido**:
Además de slots de color shadcn, el contrato incluye spacing (`--spacing-1…8`), motion (`--motion-instant|fast|normal`), y radius (`--radius`, `--radius-full`). Definido en DESIGN.md, defaults en `@moderno/tokens`, overrides en themes.
_Avoid_: Hardcoded spacing, magic numbers in CSS

**Theme Moderno v1**:
Incluye ramps OKLCH completos para light (`:root`) y dark (`.dark`), con aliases semánticos en ambos scopes. Toggle light/dark funcional desde v1.
_Avoid_: Dark-only theme, WIP light mode

**Escala tipográfica**:
Tamaños y line-heights como CSS vars en `@moderno/tokens`; expuestos como utilities Tailwind v4 vía `@theme inline` (`text-display`, `text-body-md`, …). Sin clases CSS custom paralelas.
_Avoid_: Typography component, custom .text-* classes in core

**Variante de componente**:
Estilo visual alternativo (outline, sm, destructive…) expresado como `data-variant`, `data-size`, etc. en el `[data-part=root]`. CVA en `@moderno/core` resuelve props → data attributes; CSS en `components.css`.
_Avoid_: Variant class, CVA Tailwind string

**Maintainer**:
Una sola persona responsable del DS. Restricción de diseño que prioriza DRY y automatización sobre flexibilidad ad-hoc.
_Avoid_: Team, contributor
