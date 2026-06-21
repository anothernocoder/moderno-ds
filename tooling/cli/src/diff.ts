/**
 * Minimal line-based unified diff (LCS). Enough for `moderno diff` to show what
 * changed between an installed file and the registry version — no dependency on
 * a diff library.
 */
export function unifiedDiff(
  oldStr: string,
  newStr: string,
  fromLabel = "installed",
  toLabel = "registry",
): string {
  const a = splitLines(oldStr);
  const b = splitLines(newStr);
  const lcs = lcsMatrix(a, b);

  const out: string[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push(`  ${a[i]}`);
      i++;
      j++;
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      out.push(`-${a[i]}`);
      i++;
    } else {
      out.push(`+${b[j]}`);
      j++;
    }
  }
  while (i < a.length) out.push(`-${a[i++]}`);
  while (j < b.length) out.push(`+${b[j++]}`);

  if (!out.some((l) => l.startsWith("-") || l.startsWith("+"))) return "";
  return `--- ${fromLabel}\n+++ ${toLabel}\n${out.join("\n")}\n`;
}

function splitLines(s: string): string[] {
  const lines = s.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function lcsMatrix(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  return dp;
}
