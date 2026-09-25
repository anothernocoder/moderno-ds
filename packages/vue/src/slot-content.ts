import { Comment, Fragment, Text, type VNode } from "vue";

/**
 * Whether rendered slot vnodes hold anything visible.
 *
 * A slot is not empty just because it returned vnodes: `<template v-if>` that
 * is false leaves a `Comment` vnode, and whitespace leaves an empty `Text`
 * vnode. Neither should turn on an optional part.
 */
export function hasSlotContent(vnodes: VNode[] | undefined): boolean {
  return (vnodes ?? []).some((vnode) => {
    if (vnode.type === Comment) return false;
    if (vnode.type === Text) return String(vnode.children ?? "").trim() !== "";
    if (vnode.type === Fragment) return hasSlotContent(vnode.children as VNode[]);
    return true;
  });
}
