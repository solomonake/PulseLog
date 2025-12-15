'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ALL_EVENTS, getEventByValue, getTimePlaceholder, getTimePattern } from '@/lib/events'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [primaryEvent, setPrimaryEvent] = useState('')
  const [weeklyMileage, setWeeklyMileage] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [raceTime, setRaceTime] = useState('')
  const [nextMeetDate, setNextMeetDate] = useState('')
  const [nextMeetEvent, setNextMeetEvent] = useState('')
  const [nextMeetPriority, setNextMeetPriority] = useState<'A' | 'B' | 'C'>('B')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Create or update athlete profile
      const raceTimes: Record<string, string> = {}
      if (raceTime) {
        raceTimes[primaryEvent] = raceTime
      }

      const { error: profileError } = await supabase
        .from('athlete_profiles')
        .upsert({
          user_id: user.id,
          primary_event: primaryEvent,
          weekly_mileage: weeklyMileage ? parseInt(weeklyMileage) : null,
          experience_level: experienceLevel,
          race_times: raceTimes,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (profileError) throw profileError

      // Create meet if provided
      if (nextMeetDate && nextMeetEvent) {
        const { error: meetError } = await supabase
          .from('meets')
          .insert({
            user_id: user.id,
            date: nextMeetDate,
            event: nextMeetEvent,
            priority: nextMeetPriority,
          })

        if (meetError) throw meetError
      }

      router.push('/log')
    } catch (err: any) {
      console.error('Onboarding error:', err)
      setErrorMsg(err.message || 'Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Set Up Your Profile</CardTitle>
            <CardDescription>
              Help us understand your training context
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryEvent">Primary Event</Label>
                <Select value={primaryEvent} onValueChange={setPrimaryEvent} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_EVENTS.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyMileage">Weekly Mileage</Label>
                <Input
                  id="weeklyMileage"
                  type="number"
                  value={weeklyMileage}
                  onChange={(e) => setWeeklyMileage(e.target.value)}
                  placeholder="e.g., 50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="post_collegiate">Post-Collegiate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Continue</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Race Times & Goals</CardTitle>
          <CardDescription>
            Optional: Add your best time and upcoming meet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {primaryEvent && (
              <div className="space-y-2">
                <Label htmlFor="raceTime">Best {getEventByValue(primaryEvent)?.label || primaryEvent.toUpperCase()} Time</Label>
                <Input
                  id="raceTime"
                  type="text"
                  value={raceTime}
                  onChange={(e) => setRaceTime(e.target.value)}
                  placeholder={getTimePlaceholder(getEventByValue(primaryEvent))}
                  pattern={getTimePattern(getEventByValue(primaryEvent))}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="nextMeetDate">Next Meet Date (Optional)</Label>
              <Input
                id="nextMeetDate"
                type="date"
                value={nextMeetDate}
                onChange={(e) => setNextMeetDate(e.target.value)}
              />
            </div>
            {nextMeetDate && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nextMeetEvent">Event</Label>
                  <Input
                    id="nextMeetEvent"
                    type="text"
                    value={nextMeetEvent}
                    onChange={(e) => setNextMeetEvent(e.target.value)}
                    placeholder="e.g., 5K"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextMeetPriority">Priority</Label>
                  <Select value={nextMeetPriority} onValueChange={(v: 'A' | 'B' | 'C') => setNextMeetPriority(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Peak Race</SelectItem>
                      <SelectItem value="B">B - Important</SelectItem>
                      <SelectItem value="C">C - Tune-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {errorMsg && (
              <div className="text-sm text-red bg-red/10 p-3 rounded-md">
                {errorMsg}
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

