// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentType } from "react";

/**
 * The React timeline block, controlled: it renders what it is given and
 * reports every change, snapped to the frame. The docs e2e spec drives the
 * Svelte copy in a real browser; this drives the React one in jsdom.
 *
 * Imported by path, as registry-render.test.tsx does: `registry/` has no
 * `node_modules`, so only Vitest's aliases (not this package's tsc) resolve
 * the block's own imports.
 */

interface TimelineProps {
  tracks?: { id: string; label: string; keyframes: { id: string; time: number }[] }[];
  duration?: number;
  time?: number;
  playing?: boolean;
  selectedKeyframe?: { trackId: string; keyframeId: string } | null;
  onTimeChange?: (time: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  onLoopChange?: (loop: boolean) => void;
  onKeyframeSelect?: (selection: { trackId: string; keyframeId: string } | null) => void;
  onKeyframeChange?: (change: { trackId: string; keyframeId: string; time: number }) => void;
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
