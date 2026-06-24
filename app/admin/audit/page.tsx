'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuditTable } from '@/components/admin/AuditTable';
import type { AuditLog, AuditAction, AuditSeverity } from '@/lib/types/security';
import { hasPermission } from '@/lib/types/security';
import { useRole } from '@/hooks/use-role';

const AUDIT_ACTIONS: AuditAction[] = [
  'AUTH_LOGIN_SUCCESS', 'AUTH_LOGIN_FAILED', 'AUTH_LOGOUT',
  'AUTH_PASSWORD_CHANGED', 'AUTH_SESSION_REVOKED', 'AUTH_SUSPICIOUS_LOGIN',
  'RBAC_ROLE_ASSIGNED', 'RBAC_ROLE_REMOVED', 'RBAC_UNAUTHORIZED_ACCESS',
  'DATA_PROFILE_UPDATED', 'DATA_ACCOUNT_DELETED', 'DATA_EXPORT_REQUESTED',
  'ADMIN_USER_VIEWED', 'ADMIN_FORCE_LOGOUT', 'ADMIN_ROLE_CHANGED',
  'DEVICE_NEW_DEVICE_DETECTED', 'DEVICE_TRUSTED', 'DEVICE_BLOCKED',
];

export default function AdminAuditPage(): JSX.Element {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('all');
  const [action, setAction] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [email, setEmail] = useState('');
  const { can } = useRole();

  const fetchLogs = useCallback((): void => {
    setLoading(true);
    const params = new URLSearchParams();
    if (severity !== 'all') params.set('severity', severity);
    if (action !== 'all') params.set('action', action);
    if (fromDate) params.set('from', new Date(fromDate).toISOString());
    if (toDate) params.set('to', new Date(toDate).toISOString());
    if (email) params.set('email', email);

    fetch(`/api/admin/audit?${params.toString()}`)
      .then(r => r.json())
      .then((d: { logs: AuditLog[] }) => setLogs(d.logs ?? []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [severity, action, fromDate, toDate, email]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleExport = useCallback((): void => {
    const headers = ['ID', 'Time', 'Severity', 'Actor', 'Action', 'Description', 'IP', 'Target'];
    const rows = logs.map(l => [
      l.id, l.createdAt, l.severity, l.actorEmail ?? l.actorId,
      l.action, `"${l.description.replace(/"/g, '""')}"`, l.ipAddress,
      l.targetId ?? '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [logs]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
        <p className="text-sm text-gray-400 mt-1">Tamper-evident security event log</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="date"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          placeholder="From"
        />
        <input
          type="date"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          placeholder="To"
        />
        <select
          value={severity}
          onChange={e => setSeverity(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="all">All Severity</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={action}
          onChange={e => setAction(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="all">All Actions</option>
          {AUDIT_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <input
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Search actor email..."
          className="flex-1 min-w-[200px] rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-10 rounded-lg bg-gray-800" />)}
        </div>
      ) : (
        <AuditTable
          logs={logs}
          onExport={handleExport}
          canExport={can('admin:export_data')}
        />
      )}
    </div>
  );
}
