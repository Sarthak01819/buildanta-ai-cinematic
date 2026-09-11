import { Link } from 'react-router'

/**
 * One button, two looks. `to` renders a router Link for internal routes,
 * `href` renders a plain anchor for external, tel: and mailto: links.
 */
export function LinkButton({ to, href, variant = 'primary', className = '', children, ...rest }) {
  const cls = ['btn', `btn-${variant}`, className].filter(Boolean).join(' ')
  if (to) {
    return (
      <Link className={cls} to={to} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a className={cls} href={href} {...rest}>
      {children}
    </a>
  )
}

/**
 * The primary action, site-wide. One destination, and by default one label:
 * the full one, or the verb alone when `short` is set.
 *
 * A caller that needs both at once passes them as children, which is how the
 * header swaps its label in CSS at a breakpoint rather than in JavaScript on
 * resize. Children have to be named here rather than left in `rest`, because
 * anything written between this component's own tags below would otherwise
 * win and the caller's markup would be dropped on the floor.
 */
export function ApplyButton({ className = '', short = false, children, ...rest }) {
  return (
    <LinkButton to="/apply" variant="primary" className={className} {...rest}>
      {children ?? (short ? 'Apply' : 'Apply for Batch 1')}
    </LinkButton>
  )
}
