'use client';

import { useEffect } from 'react';
import { buildFingerprint } from '@/lib/device-fingerprint';

/**
 * Invisible device tracker — mounts once in authenticated layout.
 * Registers device + creates session, stores IDs in sessionStorage.
 * Renders nothing.
 */
export function DeviceTracker(): null {
  useEffect(() => {
    // Only run once per tab session
    if (sessionStorage.getItem('deviceId')) return;

    buildFingerprint()
      .then(fp => {
        fetch('/api/device/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fp),
        })
          .then(r => r.json())
          .then((data: { deviceId?: string; sessionId?: string }) => {
            if (data.deviceId) sessionStorage.setItem('deviceId', data.deviceId);
            if (data.sessionId) sessionStorage.setItem('sessionId', data.sessionId);
          })
          .catch(() => { /* silent fail — never break UX */ });
      })
      .catch(() => { /* silent */ });
  }, []);

  return null;
}
