/**
 * Shared marketing copy — real content sourced from Andrew Curless's founding
 * bio. Centralized so the home, about, and services pages stay consistent.
 * Do NOT invent credentials, certifications, or client names here.
 */

export const TAGLINE = 'Train like a Star, Feel like a Star.'

export interface Pillar {
  title: string
  description: string
}

export const PILLARS: Pillar[] = [
  {
    title: 'Progressive Athletic Development',
    description:
      'A tiered approach that scales with competency. We master essential bodyweight movement patterns and core strength before progressing to external loads and advanced barbell lifts.',
  },
  {
    title: 'Comprehensive Strength & Conditioning',
    description:
      'Emphasizing technique, heavy multi-joint compound movements, and functional balance through full ranges of motion — rather than just chasing maximum lifting numbers.',
  },
  {
    title: 'Agility & Movement Mechanics',
    description:
      'Specific focus on acceleration, deceleration, change of direction, and precise jumping and landing mechanics to maximize efficiency and reduce injury risk.',
  },
  {
    title: 'Mobility, Stretching & Recovery',
    description:
      'Prioritizing joint mobility, stretching routines, and active recovery protocols to maintain healthy tissue, improve flexibility, and keep athletes at their peak.',
  },
  {
    title: 'Tactical Strength & Readiness',
    description:
      'Integrating military-grade functional endurance, combat-readiness conditioning, and load-bearing resilience to build profound mental toughness.',
  },
  {
    title: 'Sport-Specific Training',
    description:
      'Tailored, high-intensity regimens designed to meet the exact metabolic and physical demands of your specific sport.',
  },
]

export interface Audience {
  title: string
  description: string
}

export const AUDIENCES: Audience[] = [
  {
    title: 'Youth Athletes',
    description:
      'Building foundational mechanics, coordination, and confidence with age-appropriate progressions and a focus on long-term development.',
  },
  {
    title: 'Adults',
    description:
      'General fitness and high-intensity power development for busy adults who want to move well, get strong, and stay healthy.',
  },
  {
    title: 'Military & Veterans',
    description:
      'Tactical conditioning and load-bearing resilience from a Navy veteran who understands the standard — with dedicated military pricing.',
  },
]

export const BIO = `My training philosophy merges elite, progressive sports performance programming with the tactical discipline and resilience forged during my time in the Navy. At Star Haven Strength, I utilize a highly structured curriculum that adapts to every athlete's physical maturity and experience level — from youth athletes building foundational mechanics to varsity competitors and adults executing high-intensity power development. My mission is to enhance athletic performance, cultivate a physical and mental advantage, and build strength of character in an intense but positive environment.`

/** Tier teaser copy. Real prices live on /pricing (single source of truth). */
export interface TierTeaser {
  name: string
  civilian: string
  military: string
  blurb: string
}

export const TIER_TEASERS: TierTeaser[] = [
  {
    name: 'Foundation',
    civilian: '$100/mo',
    military: '$75/mo',
    blurb: 'Structured programming and the core logging tools to get moving.',
  },
  {
    name: 'Custom',
    civilian: '$150/mo',
    military: '$120/mo',
    blurb: 'Individualized programming tailored to your goals and schedule.',
  },
  {
    name: 'Performance',
    civilian: '$200/mo',
    military: '$150/mo',
    blurb: 'Sport-specific performance coaching with closer accountability.',
  },
  {
    name: 'Elite',
    civilian: '$300/mo',
    military: '$225/mo',
    blurb: 'The highest level of access, customization, and coach support.',
  },
]
