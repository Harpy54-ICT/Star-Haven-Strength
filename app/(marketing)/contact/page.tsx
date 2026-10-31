import type { Metadata } from 'next'
import { Mail, MapPin, Clock } from 'lucide-react'
import ContactForm from '@/components/marketing/ContactForm'

export const metadata: Metadata = {
  title: 'Contact | Star Haven Strength',
  description:
    'Get in touch with Star Haven Strength. Ask about coaching tiers, military discounts, or getting started.',
}

export default function ContactPage() {
  return (
    <main>
      <section className="bg-charcoal px-4 py-20 text-center sm:px-6">
        <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-gold">
          Get In Touch
        </span>
        <h1 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-wide text-white sm:text-5xl">
          Contact
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-white/70">
          Questions about coaching, tiers, or military discounts? Send a message
          and Andrew will get back to you.
        </p>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-green">
              Send a Message
            </h2>
            <p className="mt-2 font-body text-sm text-grey-dark">
              We&apos;ll never share your information. No spam.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-grey-mid bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-green/10">
                <Mail className="text-green" size={22} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold uppercase tracking-wide text-charcoal">
                Coaching Inquiries
              </h3>
              <p className="mt-2 font-body text-sm text-grey-dark">
                Use the form to reach out about any tier. We respond to every
                message personally.
              </p>
            </div>
            <div className="rounded-xl border border-grey-mid bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-green/10">
                <Clock className="text-green" size={22} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold uppercase tracking-wide text-charcoal">
                Response Time
              </h3>
              <p className="mt-2 font-body text-sm text-grey-dark">
                Most inquiries receive a reply within 1–2 business days.
              </p>
            </div>
            <div className="rounded-xl border border-grey-mid bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-green/10">
                <MapPin className="text-green" size={22} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold uppercase tracking-wide text-charcoal">
                Training
              </h3>
              <p className="mt-2 font-body text-sm text-grey-dark">
                Online coaching available anywhere. In-person details shared on
                request.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
