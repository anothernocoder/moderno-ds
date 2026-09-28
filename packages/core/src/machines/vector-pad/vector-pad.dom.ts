import type { Scope } from "@zag-js/core";
import type { VectorPadPosition } from "./vector-pad.types.js";

export const getRootId = (scope: Scope) => scope.ids?.root ?? `vector-pad:${scope.id}`;
export const getLabelId = (scope: Scope) => scope.ids?.label ?? `vector-pad:${scope.id}:label`;
export const getControlId = (scope: Scope) =>
  scope.ids?.control ?? `vector-pad:${scope.id}:control`;
export const getThumbId = (scope: Scope) => scope.ids?.thumb ?? `vector-pad:${scope.id}:thumb`;

export const getControlEl = (scope: Scope) => scope.getById<HTMLElement>(getControlId(scope));
export const getThumbEl = (scope: Scope) => scope.getById<HTMLElement>(getThumbId(scope));

/** A point in the viewport, in px, as Zag's pointer helpers report it. */
export interface Point {
  x: number;
  y: number;
}

/** Where a point sits on the pad, as fractions of its box from the left and top edges. */
export function getPositionOnControl(controlEl: HTMLElement, point: Point): VectorPadPosition {
  const { left, top, width, height } = controlEl.getBoundingClientRect();
  return {
    left: width > 0 ? (point.x - left) / width : 0,
    top: height > 0 ? (point.y - top) / height : 0,
  };
}

/** How far a point is from the centre of an element, in px. */
export function getOffsetFromCentre(el: HTMLElement, point: Point): Point {
  const { left, top, width, height } = el.getBoundingClientRect();
  return { x: point.x - (left + width / 2), y: point.y - (top + height / 2) };
}
