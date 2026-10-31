'use client'

import { useRef, useState } from 'react'
import { X, UploadCloud, FileText, Loader2, ShieldCheck } from 'lucide-react'

const BRANCHES = [
  'Army',
  'Navy',
  'Marine Corps',
  'Air Force',
  'Space Force',
  'Coast Guard',
  'National Guard',
]

const MAX_BYTES = 10 * 1024 * 1024
const ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'

interface Props {
  /** Optional controlled trigger label. */
  triggerLabel?: string
  defaultBranch?: string | null
}

export default function MilitaryVerificationModal({
  triggerLabel = 'Verify Military Status',
  defaultBranch = null,
}: Props) {
  const [open, setOpen] = useState(false)
  const [branch, setBranch] = useState(defaultBranch ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setBranch(defaultBranch ?? '')
    setFile(null)
    setNotes('')
    setError('')
    setSuccess(false)
    setSubmitting(false)
  }

  function close() {
    setOpen(false)
    // Reset shortly after the modal closes.
    setTimeout(reset, 200)
  }

  function validateAndSet(f: File | undefined) {
    if (!f) return
    const okType = ['application/pdf', 'image/jpeg', 'image/png'].includes(
      f.type
    )
    if (!okType) {
      setError('Only PDF, JPG, or PNG files are allowed.')
      return
    }
    if (f.size > MAX_BYTES) {
      setError('File exceeds the 10MB limit.')
      return
    }
    setError('')
    setFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    validateAndSet(e.dataTransfer.files?.[0])
  }

  async function submit() {
    if (!branch) {
      setError('Please select your branch of service.')
      return
    }
    if (!file) {
      setError('Please attach your document.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('branch', branch)
      fd.append('notes', notes)
      const res = await fetch('/api/military-verify/submit', {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Upload failed. Please try again.')
        setSubmitting(false)
        return
      }
      setSuccess(true)
      setSubmitting(false)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-green px-5 py-2.5 font-display font-semibold uppercase tracking-wide text-gold transition-colors hover:bg-green-light"
      >
        <ShieldCheck size={18} />
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/70 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Military Verification"
          onClick={close}
        >
          <div
            className="relative w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 text-grey-dark hover:text-charcoal"
              aria-label="Close"
            >
              <X size={22} />
            </button>

            {success ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green/10">
                  <ShieldCheck className="text-green" size={30} />
                </div>
                <h2 className="font-display text-2xl font-bold text-green">
                  Documents Submitted!
                </h2>
                <p className="mt-2 font-body text-grey-dark">
                  You&apos;ll be notified once your military status is verified.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 rounded-lg bg-green px-6 py-3 font-display font-semibold uppercase tracking-wide text-gold hover:bg-green-light"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-green">
                  Military Verification
                </h2>
                <p className="mt-2 font-body text-sm text-grey-dark">
                  Upload your DD-214 or VA-issued ID to unlock your lifetime 20%
                  military discount.
                </p>

                {error && (
                  <div
                    role="alert"
                    className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                <div className="mt-5 space-y-5">
                  <div>
                    <label className="mb-1.5 block font-body text-sm font-semibold text-charcoal">
                      Branch of service
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full rounded-lg border border-grey-mid bg-white px-4 py-3 font-body text-charcoal outline-none focus:border-green focus:ring-2 focus:ring-green/20"
                    >
                      <option value="">Select a branch…</option>
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block font-body text-sm font-semibold text-charcoal">
                      Document
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragActive(true)
                      }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={onDrop}
                      onClick={() => inputRef.current?.click()}
                      className={[
                        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
                        dragActive
                          ? 'border-gold bg-gold/5'
                          : 'border-gold/60 hover:border-gold hover:bg-gold/5',
                      ].join(' ')}
                    >
                      {file ? (
                        <div className="flex items-center gap-2 text-charcoal">
                          <FileText className="text-green" size={20} />
                          <span className="font-body text-sm font-medium">
                            {file.name}
                          </span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="mb-2 text-gold-dark" size={28} />
                          <p className="font-body text-sm text-charcoal">
                            Drag &amp; drop or{' '}
                            <span className="font-semibold text-green">
                              browse
                            </span>
                          </p>
                          <p className="mt-1 font-body text-xs text-grey-dark">
                            PDF, JPG, or PNG · max 10MB
                          </p>
                        </>
                      )}
                      <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPT}
                        className="hidden"
                        onChange={(e) =>
                          validateAndSet(e.target.files?.[0] ?? undefined)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block font-body text-sm font-semibold text-charcoal">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Anything that helps us verify faster…"
                      className="w-full rounded-lg border border-grey-mid bg-white px-4 py-3 font-body text-charcoal outline-none focus:border-green focus:ring-2 focus:ring-green/20"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3.5 font-display font-bold uppercase tracking-wide text-charcoal transition-colors hover:bg-gold-light disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Submitting…
                      </>
                    ) : (
                      'Submit for Verification'
                    )}
                  </button>

                  <p className="text-center font-body text-xs text-grey-dark">
                    Verification typically reviewed within 24 hours.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
