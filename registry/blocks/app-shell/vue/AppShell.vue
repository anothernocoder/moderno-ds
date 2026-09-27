<script setup lang="ts">
import { computed, ref } from "vue";
import { Alert, Avatar, Button, Drawer, Menu, Portal, Skeleton } from "@moderno-ui/vue";

interface AppShellNavItem {
  id: string;
  label: string;
  href: string;
  current?: boolean;
  disabled?: boolean;
}

interface AppShellUser {
  name: string;
  email: string;
  image?: string;
}

type AppShellUserAction = "profile" | "settings" | "sign-out";

const sampleNavigation: AppShellNavItem[] = [
  { id: "overview", label: "Overview", href: "/overview", current: true },
  { id: "transactions", label: "Transactions", href: "/transactions" },
  { id: "invoices", label: "Invoices", href: "/invoices" },
  { id: "customers", label: "Customers", href: "/customers" },
  { id: "settings", label: "Settings", href: "/settings" },
];

const sampleUser: AppShellUser = { name: "Ada Lovelace", email: "ada@acme.com" };

const props = withDefaults(
  defineProps<{
    brand?: string;
    heading?: string;
    navigation?: AppShellNavItem[];
    user?: AppShellUser;
    error?: string;
    loading?: boolean;
  }>(),
  {
    brand: "Acme",
    heading: "Overview",
    navigation: undefined,
    user: undefined,
    error: undefined,
    loading: false,
  },
);

const emit = defineEmits<{
  retry: [];
  userSelect: [action: AppShellUserAction];
}>();

const drawerOpen = ref(false);

const shownNavigation = computed(() => props.navigation ?? sampleNavigation);
const shownUser = computed(() => props.user ?? sampleUser);

const initials = computed(() =>
  shownUser.value.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join(""),
);
</script>

<template>
  <div class="@container moderno-block-app-shell text-foreground">
    <div class="grid min-h-full bg-background @md:grid-cols-[auto_minmax(0,1fr)]">
      <div class="hidden border-e border-border @md:flex @md:w-56 @md:flex-col @lg:w-64">
        <div class="flex h-14 shrink-0 items-center border-b border-border px-4">
          <p class="truncate text-ui-lg font-semibold">{{ brand }}</p>
        </div>
        <nav aria-label="Main" class="p-3">
          <ul class="m-0 grid list-none gap-1 p-0">
            <li v-for="item in shownNavigation" :key="item.id">
              <a
                :href="item.disabled ? undefined : item.href"
                :aria-current="item.current ? 'page' : undefined"
                :aria-disabled="item.disabled || undefined"
                class="flex h-9 items-center rounded-md px-3 text-ui-md text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                {{ item.label }}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div class="grid min-w-0 grid-rows-[auto_1fr]">
        <header class="flex h-14 items-center gap-3 border-b border-border px-4 @sm:px-6 @lg:px-8">
          <Drawer.Root v-model:open="drawerOpen" placement="left" lazy-mount unmount-on-exit>
            <Drawer.Trigger as-child>
              <Button type="button" variant="outline" size="sm" class="@md:hidden">Menu</Button>
            </Drawer.Trigger>
            <Portal>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content>
                  <Drawer.Title>{{ brand }}</Drawer.Title>
                  <Drawer.CloseTrigger aria-label="Close menu">×</Drawer.CloseTrigger>
                  <nav aria-label="Main">
                    <ul class="m-0 grid list-none gap-1 p-0">
                      <li v-for="item in shownNavigation" :key="item.id">
                        <a
                          :href="item.disabled ? undefined : item.href"
                          :aria-current="item.current ? 'page' : undefined"
                          :aria-disabled="item.disabled || undefined"
                          class="flex h-9 items-center rounded-md px-3 text-ui-md text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
                          @click="drawerOpen = false"
                        >
                          {{ item.label }}
                        </a>
                      </li>
                    </ul>
                  </nav>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>

          <h1 class="min-w-0 flex-1 truncate font-serif text-heading-sm">{{ heading }}</h1>

          <Menu.Root @select="(details) => emit('userSelect', details.value as AppShellUserAction)">
            <Menu.Trigger :aria-label="shownUser.name">
              <span class="@sm:hidden">{{ initials }}</span>
              <span class="hidden @sm:inline">{{ shownUser.name }}</span>
              <Menu.Indicator>▾</Menu.Indicator>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <div class="flex items-center gap-3 p-2">
                    <Avatar.Root size="sm">
                      <Avatar.Fallback>{{ initials }}</Avatar.Fallback>
                      <Avatar.Image
                        v-if="shownUser.image"
                        :src="shownUser.image"
                        :alt="shownUser.name"
                      />
                    </Avatar.Root>
                    <div class="grid min-w-0">
                      <span class="truncate text-ui-md font-medium">{{ shownUser.name }}</span>
                      <span class="truncate text-ui-sm text-muted-foreground">
                        {{ shownUser.email }}
                      </span>
                    </div>
                  </div>
                  <Menu.Separator />
                  <Menu.Item value="profile">Profile</Menu.Item>
                  <Menu.Item value="settings">Settings</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item value="sign-out">Sign out</Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </header>

        <main class="min-w-0 p-4 @sm:p-6 @lg:p-8">
          <Alert.Root v-if="error" variant="error">
            <Alert.Content>
              <Alert.Title>{{ error }}</Alert.Title>
              <Alert.Description>Your data is safe. Try again in a moment.</Alert.Description>
              <Alert.Action>
                <Button type="button" variant="outline" size="sm" @click="emit('retry')">
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
          <div
            v-else-if="loading"
            role="status"
            aria-busy="true"
            class="grid gap-4 @lg:grid-cols-3"
          >
            <span class="sr-only">Loading this page…</span>
            <Skeleton v-for="key in 3" :key="key" shape="rect" class="h-24 rounded-lg" />
          </div>
          <slot v-else>
            <div
              class="grid justify-items-center gap-1 rounded-lg border border-dashed border-border px-4 py-12 text-center"
            >
              <p class="text-body font-medium">Nothing here yet</p>
              <p class="text-ui-md text-muted-foreground">
                What you add to this page shows up here.
              </p>
            </div>
          </slot>
        </main>
      </div>
    </div>
  </div>
</template>
