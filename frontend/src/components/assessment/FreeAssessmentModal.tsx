'use client'

/**
 * Free Assessment — interactive home-energy quiz modal ported from the
 * legacy bluven site (HomeEnergyAssessmentGame in old App.jsx).
 * Self-contained: scoring maps, copy, icons, UI all live in this file.
 *
 * Usage:
 *   1. Wrap the app in <FreeAssessmentProvider>.
 *   2. Anywhere inside, call useFreeAssessment().open() to launch.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from 'react'
import Link from 'next/link'
import styles from './FreeAssessment.module.css'
import { api } from '@/api/client'
import type { AssessmentRequest } from '@/types/cms'

/* ============================================================
   1. ICONS — inline SVG (no external icon library dependency)
   ============================================================ */

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const Icon = (path: ReactNode): ComponentType<IconProps> => {
  const Component = ({ size = 20, ...rest }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {path}
    </svg>
  )
  Component.displayName = 'AssessmentIcon'
  return Component
}

const Sun = Icon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </>,
)
const Battery = Icon(
  <>
    <rect x="2" y="7" width="16" height="10" rx="2" />
    <line x1="22" y1="11" x2="22" y2="13" />
    <line x1="6" y1="11" x2="6" y2="13" />
    <line x1="10" y1="11" x2="10" y2="13" />
    <line x1="14" y1="11" x2="14" y2="13" />
  </>,
)
const BatteryCharging = Icon(
  <>
    <path d="M15 7h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
    <path d="M7 17H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2" />
    <line x1="22" y1="11" x2="22" y2="13" />
    <polyline points="11 6 7 12 13 12 9 18" />
  </>,
)
const Shield = Icon(
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
)
const PiggyBank = Icon(
  <>
    <path d="M19 5c-1.5 0-2.8.9-3.5 2.3A8 8 0 0 0 12 7C7 7 3 10 3 14a5.6 5.6 0 0 0 2 4l-1 4 4-1c1.3.4 2.6.6 4 .6 5 0 9-3 9-7 0-1.3-.4-2.5-1-3.5L21 9c-.5-2.5-1.8-4-2-4z" />
    <path d="M14 11h.01" />
    <path d="M5 14a3 3 0 0 1 3-3" />
  </>,
)
const X = Icon(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>,
)
const ChevronLeft = Icon(<polyline points="15 18 9 12 15 6" />)
const ChevronRight = Icon(<polyline points="9 18 15 12 9 6" />)
const Sparkles = Icon(
  <>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    <path d="M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
    <path d="M5 16l.5 1.4 1.5.5-1.5.5L5 19.8l-.5-1.4L3 17.9l1.5-.5L5 16z" />
  </>,
)
const CheckCircle2 = Icon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11.5 14.5 16 9.5" />
  </>,
)
const PhoneCall = Icon(
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />,
)
const Home = Icon(
  <>
    <path d="M3 12L12 3l9 9" />
    <path d="M5 10v10h14V10" />
  </>,
)
const House = Icon(
  <>
    <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1v-9z" />
  </>,
)
const Users = Icon(
  <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
)
const MoonStar = Icon(
  <>
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    <path d="M19 3l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
  </>,
)
const Clock3 = Icon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16.5 12" />
  </>,
)
const Zap = Icon(
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
)
const LineChart = Icon(
  <>
    <path d="M3 3v18h18" />
    <polyline points="6 16 11 11 14 14 20 7" />
  </>,
)
const Lightbulb = Icon(
  <>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7c1 .8 1.5 1.5 1.5 3.3h5c0-1.8.5-2.5 1.5-3.3A7 7 0 0 0 12 2z" />
  </>,
)
const Circle = Icon(<circle cx="12" cy="12" r="10" />)
const ScanSearch = Icon(
  <>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M21 7V5a2 2 0 0 0-2-2h-2" />
    <path d="M3 17v2a2 2 0 0 0 2 2h2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <circle cx="12" cy="12" r="3" />
    <path d="m16 16-1.9-1.9" />
  </>,
)

/* ============================================================
   2. DATA — scoring constants, recommendations, copy
   ============================================================ */

const RECOMMENDATION = {
  SOLAR_FIRST: 'Solar First',
  BATTERY_ADD: 'Add a Battery',
  SOLAR_AND_BATTERY: 'Solar + Battery',
  OPTIMIZATION: 'System Review & Optimization',
  ASSESSMENT: 'Professional Assessment Recommended',
} as const

type RecommendationType = (typeof RECOMMENDATION)[keyof typeof RECOMMENDATION]

interface QuestionOption {
  label: string
  hint?: string
  icon: ComponentType<IconProps>
  exclusive?: boolean
}

interface Question {
  id: AnswerKey
  type: 'single' | 'multi'
  title: string
  subtitle: string
  options: QuestionOption[]
  tip?: string
}

type AnswerKey =
  | 'home_size'
  | 'occupants'
  | 'activity_time'
  | 'major_loads'
  | 'solar_status'
  | 'battery_status'
  | 'main_goal'
  | 'bill_level'

type Answers = {
  home_size: string
  occupants: string
  activity_time: string
  major_loads: string[]
  solar_status: string
  battery_status: string
  main_goal: string[]
  bill_level: string
}

const initialAnswers: Answers = {
  home_size: '',
  occupants: '',
  activity_time: '',
  major_loads: [],
  solar_status: '',
  battery_status: '',
  main_goal: [],
  bill_level: '',
}

const copy = {
  badge: '30-SECOND ENERGY CHECK',
  title: 'What Type of Energy Home Are You?',
  subtitle:
    'Answer a few quick questions and get a tailored home energy report with a clear direction for solar, battery, or both.',
  start: 'Start My Free Assessment',
  restart: 'Restart Assessment',
  next: 'Next',
  back: 'Back',
  finish: 'See My Result',
  progress: 'Question',
  multiHint: 'Choose all that apply',
  singleHint: 'Choose one option',
  resultBadge: 'Your Home Energy Result',
  profileTitle: 'Your home profile',
  recommendationTitle: 'Recommended direction',
  billTitle: 'What may be increasing your bill',
  nextStep: 'Your next step',
  fitLevel: 'Home fit level',
  whatYouGet: "What you'll get",
  readyToBegin: 'Ready to begin',
  beginTitle: 'Find the right energy path for your home in 30 seconds',
  beginText:
    "This is a lightweight interactive assessment, not a boring form. You'll get a simple result, useful direction, and a tailored next step from our engineering team.",
  getItems: [
    'Your home energy type',
    'The right direction for solar, battery, or both',
    'What may be increasing your electricity costs',
    'A tailored next step from our engineering team',
  ],
  featureCards: ['Solar fit', 'Battery fit', 'Home profile', 'Professional recommendation'],
  ctaPrimary: 'Get My Tailored Energy Plan',
  ctaSecondary: 'Talk to Our Engineers',
  fields: {
    usage: 'Overall energy demand',
    daytime: 'Daytime solar opportunity',
    night: 'Evening grid reliance',
    load: 'Heavy load pressure',
    backup: 'Backup importance',
  },
  levels: { low: 'Low', moderate: 'Moderate', high: 'High' },
  rec: {
    [RECOMMENDATION.SOLAR_FIRST]: 'Solar First',
    [RECOMMENDATION.BATTERY_ADD]: 'Add a Battery',
    [RECOMMENDATION.SOLAR_AND_BATTERY]: 'Solar + Battery',
    [RECOMMENDATION.OPTIMIZATION]: 'System Review & Optimization',
    [RECOMMENDATION.ASSESSMENT]: 'Professional Assessment Recommended',
  },
  household: {
    optimizer: 'The Energy Optimizer',
    highUsage: 'The High-Usage Home',
    solarOpportunity: 'The Solar Opportunity Home',
    batteryCandidate: 'The Battery Candidate',
    backupFocused: 'The Backup-Focused Home',
    heavyLoad: 'The Heavy Load Home',
    everyday: 'The Everyday Energy User',
  },
  fit: {
    strong: 'Strong fit',
    good: 'Good fit',
    review: 'Needs review',
  },
  summaries: {
    [RECOMMENDATION.SOLAR_FIRST]:
      'Based on your answers, your home appears to be a strong candidate for solar as the first step toward reducing daytime grid use and improving long-term energy savings.',
    [RECOMMENDATION.BATTERY_ADD]:
      'Based on your current setup and usage pattern, adding a battery may help your home store more energy for evening use and improve energy independence.',
    [RECOMMENDATION.SOLAR_AND_BATTERY]:
      'Your answers suggest your home may benefit most from a combined solar and battery solution, especially where both higher usage and grid reliance are involved.',
    [RECOMMENDATION.OPTIMIZATION]:
      'Your household already has key energy infrastructure in place. A professional review may help identify opportunities to improve performance, backup capability, or bill reduction.',
    [RECOMMENDATION.ASSESSMENT]:
      'Your home has a more specific energy profile, so the best next step is a tailored assessment from our engineering team.',
  },
  nextStepText: {
    [RECOMMENDATION.SOLAR_FIRST]:
      'A tailored solar design can help estimate the right system size, likely daytime offset, and whether future battery readiness makes sense for your home.',
    [RECOMMENDATION.BATTERY_ADD]:
      'A battery assessment can confirm storage size, backup options, and whether your current solar setup is ready for the right upgrade.',
    [RECOMMENDATION.SOLAR_AND_BATTERY]:
      'A combined assessment can model solar generation, storage needs, and the best way to reduce both daytime imports and evening reliance.',
    [RECOMMENDATION.OPTIMIZATION]:
      'A system review can identify whether better settings, tariff alignment, backup configuration, or an upgrade path could improve performance.',
    [RECOMMENDATION.ASSESSMENT]:
      'A quick professional review can clarify your real energy opportunity and recommend the most suitable next step without guesswork.',
  },
}

const questions: Question[] = [
  {
    id: 'home_size',
    type: 'single',
    title: 'What best matches your home and energy use?',
    subtitle: 'Choose the option that feels closest to your home size and typical electricity use.',
    options: [
      {
        label: 'Apartment / Small home',
        hint: 'Usually 1–2 people, fewer large appliances, and lower daily energy use.',
        icon: Home,
      },
      {
        label: 'Medium family home',
        hint: 'Often 3–4 people, regular appliance use, and moderate daily demand.',
        icon: House,
      },
      {
        label: 'Large home',
        hint: 'Typically more people, more appliances, and higher overall electricity use.',
        icon: House,
      },
    ],
    tip: 'Tip: smaller homes often use around 5–12 kWh/day, medium homes around 12–25 kWh/day, and larger homes usually use more.',
  },
  {
    id: 'occupants',
    type: 'single',
    title: 'How many people usually live in the home?',
    subtitle: 'This helps us estimate likely energy demand.',
    options: [
      { label: '1–2 people', icon: Users },
      { label: '3–4 people', icon: Users },
      { label: '5+ people', icon: Users },
    ],
  },
  {
    id: 'activity_time',
    type: 'single',
    title: 'When is your home usually most active?',
    subtitle: 'This helps identify whether solar or battery may suit your usage pattern better.',
    options: [
      { label: 'Mostly during the day', icon: Sun },
      { label: 'Mostly in the evening', icon: MoonStar },
      { label: 'Someone is home most of the day', icon: Clock3 },
    ],
  },
  {
    id: 'major_loads',
    type: 'multi',
    title: 'Which major electrical loads do you have?',
    subtitle: 'Choose all that apply.',
    options: [
      { label: 'Ducted air conditioning', icon: Zap },
      { label: 'Pool pump', icon: LineChart },
      { label: 'Electric hot water', icon: Lightbulb },
      { label: 'EV charger', icon: BatteryCharging },
      { label: 'Spa / workshop / granny flat', icon: House },
      { label: 'No major loads', icon: Circle, exclusive: true },
    ],
  },
  {
    id: 'solar_status',
    type: 'single',
    title: 'Do you already have solar?',
    subtitle: 'This helps us understand whether the next step is solar, battery, or optimisation.',
    options: [
      { label: 'No solar', icon: Sun },
      { label: 'Yes, under 6.6kW', icon: Sun },
      { label: 'Yes, 6.6kW+', icon: Sun },
    ],
  },
  {
    id: 'battery_status',
    type: 'single',
    title: 'Do you already have battery storage?',
    subtitle: 'We use this to tell whether your best fit is battery, hybrid, or review.',
    options: [
      { label: 'No battery', icon: Battery },
      { label: 'Yes, already installed', icon: Battery },
    ],
  },
  {
    id: 'main_goal',
    type: 'multi',
    title: 'What matters most to you?',
    subtitle: "Choose all that apply — we'll tailor your result accordingly.",
    options: [
      { label: 'Lower my electricity bills', icon: PiggyBank },
      { label: 'Use more of my solar energy', icon: Sun },
      { label: 'Backup during blackouts', icon: Shield },
      { label: 'Prepare for future energy needs', icon: Zap },
      { label: 'Join a Virtual Power Plant (VPP)', icon: Battery },
      { label: 'Take advantage of free midday charging', icon: Sun },
      { label: 'Not sure yet', icon: Circle, exclusive: true },
    ],
  },
  {
    id: 'bill_level',
    type: 'single',
    title: 'How does your electricity bill usually feel?',
    subtitle: 'This helps us gauge pressure and urgency.',
    options: [
      { label: 'Lower than expected', icon: PiggyBank },
      { label: 'Manageable', icon: PiggyBank },
      { label: 'Higher than I want', icon: PiggyBank },
      { label: 'Very high / unpredictable', icon: PiggyBank },
    ],
  },
]

type ScoreMap = Record<string, Partial<Scores>>

interface Scores {
  usageScore: number
  daytimeScore: number
  nightScore: number
  loadScore: number
  solarFitScore: number
  batteryFitScore: number
  backupScore: number
}

const homeSizeMap: ScoreMap = {
  'Apartment / Small home': { usageScore: 1, solarFitScore: 1, batteryFitScore: 0 },
  'Medium family home': { usageScore: 2, solarFitScore: 2, batteryFitScore: 1 },
  'Large home': { usageScore: 4, solarFitScore: 3, batteryFitScore: 3 },
}
const occupantsMap: ScoreMap = {
  '1–2 people': { usageScore: 1 },
  '3–4 people': { usageScore: 2 },
  '5+ people': { usageScore: 4 },
}
const activityTimeMap: ScoreMap = {
  'Mostly during the day': { daytimeScore: 3, solarFitScore: 3, batteryFitScore: 1 },
  'Mostly in the evening': { nightScore: 3, solarFitScore: 1, batteryFitScore: 3 },
  'Someone is home most of the day': { daytimeScore: 4, solarFitScore: 4, batteryFitScore: 2 },
}
const majorLoadsMap: ScoreMap = {
  'Ducted air conditioning': { usageScore: 3, loadScore: 3, solarFitScore: 2, batteryFitScore: 2 },
  'Pool pump': { usageScore: 2, loadScore: 2, daytimeScore: 2, solarFitScore: 3 },
  'Electric hot water': { usageScore: 2, loadScore: 2, solarFitScore: 2, batteryFitScore: 1 },
  'EV charger': { usageScore: 4, loadScore: 4, solarFitScore: 3, batteryFitScore: 3 },
  'Spa / workshop / granny flat': { usageScore: 3, loadScore: 3, solarFitScore: 2, batteryFitScore: 2 },
  'No major loads': { usageScore: 0, loadScore: 0 },
}
const solarStatusMap: ScoreMap = {
  'No solar': { solarFitScore: 4 },
  'Yes, under 6.6kW': { solarFitScore: 2, batteryFitScore: 2 },
  'Yes, 6.6kW+': { solarFitScore: 0, batteryFitScore: 3 },
}
const batteryStatusMap: ScoreMap = {
  'No battery': { batteryFitScore: 2 },
  'Yes, already installed': { batteryFitScore: -2 },
}
const mainGoalMap: ScoreMap = {
  'Lower my electricity bills': { solarFitScore: 2, batteryFitScore: 2 },
  'Use more of my solar energy': { batteryFitScore: 4 },
  'Backup during blackouts': { batteryFitScore: 4, backupScore: 5 },
  'Prepare for future energy needs': { solarFitScore: 2, batteryFitScore: 3 },
  'Join a Virtual Power Plant (VPP)': { batteryFitScore: 3, solarFitScore: 1 },
  'Take advantage of free midday charging': { solarFitScore: 4, daytimeScore: 3 },
  'Not sure yet': { solarFitScore: 1, batteryFitScore: 1 },
}
const billLevelMap: ScoreMap = {
  'Lower than expected': { usageScore: 0 },
  Manageable: { usageScore: 1 },
  'Higher than I want': { usageScore: 3, solarFitScore: 2, batteryFitScore: 2 },
  'Very high / unpredictable': { usageScore: 5, solarFitScore: 3, batteryFitScore: 3 },
}

function scoreToLevel(score: number) {
  if (score <= 1) return copy.levels.low
  if (score <= 4) return copy.levels.moderate
  return copy.levels.high
}

function getDirectionIcons(rec: RecommendationType): ComponentType<IconProps>[] {
  switch (rec) {
    case RECOMMENDATION.SOLAR_FIRST:
      return [Sun]
    case RECOMMENDATION.BATTERY_ADD:
      return [Battery]
    case RECOMMENDATION.SOLAR_AND_BATTERY:
      return [Sun, Battery]
    default:
      return [Shield]
  }
}

function getHouseholdType(scores: Scores, answers: Answers): string {
  const hasSolar = answers.solar_status !== 'No solar' && answers.solar_status !== ''
  const hasBattery = answers.battery_status === 'Yes, already installed'

  if (hasSolar && hasBattery) return copy.household.optimizer
  if (!hasSolar && scores.usageScore >= 9) return copy.household.highUsage
  if (scores.daytimeScore >= 4 && !hasSolar) return copy.household.solarOpportunity
  if (scores.nightScore >= 3 && hasSolar && !hasBattery) return copy.household.batteryCandidate
  if (scores.backupScore >= 5) return copy.household.backupFocused
  if (scores.loadScore >= 5) return copy.household.heavyLoad
  return copy.household.everyday
}

function getRecommendation(scores: Scores, answers: Answers): { type: RecommendationType; fit: string } {
  const hasSolar = answers.solar_status !== 'No solar' && answers.solar_status !== ''
  const hasBattery = answers.battery_status === 'Yes, already installed'
  const { solarFitScore: solar, batteryFitScore: battery, usageScore: usage, nightScore: night, backupScore: backup } = scores

  if (hasSolar && hasBattery) return { type: RECOMMENDATION.OPTIMIZATION, fit: copy.fit.good }

  if (!hasSolar && !hasBattery) {
    if (solar >= 6 && battery >= 6 && usage >= 8) return { type: RECOMMENDATION.SOLAR_AND_BATTERY, fit: copy.fit.strong }
    if (solar >= battery + 2) return { type: RECOMMENDATION.SOLAR_FIRST, fit: copy.fit.strong }
    if (battery > solar + 1 && usage >= 7) return { type: RECOMMENDATION.SOLAR_AND_BATTERY, fit: copy.fit.good }
    return { type: RECOMMENDATION.SOLAR_FIRST, fit: copy.fit.good }
  }

  if (hasSolar && !hasBattery) {
    if (battery >= 6 || backup >= 5 || night >= 3) return { type: RECOMMENDATION.BATTERY_ADD, fit: copy.fit.strong }
    return { type: RECOMMENDATION.OPTIMIZATION, fit: copy.fit.review }
  }

  return { type: RECOMMENDATION.ASSESSMENT, fit: copy.fit.review }
}

function getBillReasons(scores: Scores, answers: Answers): string[] {
  const reasons: string[] = []
  const goals = answers.main_goal
  const hasSolar = answers.solar_status !== 'No solar' && answers.solar_status !== ''
  const hasBattery = answers.battery_status === 'Yes, already installed'

  if (scores.usageScore >= 8) reasons.push('Your home appears to have above-average electricity demand, which can directly push bills higher.')
  if (scores.nightScore >= 3) reasons.push('A significant share of your usage likely happens in the evening, which can mean higher reliance on grid power.')
  if (scores.loadScore >= 5) reasons.push('Large electrical loads may be putting additional pressure on your bill.')
  if (!hasSolar) reasons.push('Your home may be missing the opportunity to offset daytime grid use with solar.')
  if (hasSolar && !hasBattery) reasons.push('You already have solar, but your home may still rely on the grid at night without battery storage.')
  if (goals.includes('Take advantage of free midday charging'))
    reasons.push('If midday free charging matters to you, better daytime energy usage and solar alignment may create more value.')
  if (goals.includes('Join a Virtual Power Plant (VPP)'))
    reasons.push('If VPP participation matters to you, the right battery-ready setup may create additional value.')

  return reasons.slice(0, 4)
}

function calculateProfile(answers: Answers) {
  const scores: Scores = {
    usageScore: 0,
    daytimeScore: 0,
    nightScore: 0,
    loadScore: 0,
    solarFitScore: 0,
    batteryFitScore: 0,
    backupScore: 0,
  }
  const apply = (key: string, map: ScoreMap) => {
    const m = map[key]
    if (!m) return
    const target = scores as unknown as Record<string, number>
    Object.entries(m).forEach(([k, v]) => {
      target[k] += v as number
    })
  }
  const applyMulti = (keys: string[], map: ScoreMap) => keys.forEach((k) => apply(k, map))

  apply(answers.home_size, homeSizeMap)
  apply(answers.occupants, occupantsMap)
  apply(answers.activity_time, activityTimeMap)
  applyMulti(answers.major_loads, majorLoadsMap)
  apply(answers.solar_status, solarStatusMap)
  apply(answers.battery_status, batteryStatusMap)
  applyMulti(answers.main_goal, mainGoalMap)
  apply(answers.bill_level, billLevelMap)

  const rec = getRecommendation(scores, answers)

  return {
    scores,
    profile: {
      usage: scoreToLevel(scores.usageScore),
      daytime: scoreToLevel(scores.daytimeScore),
      night: scoreToLevel(scores.nightScore),
      load: scoreToLevel(scores.loadScore),
      backup: scoreToLevel(scores.backupScore),
    },
    householdType: getHouseholdType(scores, answers),
    recommendationType: rec.type,
    fitLevel: rec.fit,
    summary: copy.summaries[rec.type],
    reasons: getBillReasons(scores, answers),
    nextStep: copy.nextStepText[rec.type],
  }
}

/* ============================================================
   3. CONTEXT + PROVIDER
   ============================================================ */

interface FreeAssessmentValue {
  isOpen: boolean
  open: () => void
  close: () => void
}

const FreeAssessmentCtx = createContext<FreeAssessmentValue | null>(null)

export function useFreeAssessment() {
  const ctx = useContext(FreeAssessmentCtx)
  if (!ctx) throw new Error('useFreeAssessment must be inside <FreeAssessmentProvider>')
  return ctx
}

export function FreeAssessmentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isOpen, close])

  const value = useMemo<FreeAssessmentValue>(() => ({ isOpen, open, close }), [isOpen, open, close])

  return (
    <FreeAssessmentCtx.Provider value={value}>
      {children}
      {isOpen && <AssessmentGame onClose={close} />}
    </FreeAssessmentCtx.Provider>
  )
}

/* ============================================================
   4. GAME UI
   ============================================================ */

function AssessmentGame({ onClose }: { onClose: () => void }) {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [revealed, setRevealed] = useState(false)

  const result = useMemo(() => calculateProfile(answers), [answers])
  const currentQuestion = questions[step]
  const isLastQuestion = step === questions.length - 1
  const currentValue = currentQuestion ? answers[currentQuestion.id] : ''
  const canProceed = Array.isArray(currentValue) ? currentValue.length > 0 : !!currentValue
  const progressPct = started ? ((step + 1) / questions.length) * 100 : 0

  const reset = () => {
    setStarted(false)
    setStep(0)
    setAnswers(initialAnswers)
    setRevealed(false)
  }

  const handleSingleSelect = (qid: AnswerKey, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }))
  }

  const handleMultiSelect = (qid: AnswerKey, option: QuestionOption) => {
    setAnswers((prev) => {
      const current = (prev[qid] as string[]) ?? []
      const isSelected = current.includes(option.label)
      let next: string[]

      if (isSelected) {
        next = current.filter((x) => x !== option.label)
      } else if (option.exclusive) {
        next = [option.label]
      } else {
        const exclusiveSelected = currentQuestion!.options.find((o) => o.exclusive && current.includes(o.label))
        next = current.filter((x) => x !== (exclusiveSelected?.label ?? ''))
        next.push(option.label)
      }

      return { ...prev, [qid]: next }
    })
  }

  const goNext = () => {
    if (isLastQuestion) setStep(questions.length)
    else setStep((s) => s + 1)
  }

  const goBack = () => {
    if (step === 0) setStarted(false)
    else setStep((s) => s - 1)
  }

  const directionIcons = getDirectionIcons(result.recommendationType)
  const reachedEnd = started && step >= questions.length
  const showContact = reachedEnd && !revealed
  const showResult = reachedEnd && revealed

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.shell} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerBadge}>
            <Sparkles size={14} />
            {copy.badge}
          </div>
          <h2 className={styles.headerTitle}>{copy.title}</h2>
          <p className={styles.headerSubtitle}>{copy.subtitle}</p>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close assessment">
            <X size={24} />
          </button>
        </div>

        <div className={styles.body}>
          {!started ? (
            <IntroScreen onStart={() => setStarted(true)} />
          ) : showContact ? (
            <ContactStep
              answers={answers}
              result={result}
              onBack={() => setStep(questions.length - 1)}
              onSuccess={() => setRevealed(true)}
            />
          ) : showResult ? (
            <ResultScreen result={result} directionIcons={directionIcons} onClose={onClose} onReset={reset} />
          ) : (
            <QuestionScreen
              question={currentQuestion}
              step={step}
              total={questions.length}
              progressPct={progressPct}
              answers={answers}
              canProceed={canProceed}
              isLast={isLastQuestion}
              onSingle={handleSingleSelect}
              onMulti={handleMultiSelect}
              onBack={goBack}
              onNext={goNext}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- Sub-screens ---------- */

function IntroScreen({ onStart }: { onStart: () => void }) {
  const featureIcons = [Sun, Battery, LineChart, PhoneCall]
  return (
    <div className={styles.section}>
      <div className={styles.introGrid}>
        <div>
          <div className={styles.featureGrid}>
            {copy.featureCards.map((label, i) => {
              const IconC = featureIcons[i] ?? Sun
              return (
                <div key={label} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <IconC size={22} />
                  </div>
                  <div className={styles.featureLabel}>{label}</div>
                </div>
              )
            })}
          </div>

          <div className={styles.whatYouGet}>
            <h3 className={styles.whatYouGetTitle}>{copy.whatYouGet}</h3>
            <ul className={styles.checkList}>
              {copy.getItems.map((item) => (
                <li key={item} className={styles.checkItem}>
                  <span className={styles.checkIcon}>
                    <CheckCircle2 size={18} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.beginCard}>
          <div>
            <div className={styles.beginEyebrow}>{copy.readyToBegin}</div>
            <h3 className={styles.beginTitle}>{copy.beginTitle}</h3>
            <p className={styles.beginText}>{copy.beginText}</p>
          </div>
          <button type="button" className={styles.startBtn} onClick={onStart}>
            <Sparkles size={18} />
            {copy.start}
          </button>
        </div>
      </div>
    </div>
  )
}

function QuestionScreen({
  question,
  step,
  total,
  progressPct,
  answers,
  canProceed,
  isLast,
  onSingle,
  onMulti,
  onBack,
  onNext,
}: {
  question: Question
  step: number
  total: number
  progressPct: number
  answers: Answers
  canProceed: boolean
  isLast: boolean
  onSingle: (qid: AnswerKey, value: string) => void
  onMulti: (qid: AnswerKey, opt: QuestionOption) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className={styles.section}>
      <div className={styles.qTopRow}>
        <div className={styles.qProgress}>
          {copy.progress} {step + 1} / {total}
        </div>
        <div className={styles.qHint}>{question.type === 'multi' ? copy.multiHint : copy.singleHint}</div>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
      </div>

      <h3 className={styles.qTitle}>{question.title}</h3>
      <p className={styles.qSubtitle}>{question.subtitle}</p>
      {question.tip && <span className={styles.qTip}>{question.tip}</span>}

      <div className={styles.optionGrid}>
        {question.options.map((option) => {
          const selected =
            question.type === 'multi'
              ? ((answers[question.id] as string[]) ?? []).includes(option.label)
              : answers[question.id] === option.label
          return (
            <OptionCard
              key={option.label}
              option={option}
              selected={selected}
              onClick={() =>
                question.type === 'multi' ? onMulti(question.id, option) : onSingle(question.id, option.label)
              }
            />
          )
        })}
      </div>

      <div className={styles.qActions}>
        <button type="button" className={styles.btnBack} onClick={onBack}>
          <ChevronLeft size={18} />
          {copy.back}
        </button>
        <button type="button" className={styles.btnNext} onClick={onNext} disabled={!canProceed}>
          {isLast ? copy.finish : copy.next}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

function OptionCard({
  option,
  selected,
  onClick,
}: {
  option: QuestionOption
  selected: boolean
  onClick: () => void
}) {
  const IconC = option.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.optionCard} ${selected ? styles.optionCardSelected : ''}`}
    >
      <div className={styles.optionIcon}>
        <IconC size={22} />
      </div>
      <div className={styles.optionBody}>
        <div className={styles.optionLabel}>{option.label}</div>
        {option.hint && <div className={styles.optionHint}>{option.hint}</div>}
        {option.exclusive && <div className={styles.optionExclusive}>Selecting this clears other choices</div>}
      </div>
      <div className={styles.optionRadio}>
        {selected && <CheckCircle2 size={14} />}
      </div>
    </button>
  )
}

/* ---------- Contact step (lead-capture gate between Q8 and Result) ---------- */

const AU_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'] as const

interface ContactForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  suburb: string
  state: string
  postcode: string
}

const initialContact: ContactForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  suburb: '',
  state: 'NSW',
  postcode: '',
}

function buildAssessmentPayload(
  contact: ContactForm,
  answers: Answers,
  result: ReturnType<typeof calculateProfile>,
): AssessmentRequest {
  return {
    firstName: contact.firstName.trim(),
    lastName:  contact.lastName.trim() || undefined,
    email:     contact.email.trim(),
    phone:     contact.phone.trim(),
    address:   contact.address.trim() || undefined,
    suburb:    contact.suburb.trim() || undefined,
    state:     contact.state || undefined,
    postcode:  contact.postcode.trim(),
    answers: {
      homeSize:       answers.home_size,
      occupants:      answers.occupants,
      activityTime:   answers.activity_time,
      majorLoads:     answers.major_loads,
      solarStatus:    answers.solar_status,
      batteryStatus:  answers.battery_status,
      mainGoal:       answers.main_goal,
      billLevel:      answers.bill_level,
    },
    result: {
      householdType:      result.householdType,
      recommendationType: result.recommendationType,
      fitLevel:           result.fitLevel,
      summary:            result.summary,
      nextStep:           result.nextStep,
      billReasons:        result.reasons.map((reason) => ({ reason })),
      profile:            result.profile,
      scores:             result.scores as unknown as Record<string, number>,
    },
    source: {
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
    },
  }
}

function ContactStep({
  answers,
  result,
  onBack,
  onSuccess,
}: {
  answers: Answers
  result: ReturnType<typeof calculateProfile>
  onBack: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState<ContactForm>(initialContact)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const canSubmit =
    !!form.firstName.trim() &&
    !!form.email.trim() &&
    !!form.phone.trim() &&
    !!form.postcode.trim() &&
    !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await api.submitAssessment(buildAssessmentPayload(form, answers, result))
      onSuccess()
    } catch (err) {
      console.error('[assessment] submit failed:', err)
      setError("We couldn't submit your details just now. Please check your info and try again — or call us on 1300 258 836.")
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.contactIntro}>
        <div className={styles.resultBadge}>
          <Sparkles size={14} />
          Almost there — unlock your report
        </div>
        <h3 className={styles.resultTitle}>Where should we send your personalised energy report?</h3>
        <p className={styles.resultSummary}>
          Drop your details below and we&apos;ll instantly reveal your tailored result on screen — plus email you a copy.
          A senior Bluven engineer will follow up within 24 business hours. No spam, no obligation.
        </p>
      </div>

      <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
        <div className={styles.contactGrid}>
          <div className={styles.contactField}>
            <label className={styles.contactLabel}>First name <span className={styles.req}>*</span></label>
            <input
              type="text"
              className={styles.contactInput}
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              autoComplete="given-name"
              required
            />
          </div>
          <div className={styles.contactField}>
            <label className={styles.contactLabel}>Last name</label>
            <input
              type="text"
              className={styles.contactInput}
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              autoComplete="family-name"
            />
          </div>

          <div className={styles.contactField}>
            <label className={styles.contactLabel}>Email <span className={styles.req}>*</span></label>
            <input
              type="email"
              className={styles.contactInput}
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className={styles.contactField}>
            <label className={styles.contactLabel}>Mobile / Phone <span className={styles.req}>*</span></label>
            <input
              type="tel"
              className={styles.contactInput}
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              autoComplete="tel"
              required
            />
          </div>

          <div className={`${styles.contactField} ${styles.contactFull}`}>
            <label className={styles.contactLabel}>Street address</label>
            <input
              type="text"
              className={styles.contactInput}
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              autoComplete="street-address"
              placeholder="e.g. 12 Smith Street"
            />
          </div>

          <div className={styles.contactField}>
            <label className={styles.contactLabel}>Suburb</label>
            <input
              type="text"
              className={styles.contactInput}
              value={form.suburb}
              onChange={(e) => update('suburb', e.target.value)}
              autoComplete="address-level2"
            />
          </div>
          <div className={styles.contactField}>
            <label className={styles.contactLabel}>State</label>
            <select
              className={styles.contactInput}
              value={form.state}
              onChange={(e) => update('state', e.target.value)}
            >
              {AU_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className={styles.contactField}>
            <label className={styles.contactLabel}>Postcode <span className={styles.req}>*</span></label>
            <input
              type="text"
              className={styles.contactInput}
              value={form.postcode}
              onChange={(e) => update('postcode', e.target.value)}
              autoComplete="postal-code"
              inputMode="numeric"
              required
            />
          </div>
        </div>

        <div className={styles.contactConsent}>
          By submitting you agree we may contact you about your assessment and solar/battery options.
          We never sell your data. See our <Link href="/privacy" className={styles.contactConsentLink}>Privacy Policy</Link>.
        </div>

        {error && <div className={styles.contactError}>{error}</div>}

        <div className={styles.qActions}>
          <button type="button" className={styles.btnBack} onClick={onBack} disabled={submitting}>
            <ChevronLeft size={18} />
            {copy.back}
          </button>
          <button type="submit" className={styles.btnNext} disabled={!canSubmit}>
            {submitting ? 'Submitting…' : 'Reveal My Report'}
            <ChevronRight size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}

function ResultScreen({
  result,
  directionIcons,
  onClose,
  onReset,
}: {
  result: ReturnType<typeof calculateProfile>
  directionIcons: ComponentType<IconProps>[]
  onClose: () => void
  onReset: () => void
}) {
  const resultTypeLabel = (() => {
    switch (result.recommendationType) {
      case RECOMMENDATION.OPTIMIZATION:
      case RECOMMENDATION.ASSESSMENT:
        return 'Review'
      case RECOMMENDATION.BATTERY_ADD:
        return 'Battery'
      case RECOMMENDATION.SOLAR_AND_BATTERY:
        return 'Hybrid'
      default:
        return 'Solar'
    }
  })()

  return (
    <div className={styles.section}>
      <div className={styles.resultTop}>
        <div>
          <div className={styles.resultBadge}>
            <Sparkles size={14} />
            {copy.resultBadge}
          </div>
          <h3 className={styles.resultTitle}>{result.householdType}</h3>
          <p className={styles.resultSummary}>{result.summary}</p>
        </div>
        <div className={styles.fitCard}>
          <div className={styles.fitLabel}>{copy.fitLevel}</div>
          <div className={styles.fitValue}>{result.fitLevel}</div>
        </div>
      </div>

      <div className={styles.resultGrid2}>
        <div className={styles.resultCard}>
          <div className={styles.resultCardLabel}>{copy.recommendationTitle}</div>
          <div className={styles.recommendTitle}>{copy.rec[result.recommendationType]}</div>
          <div className={styles.recommendIcons}>
            {directionIcons.map((IconC, i) => (
              <div key={i} className={styles.recommendIcon}>
                <IconC size={22} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.resultCard}>
          <div className={styles.resultCardLabel}>{copy.profileTitle}</div>
          <div className={styles.statGrid}>
            <Stat label={copy.fields.usage} value={result.profile.usage} />
            <Stat label={copy.fields.daytime} value={result.profile.daytime} />
            <Stat label={copy.fields.night} value={result.profile.night} />
            <Stat label={copy.fields.load} value={result.profile.load} />
            <Stat label={copy.fields.backup} value={result.profile.backup} />
            <Stat label="Result type" value={resultTypeLabel} />
          </div>
        </div>
      </div>

      {result.reasons.length > 0 && (
        <div className={styles.reasonsBlock}>
          <div className={styles.resultCardLabel}>{copy.billTitle}</div>
          <ul className={styles.checkList}>
            {result.reasons.map((reason) => (
              <li key={reason} className={styles.checkItem}>
                <span className={styles.checkIcon}>
                  <CheckCircle2 size={18} />
                </span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.nextStepBlock}>
        <div className={styles.resultCardLabel}>{copy.nextStep}</div>
        <p className={styles.nextStepText}>{result.nextStep}</p>
        <div className={styles.ctaRow}>
          <Link href="/quote" className={styles.ctaPrimary} onClick={onClose}>
            <ScanSearch size={18} />
            {copy.ctaPrimary}
          </Link>
          <Link href="/contact" className={styles.ctaSecondary} onClick={onClose}>
            <PhoneCall size={18} />
            {copy.ctaSecondary}
          </Link>
          <button type="button" className={styles.ctaTertiary} onClick={onReset}>
            {copy.restart}
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.statBox}>
      <div className={styles.statBoxLabel}>{label}</div>
      <div className={styles.statBoxValue}>{value}</div>
    </div>
  )
}

/* ============================================================
   5. PUBLIC BUTTON COMPONENTS
   ============================================================ */

/** Sticky "Free Assessment" pill — sits next to the existing sticky-quote in <Nav>. */
export function FreeAssessmentStickyButton({ show }: { show: boolean }) {
  const { open } = useFreeAssessment()
  return (
    <button
      type="button"
      className={`${styles.stickyBtn} ${show ? styles.show : ''}`}
      onClick={open}
      aria-label="Start free home energy assessment"
    >
      <span className={styles.stickyBtnIcon}>
        <Sparkles size={14} />
      </span>
      <span>Free Assessment</span>
      <span className={styles.stickyBtnArrow}>→</span>
    </button>
  )
}

/** Hero primary CTA — "Get Free Assessment" yellow pill (matches old site). */
export function FreeAssessmentHeroButton() {
  const { open } = useFreeAssessment()
  return (
    <button type="button" className={styles.heroBtn} onClick={open}>
      <span className={styles.heroBtnIcon}>
        <Sparkles size={18} />
      </span>
      <span>Get Free Assessment</span>
      <span className={styles.heroBtnArrow}>→</span>
    </button>
  )
}
