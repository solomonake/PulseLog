import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // Get app user record (role, created_at, etc)
  const { data: appUser, error: userError } = await supabase
    .from('users')
    .select('id,email,role,created_at')
    .eq('id', user.id)
    .maybeSingle()

  // If you require a users row and it doesn't exist yet, send them to onboarding/setup
  if (userError) {
    console.error('Failed to load user row:', userError)
  }
  if (!appUser) {
    redirect('/onboarding') // change this route to whatever your setup page is
  }

  // Fetch subscription status (safe if no row yet)
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (subError) {
    console.error('Failed to load subscription:', subError)
  }

  return (
    <SettingsClient
      user={appUser}
      subscription={subscription ?? null}
    />
  )
}
