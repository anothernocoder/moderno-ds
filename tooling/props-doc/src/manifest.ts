/**
 * The documented-component manifest: which components get a PropsTable and
 * where each props interface lives, resolved from the canonical
 * `@moderno-ui/react` types (props are identical across bindings by contract —
 * they share the `@moderno-ui/core` recipes).
 *
 * `test/manifest.test.ts` resolves every entry against the real react
 * tsconfig, so a renamed export or moved file fails in tests, not at docs
 * build time. A new Primitive is documented by the `props` field of its own
 * file, `src/components/<slug>.ts`; `ENTRIES` is generated from those files.
 */
export { ENTRIES } from "./components.generated.ts";
