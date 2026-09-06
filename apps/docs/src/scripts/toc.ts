/**
 * Scrollspy for the right-rail "On this page" TOC: marks the link for
 * whichever heading is currently nearest the top of the viewport with
 * aria-current. Links work fine without this — it's a highlight only.
 */
const links = document.querySelectorAll<HTMLAnchorElement>("[data-toc-link]");

if (links.length) {
  const headingEls = [...links]
    .map((link) => document.getElementById(link.dataset.tocLink ?? ""))
    .filter((el): el is HTMLElement => el !== null);

  const setActive = (slug: string | null) => {
    for (const link of links) {
      if (link.dataset.tocLink === slug) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length) setActive(visible[0].target.id);
    },
    // Treat the top ~30% of the viewport (below the sticky header) as the
    // "current section" band.
    { rootMargin: "-4.5rem 0px -70% 0px", threshold: 0 },
  );

  headingEls.forEach((el) => observer.observe(el));
}
