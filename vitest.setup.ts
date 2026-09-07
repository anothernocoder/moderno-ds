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
}
