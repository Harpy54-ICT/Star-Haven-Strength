/** Shared labels/metadata for Coach's Office post types. */

export type CoachPostTypeValue = 'science_review' | 'workout_info' | 'commentary'
export type CoachPostStatusValue = 'draft' | 'published'

export const COACH_POST_TYPES: {
  value: CoachPostTypeValue
  label: string
  description: string
}[] = [
  {
    value: 'science_review',
    label: 'Science Review',
    description: 'A breakdown of research papers and the evidence behind training.',
  },
  {
    value: 'workout_info',
    label: 'Workout Info',
    description: 'Technique tips, programming notes, and training how-tos.',
  },
  {
    value: 'commentary',
    label: 'Commentary',
    description: 'General coaching thoughts and perspective from Drue.',
  },
]

export const COACH_POST_TYPE_LABELS: Record<CoachPostTypeValue, string> =
  Object.fromEntries(
    COACH_POST_TYPES.map((t) => [t.value, t.label])
  ) as Record<CoachPostTypeValue, string>

export function coachPostTypeLabel(value: string): string {
  return COACH_POST_TYPE_LABELS[value as CoachPostTypeValue] ?? value
}
