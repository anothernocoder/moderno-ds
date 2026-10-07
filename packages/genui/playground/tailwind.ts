// The Tailwind utilities the playground's Blocks are written with, compiled
// over the moderno preset by the docs' own compiler (apps/docs/scripts/tailwind.ts).
// main.tsx imports them as `virtual:blocks.css`.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { buildDocsTailwind } from "../../../apps/docs/scripts/tailwind.ts";

const ID = "virtual:blocks.css";

/** The registry files blocks.ts imports: the registered Blocks' sources. */
function blockSources(): string[] {
  const blocksFile = new URL("./blocks.ts", import.meta.url);
  return [...readFileSync(blocksFile, "utf8").matchAll(/from "(\.[^"]*\/registry\/[^"]+)"/g)].map(
    ([, path]) => fileURLToPath(new URL(path!, blocksFile)),
  );
}

/** Serves the utilities, with the preflight blocks are written against scoped to each `.widget`. */
export function blocksTailwind(): Plugin {
  return {
    name: "genui-blocks-tailwind",
    resolveId: (id) => (id === ID ? `\0${ID}` : undefined),
    load: (id) => (id === `\0${ID}` ? buildDocsTailwind(blockSources(), ".widget") : undefined),
  };
}
