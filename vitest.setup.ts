/**
 * Test setup — jsdom polyfills for the browser APIs Ark UI's positioning and
 * pointer machinery rely on (floating-ui / zag-js). jsdom ships none of these.
 * All stubs are guarded so the file is a no-op in the default `node` environment.
 */

import { afterEach } from "vitest";

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] {
    return [];
  }
}

/**
 * `CSS.escape` — jsdom implements no `CSS` namespace at all, and zag's PinInput
 * builds its `input[data-ownedby=…]` selector by escaping the root id (which
 * contains `:`). This is the CSSOM serialize-an-identifier algorithm verbatim,
 * not a `replace(/:/g, "\\:")` shortcut: a wrong escape would silently return
 * the wrong elements rather than throw.
 */
function cssEscape(value: string): string {
  const string = String(value);
  const { length } = string;
  const firstCodeUnit = string.charCodeAt(0);
  // A lone "-" is not a valid identifier on its own.
  if (length === 1 && firstCodeUnit === 0x002d) return "\\" + string;

  let result = "";
  for (let index = 0; index < length; index++) {
    const codeUnit = string.charCodeAt(index);
    // NULL becomes the replacement character.
    if (codeUnit === 0x0000) {
      result += "�";
      continue;
    }
    if (
      // Control characters, and digits that would start an identifier (or
      // follow a leading "-"), escape as a hex code point.
      (codeUnit >= 0x0001 && codeUnit <= 0x001f) ||
      codeUnit === 0x007f ||
      (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
      (index === 1 && codeUnit >= 0x0030 && codeUnit <= 0x0039 && firstCodeUnit === 0x002d)
    ) {
      result += "\\" + codeUnit.toString(16) + " ";
      continue;
    }
    if (
      // Everything an identifier may carry unescaped: non-ASCII, "-", "_",
      // digits and letters.
      codeUnit >= 0x0080 ||
      codeUnit === 0x002d ||
      codeUnit === 0x005f ||
      (codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
      (codeUnit >= 0x0041 && codeUnit <= 0x005a) ||
      (codeUnit >= 0x0061 && codeUnit <= 0x007a)
    ) {
      result += string.charAt(index);
      continue;
    }
    result += "\\" + string.charAt(index);
  }
  return result;
}

const g = globalThis as Record<string, unknown>;
g.ResizeObserver ??= ResizeObserverStub;
g.IntersectionObserver ??= IntersectionObserverStub;
g.CSS ??= { escape: cssEscape };

if (typeof window !== "undefined") {
  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;

  const el = Element.prototype as unknown as Record<string, unknown>;
  el.scrollIntoView ??= function scrollIntoView() {};
  el.scrollTo ??= function scrollTo() {};
  el.hasPointerCapture ??= function hasPointerCapture() {
    return false;
  };
  el.setPointerCapture ??= function setPointerCapture() {};
  el.releasePointerCapture ??= function releasePointerCapture() {};

  /**
   * `requestAnimationFrame` on `performance.now()`'s clock. A browser hands the
   * callback a timestamp on the same timeline as `performance.now()`; jsdom
   * hands it the time since its window was created, which trails
   * `performance.now()` by however long the test worker took to build that
   * window. zag's `setRafTimeout` (toast duration, toast remove delay) measures
   * `rafTimestamp - performance.now()`-at-start, so under jsdom every such
   * timer ran that much late: a 50ms toast took 50ms plus twice the worker's
   * setup time to go away, past `waitFor`'s 1s on a busy CI runner. Same frames,
   * same handles (so `cancelAnimationFrame` still works); only the timestamp
   * is corrected.
   *
   * Frames a test leaves queued are cancelled once it ends. Every test in a
   * file shares one jsdom window, and zag queues work in a frame without
   * cancelling it on unmount (a menu that opens focuses its content one frame
   * later). Each test renders a fresh app, so its ids repeat the previous
   * test's (`menu:v-0:content`): a frame queued by the previous test finds the
   * new test's element by that id and acts on it. The Vue Menu's keyboard test
   * failed that way: the previous test's frame moved focus from the trigger to
   * the closed menu's content just before Enter was pressed. In a browser the
   * ids never repeat, so only the tests need this.
   */
  const jsdomRequestAnimationFrame = window.requestAnimationFrame?.bind(window);
  const jsdomCancelAnimationFrame = window.cancelAnimationFrame?.bind(window);
  if (jsdomRequestAnimationFrame && jsdomCancelAnimationFrame) {
    const pendingFrames = new Set<number>();
    const requestAnimationFrame = (callback: FrameRequestCallback) => {
      const handle = jsdomRequestAnimationFrame(() => {
        pendingFrames.delete(handle);
        callback(performance.now());
      });
      pendingFrames.add(handle);
      return handle;
    };
    const cancelAnimationFrame = (handle: number) => {
      pendingFrames.delete(handle);
      jsdomCancelAnimationFrame(handle);
    };
    window.requestAnimationFrame = requestAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;
    g.requestAnimationFrame = requestAnimationFrame;
    g.cancelAnimationFrame = cancelAnimationFrame;

    // Setup-file hooks run after the test file's own, so this also catches
    // frames queued while `cleanup` unmounts the test's components.
    afterEach(() => {
      for (const handle of pendingFrames) jsdomCancelAnimationFrame(handle);
      pendingFrames.clear();
    });
  }
}
