/**
 * The manifests a consumer project would have installed, for suites that call
 * a tool against them: registers the suite's `beforeAll`/`afterAll` around a
 * throwaway consumer fixture and returns a getter for what `discoverManifests`
 * finds in it.
 */
import { afterAll, beforeAll } from "vitest";
import { discoverManifests, type AggregatedManifests } from "@moderno-ui/lint-core";
import {
  createConsumerFixture,
  type ConsumerFixture,
} from "../../../lint-core/test/helpers/consumer-fixture.ts";

export function useConsumerManifests(): () => AggregatedManifests {
  let fixture: ConsumerFixture;
  let manifests: AggregatedManifests;

  beforeAll(() => {
    fixture = createConsumerFixture();
    manifests = discoverManifests(fixture.dir);
  });

  afterAll(() => {
    fixture.cleanup();
  });

  return () => manifests;
}
