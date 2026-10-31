'use client'

interface PillSelectProps {
  options: readonly string[]
  /** Selected values. For single-select, an array with 0 or 1 entries. */
  selected: string[]
  onChange: (next: string[]) => void
  multiSelect?: boolean
  size?: 'sm' | 'md'
}

/**
 * Pill-style selector used throughout the intake form.
 * - Selected: deep green background, white text.
 * - Unselected: white with border, hover light-green.
 * In single-select mode only one pill can be active at a time.
 */
export default function PillSelect({
  options,
  selected,
  onChange,
  multiSelect = false,
  size = 'md',
}: PillSelectProps) {
  function toggle(option: string) {
    if (multiSelect) {
      if (selected.includes(option)) {
        onChange(selected.filter((s) => s !== option))
      } else {
        onChange([...selected, option])
      }
    } else {
      onChange(selected[0] === option ? [] : [option])
    }
  }

  const sizeClasses =
    size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5 text-sm'

  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((option) => {
        const isSelected = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggle(option)}
            className={[
              'rounded-full border font-body font-medium transition-colors',
              sizeClasses,
              isSelected
                ? 'border-green bg-green text-white'
                : 'border-grey-mid bg-white text-charcoal hover:border-green hover:bg-green/5',
            ].join(' ')}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
