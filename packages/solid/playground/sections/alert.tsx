/**
 * Alert — CSS-only; the anatomy and the role resolved from the status
 * ("info" reports politely, "error" interrupts) reach the server, with and
 * without an action.
 */
import { Alert } from "../../src/alert.jsx";
import { Button } from "../../src/button.jsx";
import type { Section } from "../section.js";

const AlertSection: Section = () => (
  <section aria-label="alerts">
    <Alert.Root variant="info">
      <Alert.Icon>i</Alert.Icon>
      <Alert.Content>
        <Alert.Title>Heads up</Alert.Title>
        <Alert.Description>Your trial ends in three days.</Alert.Description>
        <Alert.Action>
          <Button size="sm" variant="outline">
            Manage plan
          </Button>
        </Alert.Action>
      </Alert.Content>
    </Alert.Root>
    <Alert.Root variant="error" size="sm">
      <Alert.Icon>!</Alert.Icon>
      <Alert.Content>
        <Alert.Title>Payment failed</Alert.Title>
        <Alert.Description>We could not charge your card.</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  </section>
);

export default AlertSection;
