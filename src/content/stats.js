/**
 * The four statistics cleared in section 5.2 of the spec. Exact wording, visible
 * source. Nothing else goes on the site without a citation.
 */
const CAREERS360 =
  'https://news.careers360.com/india-skills-report-2026-cs-computer-science-it-engineer-top-jobs-mba-employment-decline-ai-ml-bfsi-fmcg-pharma-women-hiring'

export const stats = [
  {
    id: 'unemployed',
    figure: '83%',
    text: 'of engineering graduates are without a job or internship offer.',
    source: 'Unstop Talent Report 2025, via Business Standard, 21 March 2025',
    href: 'https://www.business-standard.com/industry/news/83-engineering-graduates-have-no-jobs-internship-offers-report-125032100856_1.html',
  },
  {
    id: 'kanpur-salary',
    figure: '₹12,605',
    text: 'a month is the average web developer salary in Kanpur.',
    source: 'Indeed',
    href: 'https://in.indeed.com/career/web-developer/salaries/Kanpur--Uttar-Pradesh',
  },
  {
    id: 'employability',
    figure: '70.15%',
    text: 'BE/BTech employability, down from 71.5% the previous year.',
    source: 'India Skills Report 2026, via Careers360',
    href: CAREERS360,
  },
  {
    id: 'genai-at-work',
    figure: '90%+',
    text: 'of Indian employees already work with generative AI tools.',
    source: 'India Skills Report 2026, via Careers360',
    href: CAREERS360,
  },
]

export const STATS_DISCLAIMER = "Market context, not a prediction of any student's outcome."
