/**
 * Vite's `import.meta.glob`, which vitest compiles away. The root tsconfig
 * loads only Node's types, so this declares the one form the tests use.
 */
interface ImportMeta {
  glob<Module>(pattern: string, options: { eager: true }): Record<string, Module>;
}
