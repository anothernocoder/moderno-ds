/**
 * `<GenUI>`: draws an OpenUI Lang response with `@moderno-ui/react` and the
 * host's Blocks. It adds no styles; the installed theme styles everything
 * (ADR-0011).
 */
import { useRef, type ComponentType } from "react";
import { Renderer, type ActionEvent, type Library, type OpenUIError } from "@openuidev/react-lang";
import type { ComponentsManifest, ContractManifest } from "@moderno-ui/lint-core";
import contract from "@moderno-ui/css/moderno.agent.json" with { type: "json" };
import reactManifest from "@moderno-ui/react/moderno.agent.json" with { type: "json" };
import { blockActions } from "../library/blocks.ts";
import { fromManifest } from "../library/from-manifest.ts";
import { withFormValues } from "./form-values.ts";
import { createReactLibrary, renderBlock, type AnyComponent } from "./library.tsx";

/** The Blocks the host renders, by name: `{ KpiCard, StatRow }`. */
export type GenUIBlocks = Record<string, ComponentType<never>>;

const manifest = reactManifest as unknown as ComponentsManifest;

let defaultLibrary: Library | undefined;

/** Every component of the installed `@moderno-ui/react`, plus the host's Blocks. */
function modernoLibrary(blocks: GenUIBlocks = {}): Library {
  const names = Object.keys(blocks);
  if (!names.length && defaultLibrary) return defaultLibrary;
  const library = createReactLibrary(
    fromManifest(manifest, contract as unknown as ContractManifest, names),
    Object.fromEntries(
      (manifest.blocks ?? [])
        .filter((block) => names.includes(block.name))
        .map((block) => [
          block.name,
          renderBlock(blocks[block.name] as AnyComponent, blockActions(block)),
        ]),
    ),
  );
  if (!names.length) defaultLibrary = library;
  return library;
}

const sameBlocks = (a: GenUIBlocks, b: GenUIBlocks) =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.entries(a).every(([name, block]) => b[name] === block);

/** Rebuilt only when the Blocks change, so an inline `blocks={{ StatRow }}` keeps the widget's state. */
function useLibrary(blocks: GenUIBlocks = {}): Library {
  const cache = useRef<{ blocks: GenUIBlocks; library: Library }>(null);
  if (!cache.current || !sameBlocks(cache.current.blocks, blocks)) {
    cache.current = { blocks, library: modernoLibrary(blocks) };
  }
  return cache.current.library;
}

export interface GenUIProps {
  /** The OpenUI Lang response so far; `null` renders nothing. */
  response: string | null;
  /** True while the response is still arriving. */
  isStreaming?: boolean;
  /**
   * The registry Blocks the host installed and renders, by name:
   * `{ KpiCard, StatRow, OrderSummary }`. Pass the same names to
   * `generateUI({ blocks })`. A program that names a Block missing here
   * renders nothing for it and reports it through `onError`.
   */
  blocks?: GenUIBlocks;
  /**
   * A component fired an action, e.g. a Button with `@ToAssistant("…")`. The
   * host handles it. A Button with no action sends its label with the values
   * of the widget's controls: `Jugar — Número: 4827; Lotería: Lotería de Bogotá`.
   * A Block's button does the same.
   */
  onAction?: (event: ActionEvent) => void;
  /**
   * The finished program has errors: a parse error, an unknown component
   * (a Block the host did not pass), or a component that failed to render
   * (`runtime/render-error`). Called with `[]` once they are gone. The host
   * retries or falls back to text, as `generateUI` does.
   */
  onError?: (errors: OpenUIError[]) => void;
}

export function GenUI({ response, isStreaming = false, blocks, onAction, onError }: GenUIProps) {
  return (
    <Renderer
      response={response}
      library={useLibrary(blocks)}
      isStreaming={isStreaming}
      onAction={onAction && ((event) => onAction(withFormValues(event)))}
      onError={onError}
    />
  );
}
