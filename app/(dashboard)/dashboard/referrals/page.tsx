import { redirect } from 'next/navigation'

/**
 * The referral program now lives in the richer Affiliate portal. Keep this
 * route working for any old links/bookmarks by redirecting to it.
 */
export default function ReferralsRedirect() {
  redirect('/dashboard/affiliate')
}
