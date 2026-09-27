# Moderno

A design system for React, Vue, Svelte and Solid. The same components, with
the same look and behaviour, in all four frameworks. Components are published
on npm as `@moderno-ui/*`; blocks, screens, flows and themes are copied into
your project by the `moderno` CLI.

Docs: [moderno.style](https://moderno.style)

## Install

```sh
npm install @moderno-ui/react @moderno-ui/css
```

```ts
import "@moderno-ui/css";
import { Button } from "@moderno-ui/react";

<Button>Save changes</Button>;
```

Use `@moderno-ui/vue`, `@moderno-ui/svelte` or `@moderno-ui/solid` for the
other frameworks.

## Upgrading from 0.2.x

**0.3.0 and later is a different library from 0.2.x.** It is not an upgrade.
The 0.2.x packages came from an earlier repo, `anothernocoder/moderno`. From
0.3.0, `@moderno-ui/*` is built from this repo, and every component was
rewritten. 0.3.0 and 0.4.0 were published without this note.

There is no codemod. Plan a migration and move one screen at a time. Three
things changed:

1. **Components use Ark UI's anatomy.** 0.2.x used Zag.js directly. Now every
   interactive component is built on [Ark UI](https://ark-ui.com) and uses
   Ark's parts and names:

   | 0.2.x                             | 0.3+                                          |
   | --------------------------------- | --------------------------------------------- |
   | `Sheet`                           | `Drawer`, with `placement`                    |
   | `Toggle` as an on/off control     | `Switch` (`Toggle` is now a pressable button) |
   | `Radio`                           | `RadioGroup`                                  |
   | `Input` with its label and errors | `Field` with `Field.Label`, `Field.Input`, …  |
   | one component per element         | parts: `Dialog.Root`, `Dialog.Trigger`, …     |

2. **`--md-*` variables became the token contract.** Themes no longer set
   `--md-*` variables or use `[data-theme]`. They set the contract's semantic
   slots (`--background`, `--primary`, `--border`, …), and dark mode is the
   `.dark` class. See [CONTRACT.md](CONTRACT.md) for the slots and rules.

3. **Packages moved.**

   | 0.2.x package                | Use instead               |
   | ---------------------------- | ------------------------- |
   | `@moderno-ui/tokens`         | `@moderno-ui/css`         |
   | `@moderno-ui/styles`         | `@moderno-ui/css`         |
   | `@moderno-ui/class-contract` | `@moderno-ui/core`        |
   | `@moderno-ui/chart-core`     | `@moderno-ui/charts-core` |
   | `@moderno-ui/registry`       | `@moderno-ui/cli`         |
   | `create-moderno-ui`          | `@moderno-ui/cli`         |

## Contributing

Start with [CONTEXT.md](CONTEXT.md) for the vocabulary and
[docs/adr](docs/adr) for the decisions. [CLAUDE.md](CLAUDE.md) has the rules
for adding or changing a component.
