'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export interface FaqItem {
  q: string
  a: string
}

/** Accessible accordion for the FAQ page. */
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-grey-mid bg-white"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-base font-bold text-charcoal">
                {item.q}
              </span>
              {isOpen ? (
                <Minus className="shrink-0 text-green" size={20} />
              ) : (
                <Plus className="shrink-0 text-green" size={20} />
              )}
            </button>
            {isOpen && (
              <div className="border-t border-grey-mid px-5 py-4">
                <p className="font-body text-sm leading-relaxed text-grey-dark">
                  {item.a}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
