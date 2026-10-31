import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SampleWorkoutDetail from '@/components/marketing/SampleWorkoutDetail'
import { SAMPLE_WORKOUT_MAP } from '@/lib/marketing/sample-workouts'

export const metadata: Metadata = {
  title: 'Zero to 5K | Sample Workouts | Star Haven Strength',
  description:
    'A beginner run/walk progression that builds from walking intervals to a continuous 5K.',
}

export default function Page() {
  const workout = SAMPLE_WORKOUT_MAP['zero-to-5k']
  if (!workout) notFound()
  return <SampleWorkoutDetail workout={workout} />
}
