/**
 * The genui playground: an agentic chat. Each turn goes to the dev server's
 * `/api/chat` (vite.config.ts), assistant programs render with `<GenUI>`, and
 * a `@ToAssistant` action posts back into the thread as the next turn.
 * `pnpm --filter @moderno-ui/genui dev`; README.md has the real-mode env.
 *
 * The theme belongs to the page, not to `<GenUI>`: the toolbar only sets
 * `data-brand` and `.dark` on `<html>` (`?brand=contrast&mode=dark` on load).
 */
import { useEffect, useState, type FormEvent } from "react";
import {
  agUIAdapter,
  ChatProvider,
  useThread,
  type ChatLLM,
  type Message,
} from "@openuidev/react-headless";
import { Alert, Button, Card, Field } from "@moderno-ui/react";
import type { ChatMessage } from "../src/server.ts";
import { GenUI, type ActionEvent } from "../src/react.ts";
import { lastAttempt, splitAnswer } from "./answer.ts";

const SUGGESTIONS = ["Sales this month", "Confirm my order", "Hello"];

function textOf(message: Message): string {
  const { content } = message as { content?: unknown };
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map((part: { text?: string }) => part.text ?? "").join("");
}

/** The thread as `generateUI` reads it: user and assistant turns, without discarded attempts. */
function toChatMessages(messages: Message[]): ChatMessage[] {
  return messages.flatMap((message): ChatMessage[] =>
    message.role === "user" || message.role === "assistant"
      ? [{ role: message.role, content: lastAttempt(textOf(message)) }]
      : [],
  );
}

const llm: ChatLLM = {
  send: ({ messages, signal }) =>
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: toChatMessages(messages) }),
      signal,
    }),
  streamProtocol: agUIAdapter(),
};

function AssistantMessage({
  content,
  isStreaming,
  onAction,
}: {
  content: string;
  isStreaming: boolean;
  onAction: (event: ActionEvent) => void;
}) {
  const parts = splitAnswer(content);
  return parts.map((part, index) =>
    part.type === "text" ? (
      <p key={index}>{part.text.trim()}</p>
    ) : (
      <div key={index} className="widget">
        <GenUI
          response={part.text}
          isStreaming={isStreaming && index === parts.length - 1}
          onAction={onAction}
        />
      </div>
    ),
  );
}

function Composer({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };
  return (
    <form className="composer" onSubmit={submit}>
      <Field.Root>
        <Field.Input
          aria-label="Message"
          placeholder="Ask for sales this month…"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </Field.Root>
      <Button type="submit" variant="primary" disabled={disabled}>
        Send
      </Button>
    </form>
  );
}

function Thread() {
  const { messages, isRunning, processMessage, threadError } = useThread();
  const send = (text: string) => void processMessage({ role: "user", content: text });
  const onAction = (event: ActionEvent) => {
    if (event.type === "continue_conversation") send(event.humanFriendlyMessage);
  };

  return (
    <>
      <ol className="thread" aria-label="Thread" aria-live="polite">
        {messages.map((message, index) =>
          message.role === "user" ? (
            <li key={message.id} className="user">
              <Card.Root variant="muted" size="sm">
                <Card.Content>{textOf(message)}</Card.Content>
              </Card.Root>
            </li>
          ) : message.role === "assistant" ? (
            <li key={message.id} className="assistant">
              <AssistantMessage
                content={textOf(message)}
                isStreaming={isRunning && index === messages.length - 1}
                onAction={onAction}
              />
            </li>
          ) : null,
        )}
      </ol>
      {threadError && (
        <Alert.Root variant="error" size="sm">
          <Alert.Content>
            <Alert.Description>{threadError.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {messages.length === 0 && (
        <div className="suggestions">
          {SUGGESTIONS.map((suggestion) => (
            <Button key={suggestion} variant="outline" size="sm" onClick={() => send(suggestion)}>
              {suggestion}
            </Button>
          ))}
        </div>
      )}
      <Composer onSend={send} disabled={isRunning} />
    </>
  );
}

const html = document.documentElement;

export function App() {
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
      </nav>
      <ChatProvider llm={llm}>
        <Thread />
      </ChatProvider>
    </main>
  );
}
