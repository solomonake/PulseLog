import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // Fetch subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <SettingsClient user={{ id: user.id, email: user.email, role: 'athlete', created_at: user.created_at }} subscription={subscription} />
  )
}

