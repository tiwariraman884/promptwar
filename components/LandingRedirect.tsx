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

export default function LandingRedirect() {
  const router = useRouter()

  useEffect(() => {
    const user = window.localStorage.getItem('eco_user')
    if (!user) {
      router.replace('/auth')
    }
    // If user exists, stay on landing — no redirect needed
  }, [router])

  return null
}
