<!--
  The app-shell block in one state per Preview: the page's main preview mounts
  `default`, and each example under it mounts one other state.

  This is the registry source itself (registry/blocks/app-shell/svelte), not a
  copy, so the demo cannot drift from the file the docs print underneath it.

  The block ships sample links to `/overview`, `/transactions`… A click on one
  here would leave the docs, so the demo passes the same links as fragments.
  The page's content is the consumer's: the demo passes three stat cards as the
  block's children, the way an app puts its page inside the shell. `empty`
  passes none, so the block shows its own empty message.

  `widths` frames the same file four times, one in each band of the block's
  steps (ADR-0005): 18rem is below `--container-sm` (the Menu button, the
  user's initials), 30rem sits between `--container-sm` and `--container-md`
  (the user's name, more room around the content), 40rem between
  `--container-md` and `--container-lg` (the sidebar in place of the Menu
  button) and 50rem crosses `--container-lg` (a wider sidebar, more room
  again). The docs column never reaches the 48rem `@lg` step, so the wide frame
  holds a 50rem stage and scrolls sideways inside itself; the page never does.

  The error copy holds its message the way a consumer does, as a string, and
  "Try again" clears it to "": the block treats the empty string as no error
  and shows the page again.

  `data-demo-state` names each copy's state on its wrapper, so the e2e spec can
  find each copy by what it is meant to show.
-->
<script lang="ts">
  import { Card } from "@moderno-ui/svelte";
  import AppShell from "../../../../registry/blocks/app-shell/svelte/AppShell.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  // `state` is read as `shown`: the name `state` would turn `$state` into a store read.
  let { locale = "en", state: shown = "default" }: { locale?: "en" | "es"; state?: State } =
    $props();

  const copy = {
    en: { error: "We could not load this page." },
    es: { error: "No pudimos cargar esta página." },
  }[locale];

  const navigation = [
    { id: "overview", label: "Overview", href: "#app-shell-overview", current: true },
    { id: "transactions", label: "Transactions", href: "#app-shell-transactions" },
    { id: "invoices", label: "Invoices", href: "#app-shell-invoices" },
    { id: "customers", label: "Customers", href: "#app-shell-customers" },
    { id: "settings", label: "Settings", href: "#app-shell-settings" },
  ];

  const withDisabled = [
    ...navigation.slice(0, 4),
    { id: "reports", label: "Reports", href: "#app-shell-reports", disabled: true },
    navigation[4]!,
  ];

  const stats = [
    { label: "Revenue", value: "€48,210" },
    { label: "Customers", value: "1,284" },
    { label: "Open invoices", value: "23" },
  ];

  let error = $state(copy.error);
</script>

{#snippet page()}
  <div class="grid gap-4 @lg:grid-cols-3">
    {#each stats as stat (stat.label)}
      <Card.Root size="sm">
        <Card.Content class="grid gap-1">
          <p class="text-ui-md text-muted-foreground">{stat.label}</p>
          <p class="font-serif text-heading tabular-nums">{stat.value}</p>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
{/snippet}

<div class="demo-state" data-demo-state={shown}>
  {#if shown === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <AppShell {navigation} children={page} />
      </div>
      <div data-demo-state="compact" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <AppShell {navigation} children={page} />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 40rem" data-label="40rem">
        <AppShell {navigation} children={page} />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide">
            <AppShell {navigation} children={page} />
          </div>
        </div>
      </div>
    </div>
  {:else if shown === "empty"}
    <AppShell {navigation} />
  {:else if shown === "loading"}
    <AppShell {navigation} loading />
  {:else if shown === "error"}
    <AppShell {navigation} {error} onretry={() => (error = "")} children={page} />
  {:else if shown === "disabled"}
    <AppShell navigation={withDisabled} children={page} />
  {:else}
    <AppShell {navigation} children={page} />
  {/if}
</div>

<style>
  /* `minmax(0, 1fr)`, not the implicit `auto`: an auto track grows to its
     items' min-content, and the 50rem stage would widen the track past the
     frame instead of scrolling inside it. */
  .demo-widths {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 2.5rem;
  }
  .demo-scroll {
    overflow-x: auto;
  }
  /* The width is the demo's, not the design system's: the block sizes only
     from contract slots. */
  .demo-wide {
    width: 50rem;
  }
</style>
