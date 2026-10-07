/**
 * The genui playground: an agentic chat. Each turn goes to the dev server's
 * `/api/chat` (vite.config.ts), assistant programs render with `<GenUI>`, and
 * a `@ToAssistant` action posts back into the thread as the next turn.
 * `pnpm --filter @moderno-ui/genui dev`; README.md has the real-mode env.
 *
 * The theme belongs to the page, not to `<GenUI>`: the toolbar only sets
 * `data-brand` and `.dark` on `<html>` (`?brand=contrast&mode=dark` on load).
 */
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  agUIAdapter,
  ChatProvider,
  useThread,
  type ChatLLM,
  type Message,
} from "@openuidev/react-headless";
import { Alert, Avatar, Button, Field, Spinner } from "@moderno-ui/react";
import type { ChatMessage } from "../src/server.ts";
import { GenUI, type ActionEvent, type OpenUIError } from "../src/react.ts";
import { lastAttempt, splitAnswer } from "./answer.ts";
import { Markdown } from "./markdown.tsx";

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
      <div key={index} className="text">
        <Markdown text={part.text} />
      </div>
    ) : (
      <Widget
        key={index}
        program={part.text}
        isStreaming={isStreaming && index === parts.length - 1}
        onAction={onAction}
      />
    ),
  );
}

/** A program, and an alert instead of a silent hole when part of it fails to render. */
function Widget({
  program,
  isStreaming,
  onAction,
}: {
  program: string;
  isStreaming: boolean;
  onAction: (event: ActionEvent) => void;
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const onError = (errors: OpenUIError[]) =>
    setFailed(errors.flatMap((error) => (error.code === "render-error" ? [error.message] : [])));
  return (
    <div className="widget">
      <GenUI response={program} isStreaming={isStreaming} onAction={onAction} onError={onError} />
      {failed.length > 0 && (
        <Alert.Root variant="error" size="sm">
          <Alert.Content>
            <Alert.Title>Part of this answer could not be shown</Alert.Title>
            <Alert.Description>{failed.join(" ")}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </div>
  );
}

/** One assistant column: the avatar mark, then the reply's text and widgets. */
function AssistantRow({ children }: { children: ReactNode }) {
  return (
    <li className="assistant">
      <Avatar.Root size="sm" aria-hidden="true">
        <Avatar.Fallback>AI</Avatar.Fallback>
      </Avatar.Root>
      <div className="reply">{children}</div>
    </li>
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
      <div>
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
      </div>
    </form>
  );
}

function Thread() {
  const { messages, isRunning, processMessage, threadError } = useThread();
  const send = (text: string) => void processMessage({ role: "user", content: text });
  const onAction = (event: ActionEvent) => {
    if (event.type === "continue_conversation") send(event.humanFriendlyMessage);
  };
  const last = messages.at(-1);
  const thinking = isRunning && !(last?.role === "assistant" && textOf(last).trim());

  // Keep the newest message in view as a turn starts and streams. The page
  // ends with the sticky composer, so its bottom shows the thread's last line.
  useEffect(() => {
    if (isRunning) window.scrollTo({ top: document.documentElement.scrollHeight });
  }, [messages, isRunning]);

  return (
    <>
      <ol className="thread" aria-label="Thread" aria-live="polite">
        {messages.map((message, index) =>
          message.role === "user" ? (
            <li key={message.id} className="user">
              {textOf(message)}
            </li>
          ) : message.role === "assistant" && textOf(message).trim() ? (
            <AssistantRow key={message.id}>
              <AssistantMessage
                content={textOf(message)}
                isStreaming={isRunning && index === messages.length - 1}
                onAction={onAction}
              />
            </AssistantRow>
          ) : null,
        )}
        {thinking && (
          <AssistantRow>
            <Spinner size="sm" label="Thinking" />
          </AssistantRow>
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
