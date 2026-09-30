<!--
  The Mobile / Tablet / Desktop switch above a block's Preview stage.

  Blocks lay themselves out from their own width (container queries, ADR-0005),
  not the viewport, so resizing a box is enough to show each layout; no iframe.
  Preview.astro wraps the demo in a `.breakpoint-frame` and renders this switch
  beside the stage, not around it, so the demo stays its own island. The switch
  sizes that frame: Mobile (375px) and Tablet (768px) give the block a fixed
  width; Desktop, the default, leaves it the stage's full width, exactly like a
  Preview without the switch.

  A fixed width wider than the stage is zoomed out to fit. `zoom` shrinks how
  big the block looks but not the width its container queries read, and unlike
  `scale` it takes its shrunk size in the layout and leaves `position: fixed`
  children (toasts) pinned to the viewport.
-->
<script lang="ts">
  import DeviceIcon from "./DeviceIcon.svelte";

  type Breakpoint = "mobile" | "tablet" | "desktop";

  let {
    labels,
  }: {
    /** The switch's accessible name and one label per breakpoint. */
    labels: Record<Breakpoint | "group", string>;
  } = $props();

  /** The width each breakpoint gives the block, in px; Desktop takes the stage's. */
  const WIDTH: Record<Breakpoint, number | undefined> = {
    mobile: 375,
    tablet: 768,
    desktop: undefined,
  };
  const BREAKPOINTS = Object.keys(WIDTH) as Breakpoint[];
  const ICON = { mobile: "phone", tablet: "tablet", desktop: "desktop" } as const;

  let breakpoint = $state<Breakpoint>("desktop");
  let toolbar: HTMLDivElement;
  let buttons: HTMLButtonElement[] = $state([]);

  function onKeydown(event: KeyboardEvent, index: number) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + BREAKPOINTS.length) % BREAKPOINTS.length;
    breakpoint = BREAKPOINTS[next]!;
    buttons[next]?.focus();
  }

  $effect(() => {
    const stage = toolbar.closest(".preview")!.querySelector<HTMLElement>(".preview-panel--demo")!;
    const frame = stage.querySelector<HTMLElement>(".breakpoint-frame")!;
    const width = WIDTH[breakpoint];
    stage.dataset.breakpoint = breakpoint;
    const observer = new ResizeObserver(([entry]) => {
      frame.style.width = width ? `${width}px` : "";
      frame.style.zoom = width ? String(Math.min(1, entry!.contentRect.width / width)) : "";
    });
    observer.observe(stage);
    return () => observer.disconnect();
  });
</script>

<!-- Same look as the screen/flow device tabs (docs.css `.demo-tabs-list`). -->
<div class="demo-tabs-list" role="radiogroup" aria-label={labels.group} bind:this={toolbar}>
  {#each BREAKPOINTS as value, i (value)}
    <button
      bind:this={buttons[i]}
      type="button"
      role="radio"
      class="demo-tab"
      aria-checked={value === breakpoint}
      aria-label={labels[value]}
      title={labels[value]}
      tabindex={value === breakpoint ? 0 : -1}
      onclick={() => (breakpoint = value)}
      onkeydown={(e) => onKeydown(e, i)}
    >
      <DeviceIcon device={ICON[value]} />
    </button>
  {/each}
</div>
