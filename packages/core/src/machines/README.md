# Machines

Behaviour Ark does not ship, written as Zag 1.x machines ([ADR-0010](../../../../docs/adr/0010-zag-machines-in-core-for-behaviour-ark-lacks.md)).

One folder per component, `machines/<slug>/`, with Zag's own file split:

```
machines/toolbar/
  toolbar.anatomy.ts   parts, from createAnatomy
  toolbar.types.ts     props, schema and the Api
  toolbar.machine.ts   createMachine(...)
  toolbar.connect.ts   connect(service, normalize)
  index.ts             re-exports the four
```

`pnpm gen` exports each folder from `@moderno-ui/core` as one namespace
(`toolbar.machine`, `toolbar.connect`). Test the machine once, in
`packages/core/test/machines/<slug>.test.ts`, with `runMachine` from
`packages/core/test/machine.ts`.
