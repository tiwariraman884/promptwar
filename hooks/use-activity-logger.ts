'use client';

import { useCallback } from 'react';
import type { ActivityEvent } from '@/lib/types/security';

export function useActivityLogger(): {
  log: (event: ActivityEvent, metadata?: Record<string, string | number | boolean | null>) => void;
} {
  const log = useCallback((
    event: ActivityEvent,
    metadata: Record<string, string | number | boolean | null> = {}
  ): void => {
    const sessionId = typeof window !== 'undefined'
      ? sessionStorage.getItem('sessionId') ?? undefined
      : undefined;
    const page = typeof window !== 'undefined' ? window.location.pathname : '';

    // Fire-and-forget — never await, never block
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, page, metadata, sessionId }),
    }).catch(() => { /* silent */ });
  }, []);

  return { log };
}
