'use client';

import { useEffect, useState, useCallback } from 'react';
import type { UserRole, Permission } from '@/lib/types/security';
import { hasPermission } from '@/lib/types/security';

export function useRole(): {
  role: UserRole;
  loading: boolean;
  can: (permission: Permission) => boolean;
} {
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/role')
      .then(r => r.json())
      .then(d => setRole((d.role as UserRole) ?? 'guest'))
      .catch(() => setRole('guest'))
      .finally(() => setLoading(false));
  }, []);

  const can = useCallback(
    (permission: Permission): boolean => hasPermission(role, permission),
    [role]
  );

  return { role, loading, can };
}
