/**
 * RadioGroup — one native radio per item, each bound to its label and text by
 * Ark's ids; the checked item, the orientation and the disabled group must
 * reach the server.
 */
import { RadioGroup } from "../../src/radio-group.jsx";
import type { Section } from "../section.js";

const RadioGroupSection: Section = () => (
  <section aria-label="radio groups">
    <RadioGroup.Root defaultValue="standard">
      <RadioGroup.Label>Shipping</RadioGroup.Label>
      <RadioGroup.Item value="standard">
        <RadioGroup.ItemControl />
        <RadioGroup.ItemText>
          Standard
          <RadioGroup.ItemDescription>3–5 business days</RadioGroup.ItemDescription>
        </RadioGroup.ItemText>
        <RadioGroup.ItemHiddenInput />
      </RadioGroup.Item>
      <RadioGroup.Item value="express">
        <RadioGroup.ItemControl />
        <RadioGroup.ItemText>
          Express
          <RadioGroup.ItemDescription>1–2 business days</RadioGroup.ItemDescription>
        </RadioGroup.ItemText>
        <RadioGroup.ItemHiddenInput />
      </RadioGroup.Item>
    </RadioGroup.Root>
    <RadioGroup.Root size="sm" orientation="horizontal" disabled>
      <RadioGroup.Label>Billing</RadioGroup.Label>
      <RadioGroup.Item value="monthly">
        <RadioGroup.ItemControl />
        <RadioGroup.ItemText>Monthly</RadioGroup.ItemText>
        <RadioGroup.ItemHiddenInput />
      </RadioGroup.Item>
      <RadioGroup.Item value="yearly">
        <RadioGroup.ItemControl />
        <RadioGroup.ItemText>Yearly</RadioGroup.ItemText>
        <RadioGroup.ItemHiddenInput />
      </RadioGroup.Item>
    </RadioGroup.Root>
  </section>
);

export default RadioGroupSection;
