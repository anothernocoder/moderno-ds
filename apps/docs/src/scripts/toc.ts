/**
 * Scrollspy for the right-rail "On this page" TOC: marks the link for the
 * last heading scrolled past the top of the viewport with aria-current, and
 * slides the rail's `.toc-indicator` onto that link along the rail itself,
 * curves included. Links work fine without this — it's a highlight only.
 */
const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-toc-link]")];
const indicator = document.querySelector<SVGSVGElement>(".toc-indicator");

if (links.length && indicator) {
  const headings = links.map((link) => document.getElementById(link.dataset.tocLink ?? ""));
  let active: HTMLAnchorElement | null = null;
  // A clicked link, held while its smooth scroll runs — otherwise the spy
  // would walk the indicator through every heading in between.
  let clicked: HTMLAnchorElement | null = null;
  let clickTimer = 0;

  const trace = indicator.querySelector("path")!;
  /** Where each link's stretch starts and ends, as a length along the trace. */
  let stretches: { start: number; end: number }[] = [];

  // Trace the rail as one path: each link's left border (its x, top to
  // bottom), joined to the next by the same S-curve the connectors draw when
  // the indent changes. Measure the path as it grows to get each stretch.
  const traceRail = () => {
    let d = "";
    let prev: { x: number; bottom: number } | null = null;
    stretches = links.map((link) => {
      const x = link.offsetLeft + 0.5;
      const top = link.offsetTop;
      const bottom = top + link.offsetHeight;
      if (!prev) d = `M ${x} ${top}`;
      else if (prev.x === x) d += ` L ${x} ${top}`;
      else {
        const mid = (prev.bottom + top) / 2;
        d += ` C ${prev.x} ${mid}, ${x} ${mid}, ${x} ${top}`;
      }
      trace.setAttribute("d", d);
      const start = trace.getTotalLength();
      d += ` L ${x} ${bottom}`;
      trace.setAttribute("d", d);
      prev = { x, bottom };
      return { start, end: trace.getTotalLength() };
    });
  };

  const placeIndicator = () => {
    if (!active) return;
    const { start, end } = stretches[links.indexOf(active)]!;
    trace.style.strokeDasharray = `${end - start} ${trace.getTotalLength()}`;
    trace.style.strokeDashoffset = String(-start);
  };

  const setActive = (link: HTMLAnchorElement) => {
    if (link === active) return;
    active?.removeAttribute("aria-current");
    link.setAttribute("aria-current", "true");
    active = link;
    placeIndicator();
    // The first placement lands without a glide from the list's top edge:
    // flush it (a layout read) before `data-ready` turns transitions on.
    if (!indicator.hasAttribute("data-ready")) {
      indicator.getBoundingClientRect();
      indicator.setAttribute("data-ready", "");
    }
  };

  // Active = the last heading at or above where a jump-to-heading parks it
  // (its scroll-margin-top). At the very bottom, headings too close to the end
  // can never scroll that high, so the last one wins.
  const headingAtTop = () => {
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) {
      return links[links.length - 1];
    }
    let index = 0;
    headings.forEach((heading, i) => {
      if (!heading) return;
      const parkLine = parseFloat(getComputedStyle(heading).scrollMarginTop) + 1;
      if (heading.getBoundingClientRect().top <= parkLine) index = i;
    });
    return links[index];
  };

  const spy = () => {
    const current = headingAtTop();
    if (clicked && current !== clicked) {
      // Still travelling to the clicked heading. If the scroll stops short
      // (page end, user took over), let the spy resume from the next scroll.
      clearTimeout(clickTimer);
      clickTimer = window.setTimeout(() => (clicked = null), 150);
      return;
    }
    clicked = null;
    setActive(current);
  };

  addEventListener("scroll", spy, { passive: true });
  for (const link of links) {
    link.addEventListener("click", () => {
      clicked = link;
      setActive(link);
    });
  }
  // Re-measure when the rail reflows (viewport resize, web fonts, the rail
  // reappearing after being hidden at narrow widths).
  new ResizeObserver(() => {
    traceRail();
    placeIndicator();
  }).observe(links[0].closest("ul")!);

  traceRail();
  spy();
}
