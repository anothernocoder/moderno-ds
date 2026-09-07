---
status: accepted
---

# Responsive via container queries; three registry tiers (block, screen, flow)

Neither the predecessor nor this repo had any responsive behaviour beyond
`auto-fit` grids (zero `@media` rules in components or blocks). Absorbing 63
blocks and 17 screens (ADR-0004) is the moment to fix the policy, because it is
cheap to apply while writing them and expensive to retrofit across ~80 items.

## Decision

- **Blocks and screens respond to their container, not the viewport.** They use
  CSS container queries against `--container-sm|md|lg` slots in the extended
  contract (`@moderno-ui/tokens` defaults; themes may override). A block must
  look right in a sidebar, a modal or a full page without knowing which. Tailwind
  v4's `@container` utilities map directly onto this.
- **Viewport media queries are reserved for primitives that change shape on
  small screens** (a `Dialog` presented as a bottom `Drawer`, a `Menu` as a
  bottom sheet). There is no separate "mobile" component family.
- **The registry has three copy tiers above primitives:** `registry:block` (a
  page section), `registry:screen` (a full-viewport composition of blocks
  representing one state of a flow; presentational, no navigation state) and
  `registry:flow` (an ordered sequence of screens plus an example assembly that
  owns the navigation state). Composition is expressed with the existing
  `registryDependencies` field, so the CLI's `add`, `update` and `diff` work per
  item and shadcn tooling still understands the manifest; no `composes` field.
- **Icons:** blocks may depend on Lucide (declared as an item dependency, so the
  CLI installs it); primitives never depend on an icon set and take icons as
  children/slots. No first-party icon package.
- **Delivery order:** one flow (`auth`) is built end to end first (its
  primitives → blocks → screens → flow → docs → screenshots) to validate the
  tiers, container queries and the docs/agent pipeline before the horizontal
  primitive pass and the domain-by-domain block pass.

## Alternatives rejected

Viewport breakpoint tokens (`--breakpoint-*`) as the primary mechanism: the same
block renders differently depending on where it is mounted, which is exactly the
bug container queries exist to remove. Collapsing screens into "large blocks":
loses the ability to install `cart` without `checkout`, and a screen's contract
(receives data and callbacks, owns no navigation) is distinct enough to name.
A first-party icon package: unbounded maintenance for a single maintainer.
