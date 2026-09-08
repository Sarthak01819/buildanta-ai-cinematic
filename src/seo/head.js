import { site } from '../config/site.js'
import { buildJsonLd } from './schema.js'

const OG_IMAGE = '/assets/hero-ending.jpg'

/** Everything the <head> of a page needs, as data. */
export function headFor(page) {
  const canonical = page.noindex ? null : site.url + (page.path === '/' ? '/' : page.path)
  return {
    title: page.title,
    description: page.description,
    canonical,
    noindex: Boolean(page.noindex),
    ogImage: site.url + OG_IMAGE,
    jsonLd: buildJsonLd(page),
  }
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** The tags the prerender script injects in place of <!--app-head-->. */
export function renderHead(head) {
  const tags = [
    `<title>${esc(head.title)}</title>`,
    `<meta name="description" content="${esc(head.description)}">`,
  ]
  if (head.noindex) tags.push('<meta name="robots" content="noindex,nofollow">')
  if (head.canonical) tags.push(`<link rel="canonical" href="${esc(head.canonical)}">`)
  tags.push(
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${esc(site.name)}">`,
    `<meta property="og:title" content="${esc(head.title)}">`,
    `<meta property="og:description" content="${esc(head.description)}">`,
    ...(head.canonical ? [`<meta property="og:url" content="${esc(head.canonical)}">`] : []),
    `<meta property="og:image" content="${esc(head.ogImage)}">`,
    '<meta property="og:image:width" content="1536">',
    '<meta property="og:image:height" content="864">',
    '<meta property="og:locale" content="en_IN">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(head.title)}">`,
    `<meta name="twitter:description" content="${esc(head.description)}">`,
    `<meta name="twitter:image" content="${esc(head.ogImage)}">`,
  )
  for (const block of head.jsonLd) {
    // "<" cannot appear raw inside a script element.
    tags.push(`<script type="application/ld+json">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`)
  }
  return tags.join('\n')
}
