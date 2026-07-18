/**
 * Theme Builder persistence — the hydration and mirroring policy behind the
 * island. The policy lives here, behind `hydrate()`/`persist()`, with storage
 * and location injected so it is testable without a browser; the island stays
 * a thin view.
 *
 * Precedence: a shared link (`?t=`) wins over this browser's last edit, and a
 * malformed source falls through to the next one instead of discarding it —
 * a broken link still restores your work in progress.
 */
import { decodeState, defaultThemeState, encodeState, type ThemeState } from "./theme.ts";

/** The subset of Web Storage the store needs — injectable for tests. */
export interface ThemeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ThemeStoreDeps {
  storage: ThemeStorage;
  /** Read the current page URL. */
  url: () => string;
  /** Apply a rewritten URL without navigating (history.replaceState). */
  replaceUrl: (url: string) => void;
}

export const THEME_STORAGE_KEY = "moderno-theme";

export interface ThemeStore {
  /** Resolve the initial editor state: `?t=`, then storage, then the default. */
  hydrate(): ThemeState;
  /** Mirror the state to storage and the shareable `?t=` URL. */
  persist(state: ThemeState): void;
}

export function createThemeStore(deps: ThemeStoreDeps): ThemeStore {
  return {
    hydrate() {
      const param = new URL(deps.url()).searchParams.get("t");
      for (const candidate of [param, safeGet(deps.storage)]) {
        if (!candidate) continue;
        const decoded = decodeState(candidate);
        if (decoded) return decoded;
      }
      return defaultThemeState();
    },
    persist(state) {
      const encoded = encodeState(state);
      try {
        deps.storage.setItem(THEME_STORAGE_KEY, encoded);
      } catch {
        // Storage full or blocked (private mode) — the URL still carries the theme.
      }
      const url = new URL(deps.url());
      url.searchParams.set("t", encoded);
      deps.replaceUrl(url.toString());
    },
  };
}

function safeGet(storage: ThemeStorage): string | null {
  try {
    return storage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}
