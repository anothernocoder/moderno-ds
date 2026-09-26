---
"@moderno-ui/core": minor
"@moderno-ui/react": minor
"@moderno-ui/vue": minor
"@moderno-ui/svelte": minor
"@moderno-ui/solid": minor
---

Add two CSS-only loading primitives in all four framework packages:

- **Skeleton** — a muted placeholder in a `text`, `rect` or `circle` shape. It
  is `aria-hidden`, sized by the consumer like the content it replaces, and its
  pulse stops under `prefers-reduced-motion`.
- **Spinner** — an indeterminate ring at three sizes (`sm`, `md`, `lg`). The
  root is `role="status"` with a visually hidden `label` (default "Loading").
  The ring paints with the surrounding text colour and turns slower under
  `prefers-reduced-motion`.

`@moderno-ui/core` gains `skeletonRecipe` and `spinnerRecipe`.
