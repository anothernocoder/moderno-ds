import { useId, useRef } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { Alert, Avatar, Button } from "@moderno-ui/react";
import { FormLayout } from "@/components/blocks/form-layout";

/**
 * ProfileSetup — the full-viewport profile setup screen: a photo you can
 * upload, then the profile fields, between a masthead and a footer. Copy it
 * into your project with `moderno add profile-setup-react`; the block it
 * composes arrives with it, and every file is yours from that moment.
 *
 * **Presentational.** The screen owns the viewport and nothing else: no file
 * upload, no request, no router. It renders the photo, errors and busy states
 * it is handed and reports what the reader did — `onAvatarChange` with the
 * file they picked, `onAvatarRemove`, `onSubmit` / `onCancel` for the form and
 * `onNavigate` for every link it draws itself. Uploading the file, and passing
 * its URL back as `avatarSrc`, stays in the page that mounts this.
 *
 * The photo is not part of the form: picking a file is its own action, so the
 * page can upload it straight away and show the result before the reader
 * saves. The file input is hidden and the "Upload photo" button opens it, so
 * the control keeps the button's look and focus ring.
 *
 * Links carry an `href` and call `onNavigate(destination, event)` on top: a
 * client router can `preventDefault()` — after reading `metaKey` to leave a
 * ctrl/cmd-click to the browser — while the markup still works without
 * JavaScript.
 *
 * The root is a `<div>`, not a `<main>`: most app shells already provide the
 * `main` landmark. If your route has none, make this element your `<main>`.
 *
 * **Responsive to its container, not the viewport** (ADR-0005). Full-viewport
 * is a *height* — `min-h-dvh` — and every width decision is read off the
 * screen's own `@container`:
 *
 * - `@sm` (`--container-sm`, 24rem) — the masthead and the photo row stop
 *   stacking: the wordmark shares a row with "Skip for now", and the avatar
 *   sits beside its buttons.
 * - `@md` (`--container-md`, 36rem) — the title grows and the footer stops
 *   stacking.
 *
 * **States.** `avatarSrc` shows the photo; without it the avatar shows
 * `initials`, or a person glyph when there are none. `avatarUploading` busies
 * the upload button, `avatarError` explains a rejected file. `error`,
 * `errors`, `loading` and `disabled` go to the form.
 *
 * Class strings are written out in full rather than shared through a constant:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export type ProfileSetupDestination = "home" | "skip" | "privacy" | "terms";

export interface ProfileSetupProps {
  /** URL of the current profile photo. Without it the avatar shows `initials`. */
  avatarSrc?: string;
  /** Up to two letters shown when there is no photo, like `"AL"`. */
  initials?: string;
  /** A picked photo is uploading: the photo buttons are inert, upload reads busy. */
  avatarUploading?: boolean;
  /** The photo was rejected (too large, wrong type). Shown under the photo. */
  avatarError?: string;
  /** Saving failed. Raises the form-level alert. */
  error?: string;
  /** Field errors keyed by name: `fullName`, `email`, `about`. */
  errors?: Record<string, string>;
  /** The save is in flight: every control is inert and the save button reads busy. */
  loading?: boolean;
  /** The profile cannot be edited right now. */
  disabled?: boolean;
  /** The reader picked a photo. Upload `file`, then pass its URL as `avatarSrc`. */
  onAvatarChange?: (file: File, event: ChangeEvent<HTMLInputElement>) => void;
  /** The reader asked to remove the current photo. */
  onAvatarRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Native submit; call `event.preventDefault()` and read the form yourself. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** The form's Cancel button was pressed. */
  onCancel?: () => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (destination: ProfileSetupDestination, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "Skip for now" points. */
  skipHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function ProfileSetup({
  avatarSrc,
  initials,
  avatarUploading = false,
  avatarError,
  error,
  errors,
  loading = false,
  disabled = false,
  onAvatarChange,
  onAvatarRemove,
  onSubmit,
  onCancel,
  onNavigate,
  homeHref = "#",
  skipHref = "#",
  privacyHref = "#",
  termsHref = "#",
}: ProfileSetupProps) {
  const hintId = `${useId()}-photo-hint`;
  const fileInput = useRef<HTMLInputElement>(null);
  const photoInert = avatarUploading || loading || disabled;

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) onAvatarChange?.(file, event);
    // Clear the input so picking the same file again still reports it.
    event.currentTarget.value = "";
  }

  return (
    <div className="@container moderno-screen-profile-setup min-h-dvh bg-background text-foreground">
      <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
        <header className="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
          <a
            className="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={homeHref}
            onClick={(event) => onNavigate?.("home", event)}
          >
            Moderno
          </a>
          <a
            className="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={skipHref}
            onClick={(event) => onNavigate?.("skip", event)}
          >
            Skip for now
          </a>
        </header>

        <div className="mx-auto grid w-full max-w-3xl content-start gap-8">
          <div className="grid gap-1">
            <h1 className="text-heading-sm font-semibold tracking-tight @md:text-heading">
              Set up your profile
            </h1>
            <p className="text-ui-md text-muted-foreground">
              Add a photo and a few details so your teammates know who you are.
            </p>
          </div>

          <section className="grid gap-4">
            <div className="grid gap-1">
              <h2 className="text-body-lg font-semibold @md:text-heading-sm">Photo</h2>
              <p id={hintId} className="text-ui-md text-muted-foreground">
                Shown next to your name. A square PNG or JPG works best.
              </p>
            </div>

            <div className="grid justify-items-start gap-4 @sm:flex @sm:items-center">
              <Avatar.Root size="lg">
                <Avatar.Fallback>
                  {initials || (
                    <svg
                      aria-hidden="true"
                      className="size-1/2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21a8 8 0 0 1 16 0" />
                    </svg>
                  )}
                </Avatar.Fallback>
                {avatarSrc ? <Avatar.Image src={avatarSrc} alt="" /> : null}
              </Avatar.Root>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={photoInert}
                  aria-busy={avatarUploading}
                  aria-describedby={hintId}
                  onClick={() => fileInput.current?.click()}
                >
                  {avatarUploading ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                      />
                      Uploading
                    </>
                  ) : avatarSrc ? (
                    "Change photo"
                  ) : (
                    "Upload photo"
                  )}
                </Button>
                {avatarSrc ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={photoInert}
                    onClick={onAvatarRemove}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
              <input
                ref={fileInput}
                className="sr-only"
                type="file"
                accept="image/png, image/jpeg"
                tabIndex={-1}
                aria-hidden="true"
                disabled={photoInert}
                onChange={handleFile}
              />
            </div>

            {avatarError ? (
              <Alert.Root variant="error" size="sm">
                <Alert.Content>
                  <Alert.Title>{avatarError}</Alert.Title>
                </Alert.Content>
              </Alert.Root>
            ) : null}
          </section>

          <FormLayout
            error={error}
            errors={errors}
            loading={loading}
            disabled={disabled}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </div>

        <footer className="grid gap-2 text-ui-md text-muted-foreground @md:flex @md:items-center @md:justify-between">
          <p>© Moderno</p>
          <nav className="flex gap-4" aria-label="Legal">
            <a
              className="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={privacyHref}
              onClick={(event) => onNavigate?.("privacy", event)}
            >
              Privacy
            </a>
            <a
              className="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={termsHref}
              onClick={(event) => onNavigate?.("terms", event)}
            >
              Terms
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
