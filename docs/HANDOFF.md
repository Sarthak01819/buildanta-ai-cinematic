# BUILDANTA site — handoff

Written 2026-09-11 to carry a Claude Code session over to Codex. It covers what
the project is, what changed recently and why, the things that cost time to
learn, and how to check work before pushing. Everything below was verified
against the repo at commit `6c95b51`, not recalled.

---

## 1. What this is

A marketing site for BUILDANTA AI INSTITUTE, Kanpur — a 28-day programme. One
public repo, one deployment, no backend.

| | |
|---|---|
| Stack | React 19, Vite 7, react-router 7. **JSX, not TypeScript.** |
| Rendering | Pre-rendered to static HTML per route at build time |
| Repo | `github.com/Sarthak01819/buildanta-ai-cinematic`, branch `main` |
| Live | https://buildanta-ai-cinematic.vercel.app (Vercel auto-deploys on push) |
| Node | 22.x |

```bash
npm run dev      # localhost:5173
npm run build    # vite build + SSR bundle + scripts/prerender.mjs
npm run check    # content rules + lists unfilled placeholders
```

`npm run build` runs three steps: the client build, an SSR build of
`src/entry-server.jsx`, then `scripts/prerender.mjs`, which renders every route
in `src/seo/pages.js` to `dist/<route>/index.html`, injects head tags and
JSON-LD, writes `sitemap.xml` and `robots.txt`, and deletes the server bundle so
it never deploys.

There is no test runner. Verification is the content check plus Playwright
scripts driven by hand — see section 7.

---

## 2. State right now

Working tree is clean apart from two untracked Ruflo artefacts (`.codex/`,
`AGENTS.md`). `main` is pushed and deployed.

**Nine config placeholders are still empty** in `src/config/site.js`. Each one
renders a visible "to be added" note via `<Pending>` on whichever page needs it,
which is deliberate — the site never invents a contact detail.

```
gstin
grievanceOfficer.name / .designation / .email
commitments.replyWithinHours / .acknowledgeComplaintWithinHours
commitments.resolveComplaintWithinDays / .refundWithinWorkingDays
commitments.enquiryRetentionMonths
```

The grievance officer is not cosmetic: the Privacy Policy is incomplete without
it under the IT Act rules. Only the owner can supply these. Do not guess them.

Already filled: phone `+919196027117`, WhatsApp `919196027117`, the Kanpur
address, `buildantapvtltd@gmail.com`, Instagram and Facebook.

---

## 3. What changed in this session, and why

Newest first. The reasoning matters more than the diff — most of these were
judgement calls that would otherwise look arbitrary.

**`6c95b51` Stop promising a demo video and a case study.** The owner dropped
both as deliverables. Removed from the FAQ, Terms, For Parents, the Proof page,
the project card links, the `videoUrl` type field and the hero's closing line.
The Terms drove the sweep: they state what a student receives on completion, so
a stale line there is a promise the programme will not keep. Four deliverables
now, same order everywhere: live URL, public repository, mock interview with
written feedback, certificate.

**`ade0ef9` Animate the FAQ.** A native `<details>` shows and hides its panel
outright, so there is nothing to transition. `useAccordion.js` takes over the
click: opening sets the attribute then animates the panel down from nothing;
closing animates up and drops the attribute at the end, which is what keeps the
content on screen long enough to watch it leave. Markup unchanged, so it still
works with scripting off, and reduced motion skips the hook entirely.

**`2bbaa71` Remove the Proof section from the home page.** The `/proof` page
stays. Its reserved cards share the class `slot` and were taking padding and
type from the deleted home-page rule, so those declarations moved onto
`.project.slot`.

**`4277e31` Four cards, not six.** The count lived in three places and only one
was the list. The heading now counts the list and the hold button draws one
block per item.

**`dec7812` "AI development" → "AI Web/App development"**, plus a concrete
example on each of the four tools.

**`1d11f38` Glyph cloud beside the gap figures**, plus two contrast repairs. See
section 5 — this one has the most traps.

**`bedd1b9` The panel theme.** Deep green rounded cards on a pale gridded
ground, from a reference the owner supplied. Hero and footer deliberately
untouched. Long reading copy stays dark-on-light.

**`bd99ebb` The header's short label.** `ApplyButton` discarded its children, so
the CSS that swapped "Apply for Batch 1" for "Apply" below 520px was dead.

**`f209370` Type scale matched to coderarmy.in**, measured at 1440px rather than
guessed: page heading 72px, section heading 60px, standfirst 24px, nav 16px.
Body copy deliberately left at 17px.

**`21922a6` / `de2cc68` Social links** as inline SVG logos; YouTube removed.
Share-token URLs were replaced with canonical profile URLs.

**`640808f` / `01fedcf` Address, email, phone, WhatsApp.**

**`5da3bde` / `5920c1a` Hero scroll shortened 30% total**, 1300vh → 945vh.

**`14b6eab` Hero re-rendered** with photographic textures and an HDRI sky.

---

## 4. Architecture worth knowing before editing

**Content vs config.** Copy lives in `src/content/` (`programme.js`,
`stats.js`, `projects.js`). Owner-supplied facts live in `src/config/site.js`,
where `null` means "not yet" and renders as `<Pending>`. Never hardcode a phone
number or address into a component.

**The hero** (`src/components/hero/`). A scroll-scrubbed video: `useScrubHero.js`
maps scroll position onto `video.currentTime`. Five media queries hide it on
phones and under reduced motion in favour of `StaticHero`. `VIDEO_BYTES` in
`heroMedia.js` **must equal the real byte size** of `public/assets/hero-scrub.mp4`
(currently 11,594,677) — it is the fallback when `Content-Length` is missing.
`heroCache.js` is one shared streamed download so the preloader and the hero do
not fetch the 11.6 MB twice.

**The preloader** (`src/components/layout/`). A curtain over first paint that
preloads fonts, stills and the hero video, then reveals. Shows once per session,
decided by an inline script in `index.html` before first paint. `reveal()`
dispatches `bd:reveal`; anything that should animate only when seen waits on
`onRevealed`.

**The panel theme** (`src/styles/panels.css`). Skin only — components keep their
own layout in `home.css` / `site.css`. **Import order matters:** `index.css`
loads tokens → environment → layout → footer → hero → home → site → **panels** →
pages → preloader → motion. Panels intentionally loads after the component
sheets so equal-specificity rules win, and `motion.css` loads last so its gates
win over everything.

**The Blender hero pipeline** lives in `scripts/hero/` (`build_hero.py`,
`materials.py`, `fetch_textures.py`, `encode.sh`). Only touch it to re-render.
A full render is 35–65 minutes. See the `hero-animation-pipeline` memory note
for the tuning env vars.

---

## 5. The glyph cloud — read this before touching the gap section

`src/components/home/GapStudy.jsx` embeds `TextPathStudies`
(`morphing-glyph-cloud`) from `@designcodeio/threeui`, MIT. It renders a
**sandboxed iframe whose `srcDoc` is a 63 KB HTML document**. Four constraints,
each of which was a bug first:

1. **Import from `@designcodeio/threeui/components/TextPathStudies`, never the
   package index.** The index is a barrel over the whole library and produced a
   **7.2 MB chunk** (3.2 MB gzipped) to draw one decoration. The per-component
   entry is 85 KB.
2. **It must not render during SSR**, or the 63 KB document lands in
   `dist/index.html`. Hence the load-after-mount.
3. **It must not load on touch devices.** The study's own document sets
   `touch-action: none` across its plate, which the page cannot reach into or
   override. Measured on an iPad Pro landscape (1366px, which clears any width
   gate): a swipe starting on the study scrolled **0px**, the same swipe over
   text scrolled 225px. The page was stuck. The gate is now
   `(min-width: 1000px) and (hover: hover) and (pointer: fine)`, plus
   `@media (any-pointer: coarse){ .gap-study{pointer-events:none} }` for
   touchscreen laptops that pass the hover test and still have a finger.
4. **The recolour is compositing, not a fork.** The study paints pale glyphs on
   near-black and exposes no control over either. `home.css` inverts and
   contrasts it so its ground becomes pure white (multiply's no-op) and
   multiplies it onto the page, then paints the accent green over the dark
   letters with `mix-blend-mode: lighten`. Measured result: frame corners equal
   the page ground `rgb(232,240,226)`, glyphs equal `rgb(74,116,49)` exactly.
   **Do not add `transform`, `opacity`, `filter`, `isolation` or `z-index` to
   `.gap-study` or `.shader-frame`** — any of them opens a stacking context and
   strands the blend, which silently turns the artwork into a grey box.

It sits below the heading, not centred on the section, because dark heading text
over those green letters measures 2.7:1.

---

## 6. Conventions

**Voice.** Plain, concrete, no hype, no promises the programme cannot keep. The
site says "we do not have graduates yet" on purpose. `npm run check` enforces a
banned-word list (`unlock`, `transform`, `revolutionary`, `10x`, `guaranteed`,
`world-class`, …) across `src/**/*.{js,jsx}`, and fails the spelling
BUILDANTAA.

**Accessibility is checked numerically, not by eye.** Every text/background pair
on this site has been measured. Four real faults were caught this way that
looked fine in a screenshot. If you change a colour, re-run the contrast sweep.

**Commits** describe why, not what. They are written as prose, and they record
the measurement behind a judgement call where there was one.

**Do not touch** `.env` (git-ignored, owner-managed; it holds
`VITE_FORM_ENDPOINT` and `VITE_FORM_ACCESS_KEY` for the Apply form's Google
Apps Script receiver — Vite bakes these in at build time, so the same pair must
exist in Vercel's project environment or the live form records nothing).

---

## 7. How to verify before pushing

Always: `npm run build && npm run check`.

Beyond that, four Playwright harnesses were used this session. They live in the
Claude session scratchpad, **which is temporary** — copy them out now if you
want them:

```
C:\Users\sarth\AppData\Local\Temp\claude\C--Users-sarth-Desktop-buildanta-cinematic\
  30c5bbca-1863-4b1b-a2a2-b14a8af4b989\scratchpad\
    type\contrast.mjs    every text run on 9 pages vs its background
    type\overflow.mjs    7 routes x 6 widths (320→1440), horizontal overflow
    gap\touch.mjs        swipe-over-element scroll trapping, touch emulation
    gap\faq.mjs          per-frame panel heights through open and close
    gap\nojs.mjs         the page with scripting disabled
    scrubtest\run.mjs    the hero's seek/band/chapter behaviour
```

Playwright is not a project dependency. Reach it like this:

```js
import { createRequire } from 'node:module'
const require = createRequire(
  'C:/Users/sarth/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json',
)
const { chromium } = require('playwright')
const b = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/sarth/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
})
```

Every harness must wait for the preloader before measuring anything, or it
measures the curtain:

```js
await p.waitForFunction(() => !document.getElementById('preload'), { timeout: 25000 }).catch(() => {})
```

**Known false positive:** the contrast sweep approximates any gradient backdrop
as the card gradient, so it reports the header wordmark's "AI Institute" at
4.04:1. That text is cream over the dark hero nav and is fine. Everything else
it reports has been real.

---

## 8. Gotchas that cost real time

- **A box cannot be shorter than its own padding.** The accordion's close
  stopped 24px above zero until the bottom padding moved to an inner element.
- **`mix-blend-mode` needs an unbroken path to the page.** See section 5.
- **`vite preview` serves `index.html` for slash-less routes**, so `/apply`
  looks like a hydration mismatch locally. Test with `/apply/`. Vercel resolves
  it correctly.
- **Count anything once.** The "Six things you own" heading, the hold button's
  blocks and the list were three sources for one number.
- **grep across line wraps.** "AI development" survived a rename because JSX had
  wrapped it across two lines.
- **CRLF.** Files are CRLF locally; git normalises on commit. The warnings are
  expected.
- **The Bash tool here mangles heredocs containing apostrophes** — write source
  files with the editor tool instead.
- **Vercel deploys in 10–80 seconds.** Poll the live URL for a string you just
  added rather than assuming.

---

## 9. Open decisions for the owner

1. The nine placeholders in section 2. The grievance officer blocks a legally
   complete Privacy Policy.
2. The desk model in the hero render is **"Desk by dook", CC-BY 3.0**, which
   requires attribution. It is credited in `scripts/hero/build_hero.py` but not
   on the site. The fonts and the ThreeUI component are credited in the README.
3. `site.url` must change the day a custom domain goes live — every canonical
   tag, `og:url`, the sitemap and robots.txt derive from it.
