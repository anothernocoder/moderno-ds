/**
 * Field — Ark's field: the label ↔ control ids come from `useId`, so they
 * must match across server and client. The second field's control is Field's
 * own Textarea part.
 */
import { h, type Component } from "vue";
import { Field } from "../../src/field.js";
import type { Section } from "../section.js";

const FieldSection: Section = () =>
  h("section", { "aria-label": "fields" }, [
    h(Field.Root as unknown as Component, { size: "sm" }, () => [
      h(Field.Label, {}, () => "Email"),
      h(Field.Input, { placeholder: "you@example.com" }),
      h(Field.HelperText, {}, () => "We never share it."),
      h(Field.ErrorText, {}, () => "Email is required."),
    ]),
    h(Field.Root as unknown as Component, { size: "lg", invalid: true }, () => [
      h(Field.Label, {}, () => "Bio"),
      h(Field.Textarea, { placeholder: "Tell us about yourself" }),
      h(Field.HelperText, {}, () => "A short introduction."),
      h(Field.ErrorText, {}, () => "Bio is required."),
    ]),
  ]);

export default FieldSection;
