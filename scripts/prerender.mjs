/**
 * Turns the client build into one static HTML file per route.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server bundle):
 *   1. renders every route in src/seo/pages.js with the server bundle,
 *   2. injects the page's head tags and JSON-LD,
 *   3. writes dist/<route>/index.html (and dist/404.html),
 *   4. writes sitemap.xml and robots.txt from the same route table,
 *   5. removes the server bundle so it is never deployed.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = path.resolve('dist')
const serverDir = path.join(dist, 'server')
const entry = path.join(serverDir, 'entry-server.js')

const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8')
if (!template.includes('<!--app-html-->') || !template.includes('<!--app-head-->')) {
  throw new Error('dist/index.html is missing the <!--app-head--> or <!--app-html--> marker')
}

const { render, PAGES, headFor, renderHead, site } = await import(pathToFileURL(entry).href)

function fileFor(route) {
  if (route === '/') return 'index.html'
  if (route === '/404') return '404.html'
  return path.join(route.slice(1), 'index.html')
}

let written = 0
for (const page of PAGES) {
  const html = render(page.path)
  const head = renderHead(headFor(page))
  const out = template.replace('<!--app-head-->', head).replace('<!--app-html-->', html)
  const target = path.join(dist, fileFor(page.path))
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, out)
  written += 1
}

const today = new Date().toISOString().slice(0, 10)
const urls = PAGES.filter((p) => !p.noindex).map(
  (p) => `  <url>\n    <loc>${site.url}${p.path === '/' ? '/' : p.path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
)
await fs.writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
)
await fs.writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`)

await fs.rm(serverDir, { recursive: true, force: true })

console.log(`Pre-rendered ${written} pages into dist/, plus sitemap.xml and robots.txt.`)
