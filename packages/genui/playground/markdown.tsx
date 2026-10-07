/**
 * The little markdown a chat reply uses: paragraphs, line breaks, `-`, `*` and
 * `1.` lists, and `**bold**`. It builds React elements from text, so HTML in
 * a reply shows as text and never runs.
 */
import { Fragment, type ReactNode } from "react";

const BULLET = /^\s*[-*]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

interface Block {
  kind: "p" | "ul" | "ol";
  lines: string[];
}

function blocksOf(text: string): Block[] {
  const blocks: Block[] = [];
  let current: Block | undefined;
  for (const line of text.split("\n")) {
    const kind = BULLET.test(line) ? "ul" : NUMBERED.test(line) ? "ol" : line.trim() ? "p" : null;
    const content = line.replace(kind === "ul" ? BULLET : NUMBERED, "");
    if (!kind) current = undefined;
    else if (current?.kind === kind) current.lines.push(content);
    else blocks.push((current = { kind, lines: [content] }));
  }
  return blocks;
}

function inline(text: string): ReactNode[] {
  return text
    .trim()
    .split(/\*\*(.+?)\*\*/)
    .map((part, index) => (index % 2 ? <strong key={index}>{part}</strong> : part));
}

export function Markdown({ text }: { text: string }) {
  return blocksOf(text).map((block, index) => {
    if (block.kind === "p")
      return (
        <p key={index}>
          {block.lines.map((line, at) => (
            <Fragment key={at}>
              {at > 0 && <br />}
              {inline(line)}
            </Fragment>
          ))}
        </p>
      );
    const List = block.kind;
    return (
      <List key={index}>
        {block.lines.map((line, at) => (
          <li key={at}>{inline(line)}</li>
        ))}
      </List>
    );
  });
}
