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
    format: '3 days · Classroom',
    text: 'You learn the tools by using them, and something of yours is live on the internet in the first three days.',
  },
  {
    days: 'Days 4 to 12',
    name: 'Three projects',
    format: '9 days · Classroom',
    text: 'Three complete builds, three days each. A working application. An agent that does the work on its own. A media piece about what you made. Every day ends with you explaining what you built and why.',
  },
  {
    days: 'Days 13 to 14',
    name: 'Hardening',
    format: '2 days · Classroom',
    text: 'You make it solid, then sit a mock interview about your own work. Real questions, real feedback.',
  },
  {
    days: 'Days 15 to 28',
    name: 'Your own idea',
    format: '14 days · Remote',
    text: 'You decide what to build. We help you scope it so it can actually be finished, then stay with you for fourteen days until it ships. The project does not get abandoned at day fourteen.',
  },
]

/**
 * The things you own. The count is read from this list, not written down
 * anywhere else, so adding or removing one here is the whole change: the
 * heading, the grid and the hold all follow.
 */
export const owns = [
  { n: '01', name: 'A live web application', text: 'Your first guided project: a working product with real data and a user beyond yourself.' },
  { n: '02', name: 'A working agent', text: 'Your second guided project: an automation for a repeated task, tested on real input with guardrails.' },
  { n: '03', name: 'A media piece', text: 'Your third guided project: image, video or voice work that presents what you built.' },
  { n: '04', name: 'Your own project', text: 'Chosen, scoped and finished by you during the final fourteen days, with our support.' },
  { n: '05', name: 'Public URLs and clean repos', text: 'Each project has a public link and an organised repository, with a README that helps someone else open it.' },
  { n: '06', name: 'A mock interview', text: 'Questions about your own work, with specific written feedback.' },
  { n: '07', name: 'The explain-back habit', text: 'Practice saying what you built, why you chose that approach, and what you changed when it broke.' },
  { n: '08', name: 'An honest certificate', text: 'It says what you actually did. Nothing inflated.' },
]

export const faq = [
  {
    q: 'Do you guarantee a job?',
    a: 'No. Nobody honestly can. What we commit to is the work: three guided projects, a project you choose yourself, public links and repositories, and a mock interview on your own work with real feedback. Those are yours to show and explain.',
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
    a: 'You complete three guided builds — a web application, an agent and a media piece — then choose and finish your own project. Each build goes through scoping, debugging, shipping and explaining your decisions. The work, and your understanding of it, are what you leave with.',
  },
  {
    q: 'Is it online or offline?',
    a: 'Days 1 to 14 are in the classroom in Kanpur. Days 15 to 28 are remote, working on your own idea with a written scope, live check-ins on days 21 and 28, and asynchronous help in between.',
  },
  {
    q: 'Do I choose all three guided projects?',
    a: 'The first fourteen days are guided: everyone builds the same three projects, so you can focus on learning the tools and finishing the work. On days 15 and 16 you choose your own idea and agree its scope with us, then build and ship it by day 28.',
  },
  {
    q: 'What happens after the classroom phase?',
    a: 'You work remotely on your own project for fourteen days. We agree in writing what done means, review progress in a live check-in on day 21, and meet again on day 28 for the final explain-back. Asynchronous help continues between those check-ins.',
  },
  {
    q: 'Is the certificate worth anything?',
    a: 'On its own, no certificate is. Ours says exactly what you did. Your shipped projects, their repositories and your ability to explain the decisions are the parts that carry weight.',
  },
  {
    q: 'Can my parents talk to someone before I decide?',
    a: 'Yes, and we would prefer it. There is a page written for them, and the institute is a real place in Kanpur you can visit before any money changes hands.',
  },
]

/** The detailed plan stays alongside the four overview phases. */
export const curriculum = [
  {
    id: 'tool-fluency', days: 'Days 1 to 3', title: 'Tool fluency',
    intro: 'Learn by using the tools. By day 3 you have a live link you can share with your family.',
    sessions: [
      { days: 'Day 1', title: 'Set up and build', text: 'Understand how the tools work, give your first real instruction, and get a small build running locally.' },
      { days: 'Day 2', title: 'Iterate and debug', text: 'Ask for changes, read what comes back and fix what breaks. Make at least ten iterations on a useful page or script.' },
      { days: 'Day 3', title: 'Put it on the internet', text: 'Learn about domains and deployment, then ship a live URL that belongs to you.' },
    ],
  },
  {
    id: 'software', days: 'Days 4 to 6', title: 'Project 1: a working product',
    intro: 'Build a real web application with a purpose, data going in and out, and a user who is not you.',
    sessions: [
      { days: 'Day 4', title: 'Scope the product', text: 'Decide what it does and what it does not do, then build the skeleton.' },
      { days: 'Day 5', title: 'Make it work end to end', text: 'Connect the data, find the first real bug and work through a debugging session.' },
      { days: 'Day 6', title: 'Ship and explain', text: 'Deploy the application and explain what you built, why you built it that way and how it works.' },
    ],
  },
  {
    id: 'agents', days: 'Days 7 to 9', title: 'Project 2: an agent that does the work',
    intro: 'Automate a real repeated task. Learn where the system can act on its own and where it needs a person.',
    sessions: [
      { days: 'Day 7', title: 'Map the task', text: 'Pick a boring, useful task and write down what a human does, step by step.' },
      { days: 'Day 8', title: 'Build and watch it fail', text: 'Build the agent, observe its failures and understand why they happen.' },
      { days: 'Day 9', title: 'Add guardrails and ship', text: 'Run it on real input, add boundaries for unsafe or uncertain actions, then ship and explain it.' },
    ],
  },
  {
    id: 'media', days: 'Days 10 to 12', title: 'Project 3: media about your work',
    intro: 'Use video, design, brand and copy to help someone else understand and take your work seriously.',
    sessions: [
      { days: 'Day 10', title: 'Generate, edit and judge', text: 'Work with image, video and voice. Learn to spot what the tools get wrong and correct it.' },
      { days: 'Day 11', title: 'Give your product a face', text: 'Apply the design and media work to the application you built in Project 1.' },
      { days: 'Day 12', title: 'Assemble and explain', text: 'Make a short media piece about your work and explain the choices behind it.' },
    ],
  },
  {
    id: 'hardening', days: 'Days 13 to 14', title: 'Make it solid. Defend your decisions.',
    intro: 'Two days to improve the work you already have. The mock interview is about your own project.',
    sessions: [
      { days: 'Day 13', title: 'Break it on purpose', text: 'Handle errors, write the README and clean the repository. Make the project survive a stranger opening it.' },
      { days: 'Day 14', title: 'Sit the mock interview', text: 'Explain your approach, what broke, how you found it, what the AI wrote and what you decided. Get specific feedback.' },
    ],
  },
  {
    id: 'independent', days: 'Days 15 to 28', title: 'Your own idea, finished by you',
    intro: 'Fourteen days of remote work with a written scope, two scheduled live check-ins and asynchronous help between them.',
    sessions: [
      { days: 'Days 15 to 16', title: 'Choose and scope', text: 'Propose your idea. We help cut it to something finishable in twelve days, then lock the scope in writing.' },
      { days: 'Days 17 to 21', title: 'Build, week one', text: 'Make daily progress remotely. At the live check-in on day 21, review what works, what is stuck and what needs to be cut.' },
      { days: 'Days 22 to 26', title: 'Build, week two', text: 'Finish the agreed scope, with support as you work through the final problems.' },
      { days: 'Days 27 to 28', title: 'Ship and document', text: 'Publish the project, organise the repository and explain the finished work at the live check-in on day 28.' },
    ],
  },
]

export const dailyRhythm = [
  { days: 'First hour', title: 'Understand the work', text: 'What you are building today, why it matters and what usually goes wrong.' },
  { days: 'Middle', title: 'Build with a mentor nearby', text: 'The mentor moves between students. You spend the session trying things and typing, not watching a screen.' },
  { days: 'Last 30 minutes', title: 'Explain it back', text: 'Each student explains what they built and why. The others ask one question each. Every classroom day ends with a student talking.' },
]
