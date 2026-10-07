// One chat turn in, a validated OpenUI Lang stream out: the Router picks the
// Surface, components and Blocks, the LLM writes against the Sub-library under
// the UI rules, and a program that is invalid or fails the usability lint gets
// one retry before the turn falls back to text (ADR-0011, ADR-0012).
import {
  createStreamingParser,
  type ElementNode,
  type ValidationError,
} from "@openuidev/lang-core";
import type { AgentComponent, ComponentsManifest, ContractManifest } from "@moderno-ui/lint-core";
import { blockExample, submitsForm } from "../library/blocks.ts";
import { fromManifest } from "../library/from-manifest.ts";
import { createSubLibrary } from "../library/sub-library.ts";
import type { JudgeConfig } from "../router/judge.ts";
import { route } from "../router/route.ts";
import { checkUsability, UI_RULES, type UsabilityError } from "./usability.ts";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Streams the model's reply to `messages` under the `system` prompt. The host picks the provider. */
export type LLM = (system: string, messages: ChatMessage[]) => AsyncIterable<string>;

export interface GenerateUIOptions {
  message: string;
  /** The turns before `message`, oldest first. */
  context?: ChatMessage[];
  /** The System One server the Router asks. */
  judge: JudgeConfig;
  llm: LLM;
  /** The framework's `moderno.agent.json`: its primitives and Blocks are what the Router picks from. */
  manifest: ComponentsManifest;
  /** The names of the Blocks the host renders (`KpiCard`). Only these are offered; none by default. */
  blocks?: readonly string[];
  /** The contract manifest: the layouts' gap steps come from its spacing tokens. */
  contract: ContractManifest;
}

export type GenUIChunk =
  /** Chat text to show as it arrives. */
  | { type: "text"; text: string }
  /** The next piece of the OpenUI Lang program, without its fences. */
  | { type: "program"; text: string }
  /** Drop everything yielded so far this turn: the program was invalid or unusable, and a new answer follows. */
  | { type: "discard"; errors: ProgramError[] };

/** Why a program was discarded: the parser's validation errors, then the usability lint's. */
export type ProgramError = ValidationError | UsabilityError;

const TEXT_PROMPT = "Reply in plain text. Do not write code or UI.";
const FENCE = "```";
const PROGRAM_NOTE = "(UI shown)";

/** The primitives that place Blocks, besides `Stack` and `Grid`, which every Sub-library has. */
const BLOCK_PLACERS = ["Card"];

/** The rules a turn with Blocks adds to `UI_RULES`. */
function blockRules(formBlocks: string[]): string[] {
  return [
    "Use a Block when one fits. Compose primitives only for what no Block covers.",
    ...(formBlocks.length
      ? [
          `For a form, use ${formBlocks.join(" or ")} rather than composing Field, Select and NumberInput by hand. It has its own submit button: add no primary Button and leave its submit action out.`,
        ]
      : []),
  ];
}

/** Yields the text and program chunks of one LLM turn as they arrive. */
export async function* generateUI(options: GenerateUIOptions): AsyncGenerator<GenUIChunk> {
  const { message, context = [], judge, llm, manifest, contract, blocks = [] } = options;
  const messages: ChatMessage[] = [...context, { role: "user", content: message }];
  const offered = (manifest.blocks ?? []).filter((block) => blocks.includes(block.name));

  const picked = await route(message, withoutPrograms(context), manifest.components, {
    judge,
    blocks: offered,
  });
  if (picked.surface === "text") {
    yield* answerInText(llm, messages);
    return;
  }

  const library = createSubLibrary(fromManifest(manifest, contract, picked.blocks), [
    ...withAlternatives(picked.components, manifest.components),
    ...picked.blocks,
    ...(picked.blocks.length ? BLOCK_PLACERS : []),
  ]);
  const formBlocks = offered.filter(submitsForm).map((block) => block.name);
  const system = library.prompt({
    inlineMode: true,
    additionalRules: picked.blocks.length
      ? [...UI_RULES, ...blockRules(formBlocks.filter((name) => picked.blocks.includes(name)))]
      : UI_RULES,
    // OpenUI's own examples are replaced, so only a turn with Blocks passes any.
    examples: picked.blocks.length
      ? picked.blocks.map((name) => blockExample(library.components[name]!))
      : undefined,
  });
  const schema = library.toJSONSchema();
  const lint = (root: ElementNode | null) => checkUsability(root, new Set(formBlocks));

  const first = yield* streamProgram(llm(system, messages), schema, lint);
  if (first.errors.length === 0) return;
  yield { type: "discard", errors: first.errors };

  const retry = yield* streamProgram(
    llm(system, [
      ...messages,
      { role: "assistant", content: first.output },
      {
        role: "user",
        content: `The openui-lang program has these errors. Answer again with them fixed:\n${JSON.stringify(first.errors, null, 2)}`,
      },
    ]),
    schema,
    lint,
  );
  if (retry.errors.length === 0) return;
  yield { type: "discard", errors: retry.errors };
  yield* answerInText(llm, messages);
}

/**
 * The picked components plus the ones their `whenNotToUse` points to
 * (`Field` → "use Select"), so the model can follow that guidance: the router
 * picks a Field for a lottery, and the model still finds the Select.
 */
function withAlternatives(names: string[], components: AgentComponent[]): string[] {
  const known = new Set(components.map((component) => component.name));
  const alternatives = components
    .filter((component) => names.includes(component.name))
    .flatMap((component) => component.guidance?.whenNotToUse ?? [])
    // "Checkbox or Switch", "Radio Group": the names it mentions, spaces dropped.
    .flatMap(({ use }) => use.match(/[A-Z][a-z]+(?: [A-Z][a-z]+)*/g) ?? [])
    .map((name) => name.replace(/ /g, ""))
    .filter((name) => known.has(name));
  return [...new Set([...names, ...alternatives])];
}

/**
 * The chat with each program swapped for a short note. A program in the router's
 * state pulls a small model's judgment of the next message toward it.
 */
function withoutPrograms(context: ChatMessage[]): ChatMessage[] {
  const program = new RegExp(`${FENCE}[\\s\\S]*?(${FENCE}|$)`, "g");
  return context.map((turn) => ({ ...turn, content: turn.content.replace(program, PROGRAM_NOTE) }));
}

async function* answerInText(llm: LLM, messages: ChatMessage[]): AsyncGenerator<GenUIChunk> {
  for await (const text of llm(TEXT_PROMPT, messages)) yield { type: "text", text };
}

/** Streams one answer, feeding its program to the parser, and returns the finished program's errors and lint failures. */
async function* streamProgram(
  stream: AsyncIterable<string>,
  schema: Parameters<typeof createStreamingParser>[0],
  lint: (root: ElementNode | null) => UsabilityError[],
): AsyncGenerator<GenUIChunk, { output: string; errors: ProgramError[] }> {
  const parser = createStreamingParser(schema);
  let output = "";
  for await (const chunk of splitFences(stream, (text) => (output += text))) {
    if (chunk.type === "program") parser.push(chunk.text);
    yield chunk;
  }
  const { root, meta } = parser.getResult();
  return { output, errors: [...meta.errors, ...lint(root)] };
}

/**
 * Splits an inline-mode answer into chat text and the code inside its fences,
 * holding back a partial fence until the next chunk settles it. `onRaw` sees
 * every chunk as it came, fences included.
 */
// ponytail: a ``` inside an openui-lang string closes the fence early. Track
// string state if a model ever writes one.
async function* splitFences(
  stream: AsyncIterable<string>,
  onRaw: (text: string) => void,
): AsyncGenerator<Extract<GenUIChunk, { type: "text" | "program" }>> {
  let buffer = "";
  let inProgram = false;
  let inFenceTag = false;
  for await (const chunk of stream) {
    onRaw(chunk);
    buffer += chunk;
    for (;;) {
      if (inFenceTag) {
        const lineEnd = buffer.indexOf("\n");
        if (lineEnd < 0) break;
        buffer = buffer.slice(lineEnd + 1);
        inFenceTag = false;
        inProgram = true;
      }
      const fence = buffer.indexOf(FENCE);
      const end = fence >= 0 ? fence : buffer.length - trailingBackticks(buffer);
      if (end > 0) yield { type: inProgram ? "program" : "text", text: buffer.slice(0, end) };
      buffer = buffer.slice(end);
      if (fence < 0) break;
      buffer = buffer.slice(FENCE.length);
      if (inProgram) inProgram = false;
      else inFenceTag = true;
    }
  }
  if (buffer && !inFenceTag) yield { type: inProgram ? "program" : "text", text: buffer };
}

function trailingBackticks(text: string): number {
  if (text.endsWith("``")) return 2;
  return text.endsWith("`") ? 1 : 0;
}
