<script lang="ts">
  import { announce } from "@moderno-ui/core";
  import { Button, Portal, Slider, Toggle, Tooltip } from "@moderno-ui/svelte";

  interface TimelineKeyframe {
    id: string;
    /** Seconds from the start. */
    time: number;
  }

  interface TimelineTrack {
    id: string;
    label: string;
    keyframes: TimelineKeyframe[];
  }

  interface KeyframeSelection {
    trackId: string;
    keyframeId: string;
  }

  interface KeyframeChange extends KeyframeSelection {
    time: number;
  }

  interface KeyframeAdd {
    trackId: string;
    /** Seconds from the start, snapped to the frame. */
    time: number;
  }

  /**
   * Where the focus goes once the app has written back `tracks`: a keyframe, by
   * id or by time, or else the track's label.
   */
  interface FocusTarget {
    trackId: string;
    keyframeId?: string;
    time?: number;
  }

  interface RulerMark {
    /** Seconds from the start. */
    time: number;
    label: string;
  }

  interface ToolbarButton {
    label: string;
    /** The Tooltip: the label, and the shortcut if there is one. */
    hint: string;
    icon: string[];
    disabled: boolean;
    onPress: () => void;
  }

  interface Props {
    tracks?: TimelineTrack[];
    /** Length of the animation, in seconds. */
    duration?: number;
    /** The playhead, in seconds. */
    time?: number;
    /** Frames per second: every time the block reports is snapped to 1 / fps. */
    fps?: number;
    playing?: boolean;
    loop?: boolean;
    selectedKeyframe?: KeyframeSelection | null;
    /** How far the time axis is zoomed: `1` fits the whole `duration` in the visible width. */
    zoom?: number;
    ontimechange?: (time: number) => void;
    onplayingchange?: (playing: boolean) => void;
    onloopchange?: (loop: boolean) => void;
    onkeyframeselect?: (selection: KeyframeSelection | null) => void;
    onkeyframechange?: (change: KeyframeChange) => void;
    onkeyframeadd?: (keyframe: KeyframeAdd) => void;
    onkeyframedelete?: (keyframe: KeyframeSelection) => void;
    onzoomchange?: (zoom: number) => void;
  }

  const sampleTracks: TimelineTrack[] = [
    {
      id: "opacity",
      label: "Opacity",
      keyframes: [
        { id: "opacity-in", time: 0 },
        { id: "opacity-full", time: 1 },
        { id: "opacity-out", time: 4 },
      ],
    },
    {
      id: "position",
      label: "Position",
      keyframes: [
        { id: "position-start", time: 0.5 },
        { id: "position-end", time: 2.5 },
      ],
    },
    {
      id: "scale",
      label: "Scale",
      keyframes: [
        { id: "scale-small", time: 1.5 },
        { id: "scale-large", time: 3 },
        { id: "scale-rest", time: 4.5 },
      ],
    },
  ];

  /** Ruler spacings in seconds, used while three seconds or more fill the view. */
  const secondSpacings = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1200];

  /**
   * Ruler spacings in frames, used once fewer than three seconds fill the view.
   * Only those that fit an even number of times in a second count, so the marks
   * a narrow ruler hides (every other one) are never the whole seconds.
   */
  const frameSpacings = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15];

  /** The deepest zoom: 3200%. */
  const zoomLimit = 32;

  /** Toolbar icons, as the paths of a 24×24 stroked SVG. */
  const icons = {
    addKeyframe: [
      "M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z",
      "M12 8v8",
      "M8 12h8",
    ],
    deleteKeyframe: [
      "M3 6h18",
      "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
      "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
    ],
    zoomOut: ["M3 11a8 8 0 1 0 16 0a8 8 0 1 0-16 0", "m21 21-4.35-4.35", "M8 11h6"],
    zoomIn: ["M3 11a8 8 0 1 0 16 0a8 8 0 1 0-16 0", "m21 21-4.35-4.35", "M11 8v6", "M8 11h6"],
    fit: ["M2 12h20", "m6 8-4 4 4 4", "m18 8 4 4-4 4"],
  };

  function snapToFrame(time: number, fps: number) {
    return Math.round(time * fps) / fps;
  }

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  function twoDigits(value: number) {
    return String(value).padStart(2, "0");
  }

  /** `m:ss:ff` — minutes, seconds and the frame within the second. */
  function formatTimecode(time: number, fps: number) {
    const frames = Math.round(time * fps);
    const seconds = Math.floor(frames / fps);
    return `${Math.floor(seconds / 60)}:${twoDigits(seconds % 60)}:${twoDigits(frames % fps)}`;
  }

  /** A whole second: `3s`, or `1:30` from a minute. */
  function formatMark(seconds: number) {
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}:${twoDigits(seconds % 60)}`;
  }

  /**
   * Every ruler mark: the first spacing that fits ten marks in the view at this
   * zoom. A mark between whole seconds is labelled by its frame, `12f`.
   */
  function rulerMarks(duration: number, fps: number, zoom: number): RulerMark[] {
    const visible = duration / zoom;
    const fitsTen = (seconds: number) => visible / seconds <= 10;
    const frameStep =
      visible < 3
        ? frameSpacings.find((frames) => fps % (frames * 2) === 0 && fitsTen(frames / fps))
        : undefined;
    if (frameStep !== undefined) {
      return Array.from({ length: Math.floor((duration * fps) / frameStep) + 1 }, (_, index) => {
        const frame = index * frameStep;
        const label = frame % fps > 0 ? `${frame % fps}f` : formatMark(frame / fps);
        return { time: frame / fps, label };
      });
    }
    const step = secondSpacings.find(fitsTen) ?? secondSpacings[secondSpacings.length - 1]!;
    return Array.from({ length: Math.floor(duration / step) + 1 }, (_, index) => ({
      time: index * step,
      label: formatMark(index * step),
    }));
  }

  /** Zoom doubles at each step, until about ten frames fill the view (or 3200%). */
  function deepestZoom(duration: number, fps: number) {
    let zoom = 1;
    while (zoom < zoomLimit && (duration * fps) / (zoom * 2) >= 10) zoom *= 2;
    return zoom;
  }

  /** The keyframe nearest in time to the one at `index`, other than itself; the later one on a tie. */
  function nearestNeighbour(keyframes: TimelineKeyframe[], index: number) {
    const before = keyframes[index - 1];
    const after = keyframes[index + 1];
    if (!before || !after) return before ?? after;
    const time = keyframes[index]!.time;
    return after.time - time <= time - before.time ? after : before;
  }

  function byTime(keyframes: TimelineKeyframe[]) {
    return [...keyframes].sort((a, b) => a.time - b.time);
  }

  let {
    tracks = sampleTracks,
    duration = 5,
    time = 0,
    fps = 30,
    playing = false,
    loop = false,
    selectedKeyframe = null,
    zoom = 1,
    ontimechange,
    onplayingchange,
    onloopchange,
    onkeyframeselect,
    onkeyframechange,
    onkeyframeadd,
    onkeyframedelete,
    onzoomchange,
  }: Props = $props();

  const frame = $derived(1 / fps);
  const playhead = $derived(clamp(time, 0, duration));
  const playheadFrame = $derived(snapToFrame(playhead, fps));
  const maxZoom = $derived(deepestZoom(duration, fps));
  const zoomLevel = $derived(clamp(zoom, 1, maxZoom));
  const marks = $derived(rulerMarks(duration, fps, zoomLevel));
  const sortedTracks = $derived(tracks.map((track) => ({ ...track, keyframes: byTime(track.keyframes) })));

  // The track a label press picked, or the last delete left; the selected keyframe's track wins.
  let pickedTrackId = $state<string | null>(null);
  const selectedTrackId = $derived(selectedKeyframe?.trackId ?? pickedTrackId);
  const selectedTrack = $derived(sortedTracks.find((track) => track.id === selectedTrackId));
  const selectedIndex = $derived(
    selectedTrack?.keyframes.findIndex((keyframe) => keyframe.id === selectedKeyframe?.keyframeId) ??
      -1,
  );
  const canAdd = $derived(
    selectedTrack !== undefined &&
      !selectedTrack.keyframes.some((keyframe) => snapToFrame(keyframe.time, fps) === playheadFrame),
  );

  let section: HTMLElement | undefined;
  let scroller: HTMLDivElement | undefined;
  let corner: HTMLSpanElement | undefined;
  let line: HTMLSpanElement | undefined;
  let pendingFocus: FocusTarget | null = null;
  let announcedZoom: number | undefined;

  function seek(next: number) {
    const snapped = snapToFrame(clamp(next, 0, duration), fps);
    if (snapped !== playheadFrame) ontimechange?.(snapped);
  }

  function isSelected(trackId: string, keyframeId: string) {
    return selectedKeyframe?.trackId === trackId && selectedKeyframe.keyframeId === keyframeId;
  }

  function select(trackId: string, keyframe: TimelineKeyframe | undefined) {
    if (keyframe && !isSelected(trackId, keyframe.id)) {
      onkeyframeselect?.({ trackId, keyframeId: keyframe.id });
    }
  }

  // A label press selects its track (pressed again, no track) and no keyframe.
  function pickTrack(trackId: string | null) {
    pickedTrackId = trackId;
    if (selectedKeyframe) onkeyframeselect?.(null);
  }

  function moveKeyframe(trackId: string, keyframe: TimelineKeyframe | undefined, next: number) {
    const snapped = snapToFrame(next, fps);
    if (keyframe && snapped !== snapToFrame(keyframe.time, fps)) {
      onkeyframechange?.({ trackId, keyframeId: keyframe.id, time: snapped });
    }
  }

  function addKeyframe() {
    if (!selectedTrack || !canAdd) return;
    pendingFocus = { trackId: selectedTrack.id, time: playheadFrame };
    onkeyframeadd?.({ trackId: selectedTrack.id, time: playheadFrame });
  }

  // The focus and the selection move to the nearest keyframe left on the track, or to its label.
  function deleteSelectedKeyframe() {
    const deleted = selectedTrack?.keyframes[selectedIndex];
    if (!selectedTrack || !deleted) return;
    const nearest = nearestNeighbour(selectedTrack.keyframes, selectedIndex);
    const trackId = selectedTrack.id;
    pickedTrackId = trackId;
    pendingFocus = { trackId, keyframeId: nearest?.id };
    onkeyframedelete?.({ trackId, keyframeId: deleted.id });
    onkeyframeselect?.(nearest ? { trackId, keyframeId: nearest.id } : null);
  }

  function changeZoom(next: number) {
    if (next !== zoomLevel) onzoomchange?.(next);
  }

  // Runs once the app has written back `tracks` after an add or a delete.
  function focusPendingTarget() {
    const target = pendingFocus;
    if (!target || !section) return;
    pendingFocus = null;
    const track = sortedTracks.find((candidate) => candidate.id === target.trackId);
    if (!track) return;
    if (target.keyframeId === undefined && target.time === undefined) {
      const labels = section.querySelectorAll<HTMLElement>("[data-track-label]");
      [...labels].find((label) => label.dataset.trackLabel === track.id)?.focus();
      return;
    }
    const index = track.keyframes.findIndex((keyframe) =>
      target.keyframeId !== undefined
        ? keyframe.id === target.keyframeId
        : snapToFrame(keyframe.time, fps) === target.time,
    );
    const roots = section.querySelectorAll<HTMLElement>("[data-track-id]");
    const root = [...roots].find((candidate) => candidate.dataset.trackId === track.id);
    root?.querySelectorAll<HTMLElement>('[role="slider"]')[index]?.focus();
  }

  // Scrolls the time area so the playhead line is in view, centring it when it was not.
  function revealPlayhead() {
    if (!scroller || !corner || !line) return;
    const start = corner.getBoundingClientRect().right;
    const end = scroller.getBoundingClientRect().left + scroller.clientWidth;
    const x = line.getBoundingClientRect().left;
    if (x < start || x > end) scroller.scrollLeft += x - (start + end) / 2;
  }

  $effect(() => {
    void tracks;
    focusPendingTarget();
  });

  $effect(() => {
    void zoomLevel;
    void playhead;
    revealPlayhead();
  });

  $effect(() => {
    if (announcedZoom !== undefined && announcedZoom !== zoomLevel) {
      announce(`Zoom ${Math.round(zoomLevel * 100)}%`);
    }
    announcedZoom = zoomLevel;
  });

  const editButtons: ToolbarButton[] = $derived([
    {
      label: "Add keyframe",
      hint: "Add keyframe",
      icon: icons.addKeyframe,
      disabled: !canAdd,
      onPress: addKeyframe,
    },
    {
      label: "Delete keyframe",
      hint: "Delete keyframe (Delete)",
      icon: icons.deleteKeyframe,
      disabled: selectedIndex < 0,
      onPress: deleteSelectedKeyframe,
    },
  ]);
  const zoomButtons: ToolbarButton[] = $derived([
    {
      label: "Zoom out",
      hint: "Zoom out",
      icon: icons.zoomOut,
      disabled: zoomLevel <= 1,
      onPress: () => changeZoom(Math.max(zoomLevel / 2, 1)),
    },
    {
      label: "Zoom in",
      hint: "Zoom in",
      icon: icons.zoomIn,
      disabled: zoomLevel >= maxZoom,
      onPress: () => changeZoom(Math.min(zoomLevel * 2, maxZoom)),
    },
    {
      label: "Fit",
      hint: "Fit",
      icon: icons.fit,
      disabled: zoomLevel === 1,
      onPress: () => changeZoom(1),
    },
  ]);

  // Page Up/Down move a thumb one second (Slider's own page step is ten frames).
  function moveBySecond(event: KeyboardEvent) {
    if (event.key !== "PageUp" && event.key !== "PageDown") return;
    const thumb = event.target as HTMLElement;
    if (thumb.getAttribute("role") !== "slider") return;
    event.preventDefault();
    event.stopPropagation();
    const seconds = event.key === "PageUp" ? 1 : -1;
    const trackId = thumb.closest<HTMLElement>("[data-track-id]")?.dataset.trackId;
    const track = sortedTracks.find((candidate) => candidate.id === trackId);
    if (!track) {
      seek(playhead + seconds);
      return;
    }
    const { keyframes } = track;
    const index = Number(thumb.dataset.index);
    const keyframe = keyframes[index];
    if (!keyframe) return;
    const earliest = index > 0 ? keyframes[index - 1]!.time + frame : 0;
    const latest = index < keyframes.length - 1 ? keyframes[index + 1]!.time - frame : duration;
    moveKeyframe(track.id, keyframe, clamp(keyframe.time + seconds, earliest, latest));
  }

  // Delete (or Backspace, which Mac keyboards label "delete") removes the selected keyframe.
  // Space plays and pauses, unless a keyframe or a button has the focus.
  function handleShortcut(event: KeyboardEvent) {
    if (event.key === "Delete" || event.key === "Backspace") {
      if (selectedIndex < 0) return;
      event.preventDefault();
      deleteSelectedKeyframe();
      return;
    }
    if (event.key !== " " || event.repeat) return;
    if ((event.target as HTMLElement).closest("[data-track-id], button")) return;
    event.preventDefault();
    onplayingchange?.(!playing);
  }

  // A press on a track's empty stretch would pull the nearest keyframe to it; only keyframes move.
  function keepTrackPressOnKeyframes(event: PointerEvent) {
    const target = event.target as HTMLElement;
    if (target.closest("[data-track-id]") && !target.closest('[role="slider"]')) {
      event.stopPropagation();
    }
  }
</script>

{#snippet toolbar(buttons: ToolbarButton[])}
  <div class="flex items-center gap-1">
    {#each buttons as button (button.label)}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet asChild(triggerProps)}
            <!-- aria-disabled, not disabled: a button that disables itself keeps the focus. -->
            <Button
              variant="ghost"
              size="sm"
              {...triggerProps({
                onclick: () => {
                  if (!button.disabled) button.onPress();
                },
              })}
              class="px-2"
              aria-label={button.label}
              aria-disabled={button.disabled || undefined}
              data-disabled={button.disabled ? "" : undefined}
            >
              <svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                {#each button.icon as path (path)}
                  <path d={path} />
                {/each}
              </svg>
            </Button>
          {/snippet}
        </Tooltip.Trigger>
        <Portal>
          <Tooltip.Positioner>
            <Tooltip.Content>{button.hint}</Tooltip.Content>
          </Tooltip.Positioner>
        </Portal>
      </Tooltip.Root>
    {/each}
  </div>
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
  bind:this={section}
  aria-label="Timeline"
  tabindex="-1"
  class="@container moderno-block-timeline grid gap-2 bg-background text-foreground outline-none"
  onkeydowncapture={moveBySecond}
  onkeydown={handleShortcut}
  onpointerdowncapture={keepTrackPressOnKeyframes}
>
  <div class="flex flex-wrap items-center gap-1 px-2">
    <Tooltip.Root>
      <Toggle.Root
        size="sm"
        aria-label="Play"
        pressed={playing}
        onPressedChange={(pressed) => onplayingchange?.(pressed)}
      >
        {#snippet asChild(toggleProps)}
          <Tooltip.Trigger {...toggleProps()}>
            <svg class="size-4" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
              {#if playing}
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              {:else}
                <path d="M7 4v16l13-8z" />
              {/if}
            </svg>
          </Tooltip.Trigger>
        {/snippet}
      </Toggle.Root>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>{playing ? "Pause (Space)" : "Play (Space)"}</Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
    <Tooltip.Root>
      <Toggle.Root
        size="sm"
        aria-label="Loop"
        pressed={loop}
        onPressedChange={(pressed) => onloopchange?.(pressed)}
      >
        {#snippet asChild(toggleProps)}
          <Tooltip.Trigger {...toggleProps()}>
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m17 2 4 4-4 4" />
              <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
              <path d="m7 22-4-4 4-4" />
              <path d="M21 13v1a4 4 0 0 1-4 4H3" />
            </svg>
          </Tooltip.Trigger>
        {/snippet}
      </Toggle.Root>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>Loop</Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
    <span aria-hidden="true" class="mx-1 h-4 w-px bg-border"></span>
    {@render toolbar(editButtons)}
    <!-- The readout and the zoom buttons stay together at the end, and wrap together. -->
    <div class="ms-auto flex items-center gap-1">
      <p class="m-0 me-1 text-ui-sm text-muted-foreground tabular-nums">
        <span class="text-foreground">{formatTimecode(playhead, fps)}</span> /
        {formatTimecode(duration, fps)}
      </p>
      {@render toolbar(zoomButtons)}
    </div>
  </div>

  <!-- The time area is `zoom` times the width left beside the gutter (label column, gap, end padding). -->
  <div
    bind:this={scroller}
    class="max-h-64 overflow-auto border-t border-border [--timeline-gutter:--spacing(28)] @sm:[--timeline-gutter:--spacing(40)]"
  >
    <div
      class="relative"
      style:width="calc({zoomLevel} * 100% - {zoomLevel - 1} * var(--timeline-gutter))"
    >
      <div class="sticky top-0 z-20 flex gap-2 border-b border-border bg-background py-2 pe-4">
        <span
          bind:this={corner}
          class="sticky start-0 z-10 -my-2 w-22 shrink-0 self-stretch bg-background @sm:w-34"
        ></span>
        <Slider.Root
          class="min-w-0 flex-1"
          size="sm"
          min={0}
          max={duration}
          step={frame}
          thumbAlignment="center"
          value={[playhead]}
          getAriaValueText={(details) => `${details.value.toFixed(2)} seconds`}
          onValueChange={(details) => seek(details.value[0]!)}
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0} aria-label="Playhead">
              <Slider.HiddenInput />
            </Slider.Thumb>
          </Slider.Control>
          <Slider.MarkerGroup>
            {#each marks as mark, index (mark.time)}
              <Slider.Marker value={mark.time} class={index % 2 === 1 ? "hidden @md:block" : undefined}>
                {mark.label}
              </Slider.Marker>
            {/each}
          </Slider.MarkerGroup>
        </Slider.Root>
      </div>

      <ul class="m-0 grid list-none p-0">
        {#each sortedTracks as track (track.id)}
          <li class="flex h-10 items-center gap-2 border-b border-border pe-4">
            <div
              class="sticky start-0 z-10 flex h-full w-22 shrink-0 items-center bg-background px-1 @sm:w-34"
            >
              <Toggle.Root
                size="sm"
                data-track-label={track.id}
                class="w-full justify-start font-normal"
                pressed={selectedTrackId === track.id}
                onPressedChange={(pressed) => pickTrack(pressed ? track.id : null)}
              >
                <span class="truncate">{track.label}</span>
              </Toggle.Root>
            </div>
            <Slider.Root
              data-track-id={track.id}
              class="min-w-0 flex-1"
              size="sm"
              min={0}
              max={duration}
              step={frame}
              minStepsBetweenThumbs={1}
              thumbAlignment="center"
              value={track.keyframes.map((keyframe) => keyframe.time)}
              getAriaValueText={(details) => `${details.value.toFixed(2)} seconds`}
              onFocusChange={(details) => select(track.id, track.keyframes[details.focusedIndex])}
              onValueChange={(details) =>
                details.value.forEach((value, index) =>
                  moveKeyframe(track.id, track.keyframes[index], value),
                )}
            >
              <Slider.Control>
                <Slider.Track />
                {#each track.keyframes as keyframe, index (keyframe.id)}
                  {@const selected = isSelected(track.id, keyframe.id)}
                  <Slider.Thumb
                    {index}
                    data-selected={selected ? "" : undefined}
                    aria-label={`${track.label} keyframe at ${keyframe.time.toFixed(2)} s${selected ? ", selected" : ""}`}
                    class="flex size-4 items-center justify-center border-0 bg-transparent shadow-none"
                  >
                    <span
                      class={selected
                        ? "size-3.5 rotate-45 rounded-sm border-2 border-primary bg-primary outline-2 outline-offset-2 outline-foreground"
                        : "size-2.5 rotate-45 rounded-sm border-2 border-primary bg-background"}
                    ></span>
                    <Slider.HiddenInput />
                  </Slider.Thumb>
                {/each}
              </Slider.Control>
            </Slider.Root>
          </li>
        {/each}
      </ul>

      <div aria-hidden="true" class="pointer-events-none absolute inset-0 flex gap-2 pe-4">
        <span class="w-22 shrink-0 @sm:w-34"></span>
        <span class="relative flex-1">
          <span
            bind:this={line}
            class="absolute inset-y-0 w-px -translate-x-1/2 bg-primary"
            style:left="{duration > 0 ? (playhead / duration) * 100 : 0}%"
          ></span>
        </span>
      </div>
    </div>
  </div>
</section>
