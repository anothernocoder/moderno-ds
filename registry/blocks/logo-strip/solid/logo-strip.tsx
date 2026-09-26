import { For, Show } from "solid-js";
import { Alert, Button, Skeleton } from "@moderno-ui/solid";

export type LogoStripMark = "circle" | "ring" | "square" | "triangle" | "diamond" | "hexagon";

export interface LogoStripLogo {
  id: string;
  name: string;
  mark: LogoStripMark;
  href: string;
}

const markPaths: Record<LogoStripMark, string> = {
  circle: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
  ring: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z",
  square: "M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z",
  triangle: "M12 2.5 22.5 20.5h-21Z",
  diamond: "M12 1.5 22.5 12 12 22.5 1.5 12Z",
  hexagon: "M12 1.5 21 6.75v10.5L12 22.5 3 17.25V6.75Z",
};

const sampleLogos: LogoStripLogo[] = [
  { id: "lumen", name: "Lumen", mark: "circle", href: "#" },
  { id: "arcline", name: "Arcline", mark: "triangle", href: "#" },
  { id: "keystone", name: "Keystone", mark: "square", href: "#" },
  { id: "orbit", name: "Orbit", mark: "ring", href: "#" },
  { id: "vertex", name: "Vertex", mark: "diamond", href: "#" },
  { id: "quanta", name: "Quanta", mark: "hexagon", href: "#" },
];

const placeholders = ["first", "second", "third", "fourth", "fifth", "sixth"];

export interface LogoStripProps {
  heading?: string;
  logos?: LogoStripLogo[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export function LogoStrip(props: LogoStripProps) {
  const heading = () => props.heading ?? "Trusted by finance teams at more than 2,000 companies";
  const logos = () => props.logos ?? sampleLogos;

  return (
    <section class="@container moderno-block-logo-strip text-foreground">
      <div class="grid gap-8 px-4 py-12 @lg:py-16">
        <h2 class="mx-auto max-w-md text-center text-ui-sm font-medium text-balance text-muted-foreground">
          {heading()}
        </h2>

        <Show
          when={!props.error}
          fallback={
            <Alert.Root variant="error" class="mx-auto w-full max-w-lg">
              <Alert.Content>
                <Alert.Title>{props.error}</Alert.Title>
                <Alert.Description>
                  The rest of the page still works. Try again in a moment.
                </Alert.Description>
                <Alert.Action>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={props.disabled}
                    onClick={props.onRetry}
                  >
                    Try again
                  </Button>
                </Alert.Action>
              </Alert.Content>
            </Alert.Root>
          }
        >
          <Show
            when={!props.loading}
            fallback={
              <div
                role="status"
                aria-busy="true"
                class="mx-auto grid w-full max-w-lg grid-cols-2 gap-x-6 gap-y-8 @sm:grid-cols-3 @lg:grid-cols-6"
              >
                <span class="sr-only">Loading logos…</span>
                <For each={placeholders}>
                  {() => (
                    <div aria-hidden="true" class="flex justify-center">
                      <Skeleton shape="text" class="w-2/3" />
                    </div>
                  )}
                </For>
              </div>
            }
          >
            <Show
              when={logos().length > 0}
              fallback={
                <p class="mx-auto w-full max-w-lg rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
                  No logos to show yet.
                </p>
              }
            >
              <ul class="mx-auto grid w-full max-w-lg grid-cols-2 gap-x-6 gap-y-8 @sm:grid-cols-3 @lg:grid-cols-6">
                <For each={logos()}>
                  {(logo) => (
                    <li class="flex justify-center">
                      <a
                        class="inline-flex items-center gap-1.5 rounded-sm text-ui-md font-semibold text-muted-foreground transition-colors not-aria-disabled:hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed @md:text-ui-lg"
                        href={props.disabled ? undefined : logo.href}
                        role={props.disabled ? "link" : undefined}
                        aria-disabled={props.disabled || undefined}
                      >
                        <svg
                          class="size-4 shrink-0 @md:size-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          fill-rule="evenodd"
                          aria-hidden="true"
                        >
                          <path d={markPaths[logo.mark]} />
                        </svg>
                        {logo.name}
                      </a>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </Show>
        </Show>
      </div>
    </section>
  );
}
