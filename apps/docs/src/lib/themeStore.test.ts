import { describe, expect, it } from "vitest";
import { defaultThemeState, encodeState } from "./theme.ts";
import { createThemeStore, THEME_STORAGE_KEY, type ThemeStorage } from "./themeStore.ts";

function memoryStorage(initial: Record<string, string> = {}): ThemeStorage & {
  data: Map<string, string>;
} {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

function harness(opts: { url?: string; storage?: ThemeStorage } = {}) {
  let href = opts.url ?? "https://moderno.style/en/theme-builder";
  const storage = opts.storage ?? memoryStorage();
  const store = createThemeStore({
    storage,
    url: () => href,
    replaceUrl: (next) => (href = next),
  });
  return { store, storage, url: () => href };
}

function namedState(name: string) {
  const state = defaultThemeState();
  state.name = name;
  return state;
}

describe("themeStore — hydration precedence", () => {
  it("returns the default state when nothing is shared or stored", () => {
    const { store } = harness();
    expect(store.hydrate()).toEqual(defaultThemeState());
  });

  it("prefers a shared ?t= link over this browser's stored theme", () => {
    const stored = memoryStorage({ [THEME_STORAGE_KEY]: encodeState(namedState("stored")) });
    const shared = encodeState(namedState("shared"));
    const { store } = harness({
      url: `https://moderno.style/en/theme-builder?t=${shared}`,
      storage: stored,
    });
    expect(store.hydrate().name).toBe("shared");
  });

  it("falls back to the stored theme when ?t= is malformed", () => {
    const stored = memoryStorage({ [THEME_STORAGE_KEY]: encodeState(namedState("stored")) });
    const { store } = harness({
      url: "https://moderno.style/en/theme-builder?t=not-base64!!",
      storage: stored,
    });
    expect(store.hydrate().name).toBe("stored");
  });

  it("falls back to the default when both sources are malformed", () => {
    const stored = memoryStorage({ [THEME_STORAGE_KEY]: "garbage" });
    const { store } = harness({
      url: "https://moderno.style/en/theme-builder?t=also-garbage!!",
      storage: stored,
    });
    expect(store.hydrate()).toEqual(defaultThemeState());
  });
});

describe("themeStore — persistence", () => {
  it("mirrors the state to storage and the URL", () => {
    const { store, storage, url } = harness();
    const state = namedState("acme");
    store.persist(state);
    const encoded = encodeState(state);
    expect((storage as ReturnType<typeof memoryStorage>).data.get(THEME_STORAGE_KEY)).toBe(
      encoded,
    );
    expect(new URL(url()).searchParams.get("t")).toBe(encoded);
  });

  it("preserves unrelated query params when rewriting the URL", () => {
    const { store, url } = harness({ url: "https://moderno.style/en/theme-builder?ref=readme" });
    store.persist(namedState("acme"));
    expect(new URL(url()).searchParams.get("ref")).toBe("readme");
  });

  it("still updates the URL when storage rejects the write (private mode)", () => {
    const throwing: ThemeStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    const { store, url } = harness({ storage: throwing });
    const state = namedState("acme");
    expect(() => store.persist(state)).not.toThrow();
    expect(new URL(url()).searchParams.get("t")).toBe(encodeState(state));
  });

  it("round-trips: what persist writes, hydrate reads back", () => {
    const { store, url } = harness();
    const state = namedState("round-trip");
    state.light.primary = "oklch(0.5 0.2 250)";
    store.persist(state);
    const next = harness({ url: url() });
    expect(next.store.hydrate()).toEqual(state);
  });
});
