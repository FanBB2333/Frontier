import { readdirSync } from "node:fs"
import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

// Which report to build: REPORT=<file name in src/reports without .ts>; default is the
// latest one by name (files are named <topic>-<YYYY-MM-DD>).
const reportsDir = resolve(import.meta.dirname, "./src/reports")
const report =
  process.env.REPORT ??
  readdirSync(reportsDir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => f.slice(0, -3))
    .sort((a, b) => a.slice(-10).localeCompare(b.slice(-10)))
    .at(-1)!

// https://vite.dev/config/
export default defineConfig({
  // one self-contained index.html (scripts, styles and fonts inlined) that opens from file://
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile(),
    {
      name: "report-id",
      transformIndexHtml: (html) => html.replaceAll("%REPORT_ID%", report),
    },
  ],
  resolve: {
    alias: {
      "@report": resolve(reportsDir, `${report}.ts`),
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
  define: {
    __REPORT_ID__: JSON.stringify(report),
  },
})
