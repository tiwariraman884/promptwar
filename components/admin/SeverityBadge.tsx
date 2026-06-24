import type { AuditSeverity } from '@/lib/types/security';

const SEVERITY_STYLES: Record<AuditSeverity, string> = {
  info: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  critical: 'bg-red-100 text-red-700 font-bold dark:bg-red-900/40 dark:text-red-300',
};

export function SeverityBadge({ severity }: { severity: AuditSeverity }): JSX.Element {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.info}`}
    >
      {severity}
    </span>
  );
}
