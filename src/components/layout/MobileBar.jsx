import { ApplyButton } from '../ui/Button.jsx'
import WhatsAppButton from '../ui/WhatsAppButton.jsx'

/** Spec 3.4: a single bar at the bottom on mobile. Apply on the left, WhatsApp on the right. */
export default function MobileBar() {
  return (
    <div className="mobile-bar" role="navigation" aria-label="Quick actions">
      <ApplyButton short />
      <WhatsAppButton label="WhatsApp" />
    </div>
  )
}
