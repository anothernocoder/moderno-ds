<script setup lang="ts">
/**
 * ProfileSetup — the full-viewport profile setup screen: a photo you can
 * upload, then the profile fields, between a masthead and a footer. Copy it
 * into your project with `moderno add profile-setup-vue`; the block it composes
 * arrives with it, and every file is yours from that moment.
 *
 * Presentational: the screen owns the viewport and nothing else — no file
 * upload, no request, no router. It renders the photo, errors and busy states
 * it is handed and emits what the reader did: `avatarChange` with the file they
 * picked, `avatarRemove`, `submit` / `cancel` for the form and `navigate` for
 * every link it draws itself. Uploading the file, and passing its URL back as
 * `avatarSrc`, stays in the page that mounts this.
 *
 * The photo is not part of the form: picking a file is its own action, so the
 * page can upload it straight away and show the result before the reader
 * saves. The file input is hidden and the "Upload photo" button opens it, so
 * the control keeps the button's look and focus ring.
 *
 * Links carry an `href` and emit `navigate` with the destination and the click
 * event: a client router can `preventDefault()` — after reading `metaKey` to
 * leave a ctrl/cmd-click to the browser — while the markup still works without
 * JavaScript.
 *
 * The root is a `<div>`, not a `<main>`: most app shells already provide the
 * `main` landmark. If your route has none, make this element your `<main>`.
 *
 * Responsive to its container, not the viewport (ADR-0005). Full-viewport is a
 * *height* — `min-h-dvh` — and every width decision is read off the screen's own
 * `@container`: at `@sm` (--container-sm, 24rem) the masthead and the photo row
 * stop stacking; at `@md` (--container-md, 36rem) the title grows and the
 * footer stops stacking.
 *
 * States: `avatarSrc` shows the photo; without it the avatar shows `initials`,
 * or a person glyph when there are none. `avatarUploading` busies the upload
 * button, `avatarError` explains a rejected file. `error`, `errors`, `loading`
 * and `disabled` go to the form.
 *
 * Class strings are written out in full rather than shared through a variable:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
import { computed, ref, useId } from "vue";
import { Alert, Avatar, Button } from "@moderno-ui/vue";
import FormLayout from "@/components/blocks/FormLayout.vue";

type ProfileSetupDestination = "home" | "skip" | "privacy" | "terms";

const props = withDefaults(
  defineProps<{
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
    /** Where the wordmark points. */
    homeHref?: string;
    /** Where "Skip for now" points. */
    skipHref?: string;
    /** Where the privacy link points. */
    privacyHref?: string;
    /** Where the terms link points. */
    termsHref?: string;
  }>(),
  {
    avatarSrc: undefined,
    initials: undefined,
    avatarUploading: false,
    avatarError: undefined,
    error: undefined,
    errors: undefined,
    loading: false,
    disabled: false,
    homeHref: "#",
    skipHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

/**
 * `avatarChange` hands back the picked file (upload it, then pass its URL as
 * `avatarSrc`); `submit` is the native form event; `navigate` names the
 * destination of a link the screen draws itself with the click event that did
 * it, so the listener can `preventDefault()`.
 */
const emit = defineEmits<{
  avatarChange: [file: File, event: Event];
  avatarRemove: [event: MouseEvent];
  submit: [event: Event];
  cancel: [];
  navigate: [destination: ProfileSetupDestination, event: MouseEvent];
}>();

const hintId = `${useId()}-photo-hint`;
const fileInput = ref<HTMLInputElement | null>(null);
const photoInert = computed(() => props.avatarUploading || props.loading || props.disabled);

function handleFile(event: Event) {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (file) emit("avatarChange", file, event);
  // Clear the input so picking the same file again still reports it.
  input.value = "";
}
</script>

<template>
  <div class="@container moderno-screen-profile-setup min-h-dvh bg-background text-foreground">
    <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
      <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
        <a
          class="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :href="homeHref"
          @click="emit('navigate', 'home', $event)"
        >
          Moderno
        </a>
        <a
          class="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :href="skipHref"
          @click="emit('navigate', 'skip', $event)"
        >
          Skip for now
        </a>
      </header>

      <div class="mx-auto grid w-full max-w-3xl content-start gap-8">
        <div class="grid gap-1">
          <h1 class="text-heading-sm font-semibold tracking-tight @md:text-heading">
            Set up your profile
          </h1>
          <p class="text-ui-md text-muted-foreground">
            Add a photo and a few details so your teammates know who you are.
          </p>
        </div>

        <section class="grid gap-4">
          <div class="grid gap-1">
            <h2 class="text-body-lg font-semibold @md:text-heading-sm">Photo</h2>
            <p :id="hintId" class="text-ui-md text-muted-foreground">
              Shown next to your name. A square PNG or JPG works best.
            </p>
          </div>

          <div class="grid justify-items-start gap-4 @sm:flex @sm:items-center">
            <Avatar.Root size="lg">
              <Avatar.Fallback>
                <template v-if="initials">{{ initials }}</template>
                <svg
                  v-else
                  aria-hidden="true"
                  class="size-1/2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </Avatar.Fallback>
              <Avatar.Image v-if="avatarSrc" :src="avatarSrc" alt="" />
            </Avatar.Root>

            <div class="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                :disabled="photoInert"
                :aria-busy="avatarUploading"
                :aria-describedby="hintId"
                @click="fileInput?.click()"
              >
                <template v-if="avatarUploading">
                  <span
                    aria-hidden="true"
                    class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                  />
                  Uploading
                </template>
                <template v-else-if="avatarSrc">Change photo</template>
                <template v-else>Upload photo</template>
              </Button>
              <Button
                v-if="avatarSrc"
                type="button"
                variant="ghost"
                size="sm"
                :disabled="photoInert"
                @click="emit('avatarRemove', $event)"
              >
                Remove
              </Button>
            </div>
            <input
              ref="fileInput"
              class="sr-only"
              type="file"
              accept="image/png, image/jpeg"
              tabindex="-1"
              aria-hidden="true"
              :disabled="photoInert"
              @change="handleFile"
            />
          </div>

          <Alert.Root v-if="avatarError" variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{{ avatarError }}</Alert.Title>
            </Alert.Content>
          </Alert.Root>
        </section>

        <FormLayout
          :error="error"
          :errors="errors"
          :loading="loading"
          :disabled="disabled"
          @submit="emit('submit', $event)"
          @cancel="emit('cancel')"
        />
      </div>

      <footer
        class="grid gap-2 text-ui-md text-muted-foreground @md:flex @md:items-center @md:justify-between"
      >
        <p>© Moderno</p>
        <nav class="flex gap-4" aria-label="Legal">
          <a
            class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            :href="privacyHref"
            @click="emit('navigate', 'privacy', $event)"
          >
            Privacy
          </a>
          <a
            class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            :href="termsHref"
            @click="emit('navigate', 'terms', $event)"
          >
            Terms
          </a>
        </nav>
      </footer>
    </div>
  </div>
</template>
