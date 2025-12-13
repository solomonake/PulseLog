'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SessionType } from '@/lib/types'
import { CheckCircle2 } from 'lucide-react'

export default function LogPage() {
  const [sessionType, setSessionType] = useState<SessionType>('easy')
  const [distance, setDistance] = useState('')
  const [avgPace, setAvgPace] = useState('')
  const [rpe, setRpe] = useState([5])
  const [sleepHours, setSleepHours] = useState('')
  const [soreness, setSoreness] = useState([3])
  const [mood, setMood] = useState([3])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if already logged today
    const checkToday = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (data) {
        router.push('/dashboard')
      }
    }
    checkToday()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const today = new Date().toISOString().split('T')[0]

      const { error } = await supabase
        .from('daily_logs')
        .insert({
          user_id: user.id,
          date: today,
          session_type: sessionType,
          distance: distance ? parseFloat(distance) : null,
          avg_pace: avgPace || null,
          rpe: rpe[0],
          sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
          soreness: soreness[0],
          mood: mood[0],
          notes: notes || null,
        })

      if (error) throw error

      setSubmitted(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err: any) {
      console.error('Log error:', err)
      alert('Error saving log: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle2 className="h-16 w-16 text-green mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Logged</h2>
            <p className="text-text-muted">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Daily Log</CardTitle>
            <CardDescription>
              Quick log — under 30 seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sessionType">Session Type</Label>
                <Select value={sessionType} onValueChange={(v: SessionType) => setSessionType(v)} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="workout">Workout</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="race">Race</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (miles)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avgPace">Avg Pace</Label>
                  <Input
                    id="avgPace"
                    type="text"
                    value={avgPace}
                    onChange={(e) => setAvgPace(e.target.value)}
                    placeholder="MM:SS"
                    pattern="[0-9]{1,2}:[0-5][0-9]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>RPE: {rpe[0]}/10</Label>
                <Slider
                  value={rpe}
                  onValueChange={setRpe}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-text-muted">
                  <span>1 - Very Easy</span>
                  <span>10 - Max</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sleepHours">Sleep (hours)</Label>
                <Input
                  id="sleepHours"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  placeholder="8.0"
                  className="text-2xl text-center"
                />
              </div>

              <div className="space-y-2">
                <Label>Soreness: {soreness[0]}/10</Label>
                <Slider
                  value={soreness}
                  onValueChange={setSoreness}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Mood: {mood[0]}/5</Label>
                <Slider
                  value={mood}
                  onValueChange={setMood}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Brief notes..."
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Saving...' : 'Submit Log'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

