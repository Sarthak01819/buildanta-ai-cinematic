import { ApplyButton, LinkButton } from '../components/ui/Button.jsx'

/** Spec 4.10. Honest, and short. */
export default function NotFound() {
  return (
    <section className="section notfound" aria-labelledby="notfound-heading">
      <div className="container">
        <h1 id="notfound-heading">That page does not exist.</h1>
        <p className="lede">Which is at least honest. Here is what does:</p>
        <div className="btn-row">
          <LinkButton to="/" variant="ghost">
            Home
          </LinkButton>
          <LinkButton to="/#programme" variant="ghost">
            The programme
          </LinkButton>
          <ApplyButton />
        </div>
      </div>
    </section>
  )
}
