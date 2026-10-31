import Link from 'next/link'
import { ShieldCheck, ArrowRight } from 'lucide-react'

interface MilitaryDiscountBannerProps {
  /** Optional override for the verify link destination. */
  verifyHref?: string
}

/**
 * Gold banner prompting unverified military/veteran users to verify their
 * status and unlock the 20% lifetime discount. Render this only when the user's
 * accountType is 'military' or 'veteran' and militaryVerified is false.
 */
export default function MilitaryDiscountBanner({
  verifyHref = '/dashboard/settings/profile',
}: MilitaryDiscountBannerProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-gold/40 bg-gold/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 shrink-0 text-gold-dark" size={24} />
        <div>
          <p className="font-display text-base font-bold text-green">
            Unlock your 20% lifetime military discount
          </p>
          <p className="font-body text-sm text-grey-dark">
            Verify your military or veteran status to apply a 20% discount to
            your membership — forever.
          </p>
        </div>
      </div>
      <Link
        href={verifyHref}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-gold px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide text-green-dark transition-colors hover:bg-gold-light"
      >
        Verify Now
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}
