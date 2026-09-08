import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App.jsx'

export { PAGES } from './seo/pages.js'
export { headFor, renderHead } from './seo/head.js'
export { site } from './config/site.js'

/** Used only by scripts/prerender.mjs after `vite build`. */
export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
}
