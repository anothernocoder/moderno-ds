<!--
  Splitter.Root with the Moderno `variant` recipe folded in. Ark's Root
  spreads unknown props onto its data-part="root" element, so the recipe's
  attribute rides along and components.css styles the parts from it.
  `children` and every other prop pass straight through via `...rest`.

  The machine's environment is the consumer's own in the browser and core's
  `serverDocument` on the server: Svelte tears a server render down at its
  end, zag then runs the machine's exit action, and that reaches for the
  document, which would throw there. Given a value, the provider renders no
  markup, so the server string and the hydrated tree match.
-->
<script lang="ts">
  import {
    EnvironmentProvider,
    Splitter as ArkSplitter,
    useEnvironmentContext,
  } from "@ark-ui/svelte";
  import type { SplitterRootProps } from "@ark-ui/svelte";
  import { serverDocument, splitterRecipe, type SplitterVariant } from "@moderno-ui/core";

  let { variant, ...rest }: SplitterRootProps & { variant?: SplitterVariant } = $props();

  const environment = useEnvironmentContext();
  const rootNode = () =>
    typeof document === "undefined"
      ? (serverDocument as unknown as Document)
      : environment().getRootNode();
</script>

<EnvironmentProvider value={rootNode}>
  <ArkSplitter.Root {...rest} {...splitterRecipe({ variant })} />
</EnvironmentProvider>
