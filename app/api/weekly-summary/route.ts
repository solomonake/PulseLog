import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWeeklySummary } from '@/lib/ai-summaries'
import { generateInsights } from '@/lib/decisionSystem'
import { DailyLog, AthleteProfile, Meet } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch data for the past week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: profile } = await supabase
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    const { data: meets } = await supabase
      .from('meets')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })

    // Generate insights
    const insights = generateInsights(
      (logs || []) as DailyLog[],
      (profile || null) as AthleteProfile | null,
      (meets || []) as Meet[]
    )

    // Generate AI summary
    const summary = await generateWeeklySummary(insights)

    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error('Weekly summary error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}

