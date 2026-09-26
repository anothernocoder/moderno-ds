/**
 * Field — Ark's label/control ids, mounted at two sizes and over both controls
 * (input + textarea) so the recipe's `data-size` is proven to reach the server
 * too.
 */
import { Field } from "../../src/field.jsx";
import type { Section } from "../section.js";

const FieldSection: Section = () => (
  <section aria-label="fields">
    <Field.Root size="sm">
      <Field.Label>Email</Field.Label>
      <Field.Input placeholder="you@example.com" />
      <Field.HelperText>We never share it.</Field.HelperText>
      <Field.ErrorText>Email is required.</Field.ErrorText>
    </Field.Root>

    <Field.Root size="lg" invalid>
      <Field.Label>Bio</Field.Label>
      <Field.Textarea placeholder="Tell us about yourself" />
      <Field.HelperText>A short introduction.</Field.HelperText>
      <Field.ErrorText>Bio is required.</Field.ErrorText>
    </Field.Root>
  </section>
);

export default FieldSection;
