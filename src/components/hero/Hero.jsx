import ScrubHero from './ScrubHero.jsx'
import StaticHero from './StaticHero.jsx'

/**
 * Both heroes, always in the DOM. The five media-query gates in motion.css
 * decide which one shows, so the server and the client render the same
 * markup and the page never has to guess the device before it paints.
 * Each carries `data-hero`; the nav bar reads whichever one has a height.
 */
export default function Hero() {
  return (
    <>
      <ScrubHero />
      <StaticHero />
    </>
  )
}
