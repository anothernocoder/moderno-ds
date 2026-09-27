<script setup lang="ts">
import { computed, ref } from "vue";
import { Alert, Button, Drawer, Menu, Portal, Skeleton } from "@moderno-ui/vue";

interface HeaderLink {
  id: string;
  label: string;
  href: string;
  current?: boolean;
  disabled?: boolean;
}

interface HeaderMenu {
  id: string;
  label: string;
  links: HeaderLink[];
}

type HeaderNavItem = HeaderLink | HeaderMenu;

const sampleNavigation: HeaderNavItem[] = [
  {
    id: "product",
    label: "Product",
    links: [
      { id: "invoicing", label: "Invoicing", href: "/invoicing" },
      { id: "time-tracking", label: "Time tracking", href: "/time-tracking" },
      { id: "receipts", label: "Receipts", href: "/receipts" },
    ],
  },
  { id: "pricing", label: "Pricing", href: "/pricing" },
  { id: "customers", label: "Customers", href: "/customers" },
];

const placeholders = ["first", "second", "third"];

const props = withDefaults(
  defineProps<{
    brand?: string;
    homeHref?: string;
    navigation?: HeaderNavItem[];
    action?: string;
    error?: string;
    loading?: boolean;
  }>(),
  {
    brand: "Northwind",
    homeHref: "/",
    navigation: undefined,
    action: "Get started",
    error: undefined,
    loading: false,
  },
);

const emit = defineEmits<{
  action: [];
  retry: [];
}>();

const drawerOpen = ref(false);

const shownNavigation = computed(() => props.navigation ?? sampleNavigation);
const collapsible = computed(
  () => !props.error && (props.loading || shownNavigation.value.length > 0),
);

function isMenu(item: HeaderNavItem): item is HeaderMenu {
  return "links" in item;
}

function actFromDrawer() {
  drawerOpen.value = false;
  emit("action");
}
</script>

<template>
  <header
    class="@container moderno-block-header border-b border-border bg-background text-foreground"
  >
    <div class="flex h-16 items-center gap-4 px-4 @sm:px-6 @lg:gap-8 @lg:px-8">
      <a
        :href="homeHref"
        class="shrink-0 rounded-sm font-serif text-heading-sm text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {{ brand }}
      </a>

      <template v-if="collapsible">
        <div v-if="loading" class="hidden min-w-0 @md:flex">
          <div role="status" aria-busy="true" class="flex items-center gap-4 px-3">
            <span class="sr-only">Loading navigation…</span>
            <Skeleton
              v-for="key in placeholders"
              :key="key"
              aria-hidden="true"
              shape="text"
              class="w-16"
            />
          </div>
        </div>
        <nav v-else aria-label="Main" class="hidden min-w-0 @md:flex">
          <ul class="m-0 flex list-none items-center gap-1 p-0">
            <li v-for="item in shownNavigation" :key="item.id">
              <Menu.Root v-if="isMenu(item)">
                <Menu.Trigger
                  class="h-9 border-transparent bg-transparent font-normal text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                >
                  {{ item.label }}
                  <Menu.Indicator aria-hidden="true">▾</Menu.Indicator>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item
                        v-for="link in item.links"
                        :key="link.id"
                        :value="link.id"
                        :disabled="link.disabled"
                        as-child
                      >
                        <a :href="link.disabled ? undefined : link.href">{{ link.label }}</a>
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
              <a
                v-else
                :href="item.disabled ? undefined : item.href"
                :role="item.disabled ? 'link' : undefined"
                :aria-current="item.current ? 'page' : undefined"
                :aria-disabled="item.disabled || undefined"
                class="flex h-9 items-center rounded-md px-3 text-ui-md whitespace-nowrap text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                {{ item.label }}
              </a>
            </li>
          </ul>
        </nav>
      </template>

      <div class="ms-auto flex shrink-0 items-center gap-2">
        <Button
          v-if="action"
          type="button"
          size="sm"
          :class="collapsible ? 'hidden @sm:inline-flex' : undefined"
          @click="emit('action')"
        >
          {{ action }}
        </Button>

        <Drawer.Root
          v-if="collapsible"
          v-model:open="drawerOpen"
          placement="right"
          lazy-mount
          unmount-on-exit
        >
          <Drawer.Trigger as-child>
            <Button type="button" variant="outline" size="sm" class="@md:hidden">Menu</Button>
          </Drawer.Trigger>
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content>
                <Drawer.Title>{{ brand }}</Drawer.Title>
                <Drawer.CloseTrigger aria-label="Close menu">×</Drawer.CloseTrigger>
                <div
                  v-if="loading"
                  role="status"
                  aria-busy="true"
                  class="flex items-center gap-4 px-3"
                >
                  <span class="sr-only">Loading navigation…</span>
                  <Skeleton
                    v-for="key in placeholders"
                    :key="key"
                    aria-hidden="true"
                    shape="text"
                    class="w-16"
                  />
                </div>
                <nav v-else aria-label="Main">
                  <ul class="m-0 grid list-none gap-1 p-0">
                    <li v-for="item in shownNavigation" :key="item.id">
                      <template v-if="isMenu(item)">
                        <p class="px-3 pt-3 pb-1 text-ui-sm font-semibold text-muted-foreground">
                          {{ item.label }}
                        </p>
                        <ul class="m-0 ms-3 grid list-none gap-1 border-s border-border p-0 ps-2">
                          <li v-for="link in item.links" :key="link.id">
                            <a
                              :href="link.disabled ? undefined : link.href"
                              :role="link.disabled ? 'link' : undefined"
                              :aria-current="link.current ? 'page' : undefined"
                              :aria-disabled="link.disabled || undefined"
                              class="flex h-9 items-center rounded-md px-3 text-ui-md whitespace-nowrap text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
                              @click="drawerOpen = false"
                            >
                              {{ link.label }}
                            </a>
                          </li>
                        </ul>
                      </template>
                      <a
                        v-else
                        :href="item.disabled ? undefined : item.href"
                        :role="item.disabled ? 'link' : undefined"
                        :aria-current="item.current ? 'page' : undefined"
                        :aria-disabled="item.disabled || undefined"
                        class="flex h-9 items-center rounded-md px-3 text-ui-md whitespace-nowrap text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        @click="drawerOpen = false"
                      >
                        {{ item.label }}
                      </a>
                    </li>
                  </ul>
                </nav>
                <Button v-if="action" type="button" class="w-full" @click="actFromDrawer">
                  {{ action }}
                </Button>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
      </div>
    </div>

    <div v-if="error" class="px-4 pb-4 @sm:px-6 @lg:px-8">
      <Alert.Root variant="error" size="sm">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>The rest of the page still works.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" @click="emit('retry')">
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    </div>
  </header>
</template>
