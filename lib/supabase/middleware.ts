import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/auth', // important for /auth/callback and confirm flows
]

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  let supabaseResponse = NextResponse.next()

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublic =
    PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/')) ||
    path.startsWith('/_next') ||
    path === '/favicon.ico'

  const isOnboarding = path.startsWith('/onboarding')
  const isProtected =
    path.startsWith('/dashboard') ||
    path.startsWith('/log') ||
    path.startsWith('/settings') ||
    path.startsWith('/insights') ||
    isOnboarding

  // If not logged in, block protected routes
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', path)
    return NextResponse.redirect(url)
  }

  // If logged in, check profile existence
  if (user) {
    let hasProfile = false
    try {
      const { data, error } = await supabase
        .from('athlete_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()
      if (!error && data) {
        hasProfile = true
      }
    } catch {
      hasProfile = false
    }

    // Authenticated users should not see /login
    if (path.startsWith('/login')) {
      const url = request.nextUrl.clone()
      url.pathname = hasProfile ? '/log' : '/onboarding'
      return NextResponse.redirect(url)
    }

    // If no profile yet, force onboarding for protected areas (except onboarding itself)
    if (!hasProfile && isProtected && !isOnboarding) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // If profile exists and user is on onboarding, redirect to /log
    if (hasProfile && isOnboarding) {
      const url = request.nextUrl.clone()
      url.pathname = '/log'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
