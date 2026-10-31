import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SampleWorkoutDetail from '@/components/marketing/SampleWorkoutDetail'
import { SAMPLE_WORKOUT_MAP } from '@/lib/marketing/sample-workouts'

export const metadata: Metadata = {
  title: 'Deadlift Form | Sample Workouts | Star Haven Strength',
  description:
    'Fundamental cues for a safe hip-hinge and deadlift.',
}

export default function Page() {
  const workout = SAMPLE_WORKOUT_MAP['deadlift-form']
  if (!workout) notFound()
  return <SampleWorkoutDetail workout={workout} />
}
