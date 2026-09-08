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

/** The primary action, site-wide. One label, one destination. */
export function ApplyButton({ className = '', short = false, ...rest }) {
  return (
    <LinkButton to="/apply" variant="primary" className={className} {...rest}>
      {short ? 'Apply' : 'Apply for Batch 1'}
    </LinkButton>
  )
}
