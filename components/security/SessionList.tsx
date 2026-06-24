'use client';

import { useEffect, useState, useCallback } from 'react';
import type { UserSession } from '@/lib/types/security';

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function getDeviceIcon(deviceType: string): string {
  switch (deviceType) {
    case 'mobile': return '📱';
    case 'tablet': return '📱';
    case 'desktop': return '💻';
    default: return '🖥️';
  }
}

export function SessionList(): JSX.Element {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const currentDeviceId = typeof window !== 'undefined'
    ? sessionStorage.getItem('deviceId')
    : null;

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then((d: { sessions: UserSession[] }) => setSessions(d.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRevoke = useCallback(async (sessionId: string) => {
    if (revoking) return;
    setRevoking(sessionId);

    try {
      const res = await fetch('/api/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
    } catch { /* silent */ }
    finally { setRevoking(null); }
  }, [revoking]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Active Sessions / सक्रिय सत्र
        </h3>
        <div className="animate-pulse space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-24 rounded-xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Active Sessions / सक्रिय सत्र
      </h3>
      {sessions.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No active sessions found.</p>
      )}
      <div className="space-y-2">
        {sessions.map(session => {
          const isCurrent = session.deviceId === currentDeviceId;
          const device = session.deviceInfo;
          const browserLabel = device?.browser ?? 'Unknown Browser';
          const osLabel = device?.os ?? 'Unknown OS';
          const deviceIcon = getDeviceIcon(device?.deviceType ?? 'unknown');

          return (
            <div
              key={session.id}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{deviceIcon}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {browserLabel} · {osLabel}
                    </span>
                    {isCurrent && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                        THIS
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    📍 {session.ipAddress}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    🕐 Last active: {timeAgo(session.lastActiveAt)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    📅 Started: {formatDate(session.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleRevoke(session.id)}
                  disabled={isCurrent || revoking === session.id}
                  title={isCurrent ? 'Current session' : 'Revoke this session'}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50"
                >
                  {revoking === session.id ? 'Revoking...' : 'Revoke'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
