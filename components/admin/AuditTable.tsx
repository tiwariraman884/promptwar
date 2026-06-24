'use client';

import { SeverityBadge } from './SeverityBadge';
import type { AuditLog } from '@/lib/types/security';

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

interface AuditTableProps {
  logs: AuditLog[];
  onExport?: () => void;
  canExport?: boolean;
}

export function AuditTable({ logs, onExport, canExport }: AuditTableProps): JSX.Element {
  return (
    <div className="space-y-4">
      {canExport && onExport && (
        <div className="flex justify-end">
          <button
            onClick={onExport}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700 transition-colors"
          >
            📥 Export CSV
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/50 text-left text-xs uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3 hidden md:table-cell">Description</th>
              <th className="px-4 py-3 hidden lg:table-cell">IP</th>
              <th className="px-4 py-3 hidden lg:table-cell">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <SeverityBadge severity={log.severity} />
                </td>
                <td className="px-4 py-3 text-gray-400" title={new Date(log.createdAt).toLocaleString()}>
                  {timeAgo(log.createdAt)}
                </td>
                <td className="px-4 py-3 text-gray-300 truncate max-w-[150px]">
                  {log.actorEmail ?? log.actorId.slice(0, 8)}
                </td>
                <td className="px-4 py-3">
                  <code className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-emerald-400 font-mono">
                    {log.action}
                  </code>
                </td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell truncate max-w-[250px]" title={log.description}>
                  {log.description.length > 60
                    ? log.description.slice(0, 60) + '…'
                    : log.description}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                  {log.ipAddress}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                  {log.targetId ? `${log.targetType}: ${log.targetId.slice(0, 8)}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">No audit logs found.</p>
        )}
      </div>
    </div>
  );
}
