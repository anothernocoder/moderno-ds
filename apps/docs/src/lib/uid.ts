/** Per-build incrementing id, for radio-group names that must be unique. */
let counter = 0;
export function uid(prefix = "u"): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
