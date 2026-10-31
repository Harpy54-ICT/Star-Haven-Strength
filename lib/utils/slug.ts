/**
 * Convert a string into a URL-safe slug.
 * Lowercases, strips accents/punctuation, collapses whitespace to hyphens.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Generate a short, readable referral code (uppercase alphanumerics). */
export function generateReferralCode(seed?: string): string {
  const base = (seed ?? '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4)
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${base}${rand}`.slice(0, 10)
}
