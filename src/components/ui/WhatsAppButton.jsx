import { LinkButton } from './Button.jsx'
import { whatsappHref, hasWhatsapp } from '../../lib/contact.js'

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path
        d="M3 3h12v9H8l-3 3v-3H3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        shapeRendering="crispEdges"
      />
      <path d="M6 6h6M6 9h4" stroke="currentColor" strokeWidth="2" shapeRendering="crispEdges" />
    </svg>
  )
}

/**
 * The WhatsApp link that sits beside every primary action (spec 3.3).
 * Until the number is configured it opens the Apply page so it is never dead.
 */
export default function WhatsAppButton({
  message,
  label = 'Message us on WhatsApp',
  variant = 'ghost',
  className = '',
  ...rest
}) {
  const href = whatsappHref(message)
  const live = hasWhatsapp()
  const linkProps = live ? { href, target: '_blank', rel: 'noopener' } : { to: href }
  return (
    <LinkButton
      variant={variant}
      className={className}
      title={live ? undefined : 'WhatsApp number not added yet. Opens the application page for now.'}
      data-pending={live ? undefined : 'whatsapp'}
      {...linkProps}
      {...rest}
    >
      <ChatIcon />
      {label}
    </LinkButton>
  )
}
