import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// VITE_BASE is the deployment path prefix, e.g. "/console/" or "./"; "/" for local dev.
// API_SERVER is where /api is proxied in dev when the mock backend is off.
const target = process.env.API_SERVER ?? "http://127.0.0.1:8090"

export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    proxy: { "/api": target },
  },
})
