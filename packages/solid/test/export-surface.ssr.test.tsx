import { describeExportSurface } from "../../core/test/export-surface.ts";

describeExportSurface("@moderno-ui/solid", new URL("../src/index.tsx", import.meta.url));
