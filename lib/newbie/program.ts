/**
 * Star Haven Strength — Newbie 13-Week Program content.
 *
 * A static, structured curriculum for a beginner's first 13 weeks training with
 * a personal trainer. Content is intentionally generic so it applies to any
 * beginner client — no individual names, no medical claims or diagnoses, and no
 * prescriptive loads. Clients should always follow their coach's specific
 * guidance for exercise selection and weights.
 */

export interface NewbieProgramWeek {
  week: number
  theme: string
  tips: string[]
  workout_focus: string
  mindset_note: string
}

/** The total number of weeks in the newbie program. */
export const NEWBIE_PROGRAM_TOTAL_WEEKS = 13

export const NEWBIE_PROGRAM_WEEKS: NewbieProgramWeek[] = [
  {
    week: 1,
    theme: 'Foundation & Form',
    tips: [
      'Prioritize learning the movement over the amount of weight on the bar.',
      'Film a set or two so you and your coach can review your form together.',
      'Warm up thoroughly before every session — five to ten minutes of easy movement.',
    ],
    workout_focus:
      'Full-body movement patterns (squat, hinge, push, pull) with light loads and controlled tempo.',
    mindset_note:
      'Starting is the hardest part, and you already did it. Focus on showing up, not on being perfect.',
  },
  {
    week: 2,
    theme: 'Foundation & Form',
    tips: [
      'Keep reps smooth and controlled rather than rushing through a set.',
      'Breathe with the movement: exhale on effort, inhale on the way back.',
      'Note how each exercise feels so you can give your coach useful feedback.',
    ],
    workout_focus:
      'Reinforce the core lifts with slightly more volume while keeping technique crisp.',
    mindset_note:
      'Good reps compound. The clean technique you build now pays off for years.',
  },
  {
    week: 3,
    theme: 'Building Consistency',
    tips: [
      'Schedule your sessions in advance and treat them like any other appointment.',
      'Lay out your gear the night before to remove friction on training days.',
      'Aim to hit every planned session this week, even on a lighter day.',
    ],
    workout_focus:
      'Establish a repeatable weekly rhythm; add a small, comfortable load increase where form allows.',
    mindset_note:
      'Consistency beats intensity in the early weeks. Winning the week is about showing up.',
  },
  {
    week: 4,
    theme: 'Building Consistency',
    tips: [
      'Track your sessions so you can see your streak building.',
      'Protect your sleep — recovery is where progress is actually made.',
      'Stay hydrated throughout the day, not just during workouts.',
    ],
    workout_focus:
      'Maintain frequency and introduce a second variation of each main pattern for variety.',
    mindset_note:
      "One month in — that's a real habit forming. Acknowledge the progress you can't see in the mirror yet.",
  },
  {
    week: 5,
    theme: 'Introducing Intensity',
    tips: [
      'Add load only when your current weight feels controlled for all reps.',
      'Leave a rep or two "in the tank" rather than grinding to failure.',
      'Rest fully between hard sets so each one is quality work.',
    ],
    workout_focus:
      'Begin challenging the main lifts with modest intensity increases while keeping technique honest.',
    mindset_note:
      'A little discomfort is a sign of growth. Lean into effort, but respect your limits.',
  },
  {
    week: 6,
    theme: 'Introducing Intensity',
    tips: [
      'Warm up each lift with lighter ramp-up sets before your working sets.',
      'Pay attention to the difference between good muscle fatigue and joint pain.',
      'Keep a short log of how hard each session felt (an effort rating out of 10).',
    ],
    workout_focus:
      'Slightly heavier working sets on the primary lifts; accessory work to support weak points.',
    mindset_note:
      'You are stronger than you were a month ago. Trust the gradual build.',
  },
  {
    week: 7,
    theme: 'Habit Solidification',
    tips: [
      'Identify the time of day you train best and defend that slot.',
      'Plan for obstacles: have a backup session in mind for busy days.',
      'Pair training with something you enjoy — a playlist, a podcast, a post-gym ritual.',
    ],
    workout_focus:
      'Keep the routine steady; refine movement quality at the now-familiar loads.',
    mindset_note:
      'Training is becoming part of who you are, not just something you do.',
  },
  {
    week: 8,
    theme: 'Habit Solidification',
    tips: [
      'Review the last two months with your coach and celebrate concrete wins.',
      'Check that your nutrition supports your training, not just your workouts.',
      'Keep your warm-up and cool-down non-negotiable.',
    ],
    workout_focus:
      'Consolidate gains; test that your technique holds up under consistent loads.',
    mindset_note:
      "Halfway point. The routine that felt hard in week one probably feels normal now — that's growth.",
  },
  {
    week: 9,
    theme: 'Progressive Overload',
    tips: [
      'Progress in small steps: a little more weight, a rep more, or better control.',
      'Only increase one variable at a time so you know what is driving results.',
      'Keep recovery habits strong as the training gets more demanding.',
    ],
    workout_focus:
      'Deliberate, structured progression on the main lifts week over week.',
    mindset_note:
      'Progress is rarely linear. Some days feel strong, some do not — the trend is what matters.',
  },
  {
    week: 10,
    theme: 'Progressive Overload',
    tips: [
      'Compare this week to week five and notice how much more you can handle.',
      'Listen to your body; a planned lighter day can set up a stronger week.',
      'Keep form your top priority even as the weights climb.',
    ],
    workout_focus:
      'Continue measured load increases; add challenge through tempo or range of motion where appropriate.',
    mindset_note:
      'The weights that once intimidated you are becoming your warm-up. Keep going.',
  },
  {
    week: 11,
    theme: 'Performance Milestone',
    tips: [
      'Work with your coach to pick a simple benchmark to measure your progress.',
      'Approach any test day well-rested and properly warmed up.',
      'Focus on executing your best technique under the benchmark effort.',
    ],
    workout_focus:
      'Prepare for a performance checkpoint on a key lift or movement pattern.',
    mindset_note:
      'Milestones are proof of the work you have put in. Be proud of how far you have come.',
  },
  {
    week: 12,
    theme: 'Performance Milestone',
    tips: [
      'Record your benchmark results so you have a baseline for the next block.',
      'Reflect on which habits made the biggest difference for you.',
      'Share your wins — accountability and encouragement fuel momentum.',
    ],
    workout_focus:
      'Execute your performance checkpoint and review the results with your coach.',
    mindset_note:
      'Twelve weeks of consistent effort is a genuine achievement. Take a moment to appreciate it.',
  },
  {
    week: 13,
    theme: 'Graduation & Reflection',
    tips: [
      'Review your whole journey with your coach and set goals for the next phase.',
      'Keep the habits that worked and adjust the ones that did not.',
      'Plan your next training block so momentum carries straight through.',
    ],
    workout_focus:
      'Consolidate everything learned and transition into your ongoing program with confidence.',
    mindset_note:
      'You have built a foundation that lasts. This is not the finish line — it is the real starting line.',
  },
]

/** Get the content for a specific week (1-based), clamped to the valid range. */
export function getNewbieProgramWeek(week: number): NewbieProgramWeek {
  const clamped = Math.min(
    Math.max(1, Math.floor(week)),
    NEWBIE_PROGRAM_TOTAL_WEEKS
  )
  return NEWBIE_PROGRAM_WEEKS[clamped - 1]
}

/**
 * Compute the current program week (1-based) from a designation start date.
 * Returns a value clamped to 1..13.
 */
export function currentProgramWeek(
  startedAt: Date,
  now: Date = new Date()
): number {
  const msPerWeek = 1000 * 60 * 60 * 24 * 7
  const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / msPerWeek)
  return Math.min(Math.max(1, elapsed + 1), NEWBIE_PROGRAM_TOTAL_WEEKS)
}
