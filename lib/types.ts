export type UserRole = 'athlete' | 'coach'

export type SessionType = 'easy' | 'workout' | 'long' | 'race'

export type MeetPriority = 'A' | 'B' | 'C'

export type InsightType = 'pace' | 'fatigue' | 'sleep' | 'pre_meet' | 'load'

export type InsightSeverity = 'green' | 'yellow' | 'red'

export type ConfidenceLevel = 'high' | 'moderate' | 'low'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface AthleteProfile {
  user_id: string
  primary_sport: string
  primary_event: string | null
  weekly_mileage: number | null
  experience_level: string | null
  race_times: Record<string, string>
  goals: string | null
  created_at: string
  updated_at: string
}

export interface DailyLog {
  id: string
  user_id: string
  date: string
  session_type: SessionType
  distance: number | null
  avg_pace: string | null
  rpe: number | null
  sleep_hours: number | null
  soreness: number | null
  mood: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Meet {
  id: string
  user_id: string
  date: string
  event: string
  priority: MeetPriority
  created_at: string
}

export interface Insight {
  id: string
  user_id: string
  type: InsightType
  severity: InsightSeverity
  explanation: string
  raw_data: Record<string, unknown>
  confidence: ConfidenceLevel
  created_at: string
}

export interface Subscription {
  user_id: string
  plan: 'monthly' | 'annual'
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

