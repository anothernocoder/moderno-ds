// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import Timeline from "../../../registry/blocks/timeline/vue/Timeline.vue";

/**
 * The Vue timeline block, controlled: it renders what it is given and emits
 * every change, snapped to the frame. The docs e2e spec drives the Svelte copy
 * in a real browser; this drives the Vue one in jsdom.
 *
 * It lives in this `vue-ssr` project because only this project compiles
 * `<script setup>` SFCs (`@vitejs/plugin-vue`).
 */

afterEach(cleanup);

const tracks = [
  {
    id: "opacity",
    label: "Opacity",
    keyframes: [
      { id: "late", time: 2 },
      { id: "early", time: 0 },
    ],
  },
];

function mount(props: Record<string, unknown> = {}) {
  const handlers = {
    onTimeChange: vi.fn(),
    onPlayingChange: vi.fn(),
    onLoopChange: vi.fn(),
    onKeyframeSelect: vi.fn(),
    onKeyframeChange: vi.fn(),
    onKeyframeAdd: vi.fn(),
    onKeyframeDelete: vi.fn(),
    onZoomChange: vi.fn(),
  };
  render(Timeline, { props: { tracks, duration: 5, time: 1.4, ...handlers, ...props } });
  return handlers;
}

const keyframeNames = () =>
  screen
    .getAllByRole("slider")
    .filter((thumb) => thumb.closest("[data-track-id]"))
    .map((thumb) => thumb.getAttribute("aria-label"));

describe("Timeline block (Vue)", () => {
  it("renders the controls, the readout, the playhead and one thumb per keyframe", () => {
    mount({ playing: true });
    expect(screen.getByRole("button", { name: "Play" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Play" }).dataset.scope).toBe("toggle");
    expect(screen.getByRole("button", { name: "Loop" }).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("0:01:12").parentElement?.textContent).toMatch(/0:01:12 \/\s*0:05:00/);
    expect(screen.getByRole("slider", { name: "Playhead" }).getAttribute("aria-valuetext")).toBe(
      "1.40 seconds",
    );
    expect(keyframeNames()).toEqual(["Opacity keyframe at 0.00 s", "Opacity keyframe at 2.00 s"]);
    expect(document.querySelectorAll('[data-track-id] [data-part="range"]')).toHaveLength(0);
  });

  it("emits play, loop and Space, but not Space on a keyframe", async () => {
    const user = userEvent.setup();
    const handlers = mount();
    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(handlers.onPlayingChange).toHaveBeenLastCalledWith(true);
    await user.click(screen.getByRole("button", { name: "Loop" }));
    expect(handlers.onLoopChange).toHaveBeenLastCalledWith(true);

    handlers.onPlayingChange.mockClear();
    screen.getByRole("slider", { name: /^Opacity keyframe at 2/ }).focus();
    await user.keyboard(" ");
    expect(handlers.onPlayingChange).not.toHaveBeenCalled();
    screen.getByRole("region", { name: "Timeline" }).focus();
    await user.keyboard(" ");
    expect(handlers.onPlayingChange).toHaveBeenLastCalledWith(true);
  });

  it("moves the playhead one frame by arrow and one second by Page Up", async () => {
    const user = userEvent.setup();
    const handlers = mount();
    screen.getByRole("slider", { name: "Playhead" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(handlers.onTimeChange).toHaveBeenLastCalledWith(43 / 30);
    await user.keyboard("{PageUp}");
    expect(handlers.onTimeChange).toHaveBeenLastCalledWith(72 / 30);
  });

  it("selects a keyframe on focus and moves it by frame and by second, within its neighbours", async () => {
    const user = userEvent.setup();
    const handlers = mount();
    screen.getByRole("slider", { name: /^Opacity keyframe at 0/ }).focus();
    await waitFor(() =>
      expect(handlers.onKeyframeSelect).toHaveBeenLastCalledWith({
        trackId: "opacity",
        keyframeId: "early",
      }),
    );
    const moved = (time: number) => ({ trackId: "opacity", keyframeId: "early", time });
    await user.keyboard("{ArrowRight}");
    expect(handlers.onKeyframeChange).toHaveBeenLastCalledWith(moved(1 / 30));
    await user.keyboard("{PageUp}");
    expect(handlers.onKeyframeChange).toHaveBeenLastCalledWith(moved(1));
    await user.keyboard("{End}");
    expect(handlers.onKeyframeChange).toHaveBeenLastCalledWith(moved(59 / 30));
  });

  it("marks the selected keyframe in its name and with data-selected", () => {
    mount({ selectedKeyframe: { trackId: "opacity", keyframeId: "late" } });
    const selected = screen.getByRole("slider", { name: "Opacity keyframe at 2.00 s, selected" });
    expect(selected.hasAttribute("data-selected")).toBe(true);
    expect(document.querySelectorAll("[data-selected]")).toHaveLength(1);
  });
});

type Track = (typeof tracks)[number];
type Selection = { trackId: string; keyframeId: string };

/**
 * The app around the block, as the docs demo writes it: it keeps `tracks`, the
 * selection and the zoom, and writes back what the block emits.
 */
const App = defineComponent({
  props: { initialTracks: { type: Array as () => Track[], required: true } },
  setup(props) {
    const current = ref(props.initialTracks);
    const selectedKeyframe = ref<Selection | null>(null);
    const zoom = ref(1);
    const edit = (
      trackId: string,
      change: (keyframes: Track["keyframes"]) => Track["keyframes"],
    ) => {
      current.value = current.value.map((track) =>
        track.id === trackId ? { ...track, keyframes: change(track.keyframes) } : track,
      );
    };
    return () =>
      h(Timeline, {
        tracks: current.value,
        duration: 5,
        time: 1.4,
        selectedKeyframe: selectedKeyframe.value,
        zoom: zoom.value,
        onKeyframeSelect: (selection: Selection | null) => (selectedKeyframe.value = selection),
        onKeyframeAdd: ({ trackId, time }: { trackId: string; time: number }) =>
          edit(trackId, (keyframes) => [...keyframes, { id: `added-${time}`, time }]),
        onKeyframeDelete: ({ trackId, keyframeId }: Selection) =>
          edit(trackId, (keyframes) => keyframes.filter(({ id }) => id !== keyframeId)),
        onZoomChange: (next: number) => (zoom.value = next),
      });
  },
});

const button = (name: string) => screen.getByRole("button", { name });
const isDisabled = (name: string) => button(name).getAttribute("aria-disabled") === "true";
const announced = () => document.querySelector("[data-live-announcer]")?.textContent;

describe("Timeline block (Vue) — adding, deleting and zooming", () => {
  it("emits an added keyframe at the playhead, on the frame, for the selected track", async () => {
    const user = userEvent.setup();
    const handlers = mount({ time: 1.41 });
    expect(isDisabled("Add keyframe"), "no track selected").toBe(true);
    await user.click(button("Opacity"));
    await waitFor(() => expect(button("Opacity").getAttribute("aria-pressed")).toBe("true"));
    await user.click(button("Add keyframe"));
    expect(handlers.onKeyframeAdd).toHaveBeenCalledWith({ trackId: "opacity", time: 42 / 30 });
    expect(keyframeNames(), "controlled: the app adds it").toHaveLength(2);
  });

  it("focuses the new keyframe, then deletes it by the Delete key and focuses the nearest", async () => {
    const user = userEvent.setup();
    render(App, { props: { initialTracks: tracks } });
    await user.click(button("Opacity"));
    await user.click(button("Add keyframe"));
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("aria-label")).toBe(
        "Opacity keyframe at 1.40 s, selected",
      ),
    );
    expect(isDisabled("Add keyframe")).toBe(true);
    await user.keyboard("{Delete}");
    // 0 s is 1.4 s away, 2 s only 0.6 s.
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("aria-label")).toBe(
        "Opacity keyframe at 2.00 s, selected",
      ),
    );
    expect(keyframeNames()).toHaveLength(2);
  });

  it("focuses the track's label once its last keyframe is deleted", async () => {
    const user = userEvent.setup();
    render(App, {
      props: { initialTracks: [{ ...tracks[0]!, keyframes: [{ id: "only", time: 1 }] }] },
    });
    await user.click(screen.getByRole("slider", { name: /^Opacity keyframe/ }));
    await user.click(button("Delete keyframe"));
    await waitFor(() => expect(document.activeElement).toBe(button("Opacity")));
    expect(isDisabled("Delete keyframe")).toBe(true);
    expect(isDisabled("Add keyframe")).toBe(false);
  });

  it("zooms in and to fit, widening the time area and announcing the level", async () => {
    const user = userEvent.setup();
    render(App, { props: { initialTracks: tracks } });
    const area = () =>
      document.querySelector<HTMLElement>(".overflow-auto > .relative")!.style.width;
    expect(isDisabled("Zoom out")).toBe(true);
    await user.click(button("Zoom in"));
    await waitFor(() => expect(announced()).toBe("Zoom 200%"));
    expect(area()).toBe("calc(2 * 100% - 1 * var(--timeline-gutter))");
    await user.click(button("Fit"));
    await waitFor(() => expect(announced()).toBe("Zoom 100%"));
    expect(isDisabled("Fit")).toBe(true);
  });
});
