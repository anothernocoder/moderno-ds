<script setup lang="ts">
import Pricing from "@/components/blocks/Pricing.vue";

type PlanSelectDestination = "home" | "sales" | "privacy" | "terms";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  action: string;
  highlighted?: boolean;
  badge?: string;
}

withDefaults(
  defineProps<{
    /** The page's heading, the pricing block's title raised to `h1`. */
    title?: string;
    /** One or two sentences under the title; `""` hides them. */
    description?: string;
    /** The plans to choose from, in order. Leave it out for the block's samples; `[]` is the empty state. */
    plans?: PricingPlan[];
    /** Loading the plans failed: an error alert with a retry replaces them. */
    error?: string;
    /** The plans are on their way: placeholder cards in a busy region. */
    loading?: boolean;
    /** The plans stay on screen and every button is disabled. */
    disabled?: boolean;
    /** Where the wordmark points. */
    homeHref?: string;
    /** Where "Talk to sales" points. */
    salesHref?: string;
    /** Where the privacy link points. */
    privacyHref?: string;
    /** Where the terms link points. */
    termsHref?: string;
  }>(),
  {
    title: "Choose your plan",
    description:
      "Pick the plan that fits your team today. You can change it at any time from your workspace settings.",
    plans: undefined,
    error: undefined,
    loading: false,
    disabled: false,
    homeHref: "#",
    salesHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

/**
 * `select` carries the chosen plan's `id` and `retry` follows "Try again";
 * `navigate` names the destination a link the screen draws itself points at and
 * hands back the click event that did it, so the listener can `preventDefault()`.
 */
const emit = defineEmits<{
  select: [id: string];
  retry: [];
  navigate: [destination: PlanSelectDestination, event: MouseEvent];
}>();
</script>

<template>
  <div class="@container moderno-screen-plan-select min-h-dvh bg-background text-foreground">
    <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
      <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
        <a
          class="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :href="homeHref"
          @click="emit('navigate', 'home', $event)"
        >
          Moderno
        </a>
        <p class="text-ui-md text-muted-foreground">
          Need something bigger?
          <a
            class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            :href="salesHref"
            @click="emit('navigate', 'sales', $event)"
          >
            Talk to sales
          </a>
        </p>
      </header>

      <div class="grid content-center">
        <Pricing
          :title-level="1"
          :title="title"
          :description="description"
          :plans="plans"
          :error="error"
          :loading="loading"
          :disabled="disabled"
          @select="emit('select', $event)"
          @retry="emit('retry')"
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
