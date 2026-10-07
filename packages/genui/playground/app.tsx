/**
 * The genui playground: each fixed response streams into `<GenUI>` line by
 * line, the way an LLM would send it. `pnpm --filter @moderno-ui/genui dev`.
 *
 * The theme belongs to the page, not to `<GenUI>`: the toolbar only sets
 * `data-brand` and `.dark` on `<html>` (`?brand=contrast&mode=dark` on load).
 */
import { useEffect, useState } from "react";
import { Button } from "@moderno-ui/react";
import { GenUI, type ActionEvent } from "../src/react.ts";
import { examples, type Example } from "./examples.ts";

const LINE_DELAY_MS = 250;

/** The response so far, one more line per tick, from the start again when `run` changes. */
function useStreamedResponse(response: string, run: number) {
  const lines = response.split("\n");
  const [count, setCount] = useState(0);
  useEffect(() => setCount(0), [response, run]);
  useEffect(() => {
    if (count >= lines.length) return;
    const timer = setTimeout(() => setCount(count + 1), LINE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [count, lines.length]);
  return { partial: lines.slice(0, count).join("\n"), isStreaming: count < lines.length };
}

function StreamedExample({ example, run }: { example: Example; run: number }) {
  const { partial, isStreaming } = useStreamedResponse(example.response, run);
  const [action, setAction] = useState<ActionEvent | null>(null);
  return (
    <section aria-label={example.title}>
      <h2>{example.title}</h2>
      <div className="frame">
        <GenUI response={partial || null} isStreaming={isStreaming} onAction={setAction} />
      </div>
      {action && <output>Sent to the assistant: “{action.humanFriendlyMessage}”</output>}
    </section>
  );
}

const html = document.documentElement;

export function App() {
  const [run, setRun] = useState(0);
  const [contrast, setContrast] = useState(html.dataset.brand === "contrast");
  const [dark, setDark] = useState(html.classList.contains("dark"));

  useEffect(() => {
    if (contrast) html.dataset.brand = "contrast";
    else delete html.dataset.brand;
    html.classList.toggle("dark", dark);
  }, [contrast, dark]);

  return (
    <main>
      <nav aria-label="Theme">
        <Button variant="outline" size="sm" onClick={() => setContrast(!contrast)}>
          Theme: {contrast ? "contrast" : "moderno"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDark(!dark)}>
          Mode: {dark ? "dark" : "light"}
        </Button>
        <Button variant="primary" size="sm" onClick={() => setRun(run + 1)}>
          Replay stream
        </Button>
      </nav>
      {examples.map((example) => (
        <StreamedExample key={example.title} example={example} run={run} />
      ))}
    </main>
  );
}
