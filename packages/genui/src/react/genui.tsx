/**
 * `<GenUI>`: draws an OpenUI Lang response with `@moderno-ui/react`. It adds
 * no styles; the installed theme styles everything (ADR-0011).
 */
import { Renderer, type ActionEvent, type Library, type OpenUIError } from "@openuidev/react-lang";
import type { ComponentsManifest, ContractManifest } from "@moderno-ui/lint-core";
import contract from "@moderno-ui/css/moderno.agent.json" with { type: "json" };
import reactManifest from "@moderno-ui/react/moderno.agent.json" with { type: "json" };
import { fromManifest } from "../library/from-manifest.ts";
import { createReactLibrary } from "./library.tsx";

let library: Library | undefined;

/** Every component of the installed `@moderno-ui/react`, built on first render. */
function modernoLibrary(): Library {
  return (library ??= createReactLibrary(
    fromManifest(
      reactManifest as unknown as ComponentsManifest,
      contract as unknown as ContractManifest,
    ),
  ));
}

export interface GenUIProps {
  /** The OpenUI Lang response so far; `null` renders nothing. */
  response: string | null;
  /** True while the response is still arriving. */
  isStreaming?: boolean;
  /** A component fired an action, e.g. a Button with `@ToAssistant("…")`. The host handles it. */
  onAction?: (event: ActionEvent) => void;
  /**
   * The finished program has errors: a parse error, or a component that failed
   * to render (`runtime/render-error`). Called with `[]` once they are gone.
   * The host retries or falls back to text, as `generateUI` does.
   */
  onError?: (errors: OpenUIError[]) => void;
}

export function GenUI({ response, isStreaming = false, onAction, onError }: GenUIProps) {
  return (
    <Renderer
      response={response}
      library={modernoLibrary()}
      isStreaming={isStreaming}
      onAction={onAction}
      onError={onError}
    />
  );
}
