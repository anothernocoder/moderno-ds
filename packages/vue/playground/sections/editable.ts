/**
 * Editable — Ark's editable machine: the text as a button named by the label
 * and its value, the hidden input named by the same label, the buttons'
 * names, a Field's ids and description, and a disabled text out of the tab
 * order must match both ways.
 */
import { h } from "vue";
import { Editable } from "../../src/editable.js";
import { Field } from "../../src/field.js";
import type { Section } from "../section.js";

const area = () => h(Editable.Area, {}, () => [h(Editable.Input), h(Editable.Preview)]);

const EditableSection: Section = () =>
  h("section", { "aria-label": "editable" }, [
    h(Editable.Root, { defaultValue: "Background" }, () => [
      h(Editable.Label, {}, () => "Layer name"),
      area(),
      h(Editable.Control, {}, () => [
        h(Editable.EditTrigger, {}, () => "Edit"),
        h(Editable.SubmitTrigger, {}, () => "Save"),
        h(Editable.CancelTrigger, {}, () => "Cancel"),
      ]),
    ]),
    h(Field.Root, {}, () => [
      h(Field.Label, {}, () => "Slide title"),
      h(Editable.Root, { size: "sm", placeholder: "Untitled" }, () => [area()]),
      h(Field.HelperText, {}, () => "Shown in the outline."),
    ]),
    h(Editable.Root, { size: "lg", defaultValue: "Track 1", disabled: true }, () => [
      h(Editable.Label, {}, () => "Track"),
      area(),
    ]),
  ]);

export default EditableSection;
