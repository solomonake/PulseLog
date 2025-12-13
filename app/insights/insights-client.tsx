'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Insight } from '@/lib/types'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'

interface InsightsClientProps {
  insights: {
    red: Insight[]
    yellow: Insight[]
    green: Insight[]
  }
}

export default function InsightsClient({ insights }: InsightsClientProps) {
  const router = useRouter()

  const renderInsight = (insight: Insight) => {
    const borderColor = 
      insight.severity === 'red' ? 'border-red' :
      insight.severity === 'yellow' ? 'border-yellow' :
      'border-green'

    return (
      <Card key={insight.id} className="mb-4">
        <CardContent className="pt-6">
          <div className={`border-l-4 ${borderColor} pl-4 space-y-2`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{insight.explanation}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                  <span>{insight.type}</span>
                  <span>•</span>
                  <span>{insight.confidence} confidence</span>
                  <span>•</span>
                  <span>{format(new Date(insight.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            <Accordion type="single" collapsible className="mt-2">
              <AccordionItem value={`details-${insight.id}`}>
                <AccordionTrigger className="text-xs py-2">
                  View raw data
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="text-xs bg-text/5 p-3 rounded overflow-auto">
                    {JSON.stringify(insight.raw_data, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-navy">Insights</h1>
        </div>

        {/* Red Insights */}
        {insights.red.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-red">Risk Signals</h2>
            {insights.red.map(renderInsight)}
          </div>
        )}

        {/* Yellow Insights */}
        {insights.yellow.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-yellow">Caution Signals</h2>
            {insights.yellow.map(renderInsight)}
          </div>
        )}

        {/* Green Insights */}
        {insights.green.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-green">Positive Signals</h2>
            {insights.green.map(renderInsight)}
          </div>
        )}

        {insights.red.length === 0 && insights.yellow.length === 0 && insights.green.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-text-muted">
              <p>No insights available. Continue logging to generate insights.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

