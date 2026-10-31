import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage, { LegalSection } from '@/components/marketing/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms and conditions for using Star Haven Strength coaching services.',
}

const CONTACT_EMAIL = 'acurless54@gmail.com'

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="The terms that govern your use of Star Haven Strength."
    >
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use
        of the Star Haven Strength website and coaching services. By creating an
        account or using the service, you agree to these Terms.
      </p>

      <LegalSection heading="Eligibility & Accounts">
        <p>
          You must provide accurate information when creating an account and keep
          your login credentials secure. Accounts for minors must be created and
          supervised by a parent or legal guardian, who accepts these Terms on
          the minor&rsquo;s behalf. You are responsible for activity that occurs
          under your account.
        </p>
      </LegalSection>

      <LegalSection heading="The Service">
        <p>
          Star Haven Strength provides online personal training, programming,
          educational content, and related tools. Coaching is individualized
          guidance based on the information you provide; results vary from person
          to person and are not guaranteed.
        </p>
      </LegalSection>

      <LegalSection heading="Subscriptions & Billing">
        <p>
          Paid tiers are billed as recurring subscriptions through our payment
          processor, Stripe. By subscribing you authorize recurring charges until
          you cancel. You can manage or cancel your subscription at any time
          through the billing portal. See our{' '}
          <Link
            href="/refund-policy"
            className="font-medium text-green hover:underline"
          >
            Refund Policy
          </Link>{' '}
          for cancellation details.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Share your account or resell access to the service.</li>
          <li>
            Copy, redistribute, or republish coaching content, programs, or
            videos without permission.
          </li>
          <li>
            Misuse the platform, attempt to disrupt it, or access data that is not
            yours.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Health & Safety">
        <p>
          The service is not medical advice. You should consult a physician before
          beginning any exercise or nutrition program, and you train at your own
          risk. Please review our{' '}
          <Link
            href="/medical-disclaimer"
            className="font-medium text-green hover:underline"
          >
            Medical Disclaimer
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Intellectual Property">
        <p>
          All content provided through the service — including programs, written
          material, and videos — is owned by Star Haven Strength or its licensors
          and is provided for your personal, non-commercial use only.
        </p>
      </LegalSection>

      <LegalSection heading="Disclaimers & Limitation of Liability">
        <p>
          The service is provided &ldquo;as is&rdquo; without warranties of any
          kind. To the fullest extent permitted by law, Star Haven Strength is not
          liable for any indirect, incidental, or consequential damages arising
          from your use of the service.
        </p>
      </LegalSection>

      <LegalSection heading="Termination">
        <p>
          You may stop using the service at any time. We may suspend or terminate
          accounts that violate these Terms. Provisions that by their nature
          should survive termination will survive.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to These Terms">
        <p>
          We may update these Terms from time to time. Material changes will be
          reflected by updating the effective date above, and continued use of the
          service constitutes acceptance of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these Terms? Email{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-green hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
