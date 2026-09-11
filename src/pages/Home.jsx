import Hero from '../components/hero/Hero.jsx'
import GapStats from '../components/home/GapStats.jsx'
import Tools from '../components/home/Tools.jsx'
import Days from '../components/home/Days.jsx'
import Owns from '../components/home/Owns.jsx'
import Cohort from '../components/home/Cohort.jsx'
import Price from '../components/home/Price.jsx'
import Faq from '../components/home/Faq.jsx'
import Closer from '../components/home/Closer.jsx'

/** The home page, in the original order. Section ids are what the header and footer link to. */
export default function Home() {
  return (
    <>
      <Hero />
      <GapStats />
      <Tools />
      <Days />
      <Owns />
      <Cohort />
      <Price />
      <Faq />
      <Closer />
    </>
  )
}
