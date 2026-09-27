/** The part of a document a zag machine may reach for while a server render is torn down. */
export interface ServerDocument {
  readonly nodeType: 9;
  getElementById(id: string): null;
}

/**
 * A document-shaped stand-in for the server, where there is no `document`.
 *
 * Zag's Solid and Svelte adapters run a machine's exit action when the server
 * render is torn down, and some exit actions reach for the document: the
 * Splitter's removes its resize-cursor stylesheet by id. Ark reads the
 * document from its environment, which defaults to the global `document`, so
 * on the server that action throws. A binding hands this stub to Ark's
 * `EnvironmentProvider` on the server instead: it holds no elements, so the
 * lookup finds nothing, as on a fresh page.
 */
export const serverDocument: ServerDocument = {
  nodeType: 9,
  getElementById: () => null,
};
