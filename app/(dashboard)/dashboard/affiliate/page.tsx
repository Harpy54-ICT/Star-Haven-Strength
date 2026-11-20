import { redirect } from 'next/navigation'

/**
 * The client refer-a-friend program lives at /dashboard/referrals. Keep this
 * older /dashboard/affiliate URL working for any existing links/bookmarks by
 * redirecting to it.
 */
export default function AffiliateRedirect() {
  redirect('/dashboard/referrals')
}
