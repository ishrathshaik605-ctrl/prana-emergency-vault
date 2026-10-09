import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, ShieldAlert, Clock, MapPin, 
  User, CheckCircle2, AlertOctagon, PhoneCall, MessageSquare, ArrowLeft 
} from 'lucide-react';

export function AuditReportPage({ vaultId, onBack }) {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditData();
  }, [vaultId]);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const [logsRes, notifsRes] = await Promise.all([
        fetch(`/api/audit/${vaultId}`),
        fetch(`/api/audit/notifications/${vaultId}`)
      ]);
      const logsData = await logsRes.json();
      const notifsData = await notifsRes.json();

      if (logsData.success) setLogs(logsData.logs || []);
      if (notifsData.success) setNotifications(notifsData.notifications || []);
    } catch (err) {
      console.error('Failed to fetch audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (logId) => {
    if (!window.confirm('Are you sure you want to revoke this access session immediately?')) return;
    try {
      const res = await fetch(`/api/audit/revoke/${logId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revoked_by: 'Vault Owner Post-Incident Review' })
      });
      const data = await res.json();
      alert(data.message || 'Access revoked.');
      fetchAuditData();
    } catch (err) {
      alert('Revocation failed');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading Immutable Audit Logs...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <button onClick={onBack} className="text-xs font-bold text-slate-500 hover:text-slate-900 mb-2 block">
          ← Back
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {t('audit_summary')}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Immutable forensic log for Vault <strong className="font-mono">{vaultId}</strong>. Track every viewer, timestamp, and location.
            </p>
          </div>

          <div className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
            ✓ Tamper-Evident Ledger Active
          </div>
        </div>
      </div>

      {/* Access Logs Timeline */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
          Chronological Access Records
        </h3>

        {logs.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 text-xs">
            No access attempts recorded yet for this vault.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-5 rounded-3xl border-2 transition-all ${
                log.tier_accessed === 'Tier 2'
                  ? 'bg-red-50/50 border-red-200'
                  : log.tier_accessed === 'Tier 1'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${
                    log.tier_accessed === 'Tier 2' ? 'bg-red-600 text-white' :
                    log.tier_accessed === 'Tier 1' ? 'bg-emerald-600 text-white' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    {log.tier_accessed}
                  </span>

                  <span className="text-xs font-bold text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>

                  {log.is_active && (
                    <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded-md animate-pulse">
                      Active Session (30 min)
                    </span>
                  )}
                  {log.status === 'revoked' && (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">
                      Revoked by {log.revoked_by}
                    </span>
                  )}
                </div>

                {log.is_active && (
                  <button
                    onClick={() => handleRevokeSession(log.id)}
                    className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs"
                  >
                    {t('revoke_access')}
                  </button>
                )}
              </div>

              {/* Plain Language Summary */}
              <p className="mt-3 text-sm font-extrabold text-slate-900 leading-snug">
                {log.plain_language_summary}
              </p>

              {/* Metadata Details */}
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Actor ID: <strong>{log.actor_identifier}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Location: <strong>{log.location_address || 'GPS Coordinates Registered'}</strong></span>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  IP: {log.ip_address}
                </div>
              </div>

              {log.categories_unlocked?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Categories:</span>
                  {log.categories_unlocked.map((cat) => (
                    <span key={cat} className="text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Dispatched Emergency Broadcasts (SMS / IVR) */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
          Emergency Alerts & Broadcasts Dispatched
        </h3>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="text-xs text-slate-500 py-2">No alerts have been dispatched yet.</div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  {notif.channel === 'VOICE_IVR' ? (
                    <PhoneCall className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-slate-900">{notif.recipient_name || notif.recipient_phone}</span>
                    <span className="text-[10px] font-mono text-slate-400 ml-2">({notif.channel})</span>
                    <p className="text-slate-600 mt-0.5 font-medium">{notif.message}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(notif.sent_at).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
