<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { announce } from "@moderno-ui/core";
import { Button, Portal, Slider, Toggle, Tooltip } from "@moderno-ui/vue";

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

const props = withDefaults(
  defineProps<{
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
  }>(),
  {
    tracks: () => [
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
    ],
    duration: 5,
    time: 0,
    fps: 30,
    playing: false,
    loop: false,
    selectedKeyframe: null,
    zoom: 1,
  },
);

const emit = defineEmits<{
  timeChange: [time: number];
  playingChange: [playing: boolean];
  loopChange: [loop: boolean];
  keyframeSelect: [selection: KeyframeSelection | null];
  keyframeChange: [change: KeyframeChange];
  keyframeAdd: [keyframe: KeyframeAdd];
  keyframeDelete: [keyframe: KeyframeSelection];
  zoomChange: [zoom: number];
}>();

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

function secondsText(details: { value: number }) {
  return `${details.value.toFixed(2)} seconds`;
}

const frame = computed(() => 1 / props.fps);
const playhead = computed(() => clamp(props.time, 0, props.duration));
const playheadFrame = computed(() => snapToFrame(playhead.value, props.fps));
const maxZoom = computed(() => deepestZoom(props.duration, props.fps));
const zoomLevel = computed(() => clamp(props.zoom, 1, maxZoom.value));
const marks = computed(() => rulerMarks(props.duration, props.fps, zoomLevel.value));
const sortedTracks = computed(() =>
  props.tracks.map((track) => ({ ...track, keyframes: byTime(track.keyframes) })),
);
const playheadOffset = computed(() =>
  props.duration > 0 ? `${(playhead.value / props.duration) * 100}%` : "0%",
);
const timeAreaWidth = computed(
  () => `calc(${zoomLevel.value} * 100% - ${zoomLevel.value - 1} * var(--timeline-gutter))`,
);

// The track a label press picked, or the last delete left; the selected keyframe's track wins.
const pickedTrackId = ref<string | null>(null);
const selectedTrackId = computed(() => props.selectedKeyframe?.trackId ?? pickedTrackId.value);
const selectedTrack = computed(() =>
  sortedTracks.value.find((track) => track.id === selectedTrackId.value),
);
const selectedIndex = computed(
  () =>
    selectedTrack.value?.keyframes.findIndex(
      (keyframe) => keyframe.id === props.selectedKeyframe?.keyframeId,
    ) ?? -1,
);
const canAdd = computed(
  () =>
    selectedTrack.value !== undefined &&
    !selectedTrack.value.keyframes.some(
      (keyframe) => snapToFrame(keyframe.time, props.fps) === playheadFrame.value,
    ),
);

const section = ref<HTMLElement>();
const scroller = ref<HTMLDivElement>();
const corner = ref<HTMLSpanElement>();
const line = ref<HTMLSpanElement>();
let pendingFocus: FocusTarget | null = null;

function seek(next: number) {
  const snapped = snapToFrame(clamp(next, 0, props.duration), props.fps);
  if (snapped !== playheadFrame.value) emit("timeChange", snapped);
}

function isSelected(trackId: string, keyframeId: string) {
  return (
    props.selectedKeyframe?.trackId === trackId && props.selectedKeyframe.keyframeId === keyframeId
  );
}

function select(trackId: string, keyframe: TimelineKeyframe | undefined) {
  if (keyframe && !isSelected(trackId, keyframe.id)) {
    emit("keyframeSelect", { trackId, keyframeId: keyframe.id });
  }
}

// A label press selects its track (pressed again, no track) and no keyframe.
function pickTrack(trackId: string | null) {
  pickedTrackId.value = trackId;
  if (props.selectedKeyframe) emit("keyframeSelect", null);
}

function moveKeyframe(trackId: string, keyframe: TimelineKeyframe | undefined, next: number) {
  const snapped = snapToFrame(next, props.fps);
  if (keyframe && snapped !== snapToFrame(keyframe.time, props.fps)) {
    emit("keyframeChange", { trackId, keyframeId: keyframe.id, time: snapped });
  }
}

function moveKeyframes(track: TimelineTrack, values: number[]) {
  values.forEach((value, index) => moveKeyframe(track.id, track.keyframes[index], value));
}

function keyframeLabel(track: TimelineTrack, keyframe: TimelineKeyframe) {
  const selected = isSelected(track.id, keyframe.id) ? ", selected" : "";
  return `${track.label} keyframe at ${keyframe.time.toFixed(2)} s${selected}`;
}

function addKeyframe() {
  const track = selectedTrack.value;
  if (!track || !canAdd.value) return;
  pendingFocus = { trackId: track.id, time: playheadFrame.value };
  emit("keyframeAdd", { trackId: track.id, time: playheadFrame.value });
}

// The focus and the selection move to the nearest keyframe left on the track, or to its label.
function deleteSelectedKeyframe() {
  const track = selectedTrack.value;
  const deleted = track?.keyframes[selectedIndex.value];
  if (!track || !deleted) return;
  const nearest = nearestNeighbour(track.keyframes, selectedIndex.value);
  pickedTrackId.value = track.id;
  pendingFocus = { trackId: track.id, keyframeId: nearest?.id };
  emit("keyframeDelete", { trackId: track.id, keyframeId: deleted.id });
  emit("keyframeSelect", nearest ? { trackId: track.id, keyframeId: nearest.id } : null);
}

function changeZoom(next: number) {
  if (next !== zoomLevel.value) emit("zoomChange", next);
}

// Runs once the app has written back `tracks` after an add or a delete.
function focusPendingTarget() {
  const target = pendingFocus;
  if (!target || !section.value) return;
  pendingFocus = null;
  const track = sortedTracks.value.find((candidate) => candidate.id === target.trackId);
  if (!track) return;
  if (target.keyframeId === undefined && target.time === undefined) {
    const labels = section.value.querySelectorAll<HTMLElement>("[data-track-label]");
    [...labels].find((label) => label.dataset.trackLabel === track.id)?.focus();
    return;
  }
  const index = track.keyframes.findIndex((keyframe) =>
    target.keyframeId !== undefined
      ? keyframe.id === target.keyframeId
      : snapToFrame(keyframe.time, props.fps) === target.time,
  );
  const roots = section.value.querySelectorAll<HTMLElement>("[data-track-id]");
  const root = [...roots].find((candidate) => candidate.dataset.trackId === track.id);
  root?.querySelectorAll<HTMLElement>('[role="slider"]')[index]?.focus();
}

// Scrolls the time area so the playhead line is in view, centring it when it was not.
function revealPlayhead() {
  if (!scroller.value || !corner.value || !line.value) return;
  const start = corner.value.getBoundingClientRect().right;
  const end = scroller.value.getBoundingClientRect().left + scroller.value.clientWidth;
  const x = line.value.getBoundingClientRect().left;
  if (x < start || x > end) scroller.value.scrollLeft += x - (start + end) / 2;
}

watch(() => props.tracks, focusPendingTarget, { flush: "post" });
watch([zoomLevel, playhead, scroller], revealPlayhead, { flush: "post" });
watch(zoomLevel, (level) => announce(`Zoom ${Math.round(level * 100)}%`));

const editButtons = computed<ToolbarButton[]>(() => [
  {
    label: "Add keyframe",
    hint: "Add keyframe",
    icon: icons.addKeyframe,
    disabled: !canAdd.value,
    onPress: addKeyframe,
  },
  {
    label: "Delete keyframe",
    hint: "Delete keyframe (Delete)",
    icon: icons.deleteKeyframe,
    disabled: selectedIndex.value < 0,
    onPress: deleteSelectedKeyframe,
  },
]);
const zoomButtons = computed<ToolbarButton[]>(() => [
  {
    label: "Zoom out",
    hint: "Zoom out",
    icon: icons.zoomOut,
    disabled: zoomLevel.value <= 1,
    onPress: () => changeZoom(Math.max(zoomLevel.value / 2, 1)),
  },
  {
    label: "Zoom in",
    hint: "Zoom in",
    icon: icons.zoomIn,
    disabled: zoomLevel.value >= maxZoom.value,
    onPress: () => changeZoom(Math.min(zoomLevel.value * 2, maxZoom.value)),
  },
  {
    label: "Fit",
    hint: "Fit",
    icon: icons.fit,
    disabled: zoomLevel.value === 1,
    onPress: () => changeZoom(1),
  },
]);

function press(button: ToolbarButton) {
  if (!button.disabled) button.onPress();
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
  const track = sortedTracks.value.find((candidate) => candidate.id === trackId);
  if (!track) {
    seek(playhead.value + seconds);
    return;
  }
  const { keyframes } = track;
  const index = Number(thumb.dataset.index);
  const keyframe = keyframes[index];
  if (!keyframe) return;
  const earliest = index > 0 ? keyframes[index - 1]!.time + frame.value : 0;
  const latest =
    index < keyframes.length - 1 ? keyframes[index + 1]!.time - frame.value : props.duration;
  moveKeyframe(track.id, keyframe, clamp(keyframe.time + seconds, earliest, latest));
}

// Delete (or Backspace, which Mac keyboards label "delete") removes the selected keyframe.
// Space plays and pauses, unless a keyframe or a button has the focus.
function handleShortcut(event: KeyboardEvent) {
  if (event.key === "Delete" || event.key === "Backspace") {
    if (selectedIndex.value < 0) return;
    event.preventDefault();
    deleteSelectedKeyframe();
    return;
  }
  if (event.key !== " " || event.repeat) return;
  if ((event.target as HTMLElement).closest("[data-track-id], button")) return;
  event.preventDefault();
  emit("playingChange", !props.playing);
}

// A press on a track's empty stretch would pull the nearest keyframe to it; only keyframes move.
function keepTrackPressOnKeyframes(event: PointerEvent) {
  const target = event.target as HTMLElement;
  if (target.closest("[data-track-id]") && !target.closest('[role="slider"]')) {
    event.stopPropagation();
  }
}
</script>

<template>
  <section
    ref="section"
    aria-label="Timeline"
    tabindex="-1"
    class="@container moderno-block-timeline grid gap-2 bg-background text-foreground outline-none"
    @keydown.capture="moveBySecond"
    @keydown="handleShortcut"
    @pointerdown.capture="keepTrackPressOnKeyframes"
  >
    <div class="flex flex-wrap items-center gap-1 px-2">
      <Tooltip.Root>
        <Toggle.Root
          as-child
          size="sm"
          aria-label="Play"
          :pressed="playing"
          @pressed-change="emit('playingChange', $event)"
        >
          <Tooltip.Trigger>
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
              aria-hidden="true"
            >
              <path v-if="playing" d="M6 4h4v16H6zM14 4h4v16h-4z" />
              <path v-else d="M7 4v16l13-8z" />
            </svg>
          </Tooltip.Trigger>
        </Toggle.Root>
        <Portal>
          <Tooltip.Positioner>
            <Tooltip.Content>{{ playing ? "Pause (Space)" : "Play (Space)" }}</Tooltip.Content>
          </Tooltip.Positioner>
        </Portal>
      </Tooltip.Root>
      <Tooltip.Root>
        <Toggle.Root
          as-child
          size="sm"
          aria-label="Loop"
          :pressed="loop"
          @pressed-change="emit('loopChange', $event)"
        >
          <Tooltip.Trigger>
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
        </Toggle.Root>
        <Portal>
          <Tooltip.Positioner>
            <Tooltip.Content>Loop</Tooltip.Content>
          </Tooltip.Positioner>
        </Portal>
      </Tooltip.Root>
      <span aria-hidden="true" class="mx-1 h-4 w-px bg-border" />
      <!-- The edit buttons; then the readout and the zoom buttons, which stay together at the end and wrap together. -->
      <div
        v-for="(buttons, group) in [editButtons, zoomButtons]"
        :key="group"
        :class="['flex items-center gap-1', { 'ms-auto': group === 1 }]"
      >
        <p v-if="group === 1" class="m-0 me-1 text-ui-sm text-muted-foreground tabular-nums">
          <span class="text-foreground">{{ formatTimecode(playhead, fps) }}</span> /
          {{ formatTimecode(duration, fps) }}
        </p>
        <Tooltip.Root v-for="button in buttons" :key="button.label">
          <Tooltip.Trigger as-child>
            <!-- aria-disabled, not disabled: a button that disables itself keeps the focus. -->
            <Button
              variant="ghost"
              size="sm"
              class="px-2"
              :aria-label="button.label"
              :aria-disabled="button.disabled || undefined"
              :data-disabled="button.disabled ? '' : undefined"
              @click="press(button)"
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
                <path v-for="path in button.icon" :key="path" :d="path" />
              </svg>
            </Button>
          </Tooltip.Trigger>
          <Portal>
            <Tooltip.Positioner>
              <Tooltip.Content>{{ button.hint }}</Tooltip.Content>
            </Tooltip.Positioner>
          </Portal>
        </Tooltip.Root>
      </div>
    </div>

    <!-- The time area is `zoom` times the width left beside the gutter (label column, gap, end padding). -->
    <div
      ref="scroller"
      class="max-h-64 overflow-auto border-t border-border [--timeline-gutter:--spacing(28)] @sm:[--timeline-gutter:--spacing(40)]"
    >
      <div class="relative" :style="{ width: timeAreaWidth }">
        <div class="sticky top-0 z-20 flex gap-2 border-b border-border bg-background py-2 pe-4">
          <span
            ref="corner"
            class="sticky start-0 z-10 -my-2 w-22 shrink-0 self-stretch bg-background @sm:w-34"
          />
          <Slider.Root
            class="min-w-0 flex-1"
            size="sm"
            :min="0"
            :max="duration"
            :step="frame"
            thumb-alignment="center"
            :model-value="[playhead]"
            :get-aria-value-text="secondsText"
            @value-change="seek($event.value[0]!)"
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb :index="0" aria-label="Playhead">
                <Slider.HiddenInput />
              </Slider.Thumb>
            </Slider.Control>
            <Slider.MarkerGroup>
              <Slider.Marker
                v-for="(mark, index) in marks"
                :key="mark.time"
                :value="mark.time"
                :class="index % 2 === 1 ? 'hidden @md:block' : undefined"
              >
                {{ mark.label }}
              </Slider.Marker>
            </Slider.MarkerGroup>
          </Slider.Root>
        </div>

        <ul class="m-0 grid list-none p-0">
          <li
            v-for="track in sortedTracks"
            :key="track.id"
            class="flex h-10 items-center gap-2 border-b border-border pe-4"
          >
            <div
              class="sticky start-0 z-10 flex h-full w-22 shrink-0 items-center bg-background px-1 @sm:w-34"
            >
              <Toggle.Root
                size="sm"
                :data-track-label="track.id"
                class="w-full justify-start font-normal"
                :pressed="selectedTrackId === track.id"
                @pressed-change="pickTrack($event ? track.id : null)"
              >
                <span class="truncate">{{ track.label }}</span>
              </Toggle.Root>
            </div>
            <Slider.Root
              :data-track-id="track.id"
              class="min-w-0 flex-1"
              size="sm"
              :min="0"
              :max="duration"
              :step="frame"
              :min-steps-between-thumbs="1"
              thumb-alignment="center"
              :model-value="track.keyframes.map((keyframe) => keyframe.time)"
              :get-aria-value-text="secondsText"
              @focus-change="select(track.id, track.keyframes[$event.focusedIndex])"
              @value-change="moveKeyframes(track, $event.value)"
            >
              <Slider.Control>
                <Slider.Track />
                <Slider.Thumb
                  v-for="(keyframe, index) in track.keyframes"
                  :key="keyframe.id"
                  :index="index"
                  :data-selected="isSelected(track.id, keyframe.id) ? '' : undefined"
                  :aria-label="keyframeLabel(track, keyframe)"
                  class="flex size-4 items-center justify-center border-0 bg-transparent shadow-none"
                >
                  <span
                    :class="
                      isSelected(track.id, keyframe.id)
                        ? 'size-3.5 rotate-45 rounded-sm border-2 border-primary bg-primary outline-2 outline-offset-2 outline-foreground'
                        : 'size-2.5 rotate-45 rounded-sm border-2 border-primary bg-background'
                    "
                  />
                  <Slider.HiddenInput />
                </Slider.Thumb>
              </Slider.Control>
            </Slider.Root>
          </li>
        </ul>

        <div aria-hidden="true" class="pointer-events-none absolute inset-0 flex gap-2 pe-4">
          <span class="w-22 shrink-0 @sm:w-34" />
          <span class="relative flex-1">
            <span
              ref="line"
              class="absolute inset-y-0 w-px -translate-x-1/2 bg-primary"
              :style="{ left: playheadOffset }"
            />
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
