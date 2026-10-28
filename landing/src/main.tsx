import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { applyLang, readLang } from "@/lib/i18n"
import { applyTheme, readTheme } from "@/lib/theme"

applyTheme(readTheme())
applyLang(readLang())

const root = document.getElementById("root")!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
// A production build carries prerendered markup to hydrate; the dev server starts empty.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
