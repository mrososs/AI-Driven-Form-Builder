import {
  User,
  Shield,
  Building2,
  CreditCard,
  Users,
  Flag,
  Sparkles,
  Settings2,
  KeyRound,
  Wand2,
  Link2,
  ChevronRight,
} from 'lucide-vue-next'
import type { Component } from 'vue'

export type StepIconKey = 'user' | 'shield' | 'building' | 'credit' | 'users' | 'flag'

export const STEP_ICONS: Record<StepIconKey, Component> = {
  user: User,
  shield: Shield,
  building: Building2,
  credit: CreditCard,
  users: Users,
  flag: Flag,
}

export const STEP_ICON_OPTIONS: Array<{ key: StepIconKey; icon: Component }> = [
  { key: 'user', icon: User },
  { key: 'shield', icon: Shield },
  { key: 'building', icon: Building2 },
  { key: 'credit', icon: CreditCard },
  { key: 'users', icon: Users },
  { key: 'flag', icon: Flag },
]

export type RuleKind = 'branch' | 'skip' | 'require' | 'async'

export interface RuleKindMeta {
  label: string
  color: 'indigo' | 'violet' | 'emerald' | 'amber'
  icon: Component
  /** Badge classes for sidebar/list chip (border + bg + text). */
  badge: string
  /** Diagram chip classes (bg + border + text + hover bg). */
  chip: string
  /** Add-rule launcher icon background classes (bg + text). */
  launcher: string
  /** Strong text class for THEN heading and bold parts. */
  strongText: string
}

export const RULE_KIND_META: Record<RuleKind, RuleKindMeta> = {
  branch: {
    label: 'Branch',
    color: 'indigo',
    icon: Link2,
    badge:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20',
    chip:
      'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/[0.08] dark:border-indigo-500/25 dark:text-indigo-200 dark:hover:bg-indigo-500/[0.14]',
    launcher: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
    strongText: 'text-indigo-700 dark:text-indigo-300',
  },
  skip: {
    label: 'Skip step',
    color: 'violet',
    icon: ChevronRight,
    badge:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20',
    chip:
      'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100 dark:bg-violet-500/[0.08] dark:border-violet-500/25 dark:text-violet-200 dark:hover:bg-violet-500/[0.14]',
    launcher: 'bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    strongText: 'text-violet-700 dark:text-violet-300',
  },
  require: {
    label: 'Gate',
    color: 'emerald',
    icon: Shield,
    badge:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
    chip:
      'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/[0.08] dark:border-emerald-500/25 dark:text-emerald-200 dark:hover:bg-emerald-500/[0.14]',
    launcher: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    strongText: 'text-emerald-700 dark:text-emerald-300',
  },
  async: {
    label: 'Async check',
    color: 'amber',
    icon: Wand2,
    badge:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
    chip:
      'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/[0.08] dark:border-amber-500/25 dark:text-amber-200 dark:hover:bg-amber-500/[0.14]',
    launcher: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    strongText: 'text-amber-700 dark:text-amber-300',
  },
}

export { Sparkles, Settings2, KeyRound, Wand2 }
