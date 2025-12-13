import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateInsights, getPriorityInsight, calculateReadiness } from '@/lib/decisionSystem'
import { DailyLog, AthleteProfile, Meet, Insight } from '@/lib/types'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch athlete profile
  const { data: profile } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch recent logs (last 14 days)
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(14)

  // Fetch upcoming meets
  const { data: meets } = await supabase
    .from('meets')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })

  // Generate insights
  const allInsights = generateInsights(
    (logs || []) as DailyLog[],
    (profile || null) as AthleteProfile | null,
    (meets || []) as Meet[]
  )

  const priorityInsight = getPriorityInsight(allInsights)
  const readiness = calculateReadiness(allInsights)

  // Check if logged today
  const today = new Date().toISOString().split('T')[0]
  const { data: todayLog } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  return (
    <DashboardClient
      priorityInsight={priorityInsight}
      readiness={readiness}
      hasLoggedToday={!!todayLog}
      allInsights={allInsights as Insight[]}
    />
  )
}

