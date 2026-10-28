import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { applyLang, readLang } from "@/lib/i18n"
import { applyTheme, readTheme } from "@/lib/theme"

applyTheme(readTheme())
applyLang(readLang())

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
