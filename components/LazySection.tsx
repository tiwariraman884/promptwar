'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  rootMargin?: string   // how early to start loading (default: 200px before entering view)
  className?: string
}

/**
 * Mounts children ONLY when the section scrolls into the viewport.
 * Use around any heavy component: GreenMap, AnalyticsSection, EarthGlobe.
 */
export default function LazySection({
  children,
  fallback,
  rootMargin = '200px',
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // mount once, never unmount
        }
      },
      { rootMargin, threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback ?? (
        <div className="w-full h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ))}
    </div>
  )
}
