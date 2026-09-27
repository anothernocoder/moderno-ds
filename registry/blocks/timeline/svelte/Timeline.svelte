<script lang="ts">
  import { Portal, Slider, Toggle, Tooltip } from "@moderno-ui/svelte";

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
    ontimechange?: (time: number) => void;
    onplayingchange?: (playing: boolean) => void;
    onloopchange?: (loop: boolean) => void;
    onkeyframeselect?: (selection: KeyframeSelection | null) => void;
    onkeyframechange?: (change: KeyframeChange) => void;
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

  /** Ruler spacings, in seconds; the first one that fits ten marks wins. */
  const markSpacings = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600];

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

  function formatMark(seconds: number) {
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}:${twoDigits(seconds % 60)}`;
  }

  function rulerMarks(duration: number) {
    const spacing = markSpacings.find((step) => duration / step <= 10) ?? 1200;
    return Array.from({ length: Math.floor(duration / spacing) + 1 }, (_, index) => index * spacing);
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
    ontimechange,
    onplayingchange,
    onloopchange,
    onkeyframeselect,
    onkeyframechange,
  }: Props = $props();

  const frame = $derived(1 / fps);
  const playhead = $derived(clamp(time, 0, duration));
  const marks = $derived(rulerMarks(duration));
  const sortedTracks = $derived(tracks.map((track) => ({ ...track, keyframes: byTime(track.keyframes) })));

  function seek(next: number) {
    const snapped = snapToFrame(clamp(next, 0, duration), fps);
    if (snapped !== snapToFrame(playhead, fps)) ontimechange?.(snapped);
  }

  function isSelected(trackId: string, keyframeId: string) {
    return selectedKeyframe?.trackId === trackId && selectedKeyframe.keyframeId === keyframeId;
  }

  function select(trackId: string, keyframe: TimelineKeyframe | undefined) {
    if (keyframe && !isSelected(trackId, keyframe.id)) {
      onkeyframeselect?.({ trackId, keyframeId: keyframe.id });
    }
  }

  function moveKeyframe(trackId: string, keyframe: TimelineKeyframe | undefined, next: number) {
    const snapped = snapToFrame(next, fps);
    if (keyframe && snapped !== snapToFrame(keyframe.time, fps)) {
      onkeyframechange?.({ trackId, keyframeId: keyframe.id, time: snapped });
    }
  }

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

  // Space plays and pauses, unless a keyframe or a button has the focus.
  function togglePlayback(event: KeyboardEvent) {
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

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
  aria-label="Timeline"
  tabindex="-1"
  class="@container moderno-block-timeline grid gap-2 bg-background text-foreground outline-none"
  onkeydowncapture={moveBySecond}
  onkeydown={togglePlayback}
  onpointerdowncapture={keepTrackPressOnKeyframes}
>
  <div class="flex items-center gap-1 px-2">
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
    <p class="m-0 ms-auto text-ui-sm text-muted-foreground tabular-nums">
      <span class="text-foreground">{formatTimecode(playhead, fps)}</span> /
      {formatTimecode(duration, fps)}
    </p>
  </div>

  <div class="max-h-64 overflow-y-auto border-t border-border">
    <div class="relative">
      <div class="sticky top-0 z-10 flex gap-4 border-b border-border bg-background py-2 pe-4">
        <span class="w-20 shrink-0 @sm:w-32"></span>
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
            {#each marks as mark, index (mark)}
              <Slider.Marker value={mark} class={index % 2 === 1 ? "hidden @md:block" : undefined}>
                {formatMark(mark)}
              </Slider.Marker>
            {/each}
          </Slider.MarkerGroup>
        </Slider.Root>
      </div>

      <ul class="m-0 grid list-none p-0">
        {#each sortedTracks as track (track.id)}
          <li class="flex h-10 items-center gap-4 border-b border-border pe-4">
            <span class="w-20 shrink-0 truncate ps-2 text-ui-sm @sm:w-32">{track.label}</span>
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

      <div aria-hidden="true" class="pointer-events-none absolute inset-0 flex gap-4 pe-4">
        <span class="w-20 shrink-0 @sm:w-32"></span>
        <span class="relative flex-1">
          <span
            class="absolute inset-y-0 w-px -translate-x-1/2 bg-primary"
            style:left="{duration > 0 ? (playhead / duration) * 100 : 0}%"
          ></span>
        </span>
      </div>
    </div>
  </div>
</section>
