/**
 * The native HTML/DOM attribute vocabulary `valid-props` must not flag.
 *
 * Why this exists: `moderno.agent.json`'s `props` is a *docs* list, not a
 * complete one. `@moderno-ui/props-doc` keeps only props declared inside the
 * workspace and drops everything inherited from `node_modules` — so a binding
 * like `ButtonProps extends ComponentPropsWithRef<"button">` ships a manifest
 * whose props are just `size, variant`, even though the component really does
 * accept `disabled`, `type`, `form`, `title`, `tabIndex` and the rest. Treating
 * that list as exhaustive turns every real DOM attribute into a false
 * "Unknown prop" — the exact opposite of the hallucinated-API failure mode the
 * rule exists to catch.
 *
 * So the rule needs its own answer to "is this a real HTML attribute?", the
 * same way ESLint's `react/no-unknown-property` carries one. Names are listed
 * in their React (camelCase) spelling and matched case- and dash-insensitively,
 * so `tabIndex`/`tabindex`, `readOnly`/`readonly` and `acceptCharset`/
 * `accept-charset` all resolve to the same entry — one table for JSX and for
 * Vue/Svelte/Astro templates.
 *
 * The set is deliberately element-agnostic: the manifest records a component's
 * `scope` and `parts` but not which HTML element it renders, so there is no
 * way to tell that `<Button href>` is wrong while `<Link href>` is right. That
 * costs a few false negatives on attributes applied to the wrong element —
 * cheap, next to a false positive on `<Button disabled>`, which makes the rule
 * actively misleading.
 *
 * Deprecated presentational attributes (`color`, `bgcolor`, `align`, `border`,
 * `background`) are left out on purpose: nothing should be spreading them onto
 * a Moderno primitive, and keeping them out means `<Button color="red">` still
 * reads as the hallucination it is.
 */

const DOM_ATTRIBUTES: readonly string[] = [
  // Global attributes, on every element.
  "accessKey",
  "autoCapitalize",
  "autoCorrect",
  "autoFocus",
  "class",
  "className",
  "contentEditable",
  "dir",
  "draggable",
  "enterKeyHint",
  "hidden",
  "id",
  "inert",
  "inputMode",
  "is",
  "itemID",
  "itemProp",
  "itemRef",
  "itemScope",
  "itemType",
  "lang",
  "nonce",
  "popover",
  "role",
  "slot",
  "spellCheck",
  "style",
  "tabIndex",
  "title",
  "translate",

  // React's own element props, plus the polymorphic-element convention every
  // binding layer honours.
  "as",
  "children",
  "dangerouslySetInnerHTML",
  "defaultChecked",
  "defaultValue",
  "key",
  "ref",
  "suppressContentEditableWarning",
  "suppressHydrationWarning",

  // Forms and controls.
  "accept",
  "acceptCharset",
  "action",
  "autoComplete",
  "capture",
  "checked",
  "cols",
  "disabled",
  "encType",
  "for",
  "form",
  "formAction",
  "formEncType",
  "formMethod",
  "formNoValidate",
  "formTarget",
  "htmlFor",
  "label",
  "list",
  "max",
  "maxLength",
  "method",
  "min",
  "minLength",
  "multiple",
  "name",
  "noValidate",
  "pattern",
  "placeholder",
  "readOnly",
  "required",
  "rows",
  "selected",
  "size",
  "step",
  "type",
  "value",
  "wrap",

  // Links, embeds and media.
  "allow",
  "allowFullScreen",
  "alt",
  "async",
  "controls",
  "crossOrigin",
  "decoding",
  "defer",
  "download",
  "height",
  "href",
  "hrefLang",
  "integrity",
  "loading",
  "loop",
  "media",
  "muted",
  "autoPlay",
  "ping",
  "playsInline",
  "poster",
  "preload",
  "referrerPolicy",
  "rel",
  "sandbox",
  "sizes",
  "src",
  "srcDoc",
  "srcSet",
  "target",
  "useMap",
  "width",

  // Tables, lists and the remaining structural attributes.
  "cite",
  "colSpan",
  "dateTime",
  "headers",
  "high",
  "low",
  "open",
  "optimum",
  "popoverTarget",
  "popoverTargetAction",
  "reversed",
  "rowSpan",
  "scope",
  "span",
  "start",
];

/**
 * Case- and dash-insensitive lookup key, so one table serves JSX's camelCase
 * (`tabIndex`, `readOnly`) and markup's lowercase/kebab spelling
 * (`tabindex`, `readonly`, `accept-charset`).
 */
function lookupKey(name: string): string {
  return name.toLowerCase().replace(/-/g, "");
}

const DOM_ATTRIBUTE_KEYS = new Set(DOM_ATTRIBUTES.map(lookupKey));

/** True when `name` is a native HTML attribute in any framework's spelling. */
export function isDomAttribute(name: string): boolean {
  return DOM_ATTRIBUTE_KEYS.has(lookupKey(name));
}
