import { Check } from 'lucide-react'

interface StepProgressBarProps {
  /** 1-based index of the active step */
  currentStep: number
  totalSteps: number
  stepLabels: readonly string[]
}

/**
 * Horizontal step indicator.
 * - Completed steps: gold circle with check.
 * - Active step: deep green circle.
 * - Upcoming steps: grey circle.
 */
export default function StepProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
}: StepProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1
          const isCompleted = step < currentStep
          const isActive = step === currentStep
          const label = stepLabels[i]

          return (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors',
                    isCompleted
                      ? 'bg-gold text-charcoal'
                      : isActive
                        ? 'bg-green text-white ring-4 ring-green/15'
                        : 'bg-grey-mid text-grey-dark',
                  ].join(' ')}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? <Check size={18} /> : step}
                </div>
                <span
                  className={[
                    'mt-2 hidden text-xs font-medium sm:block',
                    isActive
                      ? 'text-green'
                      : isCompleted
                        ? 'text-gold-dark'
                        : 'text-grey-dark',
                  ].join(' ')}
                >
                  {label}
                </span>
              </div>

              {step < totalSteps && (
                <div
                  className={[
                    'mx-2 h-0.5 flex-1 rounded-full transition-colors',
                    step < currentStep ? 'bg-gold' : 'bg-grey-mid',
                  ].join(' ')}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
