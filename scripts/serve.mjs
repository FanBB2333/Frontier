// Minimal static file server for previewing a build: node scripts/serve.mjs <dir> [port]
import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize, resolve } from "node:path"

const root = resolve(process.argv[2] ?? "_site")
const port = Number(process.argv[3] ?? 4173)
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".woff2": "font/woff2",
  ".json": "application/json",
}

export function serve(dir = root, p = port) {
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "")
    let file = join(dir, path)
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html")
      const body = await readFile(file)
      res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" })
      res.end(body)
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" })
      res.end("Not found")
    }
  })
  return new Promise((ok) => server.listen(p, () => ok(server)))
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await serve()
  console.log(`Serving ${root} at http://localhost:${port}/`)
}
