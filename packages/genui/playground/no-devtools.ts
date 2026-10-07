// react-lang auto-mounts OpenUI's devtools button in dev. At phone width it sits
// over the composer's Send button, so the playground claims the mount flag first.
// main.tsx imports this before anything that loads react-lang.
(globalThis as Record<symbol, unknown>)[Symbol.for("openui.devtools.autoMount")] = true;
