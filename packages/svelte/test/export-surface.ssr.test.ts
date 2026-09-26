import { describeExportSurface } from "../../core/test/export-surface.ts";

describeExportSurface("@moderno-ui/svelte", new URL("../src/index.ts", import.meta.url));
