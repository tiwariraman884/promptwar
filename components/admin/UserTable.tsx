'use client';

import { useState, useCallback } from 'react';
import { RoleBadge } from './RoleBadge';
import type { AdminUserRow, UserRole } from '@/lib/types/security';

const ALL_ROLES: UserRole[] = ['super_admin', 'admin', 'moderator', 'premium_user', 'user', 'guest'];

interface UserTableProps {
  users: AdminUserRow[];
  onRoleChange?: (userId: string, newRole: UserRole) => Promise<void>;
  onBanToggle?: (userId: string, ban: boolean) => Promise<void>;
}

export function UserTable({ users, onRoleChange, onBanToggle }: UserTableProps): JSX.Element {
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [banning, setBanning] = useState<string | null>(null);

  const filtered = users.filter(u => {
    const matchesSearch = !filter || u.email.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter ||
      (roleFilter === 'banned' && u.isBanned);
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = useCallback(async (userId: string, newRole: UserRole, email: string) => {
    if (!onRoleChange) return;
    const confirmed = window.confirm(`Change role for ${email} to ${newRole}?`);
    if (!confirmed) return;
    setChangingRole(userId);
    try { await onRoleChange(userId, newRole); }
    finally { setChangingRole(null); }
  }, [onRoleChange]);

  const handleBan = useCallback(async (userId: string, ban: boolean, email: string) => {
    if (!onBanToggle) return;
    const action = ban ? 'Ban' : 'Unban';
    const confirmed = window.confirm(`${action} user ${email}?`);
    if (!confirmed) return;
    setBanning(userId);
    try { await onBanToggle(userId, ban); }
    finally { setBanning(null); }
  }, [onBanToggle]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by email..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="all">All Roles</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          <option value="banned">Banned</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/50 text-left text-xs uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 hidden sm:table-cell">Joined</th>
              <th className="px-4 py-3 hidden md:table-cell">Last Login</th>
              <th className="px-4 py-3 hidden lg:table-cell">Sessions</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map(user => (
              <tr key={user.userId} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 font-medium text-white truncate max-w-[200px]">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                  {user.lastSignInAt
                    ? new Date(user.lastSignInAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                    : '—'}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                  {user.activeSessions}
                </td>
                <td className="px-4 py-3">
                  {user.isBanned ? (
                    <span className="text-xs font-bold text-red-400">🚫 Banned</span>
                  ) : (
                    <span className="text-xs text-emerald-400">● Active</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      disabled={changingRole === user.userId}
                      onChange={e => handleRoleChange(user.userId, e.target.value as UserRole, user.email)}
                      className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-white focus:outline-none disabled:opacity-50"
                    >
                      {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button
                      onClick={() => handleBan(user.userId, !user.isBanned, user.email)}
                      disabled={banning === user.userId}
                      className={`rounded px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                        user.isBanned
                          ? 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900'
                          : 'bg-red-900/50 text-red-400 hover:bg-red-900'
                      }`}
                    >
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">No users found.</p>
        )}
      </div>
    </div>
  );
}
