import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SampleWorkoutDetail from '@/components/marketing/SampleWorkoutDetail'
import { SAMPLE_WORKOUT_MAP } from '@/lib/marketing/sample-workouts'

export const metadata: Metadata = {
  title: 'Mobility for Adults | Sample Workouts | Star Haven Strength',
  description:
    'A full-body mobility routine for general adult fitness and recovery days.',
}

export default function Page() {
  const workout = SAMPLE_WORKOUT_MAP['mobility-adults']
  if (!workout) notFound()
  return <SampleWorkoutDetail workout={workout} />
}
