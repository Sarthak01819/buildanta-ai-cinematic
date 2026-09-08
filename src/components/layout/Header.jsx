import { Link, NavLink } from 'react-router'
import { useNavSolid } from '../../hooks/useNavSolid.js'
import { ApplyButton } from '../ui/Button.jsx'

/** Header per spec 3.1: logo, Programme, For Parents, Proof, and the one button. Mobile keeps logo + Apply. */
export default function Header() {
  const solid = useNavSolid()
  return (
    <header className={solid ? 'nav solid' : 'nav'}>
      <div className="container nav-inner">
        <Link className="wordmark" to="/" translate="no" aria-label="BUILDANTA AI Institute, home">
          <span className="mark" aria-hidden="true">
            <img src="/brand/buildanta-mark.svg" alt="" width="26" height="26" decoding="async" />
          </span>
          <span className="wordmark-text">
            <b>BUILDANTA</b> <span>AI Institute</span>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link to="/#programme">Programme</Link>
          <NavLink to="/for-parents">For Parents</NavLink>
          <NavLink to="/proof">Proof</NavLink>
        </nav>
        <ApplyButton className="nav-cta" aria-label="Apply for Batch 1">
          <span className="lbl-full">Apply for Batch 1</span>
          <span className="lbl-short">Apply</span>
        </ApplyButton>
      </div>
    </header>
  )
}
