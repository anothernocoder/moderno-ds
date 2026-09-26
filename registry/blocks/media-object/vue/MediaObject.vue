<script setup lang="ts">
import { useId } from "vue";
import { Alert, Avatar, Button, Skeleton } from "@moderno-ui/vue";

type MediaObjectPosition = "start" | "end";

withDefaults(
  defineProps<{
    heading?: string;
    meta?: string;
    body?: string;
    initials?: string;
    avatarUrl?: string;
    mediaPosition?: MediaObjectPosition;
    actionLabel?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    heading: "Ada Lovelace",
    meta: "Commented 2 hours ago",
    body: "The new onboarding reads well. Could we drop the second step? Most people skip it, and the first one already asks for the same details.",
    initials: "AL",
    avatarUrl: undefined,
    mediaPosition: "start",
    actionLabel: "Reply",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  action: [];
  retry: [];
}>();

const headingId = `${useId()}-heading`;
</script>

<template>
  <article class="@container moderno-block-media-object text-foreground">
    <div
      v-if="loading"
      role="status"
      aria-busy="true"
      :data-media-position="mediaPosition"
      class="flex flex-col items-start gap-3 @sm:flex-row @sm:gap-4 @sm:data-[media-position=end]:flex-row-reverse"
    >
      <span class="sr-only">Loading…</span>
      <Skeleton shape="circle" aria-hidden="true" class="w-10" />
      <div aria-hidden="true" class="grid w-full min-w-0 flex-1 gap-2">
        <Skeleton shape="text" class="w-1/3" />
        <Skeleton shape="text" />
        <Skeleton shape="text" class="w-2/3" />
      </div>
    </div>

    <div
      v-else
      :data-media-position="mediaPosition"
      class="flex flex-col items-start gap-3 @sm:flex-row @sm:gap-4 @sm:data-[media-position=end]:flex-row-reverse"
    >
      <Avatar.Root>
        <Avatar.Fallback>{{ initials }}</Avatar.Fallback>
        <Avatar.Image v-if="avatarUrl" :src="avatarUrl" alt="" />
      </Avatar.Root>

      <div class="grid w-full min-w-0 flex-1 gap-2">
        <header class="grid gap-0.5 @lg:flex @lg:items-baseline @lg:justify-between @lg:gap-4">
          <h3 :id="headingId" class="text-body font-semibold @md:text-body-lg">{{ heading }}</h3>
          <p v-if="meta" class="text-ui-sm text-muted-foreground @lg:shrink-0">{{ meta }}</p>
        </header>

        <Alert.Root v-if="error" variant="error">
          <Alert.Content>
            <Alert.Title>{{ error }}</Alert.Title>
            <Alert.Description>Only this message failed to load.</Alert.Description>
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
        <p v-else-if="body" class="text-ui-md @md:text-body">{{ body }}</p>
        <p v-else class="text-ui-md text-muted-foreground">Nothing written yet.</p>

        <div v-if="!error && actionLabel" class="flex">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            :disabled="disabled"
            :aria-describedby="headingId"
            @click="emit('action')"
          >
            {{ actionLabel }}
          </Button>
        </div>
      </div>
    </div>
  </article>
</template>
