/**
 * Runs a Zag machine from `packages/core/src/machines/` in vitest, with no
 * framework (ADR-0010). A machine's logic is tested here once; the four
 * framework suites only check that they bind it.
 *
 *     const run = runMachine(toolbar.machine, toolbar.connect, { orientation: "vertical" });
 *     await run.send({ type: "ITEM.FOCUS", value: "bold" });
 *     expect(run.state).toBe("focused");
 *     expect(run.api.getRootProps()["aria-orientation"]).toBe("vertical");
 */
import type { Machine, MachineSchema, Service } from "@zag-js/core";
import { createNormalizer, type NormalizeProps, type PropTypes } from "@zag-js/types";
import { VanillaMachine } from "@zag-js/vanilla";
import { onTestFinished } from "vitest";

/** A machine's connect function, as Zag's own packages write it. */
type Connect<T extends MachineSchema, Api> = (
  service: Service<T>,
  normalize: NormalizeProps<PropTypes>,
) => Api;

interface MachineRun<T extends MachineSchema, Api> {
  /** The connected API for the current state: the props a binding spreads on each part. */
  readonly api: Api;
  /** The current state, e.g. `"idle"`. */
  readonly state: T["state"];
  /** The current value of one context entry. */
  context<K extends keyof T["context"]>(key: K): T["context"][K];
  /** Sends an event and resolves once the machine has handled it. */
  send(event: T["event"]): Promise<void>;
  /** Merges new props over the current ones, as a binding does when its props change. */
  setProps(props: Partial<T["props"]>): void;
  /** Stops the machine: runs its exit actions and cleans up its effects. Runs once. */
  stop(): void;
}

/**
 * Leaves each prop as the connect wrote it (`onClick`, `aria-pressed`), so a
 * test reads the same names a binding spreads.
 */
const keepProps = createNormalizer((props) => props);

/**
 * Zag handles each event on a microtask, and an action may send another. A
 * timer fires only once every queued microtask has run, so waiting for one lets
 * the whole chain settle. The timer is taken before a test can fake timers, so
 * `vi.useFakeTimers()` does not stall a send.
 */
const realSetTimeout = globalThis.setTimeout;
const afterQueuedWork = () => new Promise<void>((resolve) => realSetTimeout(resolve, 0));

/**
 * Starts `machine` with `props` and returns a handle to drive it. The machine
 * stops when the test ends, so a test only calls `stop()` to check what
 * stopping does.
 */
export function runMachine<T extends MachineSchema, Api>(
  machine: Machine<T>,
  connect: Connect<T, Api>,
  props: Partial<T["props"]> = {},
): MachineRun<T, Api> {
  const service = new VanillaMachine(machine, props);
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    service.stop();
  };

  service.start();
  onTestFinished(stop);

  return {
    get api() {
      return connect(service.service, keepProps);
    },
    get state() {
      return service.state.get();
    },
    context: (key) => service.context.get(key),
    async send(event) {
      service.send(event);
      await afterQueuedWork();
    },
    setProps: (next) => service.updateProps(next),
    stop,
  };
}
