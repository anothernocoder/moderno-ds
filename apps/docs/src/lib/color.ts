/**
 * OKLCH ⇄ sRGB hex, just enough to put a native `<input type="color">` next
 * to each Theme Builder slot. The contract authors every colour as
 * `oklch(L C H)`, but the browser picker only speaks `#rrggbb` — so the
 * picker's value is derived from the slot and a pick is written back as OKLCH.
 */

const OKLCH = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)(%?)\s+([\d.]+)(?:deg)?\s*(?:\/[^)]*)?\)$/i;

/** `oklch(L C H)` → `#rrggbb`, gamut-clamped. Null when the value is not OKLCH. */
export function oklchToHex(value: string): string | null {
  const m = value.trim().match(OKLCH);
  if (!m) return null;
  const l = m[2] ? parseFloat(m[1]!) / 100 : parseFloat(m[1]!);
  const c = m[4] ? (parseFloat(m[3]!) / 100) * 0.4 : parseFloat(m[3]!);
  const h = (parseFloat(m[5]!) * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const rgb = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return (
    "#" +
    rgb
      .map((v) => {
        const lin = Math.min(1, Math.max(0, v));
        const srgb = lin <= 0.0031308 ? 12.92 * lin : 1.055 * lin ** (1 / 2.4) - 0.055;
        return Math.round(srgb * 255)
          .toString(16)
          .padStart(2, "0");
      })
      .join("")
  );
}

/** `#rrggbb` → `oklch(L C H)` in the contract's 3-decimal style. */
export function hexToOklch(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.hypot(A, B);
  const round = (v: number, d: number) => Number(v.toFixed(d));

  // Achromatic: hue is meaningless, and the contract writes greys as `L 0 0`.
  if (C < 0.0005) return `oklch(${round(L, 3)} 0 0)`;
  const H = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return `oklch(${round(L, 3)} ${round(C, 3)} ${round(H, 1)})`;
}
