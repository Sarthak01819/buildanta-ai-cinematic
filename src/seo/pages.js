/**
 * Every route the site has, with its title and description. The prerender
 * script and the client-side <Seo> component both read this, so a page can
 * never be indexed with the wrong head.
 *
 * `schema` lists which JSON-LD blocks a page carries; see schema.js.
 */
export const PAGES = [
  {
    path: '/',
    title: 'AI Institute in Kanpur — Claude Code & AI Agents | BUILDANTA',
    description:
      'An offline AI institute in Kanpur teaching Claude Code, AI agents and AI video generation. Twenty-eight days, one live project, shipped in public. Batch 1 is forming.',
    schema: ['organization', 'course', 'faq'],
  },
  {
    path: '/apply',
    title: 'Apply for Batch 1 — BUILDANTA AI INSTITUTE, Kanpur',
    description:
      "Four questions, one minute, a real person reads every application. Tell us where you're starting and we'll be honest about fit.",
    schema: ['organization'],
  },
  {
    path: '/for-parents',
    title: 'For Parents — What BUILDANTA AI INSTITUTE Actually Offers',
    description:
      'Fees, structure, and what your child leaves with. No job guarantees, no salary claims — just what the 28 days contain and what it costs.',
    schema: ['organization'],
  },
  {
    path: '/proof',
    title: 'Student Work — Live Projects from BUILDANTA AI INSTITUTE',
    description:
      "Every student ships a real project in public. Batch 1 hasn't started yet, so this page is empty — by choice, not by accident.",
  },
  {
    path: '/why',
    title: "Why We Exist — We Couldn't Hire These Skills in Kanpur",
    description:
      'We went looking to hire people who knew Claude Code and AI agents. In Kanpur we found nobody. So we started teaching it. The story behind BUILDANTA AI INSTITUTE.',
  },
  {
    path: '/what-is-claude-code',
    title: 'What is Claude Code? A Plain Explanation | BUILDANTA',
    description:
      'Claude Code lets you build software by directing an AI coding agent instead of writing every line. What it changes, what you can build, and what it does not do.',
    schema: ['article'],
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | BUILDANTA AI INSTITUTE',
    description:
      'What personal data BUILDANTA SOLUTION collects through this site, why, who it is shared with, how long it is kept, and your rights under the DPDP Act 2023.',
  },
  {
    path: '/terms',
    title: 'Terms & Conditions | BUILDANTA AI INSTITUTE',
    description:
      'The terms that govern enrolment in the AI CareerNext programme: fees, what we commit to, what we do not promise, and how disputes are handled.',
  },
  {
    path: '/refund',
    title: 'Refund & Cancellation Policy | BUILDANTA AI INSTITUTE',
    description:
      'What happens if you cancel before or after the batch starts, what happens if we cancel or postpone, and how refunds are paid.',
  },
  {
    path: '/404',
    title: 'Page not found | BUILDANTA AI INSTITUTE',
    description: 'That page does not exist. Here is what does.',
    noindex: true,
  },
]

const NOT_FOUND = PAGES.find((p) => p.path === '/404')

function normalise(pathname) {
  if (!pathname) return '/'
  let p = pathname.split('?')[0].split('#')[0]
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p || '/'
}

export function getPage(pathname) {
  const p = normalise(pathname)
  return PAGES.find((page) => page.path === p) || NOT_FOUND
}
