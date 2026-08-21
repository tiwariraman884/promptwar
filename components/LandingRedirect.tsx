'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { SettingsDB } from '@/lib/settings-db'

export default function LandingRedirect() {
  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
      const hasCookie = typeof document !== "undefined" && document.cookie.includes("eco_auth=true")
      const localProfile = SettingsDB.getProfile()
      if (hasCookie || Boolean(localProfile?.email)) {
        router.replace('/dashboard')
        return
      }

      if (!isSupabaseConfigured()) {
        return
      }

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          router.replace('/dashboard')
        }
      } catch {
        // stay on landing page
      }
    }

    checkSession()
  }, [router])

  return null
}
