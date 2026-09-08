import { useEffect } from 'react'
import { Outlet } from 'react-router'
import Environment from './Environment.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import MobileBar from './MobileBar.jsx'
import ScrollManager from './ScrollManager.jsx'
import Seo from '../seo/Seo.jsx'

/** Pauses every CSS loop while the tab is hidden. Not inherited, so the class sits on body. */
function usePauseWhenHidden() {
  useEffect(() => {
    function sync() {
      document.body.classList.toggle('paused', document.hidden)
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])
}

export default function Layout() {
  usePauseWhenHidden()
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Environment />
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <MobileBar />
      <Seo />
      <ScrollManager />
    </>
  )
}
