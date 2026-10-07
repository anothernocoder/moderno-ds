import "./no-devtools.ts";
import { createRoot } from "react-dom/client";
import "@fontsource/hedvig-letters-sans";
import "@fontsource/hedvig-letters-serif";
import "@moderno-ui/css";
import "../../../registry/themes/theme-moderno/theme.css";
import "../../../registry/themes/theme-contrast/theme.css";
import "./playground.css";
import { App } from "./app.tsx";

const query = new URLSearchParams(location.search);
if (query.get("brand") === "contrast") document.documentElement.dataset.brand = "contrast";
if (query.get("mode") === "dark") document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);
