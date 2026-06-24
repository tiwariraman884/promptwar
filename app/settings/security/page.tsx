'use client';

import { SessionList } from '@/components/security/SessionList';
import { useRole } from '@/hooks/use-role';
import { RoleBadge } from '@/components/admin/RoleBadge';
import Link from 'next/link';
import type { Route } from 'next';

export default function SecuritySettingsPage(): JSX.Element {
  const { role, loading, can } = useRole();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Security Settings / सुरक्षा सेटिंग्स
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your sessions, devices, and account security.
        </p>
      </div>

      {/* Role display */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Your Role / आपकी भूमिका
        </h3>
        {loading ? (
          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        ) : (
          <div className="flex items-center gap-3">
            <RoleBadge role={role} />
            {can('admin:view_dashboard') && (
              <Link
                href={'/admin' as Route}
                className="rounded-lg bg-yellow-900/30 px-3 py-1.5 text-xs font-medium text-yellow-400 border border-yellow-700/50 hover:bg-yellow-900/50 transition-colors"
              >
                ⚡ Open Admin Panel
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <SessionList />
      </div>

      {/* Security tips */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Security Tips / सुरक्षा सुझाव
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>🔒 Revoke sessions you don&apos;t recognize</li>
          <li>📱 Use a strong, unique password</li>
          <li>🌐 Avoid logging in on public Wi-Fi without VPN</li>
          <li>🔄 Change your password every 90 days</li>
        </ul>
      </div>
    </div>
  );
}
