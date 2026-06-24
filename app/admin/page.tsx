import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/admin/StatCard';
import { SeverityBadge } from '@/components/admin/SeverityBadge';
import type { SecuritySummary, AuditSeverity } from '@/lib/types/security';

async function getSecuritySummary(): Promise<SecuritySummary> {
  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) {
    return {
      totalUsers: 0, activeSessions: 0, auditEventsToday: 0,
      criticalAlertsToday: 0, newDevicesThisWeek: 0, failedLoginsToday: 0,
    };
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayISO = todayStart.toISOString();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    usersRes,
    sessionsRes,
    auditTodayRes,
    criticalRes,
    devicesRes,
    failedRes,
  ] = await Promise.all([
    adminSupabase.from('user_roles').select('id', { count: 'exact', head: true }),
    adminSupabase.from('user_sessions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    adminSupabase.from('audit_logs').select('id', { count: 'exact', head: true }).gte('created_at', todayISO),
    adminSupabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('severity', 'critical').gte('created_at', todayISO),
    adminSupabase.from('user_devices').select('id', { count: 'exact', head: true }).gte('first_seen_at', weekAgo),
    adminSupabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('action', 'AUTH_LOGIN_FAILED').gte('created_at', todayISO),
  ]);

  return {
    totalUsers: usersRes.count ?? 0,
    activeSessions: sessionsRes.count ?? 0,
    auditEventsToday: auditTodayRes.count ?? 0,
    criticalAlertsToday: criticalRes.count ?? 0,
    newDevicesThisWeek: devicesRes.count ?? 0,
    failedLoginsToday: failedRes.count ?? 0,
  };
}

async function getRecentCritical(): Promise<Array<{ id: string; action: string; description: string; createdAt: string; severity: AuditSeverity }>> {
  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) return [];

  const { data } = await adminSupabase
    .from('audit_logs')
    .select('id, action, description, created_at, severity')
    .eq('severity', 'critical')
    .order('created_at', { ascending: false })
    .limit(5);

  return (data ?? []).map(row => ({
    id: row.id,
    action: row.action,
    description: row.description,
    createdAt: row.created_at,
    severity: row.severity as AuditSeverity,
  }));
}

export default async function AdminOverviewPage(): Promise<JSX.Element> {
  const [summary, criticalEvents] = await Promise.all([
    getSecuritySummary(),
    getRecentCritical(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Security Overview</h2>
        <p className="text-sm text-gray-400 mt-1">Real-time security metrics for GreenStep India</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon="👥" label="Total Users" value={summary.totalUsers} />
        <StatCard icon="🟢" label="Active Sessions" value={summary.activeSessions} />
        <StatCard icon="📋" label="Audit Events" value={summary.auditEventsToday} sublabel="today" />
        <StatCard icon="🔴" label="Critical Alerts" value={summary.criticalAlertsToday} sublabel="today" variant="critical" />
        <StatCard icon="📱" label="New Devices" value={summary.newDevicesThisWeek} sublabel="7 days" />
        <StatCard icon="⚠️" label="Failed Logins" value={summary.failedLoginsToday} sublabel="today" variant={summary.failedLoginsToday > 5 ? 'critical' : 'default'} />
      </div>

      {/* Recent critical events */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Recent Critical Events</h3>
        {criticalEvents.length === 0 ? (
          <p className="text-sm text-gray-500">No critical events. ✅</p>
        ) : (
          <div className="space-y-2">
            {criticalEvents.map(event => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3"
              >
                <SeverityBadge severity={event.severity} />
                <div className="min-w-0 flex-1">
                  <code className="text-xs text-emerald-400 font-mono">{event.action}</code>
                  <p className="text-sm text-gray-300 mt-0.5 truncate">{event.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(event.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
