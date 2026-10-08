// The Router: System One picks the Surface and the primitives and Blocks the
// LLM's Sub-library needs (CONTEXT.md, ADR-0011, ADR-0012). It asks the
// Surface and the kind of UI first, then one Noul for each of the few
// primitives that kind shortlists and for each Block the host renders.
import { rankComponents, type AgentComponent } from "@moderno-ui/lint-core";
import type { AgentBlock } from "../library/blocks.ts";
import { judge, type JudgeConfig, type Question } from "./judge.ts";

export type Surface = "text" | "widget" | "screen" | "dashboard";

export interface RouteOptions {
  judge: JudgeConfig;
  /** A component is picked when its Noul is at least this. Default 0.5. */
  threshold?: number;
  /** Below this confidence a `text` Surface is treated as UI; the LLM may still answer in text. Default 0.5. */
  minConfidence?: number;
  /** How many components get a Noul. Default 8. */
  shortlist?: number;
  /** The Blocks the host renders. Each gets a Noul; none by default. */
  blocks?: AgentBlock[];
}

export interface Route {
  surface: Surface;
  /** Names of the components the LLM gets. */
  components: string[];
  /** Names of the Blocks the LLM gets. */
  blocks: string[];
}

const SURFACE_CRITERIA: Record<Surface, string> = {
  text: "A plain text reply answers it: a greeting, a short fact, an explanation. No UI.",
  widget:
    "One small piece of UI helps: a chart, a confirm card with buttons, an alert, a short form.",
  screen: "A full view with several sections helps, such as a settings page or a detail page.",
  dashboard:
    "Several metrics and charts side by side help, to monitor or compare data at a glance.",
};

/**
 * What the UI mostly shows. System One reads the message in any language; the
 * English keywords then rank the components by their manifest guidance.
 */
const KINDS: Record<string, { criteria: string; keywords: string }> = {
  chart: {
    criteria:
      "Numbers to plot: sales, metrics, a trend, a comparison, a ranking, a share of a whole.",
    keywords: "chart card values",
  },
  form: {
    criteria: "Details to collect from the user: a sign-up, a booking, a search, settings.",
    keywords: "form field select checkbox date button",
  },
  confirm: {
    criteria: "Something to confirm or act on: an order, a payment, a booking, a delete.",
    keywords: "card button confirm dialog summary",
  },
  status: {
    criteria:
      "How something went or how far it has come: a success, an error, a warning, progress.",
    keywords: "alert status message toast progress callout",
  },
  content: {
    criteria:
      "Content to browse or read: sections, details, a gallery, a list, answers to questions.",
    keywords: "card content sections tabs accordion carousel list",
  },
  navigation: {
    criteria: "Ways to move around or reach actions: pages, a menu, a side panel.",
    keywords: "menu pagination navigation drawer pages",
  },
  creative: {
    criteria: "Values for a creative tool: a colour, an angle, a position, a file.",
    keywords: "creative colour angle position file",
  },
};

const COMPONENT_KEY = "component:";
const BLOCK_KEY = "block:";

const FIRST_QUESTIONS: Record<string, Question> = {
  surface: {
    type: "choice",
    instructions:
      "What should the reply to `message` be? `context` is the earlier chat: background only, judge `message`.",
    criteria: SURFACE_CRITERIA,
  },
  kind: {
    type: "choice",
    instructions: "If `message` got a UI answer, what would it mostly show?",
    criteria: Object.fromEntries(
      Object.entries(KINDS).map(([kind, { criteria }]) => [kind, criteria]),
    ),
  },
};

/**
 * Decides the Surface for `message` and which of `components` help answer it.
 * State is `{ context, message }`: `context` is the earlier chat, as background.
 */
export async function route(
  message: string,
  context: unknown,
  components: AgentComponent[],
  options: RouteOptions,
): Promise<Route> {
  const { threshold = 0.5, minConfidence = 0.5, shortlist = 8, blocks = [] } = options;
  const state = { context, message };

  const first = await judge(options.judge, state, FIRST_QUESTIONS);
  const surfaceAnswer = first.surface;
  const kindAnswer = first.kind;
  if (surfaceAnswer?.type !== "choice" || kindAnswer?.type !== "choice")
    throw new Error("System One returned no surface or kind choice");
  if (surfaceAnswer.choice === "text" && surfaceAnswer.confidence >= minConfidence)
    return { surface: "text", components: [], blocks: [] };
  const surface = mostLikelyUI(surfaceAnswer.probabilities, surfaceAnswer.choice as Surface);

  const keywords = KINDS[kindAnswer.choice]?.keywords ?? "";
  const candidates = rankComponents(components, keywords)
    .slice(0, shortlist)
    .map(({ component }) => component.name);
  const questions: Record<string, Question> = {};
  for (const name of candidates) {
    questions[COMPONENT_KEY + name] = {
      type: "noul",
      instructions: `Does a ${name} help answer \`message\`?`,
    };
  }
  // ponytail: every offered Block gets a Noul. Shortlist them like the
  // primitives if hosts offer dozens.
  for (const block of blocks) {
    questions[BLOCK_KEY + block.name] = {
      type: "noul",
      instructions: `Does the ready-made ${block.name} block show what \`message\` asks for, or a part of it? ${block.guidance?.intent ?? block.description}`,
      criteria: {
        true: "It fits: a ready-made block beats building the same thing from smaller components.",
      },
    };
  }
  const nouls = await judge(options.judge, state, questions);

  const passes = (key: string) => {
    const answer = nouls[key];
    return answer?.type === "noul" && answer.noul >= threshold;
  };
  const picked = candidates.filter((name) => passes(COMPONENT_KEY + name));
  const pickedBlocks = blocks.map((block) => block.name).filter((name) => passes(BLOCK_KEY + name));
  const nothingPicked = picked.length === 0 && pickedBlocks.length === 0;
  return {
    surface,
    components: nothingPicked ? components.map((component) => component.name) : picked,
    blocks: pickedBlocks,
  };
}

/** The chosen Surface, or the likeliest UI one when the choice is a doubtful `text`. */
function mostLikelyUI(probabilities: Record<string, number>, choice: Surface): Surface {
  if (choice !== "text") return choice;
  return (["widget", "screen", "dashboard"] as const).reduce((best, surface) =>
    (probabilities[surface] ?? 0) > (probabilities[best] ?? 0) ? surface : best,
  );
}
