/** @jsxImportSource solid-js */
/**
 * Checkbox across its three states, its sizes and the disabled affordance —
 * @moderno-ui/solid, the same demo every framework's example shows.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { Checkbox } from "@moderno-ui/solid";

export function CheckboxDemo() {
  return (
    <>
      <div class="demo-row">
        <Checkbox.Root>
          <Checkbox.Control>
            <Checkbox.Indicator>✓</Checkbox.Indicator>
            <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>Unchecked</Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
        <Checkbox.Root defaultChecked>
          <Checkbox.Control>
            <Checkbox.Indicator>✓</Checkbox.Indicator>
            <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>Checked</Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
        <Checkbox.Root defaultChecked="indeterminate">
          <Checkbox.Control>
            <Checkbox.Indicator>✓</Checkbox.Indicator>
            <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>Indeterminate</Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
        <Checkbox.Root disabled defaultChecked>
          <Checkbox.Control>
            <Checkbox.Indicator>✓</Checkbox.Indicator>
            <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>Disabled</Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
      </div>
      <div class="demo-row">
        <Checkbox.Root size="sm" defaultChecked>
          <Checkbox.Control>
            <Checkbox.Indicator>✓</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>Small</Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
        <Checkbox.Root size="md" defaultChecked>
          <Checkbox.Control>
            <Checkbox.Indicator>✓</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>Medium</Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
        <Checkbox.Root size="lg" defaultChecked>
          <Checkbox.Control>
            <Checkbox.Indicator>✓</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>Large</Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
      </div>
    </>
  );
}
