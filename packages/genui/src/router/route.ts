// The Router: one System One call that picks the Surface and the primitives
// the LLM's Sub-library needs (CONTEXT.md, ADR-0011).
import { judge, type JudgeConfig, type Question } from "./judge.ts";

export type Surface = "text" | "widget" | "screen" | "dashboard";

export interface RouteOptions {
  judge: JudgeConfig;
  /** A component is picked when its Noul is at least this. Default 0.5. */
  threshold?: number;
  /** Below this Surface confidence the router does not prune. Default 0.5. */
  minConfidence?: number;
}

export interface Route {
  surface: Surface;
  /** Names of the components the LLM gets. */
  components: string[];
}

/** The part of an OpenUI `Library` the router reads. */
export interface RoutableLibrary {
  components: Record<string, { description: string }>;
}

const SURFACE_CRITERIA: Record<Surface, string> = {
  text: "A plain text reply answers it: a greeting, a short fact, an explanation. No UI.",
  widget:
    "One small piece of UI helps: a chart, a confirm card with buttons, an alert, a short form.",
  screen: "A full view with several sections helps, such as a settings page or a detail page.",
  dashboard:
    "Several metrics and charts side by side help, to monitor or compare data at a glance.",
};

const COMPONENT_KEY = "component:";

/**
 * Decides the Surface for `message` and which of `library`'s components help
 * answer it, in one `judge` call. State is `{ message, context }`.
 */
export async function route(
  message: string,
  context: unknown,
  library: RoutableLibrary,
  options: RouteOptions,
): Promise<Route> {
  const { threshold = 0.5, minConfidence = 0.5 } = options;
  const names = Object.keys(library.components);

  const questions: Record<string, Question> = {
    surface: {
      type: "choice",
      instructions: "What should the reply to `message` be, given `context`?",
      criteria: SURFACE_CRITERIA,
    },
  };
  for (const name of names) {
    questions[COMPONENT_KEY + name] = {
      type: "noul",
      instructions: `Would a ${name} — ${library.components[name]!.description} — help answer \`message\`?`,
    };
  }

  const answers = await judge(options.judge, { message, context }, questions);

  const surfaceAnswer = answers.surface;
  if (surfaceAnswer?.type !== "choice") throw new Error("System One returned no surface choice");
  const surface = surfaceAnswer.choice as Surface;
  if (surfaceAnswer.confidence < minConfidence) return { surface, components: names };
  if (surface === "text") return { surface, components: [] };

  const picked = names.filter((name) => {
    const answer = answers[COMPONENT_KEY + name];
    return answer?.type === "noul" && answer.noul >= threshold;
  });
  return { surface, components: picked.length > 0 ? picked : names };
}
