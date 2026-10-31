import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage, { LegalSection } from '@/components/marketing/LegalPage'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description:
    'Star Haven Strength cancellation and refund policy for coaching subscriptions.',
}

const CONTACT_EMAIL = 'acurless54@gmail.com'

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      intro="How cancellations and refunds work for your subscription."
    >
      <p>
        This is Andrew&rsquo;s refund and cancellation policy for Star Haven
        Strength. It is intended to be clear and fair, and Andrew may update it
        over time — the current version always appears on this page.
      </p>

      <LegalSection heading="Cancel Any Time">
        <p>
          You can cancel your subscription at any time through the billing portal
          — open it from your{' '}
          <Link
            href="/dashboard/settings/billing"
            className="font-medium text-green hover:underline"
          >
            billing settings
          </Link>
          . No phone call or email is required to cancel.
        </p>
      </LegalSection>

      <LegalSection heading="When Cancellation Takes Effect">
        <p>
          When you cancel, your subscription remains active until the end of your
          current billing period. You keep access to everything in your tier until
          that date, and you will not be charged again afterward.
        </p>
      </LegalSection>

      <LegalSection heading="No Partial-Month Refunds">
        <p>
          Because access continues through the end of the period you have already
          paid for, we do not provide partial-month or prorated refunds for the
          current period, except where a refund is required by applicable law.
        </p>
      </LegalSection>

      <LegalSection heading="Questions or Billing Issues">
        <p>
          If you believe you were charged in error or have a question about your
          billing, contact Andrew at{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-green hover:underline"
          >
            {CONTACT_EMAIL}
          </a>{' '}
          and we will work with you in good faith.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
