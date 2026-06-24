'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserTable } from '@/components/admin/UserTable';
import type { AdminUserRow, UserRole } from '@/lib/types/security';

export default function AdminUsersPage(): JSX.Element {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then((d: { users: AdminUserRow[] }) => setUsers(d.users ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = useCallback(async (userId: string, newRole: UserRole): Promise<void> => {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers(prev =>
        prev.map(u => u.userId === userId ? { ...u, role: newRole } : u)
      );
    }
  }, []);

  const handleBanToggle = useCallback(async (userId: string, ban: boolean): Promise<void> => {
    const res = await fetch(`/api/admin/users/${userId}/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ banned: ban }),
    });
    if (res.ok) {
      setUsers(prev =>
        prev.map(u => u.userId === userId ? { ...u, isBanned: ban } : u)
      );
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-lg bg-gray-800" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <p className="text-sm text-gray-400 mt-1">{users.length} users registered</p>
      </div>
      <UserTable
        users={users}
        onRoleChange={handleRoleChange}
        onBanToggle={handleBanToggle}
      />
    </div>
  );
}
