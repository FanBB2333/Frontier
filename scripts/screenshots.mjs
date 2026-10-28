// Regenerates the README screenshots from the Pages build: run `pnpm build:pages` first.
// Uses the locally installed Google Chrome through playwright-core (no browser download).
// Usage: node scripts/screenshots.mjs [outdir]

import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { chromium } from "playwright-core"
import { serve } from "./serve.mjs"

const outDir = resolve(process.argv[2] ?? "docs/screenshots")
const PORT = 4173
const base = `http://localhost:${PORT}`

// [file, path under _site, localStorage to seed, optional action before the shot]
const SHOTS = [
  ["gallery.png", "/#/slides", {}],
  ["annotation-workspace.png", "/annotation/?as=admin#/tasks/s-0005", {}],
  ["annotation-admin-dark.png", "/annotation/?as=admin#/admin", { "frontier-annotation:theme": "dark" }],
  ["slides-page.png", "/slides/#/2", {}],
  ["slides-overview-dark.png", "/slides/#/6", { "frontier-slides:theme": "midnight" }, (page) => page.keyboard.press("o")],
  ["landing-hero.png", "/landing/", {}],
  [
    "landing-baseline-dark.png",
    "/landing/",
    { "frontier-landing:theme": "dark", "frontier-landing:lang": "zh" },
    (page) => page.evaluate(() => document.getElementById("baseline").scrollIntoView({ behavior: "instant" })),
  ],
  [
    "report-tree.png",
    "/report/",
    { "frontier-report:mode": "light" },
    async (page) => {
      await page.getByRole("radio", { name: "细节" }).click({ force: true })
      await page.waitForTimeout(600)
      await page.getByText("目前的结果", { exact: true }).first().click()
    },
  ],
  [
    "report-walk-dark.png",
    "/report/",
    { "frontier-report:mode": "dark", "frontier-report:accent": "violet" },
    async (page) => {
      await page.getByRole("radio", { name: "要点" }).click({ force: true })
      await page.waitForTimeout(400)
      await page.getByRole("button", { name: "汇报模式" }).click()
      for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowRight")
    },
  ],
]

await mkdir(outDir, { recursive: true })
const server = await serve(resolve("_site"), PORT)
const browser = await chromium.launch({ channel: "chrome" })
try {
  for (const [file, path, storage, action] of SHOTS) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await context.addInitScript((entries) => {
      for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v)
    }, storage)
    const page = await context.newPage()
    await page.goto(base + path)
    await page.waitForTimeout(2600) // entrance animations
    if (action) {
      await action(page)
      await page.waitForTimeout(1600)
    }
    await page.screenshot({ path: resolve(outDir, file) })
    await context.close()
    console.log(`  ${file}`)
  }
} finally {
  await browser.close()
  server.close()
}
