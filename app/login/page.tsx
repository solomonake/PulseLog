'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        })
        if (error) throw error
        router.push('/onboarding')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Enter your email to resend confirmation.')
      return
    }
    setError(null)
    setResendLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (error) throw error
      setError('Confirmation email sent. Check your inbox.')
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 flex items-center justify-center">
      <Card className="w-full max-w-5xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-10 flex flex-col justify-center space-y-6">
            <div>
              <div className="text-3xl font-bold text-navy">PulseLog</div>
              <div className="text-sm text-text-muted">Training intelligence for competitive runners</div>
            </div>
            <CardHeader className="p-0">
              <CardTitle className="text-2xl">{isSignUp ? 'Create your account' : 'Sign in to continue'}</CardTitle>
              <CardDescription>
                {isSignUp ? 'Start tracking training with clear readiness signals.' : 'Access your training insights and logs.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="athlete@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                {error && (
                  <div className="text-sm text-red bg-red/10 p-3 rounded">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                </Button>
                {!isSignUp && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={resendLoading}
                  >
                    {resendLoading ? 'Sending...' : 'Resend confirmation email'}
                  </Button>
                )}
              </form>
            </CardContent>
          </div>
          <div className="hidden md:flex items-center justify-center bg-navy/5 p-8 md:p-10 border-l border-border">
            <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="text-xl font-semibold text-navy">PulseLog</div>
              <div className="text-sm text-text-muted max-w-xs">
                Training intelligence for competitive runners
              </div>
              <div className="relative w-full max-w-xs aspect-square">
                <Image
                  src="/illustrations/track.svg"
                  alt="Track illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

