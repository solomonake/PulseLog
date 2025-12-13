import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateInsights } from '@/lib/decisionSystem'
import { DailyLog, AthleteProfile, Meet, Insight } from '@/lib/types'
import InsightsClient from './insights-client'

export default async function InsightsPage() {
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

  // Fetch recent logs (last 30 days)
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(30)

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

  // Also fetch stored insights from database
  const { data: storedInsights } = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Combine and sort by date
  const combinedInsights = [
    ...allInsights.map(i => ({ ...i, id: `generated-${i.type}-${i.created_at}` })),
    ...(storedInsights || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Group by severity
  const groupedInsights = {
    red: combinedInsights.filter(i => i.severity === 'red'),
    yellow: combinedInsights.filter(i => i.severity === 'yellow'),
    green: combinedInsights.filter(i => i.severity === 'green'),
  }

  return (
    <InsightsClient insights={groupedInsights} />
  )
}

