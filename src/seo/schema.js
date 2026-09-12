import { site } from '../config/site.js'
import { faq } from '../content/programme.js'

const LOGO = '/brand/buildanta-180.png'
const IMAGE = '/assets/hero-ending.jpg'

function postalAddress() {
  const address = {
    '@type': 'PostalAddress',
    addressLocality: site.city,
    addressRegion: site.state,
    addressCountry: site.country,
  }
  if (site.address.street) address.streetAddress = site.address.street
  if (site.address.pin) address.postalCode = site.address.pin
  return address
}

/** EducationalOrganization + LocalBusiness, as the launch checklist asks. Placeholders are omitted, never invented. */
export function organization() {
  const org = {
    '@context': 'https://schema.org',
    '@type': ['EducationalOrganization', 'LocalBusiness'],
    '@id': `${site.url}/#organization`,
    name: site.name,
    legalName: site.company,
    url: site.url,
    logo: site.url + LOGO,
    image: site.url + IMAGE,
    address: postalAddress(),
    areaServed: site.city,
  }
  if (site.phone) org.telephone = site.phone
  if (site.email) org.email = site.email
  if (site.gstin) org.taxID = site.gstin
  const sameAs = [site.social.instagram, site.social.facebook].filter(Boolean)
  if (sameAs.length) org.sameAs = sameAs
  return org
}

export function course() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: site.programme,
    description:
      'A 28-day programme in Kanpur: 3 days of tool fluency, 9 days for three guided projects, 2 days of hardening and a mock interview, then 14 remote days for a student-chosen project. The guided builds cover a web application, an agent and a media piece. Remote support includes a written scope and live check-ins on days 21 and 28.',
    provider: { '@type': 'EducationalOrganization', name: site.name, url: site.url },
    url: `${site.url}/`,
    offers: {
      '@type': 'Offer',
      price: String(site.pricing.total),
      priceCurrency: 'INR',
      availability: 'https://schema.org/PreOrder',
      url: `${site.url}/apply`,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: ['Onsite', 'Online'],
      courseWorkload: 'P28D',
      location: { '@type': 'Place', name: site.name, address: postalAddress() },
    },
  }
}

export function faqPage() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

export function article(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'What is Claude Code?',
    description: page.description,
    mainEntityOfPage: site.url + page.path,
    datePublished: '2026-09-08',
    dateModified: site.legal.lastUpdated,
    author: { '@type': 'Organization', name: site.name },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: { '@type': 'ImageObject', url: site.url + LOGO },
    },
  }
}

export function buildJsonLd(page) {
  const blocks = []
  for (const key of page.schema || []) {
    if (key === 'organization') blocks.push(organization())
    else if (key === 'course') blocks.push(course())
    else if (key === 'faq') blocks.push(faqPage())
    else if (key === 'article') blocks.push(article(page))
  }
  return blocks
}
