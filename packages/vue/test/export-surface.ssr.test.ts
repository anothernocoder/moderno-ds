import { describeExportSurface } from "../../core/test/export-surface.ts";

describeExportSurface("@moderno-ui/vue", new URL("../src/index.ts", import.meta.url));
