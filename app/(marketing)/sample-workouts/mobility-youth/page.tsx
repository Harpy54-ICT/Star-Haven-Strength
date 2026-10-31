import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SampleWorkoutDetail from '@/components/marketing/SampleWorkoutDetail'
import { SAMPLE_WORKOUT_MAP } from '@/lib/marketing/sample-workouts'

export const metadata: Metadata = {
  title: 'Mobility for Youth | Sample Workouts | Star Haven Strength',
  description:
    'A fun, movement-focused mobility routine for youth athletes, done under adult supervision.',
}

export default function Page() {
  const workout = SAMPLE_WORKOUT_MAP['mobility-youth']
  if (!workout) notFound()
  return <SampleWorkoutDetail workout={workout} />
}
