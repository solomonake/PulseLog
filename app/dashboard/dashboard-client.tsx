'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Insight, InsightSeverity } from '@/lib/types'
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'

interface DashboardClientProps {
  priorityInsight: Insight | null
  readiness: InsightSeverity
  hasLoggedToday: boolean
  allInsights: Insight[]
}

export default function DashboardClient({
  priorityInsight,
  readiness,
  hasLoggedToday,
  allInsights,
}: DashboardClientProps) {
  const router = useRouter()

  const getReadinessColor = (severity: InsightSeverity) => {
    switch (severity) {
      case 'green':
        return 'bg-green text-white'
      case 'yellow':
        return 'bg-yellow text-navy'
      case 'red':
        return 'bg-red text-white'
      default:
        return 'bg-text-muted text-white'
    }
  }

  const getReadinessLabel = (severity: InsightSeverity) => {
    switch (severity) {
      case 'green':
        return 'Ready'
      case 'yellow':
        return 'Caution'
      case 'red':
        return 'Risk'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
          <Button variant="outline" onClick={() => router.push('/insights')}>
            All Insights
          </Button>
        </div>

        {/* Readiness Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`${getReadinessColor(readiness)} rounded-lg p-6 text-center`}>
              <div className="text-4xl font-bold mb-2">
                {getReadinessLabel(readiness)}
              </div>
              {readiness === 'green' && (
                <p className="text-sm opacity-90">Training on track</p>
              )}
              {readiness === 'yellow' && (
                <p className="text-sm opacity-90">Monitor fatigue</p>
              )}
              {readiness === 'red' && (
                <p className="text-sm opacity-90">Adjust training</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Priority Insight */}
        {priorityInsight ? (
          <Card>
            <CardHeader>
              <CardTitle>Priority Insight</CardTitle>
              <CardDescription>
                Highest-priority signal from your training data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg border-l-4 ${
                priorityInsight.severity === 'green' ? 'border-green bg-green/5' :
                priorityInsight.severity === 'yellow' ? 'border-yellow bg-yellow/5' :
                'border-red bg-red/5'
              }`}>
                <p className="text-sm font-medium mb-2">{priorityInsight.explanation}</p>
                <div className="text-xs text-text-muted">
                  Confidence: {priorityInsight.confidence} | Type: {priorityInsight.type}
                </div>
              </div>
              <Accordion type="single" collapsible>
                <AccordionItem value="details">
                  <AccordionTrigger className="text-sm">
                    Why am I seeing this?
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className="text-xs bg-text/5 p-3 rounded overflow-auto">
                      {JSON.stringify(priorityInsight.raw_data, null, 2)}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-text-muted">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green" />
              <p>No insights to display. Continue logging to generate insights.</p>
            </CardContent>
          </Card>
        )}

        {/* Primary CTA */}
        <Card>
          <CardContent className="pt-6">
            {hasLoggedToday ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green" />
                <div>
                  <h3 className="font-semibold mb-1">Today&apos;s log complete</h3>
                  <p className="text-sm text-text-muted">Check back tomorrow for your next log.</p>
                </div>
                <Button variant="outline" onClick={() => router.push('/insights')}>
                  View All Insights
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <TrendingUp className="h-12 w-12 mx-auto text-navy" />
                <div>
                  <h3 className="font-semibold mb-1">Log today&apos;s session</h3>
                  <p className="text-sm text-text-muted">Quick log — under 30 seconds</p>
                </div>
                <Button onClick={() => router.push('/log')} className="w-full" size="lg">
                  Log Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

