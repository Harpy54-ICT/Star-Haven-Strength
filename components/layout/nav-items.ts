import {
  LayoutDashboard,
  ClipboardList,
  Dumbbell,
  TrendingUp,
  Ruler,
  Apple,
  ListChecks,
  Calendar,
  CheckSquare,
  Trophy,
  Medal,
  Library,
  MessageSquare,
  Bell,
  Gift,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

/** Primary dashboard navigation. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Program', href: '/dashboard/program', icon: ClipboardList },
  { label: 'Log Workout', href: '/dashboard/log-workout', icon: Dumbbell },
  { label: 'Exercises', href: '/dashboard/exercises', icon: Library },
  { label: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
  { label: 'Body Metrics', href: '/dashboard/body-metrics', icon: Ruler },
  { label: 'Nutrition', href: '/dashboard/nutrition', icon: Apple },
  { label: 'Habits', href: '/dashboard/habits', icon: ListChecks },
  { label: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { label: 'Check-Ins', href: '/dashboard/check-ins', icon: CheckSquare },
  { label: 'Achievements', href: '/dashboard/achievements', icon: Medal },
  { label: 'Challenges', href: '/challenges', icon: Trophy },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Referrals', href: '/dashboard/referrals', icon: Gift },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]
