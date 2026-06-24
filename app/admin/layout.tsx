import { requirePermission } from '@/lib/rbac/with-role';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Route } from 'next';

export default async function AdminLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const { role } = await requirePermission('admin:view_dashboard');

  const tabs: Array<{ label: string; href: Route }> = [
    { label: 'Overview', href: '/admin' as Route },
    { label: 'Users', href: '/admin/users' as Route },
    { label: 'Audit Logs', href: '/admin/audit' as Route },
    { label: 'Sessions', href: '/admin/sessions' as Route },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Admin top bar */}
      <div className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Back
            </Link>
            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          </div>
          <span className="rounded-full bg-yellow-900/40 px-3 py-1 text-xs font-bold text-yellow-400 border border-yellow-700/50">
            ⚡ Admin Mode · {role}
          </span>
        </div>

        {/* Tab navigation */}
        <div className="mx-auto max-w-7xl overflow-x-auto px-4">
          <nav className="flex gap-1 pb-px">
            {tabs.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                className="whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-900 hover:text-white"
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
