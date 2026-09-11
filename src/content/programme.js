/** What is taught. Matches the tools strip wording fixed in section 4.1 of the spec. */
export const tools = [
  {
    name: 'Claude Code',
    text:
      'Building real software by directing an AI coding agent, not by typing every line. For example: adding a working payment page to a site that already exists, or turning a bug report into a tested fix.',
  },
  {
    name: 'AI agents',
    text:
      'Systems that carry out multi-step work on their own. For example: an agent that reads incoming enquiries, answers the ordinary ones and passes the rest to a person.',
  },
  {
    name: 'AI video generation',
    text:
      'Producing video with generative tools, start to finish. For example: a thirty-second advertisement for a shop, or a voiced walkthrough of the project you built.',
  },
  {
    name: 'AI Web/App development',
    text:
      'Putting these together into something that actually ships. For example: a booking site for a clinic in the city, or a phone app with a real sign-in and a database behind it.',
  },
]

export const TOOLS_STRIP = 'Claude Code · AI agents · AI video generation · AI Web/App development'

/** The twenty-eight days. */
export const phases = [
  {
    days: 'Days 1 to 3',
    name: 'Tool fluency',
    text: 'You learn the tools by using them, and something of yours is live on the internet in the first three days.',
  },
  {
    days: 'Days 4 to 9',
    name: 'Your build',
    text: 'You build your own project. Every day you explain back what you built and why.',
  },
  {
    days: 'Days 10 to 14',
    name: 'Hardening',
    text: 'You make it solid, then sit a mock interview about your own work. Real questions, real feedback.',
  },
  {
    days: 'Weeks 3 to 4',
    name: 'Follow-through',
    text: 'Remote. You keep going, we keep checking in. The project does not get abandoned at day fourteen.',
  },
]

/** Six things you own. */
export const owns = [
  { n: '01', name: 'A live URL', text: 'A real project on the real internet, not a folder on your laptop.' },
  { n: '02', name: 'A public repo', text: 'The code, with your name on it.' },
  { n: '03', name: 'A demo video', text: 'You, explaining what you made.' },
  { n: '04', name: 'A mock interview', text: 'With written feedback. Specific.' },
  { n: '05', name: 'A case study', text: 'Written properly, ready to post.' },
  { n: '06', name: 'An honest certificate', text: 'It says what you actually did. Nothing inflated.' },
]

export const faq = [
  {
    q: 'Do you guarantee a job?',
    a: 'No. Nobody honestly can. What we commit to is the work: in twenty-eight days you have a live project, the repo behind it, a demo video and a mock interview with real feedback. Those are yours, and you can show them to anyone.',
  },
  {
    q: 'Are there students who finished already?',
    a: 'Not yet. Batch 1 has not started. We would rather tell you that plainly than write testimonials nobody earned.',
  },
  {
    q: 'Do I need to already know how to code?',
    a: 'You need to be comfortable with a computer and willing to work. These tools changed what knowing how to code means. Tell us where you are starting when you apply and we will be straight with you about fit.',
  },
  {
    q: 'How is this different from a full-stack course?',
    a: 'A full-stack course teaches you a stack. This ends with something live rather than a completion certificate, and you build one real thing in public instead of following twelve tutorials.',
  },
  {
    q: 'Is it online or offline?',
    a: 'The first two weeks are offline, in Kanpur. Weeks three and four are remote follow-through.',
  },
  {
    q: 'Is the certificate worth anything?',
    a: 'On its own, no certificate is. Ours says exactly what you did. The live URL, the repo and the demo video are the parts that carry weight, which is why the programme is built around producing them.',
  },
  {
    q: 'Can my parents talk to someone before I decide?',
    a: 'Yes, and we would prefer it. There is a page written for them, and the institute is a real place in Kanpur you can visit before any money changes hands.',
  },
]
