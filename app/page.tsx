import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Always send authenticated users to log; middleware will route onboarding if needed
    redirect('/log')
  } else {
    redirect('/login')
  }
}

