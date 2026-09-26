import { describeExportSurface } from "../../core/test/export-surface.ts";

describeExportSurface("@moderno-ui/react", new URL("../src/index.ts", import.meta.url));
