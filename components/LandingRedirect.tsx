'use client'

/**
 * LandingRedirect — tiny client component (~0 bundle weight)
 *
 * The ONLY reason page.tsx needed 'use client' was this localStorage
 * check. By isolating it here, the hero section (h1, image, CTAs)
 * becomes server-rendered HTML and paints immediately.
 *
 * This component renders NOTHING visible — it only triggers redirects.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export default function LandingRedirect() {
  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
      if (!isSupabaseConfigured()) {
        router.replace('/auth')
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth')
      }
    }

    checkSession()
  }, [router])

  return null
}
