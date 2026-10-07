import { GenUI } from "@moderno-ui/genui/react";
import type { GenUIChunk } from "@moderno-ui/genui/server";

// What generateUI yielded for "hello": text only, no program.
const chunks: GenUIChunk[] = [{ type: "text", text: "Hi! Ask me for sales this month." }];

export default function TextTurn() {
  const text = chunks.flatMap((chunk) => (chunk.type === "text" ? chunk.text : [])).join("");
  const program = chunks.flatMap((chunk) => (chunk.type === "program" ? chunk.text : [])).join("");
  return (
    <div>
      <p>{text}</p>
      <GenUI response={program || null} />
    </div>
  );
}
