import { createHash } from "node:crypto";

/** Content hash used to detect whether an installed file was edited locally. */
export function hashContent(content: string): string {
  return "sha256-" + createHash("sha256").update(content, "utf8").digest("hex");
}
