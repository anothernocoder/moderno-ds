// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ComponentType } from "react";

/**
 * The React timeline block, controlled: it renders what it is given and
 * reports every change, snapped to the frame. The docs e2e spec drives the
 * Svelte copy in a real browser; this drives the React one in jsdom.
 *
 * Imported by path, as registry-render.test.tsx does: `registry/` has no
 * `node_modules`, so only Vitest's aliases (not this package's tsc) resolve
 * the block's own imports.
 */

type Track = { id: string; label: string; keyframes: { id: string; time: number }[] };
type Selection = { trackId: string; keyframeId: string };

interface TimelineProps {
  tracks?: Track[];
  duration?: number;
  time?: number;
  playing?: boolean;
  selectedKeyframe?: Selection | null;
  zoom?: number;
  onTimeChange?: (time: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  onLoopChange?: (loop: boolean) => void;
  onKeyframeSelect?: (selection: Selection | null) => void;
  onKeyframeChange?: (change: Selection & { time: number }) => void;
  onKeyframeAdd?: (keyframe: { trackId: string; time: number }) => void;
  onKeyframeDelete?: (keyframe: Selection) => void;
  onZoomChange?: (zoom: number) => void;
}

const blockPath = "../../../registry/blocks/timeline/react/timeline.tsx";
const { Timeline } = (await import(/* @vite-ignore */ blockPath)) as {
  Timeline: ComponentType<TimelineProps>;
};

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

function mount(props: TimelineProps = {}) {
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
  render(<Timeline tracks={tracks} duration={5} time={1.4} {...handlers} {...props} />);
  return handlers;
}

const keyframeNames = () =>
  screen
    .getAllByRole("slider")
    .filter((thumb) => thumb.closest("[data-track-id]"))
    .map((thumb) => thumb.getAttribute("aria-label"));

describe("Timeline block (React)", () => {
  it("renders the controls, the readout, the playhead and one thumb per keyframe", () => {
    mount({ playing: true });
    expect(screen.getByRole("button", { name: "Play" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Loop" }).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("0:01:12").parentElement?.textContent).toMatch(/0:01:12 \/\s*0:05:00/);
    expect(screen.getByRole("slider", { name: "Playhead" }).getAttribute("aria-valuetext")).toBe(
      "1.40 seconds",
    );
    // Sorted by time, whatever order they came in.
    expect(keyframeNames()).toEqual(["Opacity keyframe at 0.00 s", "Opacity keyframe at 2.00 s"]);
    expect(document.querySelectorAll('[data-track-id] [data-part="range"]')).toHaveLength(0);
  });

  it("reports play, loop and Space, but not Space on a keyframe", async () => {
    const user = userEvent.setup();
    const handlers = mount();
    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(handlers.onPlayingChange).toHaveBeenLastCalledWith(true);
    await user.click(screen.getByRole("button", { name: "Loop" }));
    expect(handlers.onLoopChange).toHaveBeenLastCalledWith(true);

    handlers.onPlayingChange.mockClear();
    act(() => screen.getByRole("slider", { name: /^Opacity keyframe at 2/ }).focus());
    await user.keyboard(" ");
    expect(handlers.onPlayingChange).not.toHaveBeenCalled();
    act(() => screen.getByRole("region", { name: "Timeline" }).focus());
    await user.keyboard(" ");
    expect(handlers.onPlayingChange).toHaveBeenLastCalledWith(true);
  });

  it("moves the playhead one frame by arrow and one second by Page Up", async () => {
    const user = userEvent.setup();
    const handlers = mount();
    act(() => screen.getByRole("slider", { name: "Playhead" }).focus());
    await user.keyboard("{ArrowRight}");
    expect(handlers.onTimeChange).toHaveBeenLastCalledWith(43 / 30);
    await user.keyboard("{PageUp}");
    expect(handlers.onTimeChange).toHaveBeenLastCalledWith(72 / 30);
  });

  it("selects a keyframe on focus and moves it by frame and by second, within its neighbours", async () => {
    const user = userEvent.setup();
    const handlers = mount();
    act(() => screen.getByRole("slider", { name: /^Opacity keyframe at 0/ }).focus());
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
    // The next keyframe sits at 2 s: this one stops a frame before it.
    expect(handlers.onKeyframeChange).toHaveBeenLastCalledWith(moved(59 / 30));
  });

  it("marks the selected keyframe in its name and with data-selected", () => {
    mount({ selectedKeyframe: { trackId: "opacity", keyframeId: "late" } });
    const selected = screen.getByRole("slider", { name: "Opacity keyframe at 2.00 s, selected" });
    expect(selected.hasAttribute("data-selected")).toBe(true);
    expect(document.querySelectorAll("[data-selected]")).toHaveLength(1);
  });
});

/**
 * The app around the block, as the docs demo writes it: it keeps `tracks`, the
 * selection and the zoom, and writes back what the block reports.
 */
function App({ initialTracks, time = 1.4 }: { initialTracks: Track[]; time?: number }) {
  const [tracks, setTracks] = useState(initialTracks);
  const [selectedKeyframe, setSelectedKeyframe] = useState<Selection | null>(null);
  const [zoom, setZoom] = useState(1);
  const edit = (trackId: string, change: (keyframes: Track["keyframes"]) => Track["keyframes"]) =>
    setTracks((current) =>
      current.map((track) =>
        track.id === trackId ? { ...track, keyframes: change(track.keyframes) } : track,
      ),
    );
  return (
    <Timeline
      tracks={tracks}
      duration={5}
      time={time}
      selectedKeyframe={selectedKeyframe}
      zoom={zoom}
      onKeyframeSelect={setSelectedKeyframe}
      onKeyframeAdd={({ trackId, time: at }) =>
        edit(trackId, (keyframes) => [...keyframes, { id: `added-${at}`, time: at }])
      }
      onKeyframeDelete={({ trackId, keyframeId }) =>
        edit(trackId, (keyframes) => keyframes.filter(({ id }) => id !== keyframeId))
      }
      onZoomChange={setZoom}
    />
  );
}

const button = (name: string) => screen.getByRole("button", { name });
const isDisabled = (name: string) => button(name).getAttribute("aria-disabled") === "true";
const announced = () => document.querySelector("[data-live-announcer]")?.textContent;

describe("Timeline block (React) — adding, deleting and zooming", () => {
  it("adds a keyframe at the playhead, on the frame, to the selected track only", async () => {
    const user = userEvent.setup();
    const handlers = mount({ time: 1.41 });
    expect(isDisabled("Add keyframe"), "no track selected").toBe(true);

    await user.click(button("Opacity"));
    expect(button("Opacity").getAttribute("aria-pressed")).toBe("true");
    expect(isDisabled("Add keyframe")).toBe(false);
    await user.click(button("Add keyframe"));
    expect(handlers.onKeyframeAdd).toHaveBeenCalledWith({ trackId: "opacity", time: 42 / 30 });
    // Controlled: nothing is added until the app writes `tracks` back.
    expect(keyframeNames()).toHaveLength(2);
  });

  it("disables Add on a frame that already has a keyframe", async () => {
    const user = userEvent.setup();
    mount({ time: 2 });
    await user.click(button("Opacity"));
    expect(isDisabled("Add keyframe")).toBe(true);
  });

  it("focuses and selects the new keyframe once the app adds it", async () => {
    const user = userEvent.setup();
    render(<App initialTracks={tracks} />);
    await user.click(button("Opacity"));
    await user.click(button("Add keyframe"));
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("aria-label")).toBe(
        "Opacity keyframe at 1.40 s, selected",
      ),
    );
    expect(keyframeNames()).toHaveLength(3);
    expect(isDisabled("Add keyframe"), "a keyframe sits on this frame now").toBe(true);
  });

  it("deletes the selected keyframe by button and by the Delete key, then focuses the nearest", async () => {
    const user = userEvent.setup();
    const three = [
      {
        ...tracks[0]!,
        keyframes: [...tracks[0]!.keyframes, { id: "last", time: 4 }],
      },
    ];
    render(<App initialTracks={three} />);
    expect(isDisabled("Delete keyframe"), "no keyframe selected").toBe(true);

    await user.click(screen.getByRole("slider", { name: /^Opacity keyframe at 2/ }));
    await user.keyboard("{Delete}");
    // 0 s and 4 s are equally near: the later one wins.
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("aria-label")).toBe(
        "Opacity keyframe at 4.00 s, selected",
      ),
    );
    await user.click(button("Delete keyframe"));
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("aria-label")).toBe(
        "Opacity keyframe at 0.00 s, selected",
      ),
    );
    expect(keyframeNames()).toEqual(["Opacity keyframe at 0.00 s, selected"]);
  });

  it("focuses the track's label once its last keyframe is deleted", async () => {
    const user = userEvent.setup();
    render(<App initialTracks={[{ ...tracks[0]!, keyframes: [{ id: "only", time: 1 }] }]} />);
    await user.click(screen.getByRole("slider", { name: /^Opacity keyframe/ }));
    await user.click(button("Delete keyframe"));
    await waitFor(() => expect(document.activeElement).toBe(button("Opacity")));
    expect(button("Opacity").getAttribute("aria-pressed"), "the track stays selected").toBe("true");
    expect(isDisabled("Delete keyframe")).toBe(true);
    expect(isDisabled("Add keyframe"), "the empty track takes a new keyframe").toBe(false);
  });

  it("zooms in, out and to fit, widening the time area and announcing the level", async () => {
    const user = userEvent.setup();
    render(<App initialTracks={tracks} />);
    const area = () =>
      document.querySelector<HTMLElement>(".overflow-auto > .relative")!.style.width;
    expect(isDisabled("Zoom out")).toBe(true);
    expect(isDisabled("Fit")).toBe(true);
    const marks = () =>
      [...document.querySelectorAll('[data-part="marker"]')].map((mark) => mark.textContent);
    expect(marks()).toEqual(["0s", "1s", "2s", "3s", "4s", "5s"]);

    await user.click(button("Zoom in"));
    await waitFor(() => expect(announced()).toBe("Zoom 200%"));
    expect(area()).toBe("calc(2 * 100% - 1 * var(--timeline-gutter))");
    // Denser marks: fifteen frames apart, whole seconds still marked.
    expect(marks().slice(0, 3)).toEqual(["0s", "15f", "1s"]);

    await user.click(button("Zoom in"));
    await user.click(button("Zoom in"));
    await waitFor(() => expect(announced()).toBe("Zoom 800%"));
    expect(isDisabled("Zoom in"), "about ten frames fill the view").toBe(true);
    expect(marks().slice(0, 3)).toEqual(["0s", "3f", "6f"]);

    await user.click(button("Zoom out"));
    await waitFor(() => expect(announced()).toBe("Zoom 400%"));
    await user.click(button("Fit"));
    await waitFor(() => expect(announced()).toBe("Zoom 100%"));
    expect(area()).toBe("calc(1 * 100% - 0 * var(--timeline-gutter))");
  });

  it("reports zoom without changing it: the app owns it", async () => {
    const user = userEvent.setup();
    const handlers = mount();
    await user.click(button("Zoom in"));
    expect(handlers.onZoomChange).toHaveBeenLastCalledWith(2);
    expect(isDisabled("Zoom out")).toBe(true);
  });
});
