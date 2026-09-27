<script setup lang="ts">
import { computed } from "vue";
import { Alert, Avatar, Button, Indicator, Skeleton } from "@moderno-ui/vue";

interface PortfolioLink {
  id: string;
  label: string;
  href: string;
}

const sampleLinks: PortfolioLink[] = [
  { id: "email", label: "Email", href: "#" },
  { id: "linkedin", label: "LinkedIn", href: "#" },
  { id: "dribbble", label: "Dribbble", href: "#" },
  { id: "cv", label: "CV", href: "#" },
];

const props = withDefaults(
  defineProps<{
    name?: string;
    role?: string;
    bio?: string;
    initials?: string;
    avatarUrl?: string;
    availability?: string;
    links?: PortfolioLink[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    name: "Lena Ortiz",
    role: "Product designer in Lisbon",
    bio: "I design calm, useful software for small teams, from the first sketch to the shipped product. Ten years in, I still love the details.",
    initials: "LO",
    avatarUrl: undefined,
    availability: "Available for new projects",
    links: undefined,
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  retry: [];
}>();

const resolvedLinks = computed(() => props.links ?? sampleLinks);
const hasAvatar = computed(() => Boolean(props.initials || props.avatarUrl));
</script>

<template>
  <section class="@container moderno-block-portfolio-header text-foreground">
    <div class="px-4 py-12 @lg:py-20">
      <Alert.Root v-if="error" variant="error" class="mx-auto w-full max-w-md">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>
            The rest of the page still works. Try again in a moment.
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
      <div
        v-else-if="loading"
        role="status"
        aria-busy="true"
        class="mx-auto flex max-w-lg flex-col gap-6 @md:flex-row @md:gap-8"
      >
        <span class="sr-only">Loading the profile…</span>
        <Skeleton aria-hidden="true" shape="circle" class="w-12 self-start" />
        <div aria-hidden="true" class="grid flex-1 gap-6 @lg:gap-8">
          <Skeleton shape="text" class="w-48" />
          <div class="grid gap-3">
            <Skeleton shape="text" class="h-8 w-2/3 @md:h-10" />
            <Skeleton shape="text" class="w-1/2" />
            <Skeleton shape="text" class="w-full" />
            <Skeleton shape="text" class="w-3/4" />
          </div>
          <div class="flex gap-6">
            <Skeleton shape="text" class="w-12" />
            <Skeleton shape="text" class="w-16" />
            <Skeleton shape="text" class="w-16" />
          </div>
        </div>
      </div>
      <header v-else class="mx-auto flex w-fit max-w-lg flex-col gap-6 @md:flex-row @md:gap-8">
        <Avatar.Root v-if="hasAvatar" size="lg">
          <Avatar.Fallback>{{ initials }}</Avatar.Fallback>
          <Avatar.Image v-if="avatarUrl" :src="avatarUrl" alt="" />
        </Avatar.Root>

        <div class="grid min-w-0 flex-1 gap-6 @lg:gap-8">
          <Indicator v-if="availability" variant="success" class="justify-self-start">
            {{ availability }}
          </Indicator>

          <div class="grid gap-3">
            <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{{ name }}</h1>
            <p v-if="role" class="text-body font-medium @sm:text-body-lg">{{ role }}</p>
            <p v-if="bio" class="text-body text-pretty text-muted-foreground @sm:text-body-lg">
              {{ bio }}
            </p>
          </div>

          <nav v-if="resolvedLinks.length > 0" aria-label="Links">
            <ul class="flex flex-wrap gap-x-6 gap-y-2">
              <li v-for="link in resolvedLinks" :key="link.id">
                <a
                  class="rounded-sm text-ui-md font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                  :href="disabled ? undefined : link.href"
                  :role="disabled ? 'link' : undefined"
                  :aria-disabled="disabled || undefined"
                  >{{ link.label }}</a
                >
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </div>
  </section>
</template>
