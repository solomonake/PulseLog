'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from '@/lib/types'
import { ArrowLeft } from 'lucide-react'

interface SettingsClientProps {
  user: User
  subscription: any
}

export default function SettingsClient({ user, subscription }: SettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    setLoading(true)
    // Stripe integration would go here
    // For now, just redirect to a placeholder
    alert('Stripe integration coming soon')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-navy">Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-text-muted">{user.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut} disabled={loading}>
              Sign Out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              {subscription?.status === 'active' || subscription?.status === 'trialing'
                ? 'Your subscription is active'
                : 'Upgrade to unlock full insights'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription?.status === 'active' || subscription?.status === 'trialing' ? (
              <div className="space-y-2">
                <p className="text-sm">
                  Plan: <span className="font-medium">{subscription.plan}</span>
                </p>
                {subscription.current_period_end && (
                  <p className="text-sm text-text-muted">
                    Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Monthly</h3>
                  <p className="text-2xl font-bold mb-2">$15<span className="text-sm font-normal text-text-muted">/month</span></p>
                  <Button onClick={() => handleSubscribe('monthly')} className="w-full" disabled={loading}>
                    Subscribe
                  </Button>
                </div>
                <div className="border rounded-lg p-4 border-green">
                  <h3 className="font-semibold mb-2">Annual</h3>
                  <p className="text-2xl font-bold mb-2">$150<span className="text-sm font-normal text-text-muted">/year</span></p>
                  <p className="text-xs text-text-muted mb-2">Save $30/year</p>
                  <Button onClick={() => handleSubscribe('annual')} variant="secondary" className="w-full" disabled={loading}>
                    Subscribe
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

