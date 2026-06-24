import { hasPermission } from '@/lib/types/security';
import { getUserRole } from './get-user-role';
import type { Permission, UserRole } from '@/lib/types/security';

export async function checkPermission(
  userId: string,
  permission: Permission
): Promise<{ allowed: boolean; role: UserRole }> {
  const role = await getUserRole(userId);
  return { allowed: hasPermission(role, permission), role };
}
