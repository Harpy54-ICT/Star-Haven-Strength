/**
 * Types and option constants for the multi-step client intake form.
 *
 * The form has 4 UI steps (Medical / Background / Goals / Review) but persists
 * three JSON blobs — step1 (medical), step2 (background), step3 (goals). The
 * Review step just confirms what was entered.
 */

// ---- Option constants (shared between the form and validation) ----

export const CHRONIC_CONDITIONS = [
  'None',
  'Type 2 Diabetes',
  'Hypertension',
  'Heart Condition',
  'Arthritis',
  'Asthma',
  'Other',
] as const

export const TRAINING_STYLES = [
  'Weights',
  'Cardio',
  'HIIT',
  'Yoga & Mobility',
  'Sport-Specific',
  'Military PT',
  'CrossFit',
  'Other',
] as const

export const EQUIPMENT_OPTIONS = [
  'Full Commercial Gym',
  'Home Gym',
  'Dumbbells Only',
  'Bodyweight Only',
  'Barracks/Limited',
  'Resistance Bands',
  'Kettlebells',
  'Pull-Up Bar',
] as const

export const DAYS_PER_WEEK_OPTIONS = [
  '0',
  '1-2',
  '3-4',
  '5-6',
  'Every Day',
] as const

export const PRIMARY_GOALS = [
  'Lose Body Fat',
  'Build Muscle',
  'Improve Performance',
  'Injury Rehabilitation',
  'General Health',
  'Military Fitness Test Prep',
  'Sport-Specific Training',
] as const

export const TIMELINE_OPTIONS = [
  '4 Weeks',
  '8 Weeks',
  '12 Weeks',
  '6 Months',
  '1 Year',
  'Ongoing',
] as const

export const FITNESS_LEVELS = [
  'Beginner',
  'Novice',
  'Intermediate',
  'Advanced',
  'Elite',
] as const

// ---- Per-step data shapes ----

export interface IntakeStep1Medical {
  hasInjuries: boolean
  injuriesDetail: string
  chronicConditions: string[]
  chronicConditionOther: string
  recentSurgery: boolean
  recentSurgeryDetail: string
  clearedByDoctor: boolean
  medicationsAffectingExercise: boolean
  medicationsDetail: string
}

export interface IntakeStep2Background {
  fitnessLevel: number // 1-5
  yearsTraining: number
  trainingStyles: string[]
  daysPerWeek: string
  equipmentAccess: string[]
}

export interface IntakeStep3Goals {
  primaryGoal: string
  targetTimeline: string
  numericGoal: string
  additionalNotes: string
}

export interface IntakeFormData {
  step1: IntakeStep1Medical
  step2: IntakeStep2Background
  step3: IntakeStep3Goals
}

// ---- Defaults ----

export const DEFAULT_INTAKE: IntakeFormData = {
  step1: {
    hasInjuries: false,
    injuriesDetail: '',
    chronicConditions: [],
    chronicConditionOther: '',
    recentSurgery: false,
    recentSurgeryDetail: '',
    clearedByDoctor: true,
    medicationsAffectingExercise: false,
    medicationsDetail: '',
  },
  step2: {
    fitnessLevel: 1,
    yearsTraining: 0,
    trainingStyles: [],
    daysPerWeek: '',
    equipmentAccess: [],
  },
  step3: {
    primaryGoal: '',
    targetTimeline: '',
    numericGoal: '',
    additionalNotes: '',
  },
}

export const INTAKE_STEP_LABELS = [
  'Medical',
  'Background',
  'Goals',
  'Review',
] as const
