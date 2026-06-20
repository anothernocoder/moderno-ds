/**
 * Test setup — jsdom polyfills for the browser APIs Ark UI's positioning and
 * pointer machinery rely on (floating-ui / zag-js). jsdom ships none of these.
 * All stubs are guarded so the file is a no-op in the default `node` environment.
 */

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

const g = globalThis as Record<string, unknown>;
g.ResizeObserver ??= ResizeObserverStub;
g.IntersectionObserver ??= IntersectionObserverStub;

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
}
