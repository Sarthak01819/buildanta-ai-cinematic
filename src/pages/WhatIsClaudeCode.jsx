import { Link } from 'react-router'
import { PageIntro } from '../components/ui/Section.jsx'
import { ApplyButton } from '../components/ui/Button.jsx'
import WhatsAppButton from '../components/ui/WhatsAppButton.jsx'
import { useReveal } from '../hooks/useReveal.js'
import { site } from '../config/site.js'

/** Spec 4.6. Proves competence instead of claiming it. */
export default function WhatIsClaudeCode() {
  const ref = useReveal()
  return (
    <>
      <PageIntro
        id="what-is-claude-code"
        kicker="Plain explanation"
        title="What is Claude Code?"
        lede="Claude Code is a tool that lets you build software by directing an AI coding agent, instead of typing every line yourself."
      />
      <section ref={ref} className="section page-body">
        <div className="container">
          <div className="prose rise">
            <p>
              You describe what you want. It writes the code, runs it, reads the errors, and fixes them. You review,
              correct, and direct. The work moves from <em>writing syntax</em> to{' '}
              <em>deciding what should exist and judging whether the result is right.</em>
            </p>
            <h2>What actually changes</h2>
            <p>
              The traditional path was: learn a language, learn a framework, build small things for months before you
              can build something real. The bottleneck was typing speed and syntax recall.
            </p>
            <p>
              With an AI coding agent, that bottleneck moves. You can put a working application on the internet far
              earlier — but only if you can describe the problem precisely, read what the agent produced, and tell
              whether it is correct. Those are the skills that now matter.
            </p>
            <p>
              This is why "AI will replace programmers" is the wrong reading. What it replaces is the part of
              programming that was always mechanical. What it rewards is judgment.
            </p>
            <h2>What you can build with it</h2>
            <p>
              Real, deployable things: a website with a working backend, a tool that processes data, an app that talks
              to an external service, an automation that runs on a schedule. Not toy examples — things with a URL that
              other people can open.
            </p>
            <h2>What it does not do</h2>
            <p>
              It does not remove the need to understand what you are building. An agent will confidently produce
              something broken if you cannot tell the difference. It does not eliminate debugging; it changes what
              debugging looks like. And it will not make decisions about what your product should be — that stays
              yours.
            </p>
            <h2>How this fits with AI agents and AI video generation</h2>
            <p>
              Claude Code is one of three shifts happening together. <strong>AI agents</strong> carry out multi-step
              work on their own rather than answering one question at a time. <strong>AI video generation</strong>{' '}
              produces finished video from a description. Each is useful alone; together they change what one person
              can produce in a week.
            </p>
            <h2>Where to learn it</h2>
            <p>
              The honest answer is that you learn it by building something with it and then explaining how it works to
              someone who will push back. Reading about it does not transfer.
            </p>
            <p>
              That is how we teach it at{' '}
              <Link to="/#programme">
                {site.name} in {site.city}
              </Link>{' '}
              — {site.batch.days} days, three guided projects and a project you choose yourself, with explain-backs
              throughout so you can describe the decisions behind the work.
            </p>
            <div className="btn-row">
              <ApplyButton />
              <WhatsAppButton label="Ask us on WhatsApp" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
