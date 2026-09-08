# BUILDANTA AI INSTITUTE, Kanpur

The website. React 19, Vite 7 and React Router 7, pre-rendered to one static
HTML file per route, so every page has its own title, description, Open Graph
tags and JSON-LD before any JavaScript runs.

Built against the 8 September 2026 build and content spec. The scroll-scrubbed
video hero, the hold-to-ship interaction and the original copy are preserved
from the single-file cinematic site; everything the spec listed as missing has
been added.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # client build, SSR build, then prerender into dist/
npm run preview    # serve dist/ locally
npm run check      # content rules + a list of unfilled placeholders
```

## Where things live

```
src/
  config/site.js          every owner-supplied value: address, phone, WhatsApp,
                          email, GSTIN, socials, grievance officer, commitments
  content/                the copy that is data: stats, tools, phases, faq,
                          and projects.js (the Proof archive, empty until Batch 1)
  seo/                    routes + titles (pages.js), JSON-LD (schema.js), head tags
  pages/                  one component per route
  components/
    layout/               Header, Footer, sticky MobileBar, scroll + head managers
    hero/                 the scrub hero and the static hero
    home/                 the home-page sections and the hold-to-ship interaction
    forms/                the Apply form and its submit logic
    proof/                project cards for the Proof page
    legal/                shared frame + the "to be decided" boxes
    ui/                   buttons, WhatsApp button, Section, BlockRule, Pending
  styles/                 tokens and the original CSS, split by concern
scripts/
  prerender.mjs           writes dist/<route>/index.html, 404.html, sitemap, robots
  check-content.mjs       the section 5 content rules, as a script
public/
  assets/                 fonts (licences beside them), hero media
  brand/                  the vector mark and favicon set
```

## Routes

`/` `/apply` `/for-parents` `/proof` `/why` `/what-is-claude-code` `/privacy`
`/terms` `/refund`, plus a real 404 page. Every "Apply for Batch 1" goes to
`/apply`; a WhatsApp link sits beside it everywhere; on phones a sticky bar
carries both.

## Before launch

1. Fill every `null` in `src/config/site.js`. Until then the site shows a
   visible "to be added" for each one rather than a made-up value, and the
   WhatsApp buttons open `/apply` instead of a dead number.
2. Decide the boxes marked "To be decided before launch" on `/terms` and
   `/refund` (refund terms, opt-out of published work, conduct refunds) and
   replace each `<Decide>` with the chosen wording.
3. Point the form at an inbox: create a `.env` file containing
   `VITE_FORM_ENDPOINT=<url>` (Formspree, Web3Forms, Basin, or your own
   function) and, if the provider wants one, `VITE_FORM_ACCESS_KEY=<key>`.
   Without an endpoint the form hands the application to WhatsApp, which
   still works. `.env` is git-ignored.
4. Replace `site.url` with the custom domain when it is live; the canonical
   tags, sitemap and robots.txt all derive from it.
5. Have a professional review `/privacy`, `/terms` and `/refund`.
6. `npm run check -- --strict` fails while any placeholder is still empty.
   Wire it into CI when you want the build to refuse to ship blanks.

## Adding student work

Append an entry to `src/content/projects.js`. The Proof page switches from the
reserved slots to real cards on the next deploy. Screenshots go in
`public/proof/`.

## Deploy

`vercel.json` sets the framework, output directory, clean URLs and cache
headers. Import the repository into Vercel and it builds with `npm run build`.

## Agent tooling

`.claude/`, `.mcp.json`, `.agents/` and `CLAUDE.md` come from `npx ruflo init`.
The rebuild was run as a ruflo swarm (hero, home, pages and review agents with
strict file ownership); `npx ruflo task list` and `npx ruflo agent list` show
the ledger. Runtime state under `.swarm/` and `.claude-flow/` is ignored by git.

## Credits

Headings are set in BoldPixels by Yūki (@YukiPixels), CC BY-SA 4.0, used
without modification. Archivo, Pixelify Sans and JetBrains Mono are under the
SIL Open Font License; the licences sit beside the font files. Hero artwork is
generated: the room is a drawing, not a photograph of the institute.
