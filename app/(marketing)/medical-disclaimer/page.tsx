import type { Metadata } from 'next'
import LegalPage, { LegalSection } from '@/components/marketing/LegalPage'

export const metadata: Metadata = {
  title: 'Medical Disclaimer',
  description:
    'Important health and safety information about using Star Haven Strength coaching.',
}

const CONTACT_EMAIL = 'acurless54@gmail.com'

export default function MedicalDisclaimerPage() {
  return (
    <LegalPage
      title="Medical Disclaimer"
      intro="Please read this important health and safety information."
    >
      <LegalSection heading="Not Medical Advice">
        <p>
          The information, programs, coaching, and content provided by Star Haven
          Strength are for general fitness and educational purposes only. They are
          not medical advice and are not a substitute for professional medical
          diagnosis, treatment, or advice from a licensed healthcare provider.
          Nothing here should be used to diagnose or treat any health condition.
        </p>
      </LegalSection>

      <LegalSection heading="Consult a Physician First">
        <p>
          You should consult your physician or a qualified healthcare provider
          before beginning any exercise or nutrition program, especially if you
          are pregnant, have a medical condition or injury, take medication, or
          have any concerns about your health. Stop exercising and seek medical
          attention if you experience pain, dizziness, shortness of breath, or any
          symptom that concerns you.
        </p>
      </LegalSection>

      <LegalSection heading="Assumption of Risk">
        <p>
          Physical exercise carries inherent risks, including the risk of injury.
          By using Star Haven Strength and following any program or guidance
          provided, you acknowledge and voluntarily accept these risks and agree
          that you participate at your own risk. You are responsible for exercising
          within your own limits and using proper form and equipment.
        </p>
      </LegalSection>

      <LegalSection heading="Questions">
        <p>
          If you have questions about this disclaimer, contact{' '}
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
