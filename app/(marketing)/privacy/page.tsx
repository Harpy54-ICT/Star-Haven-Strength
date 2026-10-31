import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage, { LegalSection } from '@/components/marketing/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Star Haven Strength collects, uses, and protects your personal information.',
}

const CONTACT_EMAIL = 'acurless54@gmail.com'

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="How we collect, use, and protect your information."
    >
      <p>
        This Privacy Policy explains how Star Haven Strength (&ldquo;we,&rdquo;
        &ldquo;us,&rdquo; or &ldquo;our&rdquo;), a veteran-owned online personal
        training business, handles information about you when you use our website
        and coaching services.
      </p>

      <LegalSection heading="Information We Collect">
        <p>We collect the following categories of information:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Account information</strong> — your name, email address, and
            password (passwords are stored only as a secure hash).
          </li>
          <li>
            <strong>Intake &amp; health questionnaire</strong> — the training and
            health details you provide during onboarding so your coach can tailor
            your program.
          </li>
          <li>
            <strong>Training data</strong> — workout logs, body metrics, progress
            photos, nutrition and habit entries, check-ins, and messages.
          </li>
          <li>
            <strong>Payment information</strong> — handled by our payment
            processor; we do not store full card numbers.
          </li>
          <li>
            <strong>Technical data</strong> — basic data such as the referral
            code you arrived with and your authenticated session.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Why We Collect It">
        <p>
          We use your information to provide and personalize coaching, operate
          your account, process payments and discounts, communicate with you,
          and improve our services. We do not sell your personal information.
        </p>
      </LegalSection>

      <LegalSection heading="Service Providers (Processors)">
        <p>
          We share information with third-party providers only as needed to run
          the service:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Stripe</strong> — payment processing and subscription
            billing.
          </li>
          <li>
            <strong>Vercel</strong> — website hosting and file storage (including
            progress photos stored via Vercel Blob).
          </li>
          <li>
            <strong>Google</strong> — optional sign-in, and Google Calendar /
            Google Meet for scheduling coaching sessions.
          </li>
          <li>
            <strong>YouTube</strong> — embedded coaching and educational videos.
          </li>
        </ul>
        <p>
          Each provider processes data under its own terms and privacy policy.
        </p>
      </LegalSection>

      <LegalSection heading="Data Retention">
        <p>
          We keep your information for as long as your account is active and as
          needed to provide the service. If you close your account or request
          deletion, we will delete or anonymize your personal information except
          where we are required to retain certain records (for example, billing
          records) by law.
        </p>
      </LegalSection>

      <LegalSection heading="Your Rights">
        <p>
          You may request access to, correction of, or deletion of your personal
          information. To make a request, contact us at{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-green hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          . We will respond within a reasonable time.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>We use a small number of cookies:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Authentication session cookie</strong> — keeps you signed in
            securely.
          </li>
          <li>
            <strong>Referral cookie</strong> — remembers the referral code you
            arrived with so credit can be attributed if you sign up.
          </li>
        </ul>
        <p>We do not use these cookies for third-party advertising.</p>
      </LegalSection>

      <LegalSection heading="Children &amp; Youth Athletes">
        <p>
          Our services may be used by youth athletes, but accounts for minors
          must be created and managed with the consent and involvement of a
          parent or legal guardian. A parent or guardian must agree to this
          policy and our Terms on the minor&rsquo;s behalf. If you believe a
          minor has provided us information without the required consent, please
          contact us and we will take appropriate steps.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about this policy? Email{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-green hover:underline"
          >
            {CONTACT_EMAIL}
          </a>{' '}
          or use our{' '}
          <Link href="/contact" className="font-medium text-green hover:underline">
            contact form
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
