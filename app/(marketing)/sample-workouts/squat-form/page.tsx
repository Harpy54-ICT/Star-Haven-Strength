import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SampleWorkoutDetail from '@/components/marketing/SampleWorkoutDetail'
import { SAMPLE_WORKOUT_MAP } from '@/lib/marketing/sample-workouts'

export const metadata: Metadata = {
  title: 'Squat Form | Sample Workouts | Star Haven Strength',
  description:
    'Key coaching cues for a safe, effective bodyweight or barbell squat.',
}

export default function Page() {
  const workout = SAMPLE_WORKOUT_MAP['squat-form']
  if (!workout) notFound()
  return <SampleWorkoutDetail workout={workout} />
}
