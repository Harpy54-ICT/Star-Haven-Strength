import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SampleWorkoutDetail from '@/components/marketing/SampleWorkoutDetail'
import { SAMPLE_WORKOUT_MAP } from '@/lib/marketing/sample-workouts'

export const metadata: Metadata = {
  title: 'Bench Press Form | Sample Workouts | Star Haven Strength',
  description:
    'Coaching cues for a stable, shoulder-friendly bench press.',
}

export default function Page() {
  const workout = SAMPLE_WORKOUT_MAP['bench-form']
  if (!workout) notFound()
  return <SampleWorkoutDetail workout={workout} />
}
