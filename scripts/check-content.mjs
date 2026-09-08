/**
 * Content rules from section 5 of the spec, enforced on every build if you
 * want them to be (`npm run check`, or `npm run check -- --strict` to fail on
 * unfilled placeholders too).
 *
 *   - none of the banned words, anywhere in page copy
 *   - BUILDANTA never spelled with a second A
 *   - every use of the 83% figure says "engineering graduates"
 *   - a list of placeholders still null in src/config/site.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { missingPlaceholders } from '../src/config/site.js'

const strict = process.argv.includes('--strict')
const root = path.resolve('src')

const BANNED = [
  'unlock',
  'transform',
  'revolutionary',
  'game-changing',
  '10x',
  'cutting-edge',
  'empower',
  'journey',
  'guaranteed',
  '100% placement',
  'dream job',
  'limited seats',
  'industry-leading',
  'world-class',
]
const bannedRe = new RegExp(`\\b(${BANNED.map((w) => w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'i')
const cssTransform = /transform\s*[:(]|--k|translate|scale\(/i

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.(jsx|js)$/.test(entry.name) && !full.includes(`${path.sep}styles${path.sep}`)) out.push(full)
  }
  return out
}

const problems = []
for (const file of walk(root)) {
  const rel = path.relative(process.cwd(), file)
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    const where = `${rel}:${i + 1}`
    const banned = bannedRe.exec(line)
    if (banned && !(banned[1].toLowerCase() === 'transform' && cssTransform.test(line))) {
      problems.push(`${where}: banned word "${banned[1]}"`)
    }
    if (/buildaanta/i.test(line)) problems.push(`${where}: BUILDANTA misspelled with a second A`)
    // The figure and its wording may sit on neighbouring lines of a data object.
    if (line.includes('83%')) {
      const nearby = lines.slice(Math.max(0, i - 2), i + 3).join(' ')
      if (!/engineering/i.test(nearby)) problems.push(`${where}: the 83% figure must say "engineering graduates"`)
    }
  })
}

const missing = missingPlaceholders()

if (problems.length) {
  console.error('Content rule violations:')
  for (const p of problems) console.error(`  ${p}`)
}
if (missing.length) {
  console.log(`Placeholders still empty in src/config/site.js (${missing.length}):`)
  for (const m of missing) console.log(`  - ${m}`)
} else {
  console.log('All placeholders in src/config/site.js are filled.')
}

if (problems.length || (strict && missing.length)) process.exit(1)
console.log(problems.length ? '' : 'No content rule violations.')
