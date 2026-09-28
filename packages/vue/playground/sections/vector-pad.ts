/**
 * VectorPad — Moderno's vector-pad machine: the handle reaches the server as
 * a slider named by its label that says both values, the root carries the
 * handle's place inline, and each field shows its axis's value.
 */
import { h } from "vue";
import { VectorPad } from "../../src/vector-pad.js";
import type { Section } from "../section.js";

const VectorPadSection: Section = () =>
  h("section", { "aria-label": "vector-pad" }, [
    h(VectorPad.Root, { defaultValue: { x: 20, y: -10 } }, () => [
      h(VectorPad.Label, {}, () => "Offset"),
      h(VectorPad.Control, {}, () => [
        h(VectorPad.Grid),
        h(VectorPad.Crosshair),
        h(VectorPad.Thumb),
      ]),
      h(VectorPad.Input, { axis: "x" }),
      h(VectorPad.Input, { axis: "y" }),
    ]),
    h(
      VectorPad.Root,
      { size: "sm", min: 0, max: { x: 100, y: 50 }, step: 5, invertY: true },
      () => [
        h(VectorPad.Label, {}, () => "Position"),
        h(VectorPad.Control, {}, () => h(VectorPad.Thumb)),
      ],
    ),
  ]);

export default VectorPadSection;
