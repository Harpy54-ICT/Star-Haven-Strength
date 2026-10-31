import MarketingHeader from '@/components/marketing/MarketingHeader'
import MarketingFooter from '@/components/marketing/MarketingFooter'

/**
 * Shared layout for all public marketing pages (home, about, services,
 * contact, FAQ, references, sample workouts, coach's office, pricing…).
 * Provides the sticky header and footer around every page.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-grey-light">
      <MarketingHeader />
      <div className="flex-1">{children}</div>
      <MarketingFooter />
    </div>
  )
}
