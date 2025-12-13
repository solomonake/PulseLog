'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, FileText, Settings, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [supabase])

  if (!user || pathname === '/login' || pathname === '/onboarding') {
    return null
  }

  return (
    <nav className="border-t border-text/10 bg-background">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          <Link href="/dashboard">
            <Button
              variant={pathname === '/dashboard' ? 'default' : 'ghost'}
              size="icon"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-xs">Dashboard</span>
            </Button>
          </Link>
          <Link href="/log">
            <Button
              variant={pathname === '/log' ? 'default' : 'ghost'}
              size="icon"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs">Log</span>
            </Button>
          </Link>
          <Link href="/insights">
            <Button
              variant={pathname === '/insights' ? 'default' : 'ghost'}
              size="icon"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Insights</span>
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant={pathname === '/settings' ? 'default' : 'ghost'}
              size="icon"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs">Settings</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

