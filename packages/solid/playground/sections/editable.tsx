/**
 * Editable — Ark's editable machine: the text as a button named by the label
 * and its value, the hidden input named by the same label, the buttons'
 * names, a Field's ids and description, and a disabled text out of the tab
 * order must reach the server.
 */
import { Editable } from "../../src/editable.jsx";
import { Field } from "../../src/field.jsx";
import type { Section } from "../section.js";

const EditableSection: Section = () => (
  <section aria-label="editable">
    <Editable.Root defaultValue="Background">
      <Editable.Label>Layer name</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
      <Editable.Control>
        <Editable.EditTrigger>Edit</Editable.EditTrigger>
        <Editable.SubmitTrigger>Save</Editable.SubmitTrigger>
        <Editable.CancelTrigger>Cancel</Editable.CancelTrigger>
      </Editable.Control>
    </Editable.Root>
    <Field.Root>
      <Field.Label>Slide title</Field.Label>
      <Editable.Root size="sm" placeholder="Untitled">
        <Editable.Area>
          <Editable.Input />
          <Editable.Preview />
        </Editable.Area>
      </Editable.Root>
      <Field.HelperText>Shown in the outline.</Field.HelperText>
    </Field.Root>
    <Editable.Root size="lg" defaultValue="Track 1" disabled>
      <Editable.Label>Track</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
  </section>
);

export default EditableSection;
