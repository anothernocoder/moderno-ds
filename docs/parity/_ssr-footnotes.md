¹ Vue hydration is verified on every portal-free component (all but Dialog and
Select), where the deterministic `useId` hazard lives; Ark's portaled popovers
position via floating-ui measurement absent in jsdom, so their hydration is
covered by the string + interaction suites.

² Svelte/Solid use a separate SSR-compiled test project (`*.ssr.test.*`) that
asserts the static server string; Svelte additionally proves the zero-runtime
Astro-island guarantee (F3.5).
