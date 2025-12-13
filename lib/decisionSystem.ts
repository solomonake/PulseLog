import { DailyLog, AthleteProfile, Meet, Insight, InsightType, InsightSeverity, ConfidenceLevel } from './types'
import { differenceInDays, parseISO, subDays } from 'date-fns'

/**
 * DETERMINISTIC DECISION SYSTEM
 * 
 * All insights are derived from observable data and fixed rules.
 * No AI inference, no predictions, no hallucinations.
 */

interface PaceRange {
  min: number // seconds per mile
  max: number // seconds per mile
}

/**
 * Calculate easy pace range from race times
 * Based on Jack Daniels VDOT principles
 */
function calculateEasyPaceRange(raceTimes: Record<string, string>, primaryEvent: string | null): PaceRange | null {
  if (!primaryEvent || !raceTimes[primaryEvent]) {
    return null
  }

  const raceTimeStr = raceTimes[primaryEvent]
  const [minutes, seconds] = raceTimeStr.split(':').map(Number)
  const totalSeconds = minutes * 60 + seconds

  let vdot: number

  // Convert race time to VDOT (simplified)
  if (primaryEvent === '5k') {
    vdot = 29.54 + (5.012 * totalSeconds - 0.1125 * totalSeconds * totalSeconds) / 1000
  } else if (primaryEvent === '10k') {
    vdot = 29.54 + (5.012 * totalSeconds - 0.1125 * totalSeconds * totalSeconds) / 2000
  } else if (primaryEvent === 'mile') {
    vdot = 29.54 + (5.012 * totalSeconds - 0.1125 * totalSeconds * totalSeconds) / 1609
  } else {
    return null
  }

  // Easy pace is approximately 65-78% of VO2 max pace
  // Simplified: easy pace = race pace * 1.3 to 1.5
  const racePacePerMile = totalSeconds / (primaryEvent === '5k' ? 3.10686 : primaryEvent === '10k' ? 6.21371 : 1)
  const slowestEasyPace = racePacePerMile * 1.5 // Slower = more seconds
  const fastestEasyPace = racePacePerMile * 1.3 // Faster = fewer seconds

  return {
    min: Math.round(slowestEasyPace), // Minimum pace (slowest, most seconds)
    max: Math.round(fastestEasyPace)  // Maximum pace (fastest, fewest seconds)
  }
}

/**
 * Convert pace string (MM:SS) to seconds per mile
 */
function paceToSeconds(pace: string): number | null {
  const parts = pace.split(':')
  if (parts.length !== 2) return null
  const minutes = parseInt(parts[0], 10)
  const seconds = parseInt(parts[1], 10)
  if (isNaN(minutes) || isNaN(seconds)) return null
  return minutes * 60 + seconds
}

/**
 * Check for easy-day pacing violations
 */
function checkEasyPaceViolation(
  log: DailyLog,
  profile: AthleteProfile | null
): Insight | null {
  if (log.session_type !== 'easy' || !log.avg_pace || !log.rpe) {
    return null
  }

  if (log.rpe < 6) {
    return null // Not a violation if RPE is low
  }

  if (!profile) {
    return null
  }

  const paceRange = calculateEasyPaceRange(profile.race_times, profile.primary_event)
  if (!paceRange) {
    return null
  }

  const logPaceSeconds = paceToSeconds(log.avg_pace)
  if (!logPaceSeconds) {
    return null
  }

  if (logPaceSeconds < paceRange.max) {
    // Too fast (fewer seconds = faster pace)
    const severity: InsightSeverity = logPaceSeconds < paceRange.min ? 'red' : 'yellow'
    return {
      id: '',
      user_id: log.user_id,
      type: 'pace',
      severity,
      explanation: `Today's easy run averaged ${log.avg_pace}/mile. Based on your current fitness, easy pace should be ${formatPace(paceRange.min)}–${formatPace(paceRange.max)}. This may be adding unnecessary fatigue.`,
      raw_data: {
        logged_pace: log.avg_pace,
        pace_range_min: formatPace(paceRange.min),
        pace_range_max: formatPace(paceRange.max),
        rpe: log.rpe
      },
      confidence: 'high' as ConfidenceLevel,
      created_at: new Date().toISOString()
    }
  }

  return null
}

function formatPace(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Check for fatigue accumulation
 */
function checkFatigueAccumulation(
  logs: DailyLog[],
  daysToCheck: number = 5,
  thresholdRPE: number = 7,
  minSessions: number = 3
): Insight | null {
  if (logs.length < minSessions) {
    return null
  }

  const recentLogs = logs
    .filter(log => {
      const logDate = parseISO(log.date)
      const daysAgo = differenceInDays(new Date(), logDate)
      return daysAgo <= daysToCheck && log.rpe !== null
    })
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())

  const highRPELogs = recentLogs.filter(log => (log.rpe ?? 0) >= thresholdRPE)

  if (highRPELogs.length >= minSessions) {
    const avgRPE = highRPELogs.reduce((sum, log) => sum + (log.rpe ?? 0), 0) / highRPELogs.length
    const severity: InsightSeverity = avgRPE >= 8 ? 'red' : 'yellow'

    return {
      id: '',
      user_id: logs[0].user_id,
      type: 'fatigue',
      severity,
      explanation: `High-intensity sessions (RPE ≥ ${thresholdRPE}) have occurred ${highRPELogs.length} times in the past ${daysToCheck} days. Average RPE: ${avgRPE.toFixed(1)}. Fatigue risk is elevated.`,
      raw_data: {
        high_rpe_sessions: highRPELogs.length,
        days_checked: daysToCheck,
        avg_rpe: avgRPE.toFixed(1),
        threshold_rpe: thresholdRPE
      },
      confidence: 'high' as ConfidenceLevel,
      created_at: new Date().toISOString()
    }
  }

  return null
}

/**
 * Check for sleep debt
 */
function checkSleepDebt(logs: DailyLog[], daysToCheck: number = 3, threshold: number = 6.5): Insight | null {
  const recentLogs = logs
    .filter(log => {
      const logDate = parseISO(log.date)
      const daysAgo = differenceInDays(new Date(), logDate)
      return daysAgo <= daysToCheck && log.sleep_hours !== null
    })
    .slice(0, daysToCheck)

  if (recentLogs.length < 2) {
    return null
  }

  const avgSleep = recentLogs.reduce((sum, log) => sum + (log.sleep_hours ?? 0), 0) / recentLogs.length

  if (avgSleep < threshold) {
    const severity: InsightSeverity = avgSleep < 5.5 ? 'red' : 'yellow'
    return {
      id: '',
      user_id: logs[0].user_id,
      type: 'sleep',
      severity,
      explanation: `Sleep has averaged ${avgSleep.toFixed(1)} hours over the past ${recentLogs.length} days. Combined with high-RPE sessions, fatigue risk is elevated.`,
      raw_data: {
        avg_sleep: avgSleep.toFixed(1),
        days_checked: recentLogs.length,
        threshold: threshold
      },
      confidence: 'moderate' as ConfidenceLevel,
      created_at: new Date().toISOString()
    }
  }

  return null
}

/**
 * Check for load spike
 */
function checkLoadSpike(logs: DailyLog[], threshold: number = 0.2): Insight | null {
  if (logs.length < 7) {
    return null
  }

  const sortedLogs = [...logs].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
  
  // Calculate weekly mileage
  const now = new Date()
  const lastWeekStart = subDays(now, 7)
  const twoWeeksAgoStart = subDays(now, 14)

  const lastWeekMileage = sortedLogs
    .filter(log => {
      const logDate = parseISO(log.date)
      return logDate >= lastWeekStart && logDate < now && log.distance !== null
    })
    .reduce((sum, log) => sum + (log.distance ?? 0), 0)

  const previousWeekMileage = sortedLogs
    .filter(log => {
      const logDate = parseISO(log.date)
      return logDate >= twoWeeksAgoStart && logDate < lastWeekStart && log.distance !== null
    })
    .reduce((sum, log) => sum + (log.distance ?? 0), 0)

  if (previousWeekMileage === 0 || lastWeekMileage === 0) {
    return null
  }

  const increase = (lastWeekMileage - previousWeekMileage) / previousWeekMileage

  if (increase > threshold) {
    const severity: InsightSeverity = increase > 0.3 ? 'red' : 'yellow'
    return {
      id: '',
      user_id: logs[0].user_id,
      type: 'load',
      severity,
      explanation: `Weekly mileage increased ${(increase * 100).toFixed(0)}% (${previousWeekMileage.toFixed(1)} → ${lastWeekMileage.toFixed(1)} miles). Rapid increases in training load increase injury risk.`,
      raw_data: {
        previous_week: previousWeekMileage.toFixed(1),
        current_week: lastWeekMileage.toFixed(1),
        increase_percent: (increase * 100).toFixed(0)
      },
      confidence: 'high' as ConfidenceLevel,
      created_at: new Date().toISOString()
    }
  }

  return null
}

/**
 * Check pre-meet sensitivity
 */
function checkPreMeetRisk(
  logs: DailyLog[],
  meets: Meet[],
  daysBefore: number = 7
): Insight | null {
  const upcomingMeets = meets
    .filter(meet => {
      const meetDate = parseISO(meet.date)
      const daysUntil = differenceInDays(meetDate, new Date())
      return daysUntil >= 0 && daysUntil <= daysBefore
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())

  if (upcomingMeets.length === 0) {
    return null
  }

  const nextMeet = upcomingMeets[0]
  const daysUntil = differenceInDays(parseISO(nextMeet.date), new Date())

  // Check for high-intensity training in the last 3 days
  const recentLogs = logs
    .filter(log => {
      const logDate = parseISO(log.date)
      const daysAgo = differenceInDays(new Date(), logDate)
      return daysAgo <= 3
    })

  const highIntensitySessions = recentLogs.filter(log => 
    (log.session_type === 'workout' || log.session_type === 'race') || 
    (log.rpe !== null && log.rpe >= 7)
  )

  if (highIntensitySessions.length > 0 && daysUntil <= 4) {
    return {
      id: '',
      user_id: logs[0].user_id,
      type: 'pre_meet',
      severity: 'yellow' as InsightSeverity,
      explanation: `You are ${daysUntil} day${daysUntil !== 1 ? 's' : ''} out from ${nextMeet.event}. High-intensity training at this point may reduce freshness.`,
      raw_data: {
        meet_date: nextMeet.date,
        meet_event: nextMeet.event,
        days_until: daysUntil,
        high_intensity_sessions_recent: highIntensitySessions.length
      },
      confidence: 'moderate' as ConfidenceLevel,
      created_at: new Date().toISOString()
    }
  }

  return null
}

/**
 * Main decision function
 * Returns insights in priority order
 */
export function generateInsights(
  logs: DailyLog[],
  profile: AthleteProfile | null,
  meets: Meet[]
): Insight[] {
  const insights: Insight[] = []

  if (logs.length === 0) {
    return insights
  }

  // Priority 1: Pre-meet risk
  const preMeetInsight = checkPreMeetRisk(logs, meets)
  if (preMeetInsight) {
    insights.push(preMeetInsight)
  }

  // Priority 2: Easy-day pacing violations
  const latestLog = logs.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())[0]
  const paceInsight = checkEasyPaceViolation(latestLog, profile)
  if (paceInsight) {
    insights.push(paceInsight)
  }

  // Priority 3: Fatigue accumulation
  const fatigueInsight = checkFatigueAccumulation(logs)
  if (fatigueInsight) {
    insights.push(fatigueInsight)
  }

  // Priority 4: Sleep debt
  const sleepInsight = checkSleepDebt(logs)
  if (sleepInsight) {
    insights.push(sleepInsight)
  }

  // Priority 5: Load spikes
  const loadInsight = checkLoadSpike(logs)
  if (loadInsight) {
    insights.push(loadInsight)
  }

  return insights
}

/**
 * Get the highest priority insight for dashboard
 */
export function getPriorityInsight(insights: Insight[]): Insight | null {
  if (insights.length === 0) {
    return null
  }

  const priorityOrder: InsightType[] = ['pre_meet', 'pace', 'fatigue', 'sleep', 'load']
  
  for (const type of priorityOrder) {
    const insight = insights.find(i => i.type === type)
    if (insight) {
      return insight
    }
  }

  return insights[0]
}

/**
 * Calculate overall readiness color
 */
export function calculateReadiness(insights: Insight[]): InsightSeverity {
  const priorityInsight = getPriorityInsight(insights)
  if (!priorityInsight) {
    return 'green'
  }
  return priorityInsight.severity
}

