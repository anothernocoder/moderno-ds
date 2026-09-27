/**
 * jsdom stand-ins for what Ark's carousel reads from a real browser, shared by
 * the four frameworks' Carousel suites.
 *
 * The tsconfig that checks core's tests has no DOM lib, so that core's own
 * sources never see one. The few DOM globals used here are declared for this
 * module alone, typed only as far as it uses them.
 */

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DomNode {
  dataset?: Record<string, string | undefined>;
  parentElement: DomNode | null;
  scrollLeft: number;
  querySelectorAll(selectors: string): ArrayLike<unknown>;
  getBoundingClientRect(): unknown;
}

type Listener = (event: { matches: boolean }) => void;

interface MediaQueryListLike {
  readonly matches: boolean;
  media: string;
  addEventListener(type: string, listener: Listener): void;
  removeEventListener(type: string, listener: Listener): void;
}

declare const HTMLElement: { prototype: DomNode };
declare const Element: { prototype: DomNode };
declare const DOMRect: { fromRect(box: Box): unknown };
declare const window: { matchMedia(query: string): MediaQueryListLike };

/** How wide the item group is in `layOutCarouselSlides`, in px. */
export const CAROUSEL_WIDTH = 100;

const isCarouselPart = (node: DomNode, part: string) =>
  node.dataset?.scope === "carousel" && node.dataset.part === part;

/**
 * jsdom has no layout, so Ark's carousel finds every slide at 0 and sees one
 * page. This lays each item group out `CAROUSEL_WIDTH` wide, with its slides
 * side by side, `slidesPerPage` to a view, the way a browser would. Call it
 * before rendering; it returns a function that undoes it.
 */
export function layOutCarouselSlides(slidesPerPage = 1): () => void {
  const slideWidth = CAROUSEL_WIDTH / slidesPerPage;
  const rect = HTMLElement.prototype.getBoundingClientRect;
  const offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth")!;
  const scrollWidth = Object.getOwnPropertyDescriptor(Element.prototype, "scrollWidth")!;

  HTMLElement.prototype.getBoundingClientRect = function (this: DomNode) {
    if (isCarouselPart(this, "item-group")) {
      return DOMRect.fromRect({ x: 0, y: 0, width: CAROUSEL_WIDTH, height: CAROUSEL_WIDTH });
    }
    if (isCarouselPart(this, "item")) {
      const scrolled = this.parentElement?.scrollLeft ?? 0;
      const x = Number(this.dataset?.index) * slideWidth - scrolled;
      return DOMRect.fromRect({ x, y: 0, width: slideWidth, height: CAROUSEL_WIDTH });
    }
    return rect.call(this);
  };
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get(this: DomNode) {
      return isCarouselPart(this, "item-group") ? CAROUSEL_WIDTH : 0;
    },
  });
  Object.defineProperty(Element.prototype, "scrollWidth", {
    configurable: true,
    get(this: DomNode) {
      if (!isCarouselPart(this, "item-group")) return 0;
      return this.querySelectorAll('[data-part="item"]').length * slideWidth;
    },
  });

  return () => {
    HTMLElement.prototype.getBoundingClientRect = rect;
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", offsetWidth);
    Object.defineProperty(Element.prototype, "scrollWidth", scrollWidth);
  };
}

/** A `window.matchMedia` whose reduced-motion answer a test sets and flips. */
export interface ReducedMotionStub {
  /** Answers the query with `prefers`, telling every listener. */
  set(prefers: boolean): void;
  /** Puts the original `matchMedia` back. */
  restore(): void;
}

/**
 * Stubs `window.matchMedia` so `(prefers-reduced-motion: reduce)` answers
 * `prefers`; any other query answers `false`.
 */
export function stubReducedMotion(prefers: boolean): ReducedMotionStub {
  const original = window.matchMedia;
  const listeners = new Set<Listener>();
  let matches = prefers;

  window.matchMedia = (query: string) => ({
    get matches() {
      return query === "(prefers-reduced-motion: reduce)" && matches;
    },
    media: query,
    addEventListener: (_type: string, listener: Listener) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: Listener) => {
      listeners.delete(listener);
    },
  });

  return {
    set(next) {
      matches = next;
      for (const listener of listeners) listener({ matches: next });
    },
    restore() {
      window.matchMedia = original;
    },
  };
}
