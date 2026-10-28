// Build-time render of the page in its default theme and language (see scripts/prerender.mjs).
import { StrictMode } from "react"
import { renderToString } from "react-dom/server"
import App from "./App.tsx"

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
