import {
  LayoutDashboard,
  ClipboardList,
  Dumbbell,
  TrendingUp,
  Ruler,
  Apple,
  Calendar,
  CheckSquare,
  Trophy,
  MessageSquare,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

/** Primary dashboard navigation. All routes live under /dashboard. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Program', href: '/dashboard/program', icon: ClipboardList },
  { label: 'Log Workout', href: '/dashboard/log-workout', icon: Dumbbell },
  { label: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
  { label: 'Body Metrics', href: '/dashboard/body-metrics', icon: Ruler },
  { label: 'Nutrition', href: '/dashboard/nutrition', icon: Apple },
  { label: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { label: 'Check-Ins', href: '/dashboard/check-ins', icon: CheckSquare },
  { label: 'Challenges', href: '/dashboard/challenges', icon: Trophy },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]
