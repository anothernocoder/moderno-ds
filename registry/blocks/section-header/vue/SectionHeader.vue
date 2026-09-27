<script setup lang="ts">
import { computed } from "vue";
import { Alert, Badge, Button, Card, Skeleton } from "@moderno-ui/vue";

type SectionHeaderVariant = "page" | "section" | "card";

type SectionHeaderTone = "neutral" | "info" | "success" | "warning" | "error";

interface SectionHeaderCrumb {
  label: string;
  href?: string;
}

interface SectionHeaderStatus {
  label: string;
  tone?: SectionHeaderTone;
}

const sampleCrumbs: SectionHeaderCrumb[] = [
  { label: "Projects", href: "#" },
  { label: "Marketing", href: "#" },
  { label: "Q3 redesign" },
];

const sampleStatus: SectionHeaderStatus = { label: "Active", tone: "success" };

const sampleMeta = ["Due Oct 14", "Owned by Ada Lovelace"];

const headingTags = { page: "h1", section: "h2", card: "h3" } as const;

const props = withDefaults(
  defineProps<{
    variant?: SectionHeaderVariant;
    heading?: string;
    description?: string;
    breadcrumbs?: SectionHeaderCrumb[];
    status?: SectionHeaderStatus | null;
    meta?: string[];
    count?: number;
    primaryLabel?: string;
    secondaryLabel?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    variant: "page",
    heading: "Q3 redesign",
    description: "Refresh the marketing site and the onboarding flow before the October launch.",
    breadcrumbs: undefined,
    status: undefined,
    meta: undefined,
    count: undefined,
    primaryLabel: "New task",
    secondaryLabel: "Share",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  primaryAction: [];
  secondaryAction: [];
  retry: [];
}>();

// Not `withDefaults` factories: the SFC compiler rejects defaults that read a local const.
const resolvedCrumbs = computed(() => props.breadcrumbs ?? sampleCrumbs);
const resolvedStatus = computed(() => (props.status === undefined ? sampleStatus : props.status));
const resolvedMeta = computed(() => props.meta ?? sampleMeta);

const isPage = computed(() => props.variant === "page");
const inert = computed(() => props.disabled || props.loading || Boolean(props.error));
const showDetails = computed(() => !props.loading && !props.error);
const showCount = computed(() => showDetails.value && props.count !== undefined);
const showStatusLine = computed(
  () =>
    isPage.value &&
    showDetails.value &&
    (resolvedStatus.value !== null || resolvedMeta.value.length > 0),
);
</script>

<template>
  <component
    :is="variant === 'card' ? 'div' : 'header'"
    class="@container moderno-block-section-header text-foreground"
    :data-variant="variant"
  >
    <component
      :is="variant === 'card' ? Card.Root : 'div'"
      :class="variant === 'section' ? 'border-b border-border pb-4' : undefined"
    >
      <component :is="variant === 'card' ? Card.Header : 'div'">
        <div class="grid gap-3">
          <nav v-if="isPage && resolvedCrumbs.length > 0" aria-label="Breadcrumb">
            <ol class="flex flex-wrap items-center gap-2 text-ui-sm text-muted-foreground">
              <li
                v-for="(crumb, index) in resolvedCrumbs"
                :key="index"
                :class="
                  index === resolvedCrumbs.length - 2
                    ? 'flex items-center gap-2'
                    : 'hidden items-center gap-2 @sm:flex'
                "
              >
                <span
                  v-if="index === resolvedCrumbs.length - 2"
                  aria-hidden="true"
                  class="@sm:hidden"
                  >←</span
                >
                <span v-if="index > 0" aria-hidden="true" class="hidden @sm:inline">/</span>
                <a
                  v-if="crumb.href && index !== resolvedCrumbs.length - 1"
                  class="rounded-sm transition-colors hover:text-foreground hover:underline underline-offset-4 focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  :href="crumb.href"
                  >{{ crumb.label }}</a
                >
                <span
                  v-else
                  :aria-current="index === resolvedCrumbs.length - 1 ? 'page' : undefined"
                  class="font-medium text-foreground"
                  >{{ crumb.label }}</span
                >
              </li>
            </ol>
          </nav>

          <div class="grid gap-4 @sm:flex @sm:items-start @sm:justify-between @sm:gap-6">
            <div v-if="loading" role="status" aria-busy="true" class="grid min-w-0 flex-1 gap-2">
              <span class="sr-only">Loading…</span>
              <Skeleton shape="text" class="h-7 w-1/2 @md:h-8" />
              <Skeleton shape="text" class="w-3/4" />
              <Skeleton v-if="isPage" shape="text" class="w-1/3" />
            </div>
            <div v-else class="grid min-w-0 flex-1 gap-1">
              <component
                :is="headingTags[variant]"
                :class="
                  variant === 'page'
                    ? 'flex flex-wrap items-center gap-x-3 gap-y-1 font-serif text-heading-sm @md:text-heading @lg:text-heading-lg'
                    : variant === 'section'
                      ? 'flex flex-wrap items-center gap-x-3 gap-y-1 text-body-lg font-semibold @md:text-heading-sm'
                      : 'flex flex-wrap items-center gap-x-3 gap-y-1 text-body font-semibold'
                "
              >
                {{ heading }}
                <Badge v-if="showCount" variant="neutral" size="sm">{{ count }}</Badge>
              </component>
              <p v-if="description" class="text-ui-md text-muted-foreground @lg:text-body">
                {{ description }}
              </p>
              <ul
                v-if="showStatusLine"
                class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-ui-sm text-muted-foreground"
              >
                <li v-if="resolvedStatus" class="flex">
                  <Badge :variant="resolvedStatus.tone ?? 'neutral'" size="sm" dot>{{
                    resolvedStatus.label
                  }}</Badge>
                </li>
                <li v-for="(item, index) in resolvedMeta" :key="index">{{ item }}</li>
              </ul>
            </div>

            <div v-if="primaryLabel || secondaryLabel" class="flex gap-2 @sm:shrink-0">
              <Button
                v-if="secondaryLabel"
                type="button"
                variant="outline"
                :size="isPage ? 'md' : 'sm'"
                class="flex-1 @sm:flex-none"
                :disabled="inert || count === 0"
                @click="emit('secondaryAction')"
              >
                {{ secondaryLabel }}
              </Button>
              <Button
                v-if="primaryLabel"
                type="button"
                variant="primary"
                :size="isPage ? 'md' : 'sm'"
                class="flex-1 @sm:flex-none"
                :disabled="inert"
                @click="emit('primaryAction')"
              >
                {{ primaryLabel }}
              </Button>
            </div>
          </div>

          <Alert.Root v-if="error" variant="error">
            <Alert.Content>
              <Alert.Title>{{ error }}</Alert.Title>
              <Alert.Description>
                Only these details failed to load; nothing was lost.
              </Alert.Description>
              <Alert.Action>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  :disabled="disabled"
                  @click="emit('retry')"
                >
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        </div>
      </component>
      <Card.Content v-if="variant === 'card' && $slots.default">
        <slot />
      </Card.Content>
    </component>
  </component>
</template>
