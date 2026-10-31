import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SampleWorkoutDetail from '@/components/marketing/SampleWorkoutDetail'
import { SAMPLE_WORKOUT_MAP } from '@/lib/marketing/sample-workouts'

export const metadata: Metadata = {
  title: 'Mobility for Seniors | Sample Workouts | Star Haven Strength',
  description:
    'A gentle, joint-friendly mobility routine for older adults to support balance and everyday movement.',
}

export default function Page() {
  const workout = SAMPLE_WORKOUT_MAP['mobility-seniors']
  if (!workout) notFound()
  return <SampleWorkoutDetail workout={workout} />
}
