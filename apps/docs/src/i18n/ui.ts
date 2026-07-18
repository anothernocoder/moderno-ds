/**
 * UI string tables. Page *content* lives in MDX (one file per locale); this
 * holds only chrome — nav, buttons, table headers, the Theme Builder labels.
 * Prop names and code identifiers are never translated (they are the real API);
 * only the surrounding labels are.
 */
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}

/** Resolve the active locale from Astro's i18n routing, with a safe fallback. */
export function currentLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/** `en/button` → `{ locale: "en", slug: "button" }`. */
export function splitId(id: string): { locale: Locale; slug: string } {
  const [first, ...rest] = id.split("/");
  const locale = first && isLocale(first) ? first : defaultLocale;
  return { locale, slug: rest.join("/") || "index" };
}

export const ui = {
  en: {
    "nav.docs": "Docs",
    "nav.components": "Components",
    "nav.themeBuilder": "Theme Builder",
    "nav.skipToContent": "Skip to content",
    "search.label": "Search",
    "search.placeholder": "Search the docs…",
    "tabs.preview": "Preview",
    "tabs.code": "Code",
    "copy.code": "Copy code",
    "copy.copied": "Copied",
    "copy.markdown": "Copy as Markdown",
    "props.name": "Prop",
    "props.type": "Type",
    "props.required": "Required",
    "props.default": "Default",
    "props.description": "Description",
    "props.yes": "Yes",
    "props.no": "No",
    "props.empty": "This component forwards the native element's attributes only.",
    "install.title": "Installation",
    "lang.switch": "Español",
    "theme.title": "Theme Builder",
    "theme.lead":
      "Edit the contract slots and brand primitives; the preview uses the real components.",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.import": "Import base theme",
    "theme.paste": "Paste tokens.dtcg.json",
    "theme.reset": "Reset",
    "theme.exportCss": "Copy theme.css",
    "theme.exportTokens": "Copy tokens.dtcg.json",
    "theme.cliSnippet": "CLI snippet",
    "theme.contrastOk": "WCAG AA",
    "theme.contrastFail": "Below AA",
    "theme.invalid": "Invalid theme",
    "theme.group.surfaces": "Surfaces",
    "theme.group.brand": "Brand",
    "theme.group.support": "Support",
    "theme.group.charts": "Charts",
    "theme.group.other": "Other",
  },
  es: {
    "nav.docs": "Documentación",
    "nav.components": "Componentes",
    "nav.themeBuilder": "Editor de temas",
    "nav.skipToContent": "Saltar al contenido",
    "search.label": "Buscar",
    "search.placeholder": "Buscar en la documentación…",
    "tabs.preview": "Vista previa",
    "tabs.code": "Código",
    "copy.code": "Copiar código",
    "copy.copied": "Copiado",
    "copy.markdown": "Copiar como Markdown",
    "props.name": "Propiedad",
    "props.type": "Tipo",
    "props.required": "Obligatoria",
    "props.default": "Por defecto",
    "props.description": "Descripción",
    "props.yes": "Sí",
    "props.no": "No",
    "props.empty": "Este componente solo reenvía los atributos del elemento nativo.",
    "install.title": "Instalación",
    "lang.switch": "English",
    "theme.title": "Editor de temas",
    "theme.lead":
      "Edita los slots del contrato y las primitivas de marca; la vista previa usa los componentes reales.",
    "theme.light": "Claro",
    "theme.dark": "Oscuro",
    "theme.import": "Importar tema base",
    "theme.paste": "Pegar tokens.dtcg.json",
    "theme.reset": "Restablecer",
    "theme.exportCss": "Copiar theme.css",
    "theme.exportTokens": "Copiar tokens.dtcg.json",
    "theme.cliSnippet": "Comando CLI",
    "theme.contrastOk": "WCAG AA",
    "theme.contrastFail": "Bajo AA",
    "theme.invalid": "Tema inválido",
    "theme.group.surfaces": "Superficies",
    "theme.group.brand": "Marca",
    "theme.group.support": "Soporte",
    "theme.group.charts": "Gráficas",
    "theme.group.other": "Otros",
  },
} as const;

export type UiKey = keyof (typeof ui)["en"];

export function useTranslations(locale: Locale) {
  return function t(key: UiKey): string {
    return ui[locale][key] ?? ui[defaultLocale][key];
  };
}
