'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Minus, Plus, Pencil } from 'lucide-react'
import StepProgressBar from '@/components/onboarding/StepProgressBar'
import PillSelect from '@/components/onboarding/PillSelect'
import {
  CHRONIC_CONDITIONS,
  TRAINING_STYLES,
  EQUIPMENT_OPTIONS,
  DAYS_PER_WEEK_OPTIONS,
  PRIMARY_GOALS,
  TIMELINE_OPTIONS,
  FITNESS_LEVELS,
  INTAKE_STEP_LABELS,
  DEFAULT_INTAKE,
  type IntakeFormData,
} from '@/types/intake'

const TOTAL_STEPS = 4

function YesNoToggle({
  value,
  onChange,
}: {
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-grey-mid">
      {[
        { label: 'Yes', val: true },
        { label: 'No', val: false },
      ].map(({ label, val }) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(val)}
          className={[
            'px-6 py-2 text-sm font-medium transition-colors',
            value === val
              ? 'bg-green text-white'
              : 'bg-white text-charcoal hover:bg-green/5',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block font-body text-sm font-semibold text-charcoal">
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-grey-mid bg-white px-4 py-3 font-body text-charcoal outline-none focus:border-green focus:ring-2 focus:ring-green/20'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<IntakeFormData>(DEFAULT_INTAKE)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const s1 = data.step1
  const s2 = data.step2
  const s3 = data.step3

  function set1<K extends keyof typeof s1>(key: K, value: (typeof s1)[K]) {
    setData((d) => ({ ...d, step1: { ...d.step1, [key]: value } }))
  }
  function set2<K extends keyof typeof s2>(key: K, value: (typeof s2)[K]) {
    setData((d) => ({ ...d, step2: { ...d.step2, [key]: value } }))
  }
  function set3<K extends keyof typeof s3>(key: K, value: (typeof s3)[K]) {
    setData((d) => ({ ...d, step3: { ...d.step3, [key]: value } }))
  }

  function validateStep(current: number): string | null {
    if (current === 1) {
      if (s1.hasInjuries && !s1.injuriesDetail.trim())
        return 'Please describe your current injuries.'
      if (
        s1.chronicConditions.includes('Other') &&
        !s1.chronicConditionOther.trim()
      )
        return 'Please specify your other chronic condition.'
      if (s1.recentSurgery && !s1.recentSurgeryDetail.trim())
        return 'Please describe your recent surgery.'
    }
    if (current === 2) {
      if (s2.trainingStyles.length === 0)
        return 'Select at least one preferred training style.'
      if (!s2.daysPerWeek) return 'Select how many days per week you train.'
      if (s2.equipmentAccess.length === 0)
        return 'Select at least one equipment option.'
    }
    if (current === 3) {
      if (!s3.primaryGoal) return 'Select your primary goal.'
      if (!s3.targetTimeline) return 'Select a target timeline.'
    }
    return null
  }

  function next() {
    const err = validateStep(step)
    if (err) {
      setError(err)
      return
    }
    setError('')
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  function back() {
    setError('')
    setStep((s) => Math.max(s - 1, 1))
  }

  async function submit() {
    for (let i = 1; i <= 3; i++) {
      const err = validateStep(i)
      if (err) {
        setError(err)
        setStep(i)
        return
      }
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/onboarding/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }
      router.push(json.redirect || '/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-grey-light px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-2 text-center">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-green">
            Let&apos;s Build Your Profile
          </h1>
          <p className="mt-1 font-body text-grey-dark">
            A few questions so your coach can tailor your program.
          </p>
        </div>

        <div className="my-8">
          <StepProgressBar
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            stepLabels={INTAKE_STEP_LABELS}
          />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* STEP 1 — Medical */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-bold text-charcoal">
                Medical History
              </h2>

              <div>
                <FieldLabel>Do you have any current injuries?</FieldLabel>
                <YesNoToggle
                  value={s1.hasInjuries}
                  onChange={(v) => set1('hasInjuries', v)}
                />
                {s1.hasInjuries && (
                  <textarea
                    value={s1.injuriesDetail}
                    onChange={(e) => set1('injuriesDetail', e.target.value)}
                    placeholder="Describe your injuries…"
                    rows={3}
                    className={`mt-3 ${inputClass}`}
                  />
                )}
              </div>

              <div>
                <FieldLabel>Any chronic conditions?</FieldLabel>
                <PillSelect
                  options={CHRONIC_CONDITIONS}
                  selected={s1.chronicConditions}
                  onChange={(v) => set1('chronicConditions', v)}
                  multiSelect
                />
                {s1.chronicConditions.includes('Other') && (
                  <input
                    type="text"
                    value={s1.chronicConditionOther}
                    onChange={(e) =>
                      set1('chronicConditionOther', e.target.value)
                    }
                    placeholder="Please specify…"
                    className={`mt-3 ${inputClass}`}
                  />
                )}
              </div>

              <div>
                <FieldLabel>Any surgery in the last 12 months?</FieldLabel>
                <YesNoToggle
                  value={s1.recentSurgery}
                  onChange={(v) => set1('recentSurgery', v)}
                />
                {s1.recentSurgery && (
                  <input
                    type="text"
                    value={s1.recentSurgeryDetail}
                    onChange={(e) =>
                      set1('recentSurgeryDetail', e.target.value)
                    }
                    placeholder="Describe the procedure…"
                    className={`mt-3 ${inputClass}`}
                  />
                )}
              </div>

              <div>
                <FieldLabel>
                  Have you been cleared by a doctor for exercise?
                </FieldLabel>
                <YesNoToggle
                  value={s1.clearedByDoctor}
                  onChange={(v) => set1('clearedByDoctor', v)}
                />
              </div>

              <div>
                <FieldLabel>
                  Are you on medications affecting exercise?
                </FieldLabel>
                <YesNoToggle
                  value={s1.medicationsAffectingExercise}
                  onChange={(v) => set1('medicationsAffectingExercise', v)}
                />
                {s1.medicationsAffectingExercise && (
                  <textarea
                    value={s1.medicationsDetail}
                    onChange={(e) => set1('medicationsDetail', e.target.value)}
                    placeholder="Optional — add any detail that helps your coach…"
                    rows={2}
                    className={`mt-3 ${inputClass}`}
                  />
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Background */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-bold text-charcoal">
                Fitness Background
              </h2>

              <div>
                <div className="flex items-center justify-between">
                  <FieldLabel>Current fitness level</FieldLabel>
                  <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-charcoal">
                    {FITNESS_LEVELS[s2.fitnessLevel - 1]}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={s2.fitnessLevel}
                  onChange={(e) =>
                    set2('fitnessLevel', Number(e.target.value))
                  }
                  className="mt-2 w-full accent-green"
                />
                <div className="mt-1 flex justify-between font-body text-xs text-grey-dark">
                  {FITNESS_LEVELS.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>Years of training</FieldLabel>
                <div className="inline-flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      set2('yearsTraining', Math.max(0, s2.yearsTraining - 1))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-grey-mid text-charcoal hover:bg-green/5"
                    aria-label="Decrease years"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={s2.yearsTraining}
                    onChange={(e) =>
                      set2(
                        'yearsTraining',
                        Math.max(0, Math.min(50, Number(e.target.value) || 0))
                      )
                    }
                    className="w-20 rounded-lg border border-grey-mid px-3 py-2 text-center font-mono text-charcoal outline-none focus:border-green"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set2('yearsTraining', Math.min(50, s2.yearsTraining + 1))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-grey-mid text-charcoal hover:bg-green/5"
                    aria-label="Increase years"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div>
                <FieldLabel>Preferred training styles</FieldLabel>
                <PillSelect
                  options={TRAINING_STYLES}
                  selected={s2.trainingStyles}
                  onChange={(v) => set2('trainingStyles', v)}
                  multiSelect
                />
              </div>

              <div>
                <FieldLabel>Days per week training</FieldLabel>
                <PillSelect
                  options={DAYS_PER_WEEK_OPTIONS}
                  selected={s2.daysPerWeek ? [s2.daysPerWeek] : []}
                  onChange={(v) => set2('daysPerWeek', v[0] ?? '')}
                />
              </div>

              <div>
                <FieldLabel>Equipment access</FieldLabel>
                <PillSelect
                  options={EQUIPMENT_OPTIONS}
                  selected={s2.equipmentAccess}
                  onChange={(v) => set2('equipmentAccess', v)}
                  multiSelect
                />
              </div>
            </div>
          )}

          {/* STEP 3 — Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-bold text-charcoal">
                Goals &amp; Timeline
              </h2>

              <div>
                <FieldLabel>Primary goal</FieldLabel>
                <PillSelect
                  options={PRIMARY_GOALS}
                  selected={s3.primaryGoal ? [s3.primaryGoal] : []}
                  onChange={(v) => set3('primaryGoal', v[0] ?? '')}
                />
              </div>

              <div>
                <FieldLabel>Target timeline</FieldLabel>
                <PillSelect
                  options={TIMELINE_OPTIONS}
                  selected={s3.targetTimeline ? [s3.targetTimeline] : []}
                  onChange={(v) => set3('targetTimeline', v[0] ?? '')}
                />
              </div>

              <div>
                <FieldLabel>Specific numeric goal? (optional)</FieldLabel>
                <input
                  type="text"
                  value={s3.numericGoal}
                  onChange={(e) => set3('numericGoal', e.target.value)}
                  placeholder="e.g. Deadlift 405 lbs, run a sub-25 2-mile"
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel>
                  Anything else your coach should know? (optional)
                </FieldLabel>
                <textarea
                  value={s3.additionalNotes}
                  onChange={(e) => set3('additionalNotes', e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* STEP 4 — Review */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-charcoal">
                Review &amp; Confirm
              </h2>

              <ReviewCard title="Medical History" onEdit={() => setStep(1)}>
                <ReviewRow
                  label="Current injuries"
                  value={s1.hasInjuries ? s1.injuriesDetail || 'Yes' : 'No'}
                />
                <ReviewRow
                  label="Chronic conditions"
                  value={
                    s1.chronicConditions.length
                      ? s1.chronicConditions
                          .map((c) =>
                            c === 'Other' && s1.chronicConditionOther
                              ? `Other: ${s1.chronicConditionOther}`
                              : c
                          )
                          .join(', ')
                      : 'None'
                  }
                />
                <ReviewRow
                  label="Recent surgery"
                  value={
                    s1.recentSurgery ? s1.recentSurgeryDetail || 'Yes' : 'No'
                  }
                />
                <ReviewRow
                  label="Cleared by doctor"
                  value={s1.clearedByDoctor ? 'Yes' : 'No'}
                />
                <ReviewRow
                  label="Medications affecting exercise"
                  value={
                    s1.medicationsAffectingExercise
                      ? s1.medicationsDetail || 'Yes'
                      : 'No'
                  }
                />
              </ReviewCard>

              <ReviewCard title="Fitness Background" onEdit={() => setStep(2)}>
                <ReviewRow
                  label="Fitness level"
                  value={FITNESS_LEVELS[s2.fitnessLevel - 1]}
                />
                <ReviewRow
                  label="Years training"
                  value={String(s2.yearsTraining)}
                />
                <ReviewRow
                  label="Training styles"
                  value={s2.trainingStyles.join(', ') || '—'}
                />
                <ReviewRow label="Days per week" value={s2.daysPerWeek || '—'} />
                <ReviewRow
                  label="Equipment"
                  value={s2.equipmentAccess.join(', ') || '—'}
                />
              </ReviewCard>

              <ReviewCard title="Goals & Timeline" onEdit={() => setStep(3)}>
                <ReviewRow label="Primary goal" value={s3.primaryGoal || '—'} />
                <ReviewRow
                  label="Target timeline"
                  value={s3.targetTimeline || '—'}
                />
                <ReviewRow
                  label="Numeric goal"
                  value={s3.numericGoal || '—'}
                />
                <ReviewRow label="Notes" value={s3.additionalNotes || '—'} />
              </ReviewCard>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={back}
                disabled={submitting}
                className="rounded-lg border border-grey-mid px-6 py-3 font-display font-semibold uppercase tracking-wide text-charcoal transition-colors hover:bg-grey-light disabled:opacity-60"
              >
                Back
              </button>
            ) : (
              <span />
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={next}
                className="rounded-lg bg-green px-8 py-3 font-display font-semibold uppercase tracking-wide text-gold transition-colors hover:bg-green-light"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-4 font-display text-lg font-bold uppercase tracking-wide text-charcoal transition-colors hover:bg-gold-light disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Saving…
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewCard({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-grey-mid bg-grey-light/50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-green">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-sm font-medium text-gold-dark hover:text-gold"
        >
          <Pencil size={14} /> Edit
        </button>
      </div>
      <dl className="space-y-1.5">{children}</dl>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="font-body text-sm text-grey-dark">{label}</dt>
      <dd className="font-body text-sm font-medium text-charcoal sm:text-right">
        {value}
      </dd>
    </div>
  )
}
