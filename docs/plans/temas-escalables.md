# Moderno: temas escalables y Theme Builder

**Estado:** propuesta · 2026-10-22 · origen: [documento de trabajo](https://claude.ai/artifact/CpE98NUJSBFX96Szd4bgiN)

> Las fases de este plan (1–5) son propias de esta iniciativa y no corresponden a las fases de [`docs/brief.md`](../brief.md) ni a los PRDs de [`docs/prd/`](../prd/README.md).

## Resumen

Moderno pasa de "un tema = 30+ valores para slots fijos" a "un tema = 6 decisiones de estilo + unas semillas de color", sin cambiar cómo se ven `theme-moderno` ni `theme-contrast`.

Hoy no se puede hacer un tema como Periwinkle sin tocar componentes. Un solo `--radius` controla botones, chips, cards, inputs y drawer. Los inputs siempre son delineados. Un mismo slot `--primary` sirve de relleno y de texto accionable.

El plan tiene 6 pilares y un Theme Builder visual, en 5 fases. Al final, un tema nuevo toma horas, se edita sobre pantallas reales y puede nacer de screenshots con el skill [`ui-kit-from-screenshots`](https://github.com/anothernocoder/another-agent-skills/tree/main/my-own-skills/ui-kit-from-screenshots).

## Principios que no cambian

Cinco reglas sostienen todo el plan; cualquier decisión que choque con ellas se descarta.

- **Regla de oro intacta.** Los componentes no se editan: se tematizan con variables y varían con props.
- **Toda edición produce un token.** Un valor suelto es una excepción visible que el linter reporta.
- **Compatibilidad total.** Cada token nuevo apunta por defecto al que hoy se usa, así que los temas existentes se ven idénticos. Lo demuestra una prueba visual.
- **Una fuente por concepto y un archivo por componente** (ADR-0008 y ADR-0009). Lo nuevo se registra con archivos propios y `pnpm gen`.
- **Contraste AA en light y dark** para cada par nuevo de texto y fondo, verificado por `theme-compile`.

## Pilar 1 · Tokens por componente

Cada componente lee sus propios tokens, y estos apuntan por defecto al contrato. Así una marca cambia el aspecto de un componente sin tocar su CSS.

![Capas de tokens: paleta, contrato, tokens de componente y componentes; los ejes y los overrides escriben en la capa de componente](assets/capas-de-tokens.svg)

La cadena actual (paleta, contrato, componente) no cambia; solo se agrega la capa resaltada, que es donde escriben los ejes y los overrides.

```css
/* packages/core: defaults que encadenan al contrato */
[data-scope="field"] {
  --field-bg: var(--background);
  --field-border: var(--input);
  --field-radius: var(--radius-field);
}
[data-scope="field"][data-part="input"] {
  background: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
}

/* theme-periwinkle: input relleno, sin borde */
[data-brand="periwinkle"] {
  --field-bg: var(--muted);
  --field-border: transparent;
}
```

Cada componente declara sus tokens en el bloque de defaults de su `packages/core/src/styles/components/<slug>.css` y en su archivo de props-doc. `pnpm gen` arma la lista que usan el contrato, el Theme Builder y el agente.

## Pilar 2 · Radios por función

El único `--radius` se divide en cinco radios por función. Todos valen `var(--radius)` por defecto, así que un tema simple sigue definiendo un solo número.

| Token                       | Lo leen                                            | Periwinkle | theme-moderno | theme-contrast |
| --------------------------- | -------------------------------------------------- | ---------- | ------------- | -------------- |
| `--radius-control`          | button, chip, switch, toggle, segmented-control    | 9999px     | 0             | 0              |
| `--radius-field`            | field, select, combobox, number-input, date-picker | 12px       | 0             | 0              |
| `--radius-surface`          | card, callout, alert, popover, menu                | 12px       | 0             | 0              |
| `--radius-group`            | radio-group tile, contenedores de ajustes          | 16px       | 0             | 0              |
| `--radius-overlay`          | dialog, drawer (lado visible)                      | 40px       | 0             | 0              |
| `--radius-full` (ya existe) | badge, avatar, puntos de estado                    | 9999px     | 9999px        | 9999px         |

Los segmentos internos (el thumb del segmented-control, el ítem activo de un menú) usan `calc(<radio del padre> - <padding>)`, como hoy hace `segmented-control.css`.

## Pilar 3 · Ejes de estilo

Un tema elige una opción en cada uno de seis ejes, y cada opción es un preset de tokens de componente. Esto cubre la mayoría de las diferencias entre apps sin escribir CSS.

| Eje        | Opciones                               | Qué tokens fija                                          |
| ---------- | -------------------------------------- | -------------------------------------------------------- |
| `shape`    | sharp · soft · rounded · pill-controls | los cinco radios del pilar 2                             |
| `density`  | compact · regular · comfortable        | alto de controles, padding de cards y filas, `spacing-*` |
| `surfaces` | bordered · tonal · elevated            | borde de cards, pasos de superficie, `shadow-*` en cards |
| `fields`   | outlined · filled · underlined         | `--field-bg`, `--field-border`, borde inferior           |
| `emphasis` | solid · tinted · ink                   | relleno de `secondary`/`accent`, color de links y chips  |
| `type`     | compact · regular · display            | `text-*`, `leading-*`, `font-weight-*`                   |

Periwinkle en el `tokens.dtcg.json` del tema:

```json
"$extensions": { "style.moderno.theme": { "name": "theme-periwinkle", "brand": "periwinkle",
  "style": { "shape": "pill-controls", "density": "regular", "surfaces": "tonal",
             "fields": "filled", "emphasis": "tinted", "type": "regular" } } }
```

`theme-compile` resuelve los ejes al compilar y escribe los valores en `theme.css`. No hay atributos nuevos en tiempo de ejecución. Un token fijado a mano en el tema siempre gana sobre el preset del eje.

## Pilar 4 · Paleta desde semillas

Un tema da cinco o seis semillas y `theme-compile` genera todos los colores del contrato, con contraste AA garantizado. Los valores medidos a mano siguen siendo posibles como overrides.

1. **Semillas:** acento, tono y croma del neutro, tonos de éxito, advertencia, error e info.
2. **Escalas:** una escala OKLCH de 12 pasos por semilla, para light y para dark (estilo Radix).
3. **Asignación:** cada slot toma un paso fijo de su escala (`card` = neutro 1, `border` = neutro 6, `primary` = acento 9).
4. **Solucionador de contraste:** si un par `*-foreground` no llega a 4.5:1, mueve el paso hasta que pase y lo reporta.
5. **Overrides:** cualquier slot o token de componente se fija a mano y gana sobre lo generado.

```json
"palette": {
  "accent": "oklch(0.58 0.2 268)",
  "neutral": { "hue": 275, "chroma": 0.01 },
  "status": { "success": 150, "warning": 75, "danger": 15, "info": 250 },
  "overrides": { "dark.background": "oklch(0.2 0.01 275)" }
}
```

Esto resuelve los "dos azules" de Periwinkle: el generador produce un paso de acento para rellenos (`primary`) y otro para texto accionable (`--link`, token de componente), cada uno con su contraste verificado.

## Pilar 5 · Tema o componente nuevo

Si la anatomía es la misma, es tema; si la anatomía o el significado son nuevos, es componente. Esta regla decide cada caso que traiga una app nueva.

| Caso                                                                    | Solución                                                   | Ejemplo de Periwinkle                                       |
| ----------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Mismo componente, otro aspecto (radio, relleno, borde, densidad, color) | Eje o token de componente                                  | Inputs rellenos, botones en píldora                         |
| Mismo componente, un estado o variante que falta                        | Variante nueva en el recipe                                | Progress con dos segmentos, botón circular de solo ícono    |
| Anatomía o significado nuevos                                           | Primitivo nuevo                                            | Monto con centavos elevados, valor enmascarado con revelado |
| Composición de primitivos con un fin de producto                        | Bloque o pantalla del registry                             | Tarjeta de balance, lista de transacciones                  |
| Algo único de una marca que nada de lo anterior cubre                   | CSS en `@layer brand` dentro del tema, bajo `[data-brand]` | Gradiente del encabezado del gráfico                        |

La última fila es la vía de escape: se revisa en el PR y se usa poco.

## Pilar 6 · Conexiones con lo que ya existe

Nada de esto es un sistema aparte: extiende `theme-compile`, el registry, el agente MCP y el skill de screenshots.

- **`theme-compile`:** resuelve ejes y semillas y valida los tokens de componente (pares de contraste, que no haya literales). Sigue generando `theme.css` y el `DESIGN.md` de cada tema.
- **Contrato:** `contract.ts` gana los radios por función como slots extendidos. Los tokens de componente viven en un archivo por componente y `pnpm gen` publica la lista.
- **Registry:** un tema sigue siendo `registry/themes/<nombre>/` con `item.json`, `tokens.dtcg.json`, `theme.css` y `DESIGN.md`.
- **Agente (`packages/mcp`):** el manifiesto expone ejes y tokens de componente, para que un agente pueda tematizar sin leer CSS.
- **Skill `ui-kit-from-screenshots`:** un adaptador `kit.json → tokens.dtcg.json`. Los colores medidos van a `overrides`, los radios a `shape` y los inputs rellenos a `fields`.

Los tokens de componente viven solo en los estilos de `packages/core`. Los cuatro paquetes de framework no cambian, salvo sus pruebas.

## Theme Builder

El Theme Builder pasa de formulario a canvas. Seleccionas un componente en una pantalla real y un inspector flotante edita el token que lo controla, mostrando todo lo que cambia con él.

![Theme Builder: ejes a la izquierda, canvas con light y dark, inspector flotante a la derecha](assets/theme-builder.svg)

La selección se resuelve con los `data-scope` y `data-part` que ya tiene cada componente, así que un clic sabe qué componente y qué parte tocaste.

**La pantalla**

- **Izquierda, estilo global:** los seis ejes como selectores visuales y las semillas de paleta. Resuelven la mayor parte del tema sin abrir un componente.
- **Centro, canvas:** pantallas del registry (sign-in, checkout, app-shell, un dashboard) en artboards, con zoom y desplazamiento. Light y dark lado a lado, en marcos de teléfono, tablet y escritorio.
- **Derecha, inspector flotante:**
  - Qué está seleccionado y botones para forzar estados (hover, focus, error, disabled, seleccionado).
  - Propiedades agrupadas: relleno, borde, radio, tipografía, espaciado, sombra.
  - La cadena de herencia de cada propiedad, por ejemplo `fondo ← --field-bg ← --muted`.
  - Un selector de tokens; el valor propio es la excepción y queda marcado.
  - El alcance del cambio con contador: solo este componente, todos los controles o todo el tema. Al pasar el mouse, el canvas resalta lo que se afecta.
  - Contraste en vivo, con "Corregir" que mueve el paso de la escala hasta pasar AA.

**Interacciones**

- Hover: contorno y etiqueta con el token. Clic: el componente. Alt+clic: la parte. Doble clic en un texto: su estilo tipográfico.
- Barra deslizante que compara el tema base con tu versión.
- Deshacer, rehacer y un panel de cambios que funciona como diff legible.
- "Explorar variaciones": seis versiones de un eje o de la paleta en una grilla.

**Entradas y salidas**

- Entradas: un tema existente, un `kit.json` del skill, o un screenshot con cuentagotas que asigna colores a tokens.
- Salidas: `tokens.dtcg.json`, `theme.css` y `DESIGN.md` en vivo, y un botón "Abrir PR" que crea `registry/themes/<nombre>/`.

**Versiones**

1. **v1, inspector sobre el builder actual:** clic para seleccionar y panel con la cadena de tokens. La vista previa ya cambia en vivo porque el preset lee `var()`.
2. **v2, canvas:** artboards, ejes a la izquierda, forzado de estados, light y dark lado a lado. Necesita los tokens de componente.
3. **v3, importar y sugerir:** screenshot y `kit.json`, variaciones y PR desde la herramienta.

## Orden sugerido

Cinco fases, cada una con una puerta medible. No se empieza la siguiente sin pasar la puerta, con una excepción: el inspector v1 del Theme Builder no necesita los tokens de componente y puede avanzar en paralelo a la fase 2.

![Cinco fases, cada una con su entrega y su puerta para seguir](assets/fases.svg)

**Fase 1 · ADR y contrato**

- Entrega: ADR-0013 con la capa de tokens por componente, los radios por rol, los ejes resueltos al compilar y las semillas de paleta. En `contract.ts` entran como tokens opcionales con fallback al token actual.
- Terminado: ADR aprobado, y `pnpm theme:build` sigue generando theme-moderno idéntico.

**Fase 2 · Tokens por componente** (depende de la fase 1)

- Entrega: un ticket por componente (button, field, chip, card, segmented, drawer…). Cada uno añade sus tokens con fallback, por ejemplo `--button-radius: var(--radius-control, var(--radius))`.
- Terminado: los snapshots visuales y los checks de contraste de theme-moderno no cambian.

**Fase 3 · Ejes, paleta y Theme Builder v1** (depende de la fase 2; el inspector v1 puede empezar antes)

- Entrega: `theme-compile` lee `axes` y `seeds` de `tokens.dtcg.json`, genera las escalas OKLCH de 12 pasos y resuelve el contraste. El builder actual gana selección por `data-scope`/`data-part` y la cadena de tokens en el inspector.
- Terminado: un tema de prueba hecho solo con ejes y semillas, con 0 overrides de color manuales, pasa AA en light y dark.

**Fase 4 · Periwinkle** (depende de la fase 3)

- Entrega: `theme-periwinkle` definido con ejes y semillas, más los componentes que faltan para ese look (amount y blocks).
- Terminado: 10 overrides o menos fuera de los ejes, y el `DESIGN.md` generado pasa el linter.

**Fase 5 · Theme Builder v2/v3 y adaptador del skill** (depende de las fases 3 y 4)

- Entrega: canvas con artboards, forzado de estados y light/dark lado a lado; importar `kit.json` → `tokens.dtcg.json`; variaciones y "Abrir PR".
- Terminado: un tema nuevo pasa de screenshots a PR en menos de un día.

**Primeros tickets**

- [ ] Redactar el ADR de tokens por componente, radios por rol, ejes y semillas
- [ ] Añadir `--radius-control`, `--radius-field`, `--radius-surface`, `--radius-group` y `--radius-overlay` al contrato con fallback a `--radius`
- [ ] Tomar snapshots visuales de theme-moderno como línea base
- [ ] Tokens de componente para button y field, los dos que más varían entre temas
- [ ] Prototipo del inspector v1 sobre el builder actual
- [ ] Spike: escalas OKLCH y solver de contraste dentro de `theme-compile`

## Riesgos y decisiones abiertas

El mayor riesgo es que crezcan los tokens hasta que nadie entienda qué cambiar. Se controla con un tope por componente y nombres por función.

| Riesgo                                 | Mitigación                                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Demasiados tokens de componente        | De 3 a 8 por componente, nombrados por función (`--field-bg`), nunca por propiedad CSS suelta       |
| Los ejes no alcanzan para una marca    | Periwinkle como prueba: si necesita más de 10 overrides fuera de ejes, falta un eje                 |
| Regresiones visuales al migrar         | Un componente por ticket, con snapshots de `theme-moderno` y `theme-contrast` antes y después       |
| El generador cambia temas existentes   | `theme-moderno` y `theme-contrast` siguen con valores escritos a mano hasta que se decida migrarlos |
| Valores sueltos desde el Theme Builder | Cada edición produce un token; el valor propio queda marcado y el linter lo reporta                 |

**Decisiones por tomar:**

- [ ] ¿Los ejes se resuelven solo al compilar o también en tiempo de ejecución (para cambiar densidad desde la app)?
- [ ] ¿El Theme Builder vive en el sitio de docs (Astro) o como app aparte?
- [ ] ¿`theme-moderno` se reescribe con semillas o queda como tema escrito a mano?
- [ ] ¿Los nombres de los ejes y sus opciones se publican como API estable desde la primera versión?
