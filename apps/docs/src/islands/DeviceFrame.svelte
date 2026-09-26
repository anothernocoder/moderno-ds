<!--
  A screen or a flow shown inside a device: a phone, a tablet or a laptop.

  The device is a mockup image (public/device/*.webp) with a transparent hole
  where its screen is. The window sits in that hole and the image is drawn over
  it, so the bezel, the camera and the island hide whatever scrolls under them.

  The window keeps a fixed width — 22rem, 42rem or 62rem, one in each band of
  the screens' container steps (ADR-0005) — because that is the container the
  screen reads. The whole device is then scaled down with
  `scale` to fit the stage's width and a readable height. `scale` is a
  transform, so it changes how big the device looks and never the width the
  screen lays itself out against.

  A screen owns the viewport, so its root is `min-h-dvh`. Inside this frame "the
  viewport" is the window; each demo tells its own screen to fill it.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  type Device = "phone" | "tablet" | "desktop";

  let {
    device,
    children,
  }: {
    device: Device;
    /** What the device's screen shows. */
    children: Snippet;
  } = $props();

  /** The container width each device gives the screen. */
  const SCREEN_WIDTH: Record<Device, string> = {
    phone: "22rem",
    tablet: "42rem",
    desktop: "62rem",
  };

  /** The tallest a device is drawn, in rem; a taller one is scaled down to it. */
  const MAX_HEIGHT_REM = 50;

  let stageWidth = $state(0);
  let deviceWidth = $state(0);
  let deviceHeight = $state(0);

  function remInPx(): number {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  /** 1 until measured (the server render), then the largest scale that fits. */
  const scale = $derived(
    stageWidth && deviceWidth && deviceHeight
      ? Math.min(1, stageWidth / deviceWidth, (MAX_HEIGHT_REM * remInPx()) / deviceHeight)
      : 1,
  );
</script>

<div class="device-stage" bind:clientWidth={stageWidth}>
  <div
    class="device-fit"
    style:width={deviceWidth ? `${deviceWidth * scale}px` : undefined}
    style:height={deviceHeight ? `${deviceHeight * scale}px` : undefined}
  >
    <div
      class="device"
      data-device={device}
      style:--viewport-width={SCREEN_WIDTH[device]}
      style:scale
      bind:offsetWidth={deviceWidth}
      bind:offsetHeight={deviceHeight}
    >
      <div class="screen-window">
        {@render children()}
      </div>
      {#if device === "phone"}
        <span class="device-home" aria-hidden="true"></span>
      {/if}
    </div>
  </div>
</div>

<style>
  .device-stage {
    display: grid;
    justify-items: center;
  }
  .device-fit {
    overflow: hidden;
  }

  /* Each mockup, measured in its own image pixels: the image's size, and the
     position, size and corner radius of the transparent hole its screen fills.
     `--status-bar` is the strip the phone's island covers. */
  .device[data-device="phone"] {
    --device-image: url("/device/iphone.webp");
    --device-w: 389;
    --device-h: 800;
    --hole-x: 17;
    --hole-y: 14;
    --hole-w: 355;
    --hole-h: 772;
    --hole-r: 56;
    --status-bar: 44;
  }
  .device[data-device="tablet"] {
    --device-image: url("/device/tablet.webp");
    --device-w: 578;
    --device-h: 800;
    --hole-x: 31;
    --hole-y: 32;
    --hole-w: 515;
    --hole-h: 738;
    --hole-r: 8;
    --status-bar: 0;
  }
  .device[data-device="desktop"] {
    --device-image: url("/device/laptop.webp");
    --device-w: 800;
    --device-h: 488;
    --hole-x: 79;
    --hole-y: 22;
    --hole-w: 642;
    --hole-h: 402;
    --hole-r: 8;
    --status-bar: 0;
  }

  /* One image pixel, at the size the window's width sets. */
  .device {
    --px: calc(var(--viewport-width) / var(--hole-w));
    position: relative;
    width: calc(var(--device-w) * var(--px));
    aspect-ratio: var(--device-w) / var(--device-h);
    transform-origin: top left;
  }
  /* The mockup, over the window: the bezel hides what scrolls under it. */
  .device::after {
    content: "";
    position: absolute;
    z-index: 2;
    inset: 0;
    background: var(--device-image) center / 100% 100% no-repeat;
    pointer-events: none;
  }
  /* The phone's status bar: the top of the hole, under the island, painted in
     the screen's own background. The window starts below it, so nothing ever
     scrolls behind the island. */
  .device[data-device="phone"]::before {
    content: "";
    position: absolute;
    z-index: 1;
    top: calc(var(--hole-y) * var(--px));
    left: calc(var(--hole-x) * var(--px));
    width: var(--viewport-width);
    height: calc(var(--status-bar) * var(--px));
    border-radius: calc(var(--hole-r) * var(--px)) calc(var(--hole-r) * var(--px)) 0 0;
    background: var(--background);
    pointer-events: none;
  }

  .screen-window {
    position: absolute;
    top: calc((var(--hole-y) + var(--status-bar)) * var(--px));
    left: calc(var(--hole-x) * var(--px));
    width: var(--viewport-width);
    height: calc((var(--hole-h) - var(--status-bar)) * var(--px));
    overflow: auto;
    border-radius: calc(var(--hole-r) * var(--px));
    background: var(--background);
    scrollbar-width: none;
  }
  .screen-window::-webkit-scrollbar {
    display: none;
  }
  /* Under the status bar only the phone's bottom corners are the hole's. */
  .device[data-device="phone"] .screen-window {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }
  /* A laptop shows a scrollbar, but a quiet one: thin, and only on hover. */
  .device[data-device="desktop"] .screen-window {
    --scrollbar-thumb: transparent;
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar-thumb) transparent;
  }
  .device[data-device="desktop"] .screen-window:is(:hover, :focus-within) {
    --scrollbar-thumb: color-mix(in oklch, var(--foreground) 20%, transparent);
  }

  .device-home {
    position: absolute;
    z-index: 1;
    bottom: calc((var(--device-h) - var(--hole-y) - var(--hole-h) + 8) * var(--px));
    left: 50%;
    translate: -50% 0;
    width: calc(134 * var(--px));
    height: calc(5 * var(--px));
    border-radius: 999px;
    background: color-mix(in oklch, var(--foreground) 85%, transparent);
    pointer-events: none;
  }
</style>
