import { packageBarrel } from "../package-barrel.ts";

/**
 * `@moderno-ui/solid`'s entry point, from one export fragment per component.
 * `.tsx` because the package publishes it as source under the `solid` condition.
 */
export default packageBarrel("packages/solid", "index.tsx");
