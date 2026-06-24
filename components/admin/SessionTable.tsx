'use client';

import { useState, useCallback } from 'react';

interface SessionRow {
  id: string;
  userEmail: string;
  deviceType: string;
  os: string;
  browser: string;
  ipAddress: string;
  createdAt: string;
  lastActiveAt: string;
  status: string;
  revokedBy?: string;
}

interface SessionTableProps {
  sessions: SessionRow[];
  onForceLogout?: (sessionId: string, userEmail: string) => Promise<void>;
}

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

export function SessionTable({ sessions, onForceLogout }: SessionTableProps): JSX.Element {
  const [revoking, setRevoking] = useState<string | null>(null);

  const handleForceLogout = useCallback(async (sessionId: string, email: string) => {
    if (!onForceLogout) return;
    const confirmed = window.confirm(`End session for ${email}? They will be logged out immediately.`);
    if (!confirmed) return;
    setRevoking(sessionId);
    try { await onForceLogout(sessionId, email); }
    finally { setRevoking(null); }
  }, [onForceLogout]);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900/50 text-left text-xs uppercase tracking-wider text-gray-400">
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3 hidden sm:table-cell">Device</th>
            <th className="px-4 py-3 hidden md:table-cell">OS · Browser</th>
            <th className="px-4 py-3 hidden lg:table-cell">IP</th>
            <th className="px-4 py-3">Started</th>
            <th className="px-4 py-3">Last Active</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {sessions.map(s => (
            <tr key={s.id} className="hover:bg-gray-800/50">
              <td className="px-4 py-3 text-white truncate max-w-[180px]">
                {s.userEmail}
              </td>
              <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                {s.deviceType === 'mobile' ? '📱' : s.deviceType === 'tablet' ? '📱' : '💻'}
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                {s.os} · {s.browser}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                {s.ipAddress}
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">
                {new Date(s.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">
                {timeAgo(s.lastActiveAt)}
              </td>
              <td className="px-4 py-3">
                {s.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active
                  </span>
                ) : (
                  <span className="text-xs text-gray-500" title={s.revokedBy ? `Revoked by ${s.revokedBy}` : ''}>
                    Revoked
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {s.status === 'active' && onForceLogout ? (
                  <button
                    onClick={() => handleForceLogout(s.id, s.userEmail)}
                    disabled={revoking === s.id}
                    className="rounded bg-red-900/50 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-900 transition-colors disabled:opacity-50"
                  >
                    {revoking === s.id ? 'Ending...' : 'Force Logout'}
                  </button>
                ) : (
                  <span className="text-xs text-gray-600">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sessions.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">No sessions found.</p>
      )}
    </div>
  );
}
