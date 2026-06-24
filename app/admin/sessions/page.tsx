'use client';

import { useEffect, useState, useCallback } from 'react';
import { SessionTable } from '@/components/admin/SessionTable';

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

export default function AdminSessionsPage(): JSX.Element {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');
  const [emailFilter, setEmailFilter] = useState('');

  const fetchSessions = useCallback((): void => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('status', statusFilter);
    if (emailFilter) params.set('email', emailFilter);

    fetch(`/api/admin/sessions?${params.toString()}`)
      .then(r => r.json())
      .then((d: { sessions: SessionRow[] }) => setSessions(d.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [statusFilter, emailFilter]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleForceLogout = useCallback(async (sessionId: string, userEmail: string): Promise<void> => {
    const res = await fetch(`/api/admin/sessions/${sessionId}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetEmail: userEmail }),
    });
    if (res.ok) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Session Management</h2>
        <p className="text-sm text-gray-400 mt-1">Monitor and manage all user sessions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
          <option value="all">All</option>
        </select>
        <input
          type="text"
          value={emailFilter}
          onChange={e => setEmailFilter(e.target.value)}
          placeholder="Filter by email..."
          className="flex-1 min-w-[200px] rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-10 rounded-lg bg-gray-800" />)}
        </div>
      ) : (
        <SessionTable
          sessions={sessions}
          onForceLogout={handleForceLogout}
        />
      )}
    </div>
  );
}
