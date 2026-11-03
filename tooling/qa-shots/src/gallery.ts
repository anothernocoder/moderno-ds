/** Marks the part of a PR description this tool owns. A new run replaces it. */
const START = "<!-- qa-shots -->";
const END = "<!-- /qa-shots -->";

/** Markdown for the screenshots: one collapsed section per group, such as `fixtures`. */
export function renderGallery(
  shotsByGroup: Record<string, string[]>,
  urlOf: (group: string, file: string) => string,
): string {
  const sections = Object.entries(shotsByGroup).map(([group, files]) => {
    const shots = files.map((file) => `**${file}**\n\n![${file}](${urlOf(group, file)})`);
    return `<details>\n<summary>${group} (${files.length})</summary>\n\n${shots.join("\n\n")}\n\n</details>`;
  });
  return ["## QA screenshots", "For a human to look at. Not a gate.", ...sections].join("\n\n");
}

/** Puts the gallery in a PR description, replacing the previous one if there is one. */
export function withGallery(body: string, gallery: string): string {
  const section = `${START}\n${gallery}\n${END}`;
  const start = body.indexOf(START);
  const end = body.indexOf(END);
  if (start === -1 || end === -1) return `${body.trimEnd()}\n\n${section}\n`;
  return body.slice(0, start) + section + body.slice(end + END.length);
}
