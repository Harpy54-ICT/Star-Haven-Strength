/**
 * Safe, general sample-workout content. Intentionally conservative and
 * educational — every page also renders a "consult a professional" disclaimer.
 * Video IDs are left empty so the YouTubeEmbed placeholder shows until Andrew
 * uploads real footage.
 */

export interface WorkoutSection {
  heading: string
  items: string[]
}

export interface SampleWorkout {
  slug: string
  title: string
  audience: string
  summary: string
  /** YouTube video ID; empty string shows the "coming soon" placeholder. */
  videoId: string
  sections: WorkoutSection[]
}

export const SAMPLE_WORKOUTS: SampleWorkout[] = [
  {
    slug: 'mobility-seniors',
    title: 'Mobility for Seniors',
    audience: 'Older adults',
    summary:
      'A gentle, joint-friendly mobility routine to support everyday movement, balance, and comfort. Move slowly and stay within a pain-free range.',
    videoId: '',
    sections: [
      {
        heading: 'Warm-Up (5 minutes)',
        items: [
          'Seated or standing deep breathing — 5 slow breaths',
          'Neck rotations — 5 each direction, gentle',
          'Shoulder rolls — 10 forward, 10 backward',
          'Ankle circles — 10 each foot',
        ],
      },
      {
        heading: 'Mobility Flow',
        items: [
          'Seated marching — 1 minute',
          'Seated or supported side bends — 8 per side',
          'Chair-supported sit-to-stand — 8 reps (use hands as needed)',
          'Standing heel raises with support — 10 reps',
          'Gentle hip circles with support — 8 per direction',
        ],
      },
      {
        heading: 'Cool-Down',
        items: [
          'Seated hamstring reach — hold 20 seconds per leg',
          'Doorway or wall chest stretch — hold 20 seconds',
          'Slow breathing — 5 breaths',
        ],
      },
    ],
  },
  {
    slug: 'mobility-adults',
    title: 'Mobility for Adults',
    audience: 'General adult fitness',
    summary:
      'A full-body mobility routine to prepare for training or to use on recovery days. Great for desk-bound bodies and busy schedules.',
    videoId: '',
    sections: [
      {
        heading: 'Warm-Up (5 minutes)',
        items: [
          'Cat-cow — 8 slow reps',
          'World\u2019s greatest stretch — 5 per side',
          'Arm circles — 10 each direction',
        ],
      },
      {
        heading: 'Mobility Flow',
        items: [
          'Hip flexor lunge stretch — 30 seconds per side',
          '90/90 hip rotations — 8 per side',
          'Thoracic rotations — 8 per side',
          'Deep bodyweight squat hold — 30 seconds',
          'Shoulder dislocates with a band or towel — 10 reps',
        ],
      },
      {
        heading: 'Cool-Down',
        items: [
          'Standing forward fold — hold 30 seconds',
          'Figure-4 glute stretch — 30 seconds per side',
          'Box breathing — 4 rounds',
        ],
      },
    ],
  },
  {
    slug: 'mobility-youth',
    title: 'Mobility for Youth',
    audience: 'Youth athletes',
    summary:
      'A fun, movement-focused routine that builds coordination and healthy range of motion. Emphasize quality of movement over speed. Youth should train under adult supervision.',
    videoId: '',
    sections: [
      {
        heading: 'Warm-Up (5 minutes)',
        items: [
          'Light jog or march in place — 2 minutes',
          'Jumping jacks — 20 reps',
          'Arm and leg swings — 10 each',
        ],
      },
      {
        heading: 'Movement Skills',
        items: [
          'Bear crawl — 10 meters forward and back',
          'Inchworm walkouts — 6 reps',
          'Bodyweight squat to stand — 10 reps',
          'Lateral shuffles — 20 seconds each direction',
          'Single-leg balance — 15 seconds per leg',
        ],
      },
      {
        heading: 'Cool-Down',
        items: [
          'Child\u2019s pose — hold 30 seconds',
          'Calf stretch against a wall — 20 seconds per side',
          'Slow breathing — 5 breaths',
        ],
      },
    ],
  },
  {
    slug: 'zero-to-5k',
    title: 'Zero to 5K',
    audience: 'Beginner runners',
    summary:
      'A beginner-friendly run/walk progression that gradually builds from walking intervals to running a continuous 5K over several weeks. Repeat any week as needed before advancing.',
    videoId: '',
    sections: [
      {
        heading: 'How It Works',
        items: [
          'Train 3 days per week with a rest day between sessions',
          'Always start with a 5-minute brisk-walk warm-up',
          'Finish with a 5-minute walk and light stretching',
          'If a week feels hard, repeat it before moving on',
        ],
      },
      {
        heading: 'Weeks 1–2',
        items: [
          'Alternate 60 seconds easy jog with 90 seconds walk',
          'Repeat for about 20 minutes',
        ],
      },
      {
        heading: 'Weeks 3–4',
        items: [
          'Alternate 3 minutes jog with 2 minutes walk',
          'Repeat for about 25 minutes',
        ],
      },
      {
        heading: 'Weeks 5–6',
        items: [
          'Jog 8–10 minutes, walk 2 minutes, repeat',
          'Build toward 25–30 minutes of mostly jogging',
        ],
      },
      {
        heading: 'Weeks 7–8',
        items: [
          'Jog continuously, building to 30 minutes / ~5K',
          'Keep the pace conversational — you should be able to talk',
        ],
      },
    ],
  },
  {
    slug: 'squat-form',
    title: 'Squat Form',
    audience: 'All levels',
    summary:
      'Key coaching cues for a safe, effective bodyweight or barbell squat. Start with bodyweight and only add load once your mechanics are solid.',
    videoId: '',
    sections: [
      {
        heading: 'Setup',
        items: [
          'Feet about shoulder-width, toes slightly turned out',
          'Brace your core as if about to be gently pushed',
          'Keep a neutral spine — chest tall, ribs down',
        ],
      },
      {
        heading: 'The Movement',
        items: [
          'Sit hips back and down, knees tracking over toes',
          'Descend to a depth you can control with good form',
          'Keep heels flat and drive the floor away to stand',
          'Exhale as you rise; fully stand without overextending',
        ],
      },
      {
        heading: 'Common Faults to Avoid',
        items: [
          'Knees caving inward — think "spread the floor"',
          'Heels lifting — work on ankle mobility first',
          'Rounding the lower back — reduce depth or load',
        ],
      },
    ],
  },
  {
    slug: 'deadlift-form',
    title: 'Deadlift Form',
    audience: 'All levels',
    summary:
      'Fundamental cues for a safe hip-hinge and deadlift. Master the hinge pattern with light load before progressing.',
    videoId: '',
    sections: [
      {
        heading: 'Setup',
        items: [
          'Bar over mid-foot, feet about hip-width',
          'Hinge at the hips and grip the bar just outside your legs',
          'Flatten your back, engage your lats, brace your core',
        ],
      },
      {
        heading: 'The Movement',
        items: [
          'Push the floor away and stand tall in one smooth motion',
          'Keep the bar close to your body the whole way',
          'Finish standing tall — squeeze glutes, avoid leaning back',
          'Lower with control by hinging the hips back first',
        ],
      },
      {
        heading: 'Common Faults to Avoid',
        items: [
          'Rounding the lower back — reduce load and reset',
          'Bar drifting away from the body',
          'Jerking the bar off the floor instead of a smooth pull',
        ],
      },
    ],
  },
  {
    slug: 'bench-form',
    title: 'Bench Press Form',
    audience: 'All levels',
    summary:
      'Coaching cues for a stable, shoulder-friendly bench press. Always use a spotter or safety arms when pressing heavier loads.',
    videoId: '',
    sections: [
      {
        heading: 'Setup',
        items: [
          'Eyes under the bar, shoulder blades pulled back and down',
          'Feet flat, slight natural arch in the lower back',
          'Grip slightly wider than shoulder-width, wrists stacked',
        ],
      },
      {
        heading: 'The Movement',
        items: [
          'Unrack and hold the bar over your shoulders',
          'Lower under control to the mid-chest, elbows ~45°',
          'Press up and slightly back toward the rack',
          'Keep your shoulder blades retracted throughout',
        ],
      },
      {
        heading: 'Common Faults to Avoid',
        items: [
          'Flaring elbows straight out to the sides',
          'Bouncing the bar off the chest',
          'Lifting the hips off the bench',
        ],
      },
    ],
  },
]

export const SAMPLE_WORKOUT_MAP: Record<string, SampleWorkout> =
  Object.fromEntries(SAMPLE_WORKOUTS.map((w) => [w.slug, w]))
