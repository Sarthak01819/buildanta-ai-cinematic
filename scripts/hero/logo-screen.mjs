// Renders logo-screen.html to a 1920x1080 PNG, the texture shown on the monitor.
// Needs Playwright with Chromium: `npx playwright install chromium` once, then
//   node scripts/hero/logo-screen.mjs scripts/hero/logo-screen.png
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
const { chromium } = createRequire(import.meta.url)('playwright')
const out = process.argv[2] || 'scripts/hero/logo-screen.png'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
await page.goto(pathToFileURL(path.resolve('scripts/hero/logo-screen.html')).href, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(500)
await page.screenshot({ path: out, type: 'png' })
await browser.close()
console.log('wrote', out)
