/**
 * Minimal OKLCH → sRGB conversion and WCAG contrast, enough to warn on
 * accessibility issues at compile time. No colour library: the theme contract
 * authors every value as `oklch(L C H[ / A])`, so we only parse that one form.
 */

export type Rgb = { r: number; g: number; b: number };

/** Parse an `oklch(L C H)` / `oklch(L C H / A)` string. Returns null if not OKLCH. */
export function parseOklch(value: string): { l: number; c: number; h: number } | null {
  const m = value.trim().match(/^oklch\(\s*([^)]+)\)$/i);
  if (!m) return null;
  const body = m[1]!.replace("/", " ");
  const parts = body.split(/\s+/).filter(Boolean);
  if (parts.length < 3) return null;
  const l = parsePercentOrNumber(parts[0]!, 1);
  const c = parsePercentOrNumber(parts[1]!, 0.4);
  const h = parseFloat(parts[2]!);
  if (![l, c, h].every(Number.isFinite)) return null;
  return { l, c, h };
}

function parsePercentOrNumber(token: string, percentBasis: number): number {
  if (token.endsWith("%")) return (parseFloat(token) / 100) * percentBasis;
  return parseFloat(token);
}

/** OKLCH → linear-light sRGB (unclamped channels clamped to [0,1]). */
export function oklchToLinearSrgb(l: number, c: number, h: number): Rgb {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const lc = l_ ** 3;
  const mc = m_ ** 3;
  const sc = s_ ** 3;

  return {
    r: clamp01(4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc),
    g: clamp01(-1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc),
    b: clamp01(-0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc),
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** WCAG 2.x relative luminance from linear-light sRGB. */
export function relativeLuminance(lin: Rgb): number {
  return 0.2126 * lin.r + 0.7152 * lin.g + 0.0722 * lin.b;
}

/** WCAG contrast ratio between two OKLCH colours. Alpha is ignored (treated opaque). */
export function contrastRatio(a: string, b: string): number {
  const ca = parseOklch(a);
  const cb = parseOklch(b);
  if (!ca || !cb) return NaN;
  const la = relativeLuminance(oklchToLinearSrgb(ca.l, ca.c, ca.h));
  const lb = relativeLuminance(oklchToLinearSrgb(cb.l, cb.c, cb.h));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}
