import React, { useState, useEffect } from 'react';
import { ShieldAlert, Bell, MessageSquare, PhoneCall, X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function LiveAlertToast({ onOpenAudit }) {
  const [alerts, setAlerts] = useState([]);
  const { speakText, translateName } = useLanguage();

  useEffect(() => {
    let eventSource;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'EMERGENCY_ACCESS_TRIGGERED') {
            const newAlert = {
              id: Date.now(),
              type: 'EMERGENCY_ACCESS',
              data: payload.data,
              timestamp: new Date().toLocaleTimeString()
            };
            setAlerts((prev) => [newAlert, ...prev.slice(0, 4)]);
            speakText(`Emergency alert: ${payload.data.actorName} accessed medical vault.`);
          } else if (payload.event === 'OTP_SENT') {
            const newAlert = {
              id: Date.now(),
              type: 'OTP_SENT',
              data: payload.data,
              timestamp: new Date().toLocaleTimeString()
            };
            setAlerts((prev) => [newAlert, ...prev.slice(0, 4)]);
          }
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      };
    } catch (e) {
      console.warn('SSE connection failed:', e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full no-print">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-2xl shadow-2xl border-2 animate-slide-up transition-all ${
            alert.type === 'EMERGENCY_ACCESS'
              ? 'bg-red-900 text-white border-red-500'
              : 'bg-slate-900 text-white border-emerald-500'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {alert.type === 'EMERGENCY_ACCESS' ? (
                <ShieldAlert className="w-5 h-5 text-red-400 animate-bounce" />
              ) : (
                <MessageSquare className="w-5 h-5 text-emerald-400" />
              )}
              <span className="text-xs uppercase font-black tracking-wider text-slate-300">
                {alert.type === 'EMERGENCY_ACCESS' ? '🚨 Live Emergency Broadcast' : '📱 SMS Gateway Alert'}
              </span>
            </div>
            <button
              onClick={() => removeAlert(alert.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 text-xs leading-relaxed font-semibold">
            {alert.type === 'EMERGENCY_ACCESS' ? (
              <div>
                <p className="font-extrabold text-sm text-yellow-300">
                  {alert.data.tier} Access for {translateName(alert.data.ownerName)}
                </p>
                <p className="mt-1 text-slate-200">
                  Opened by: <strong>{translateName(alert.data.actorName)}</strong> ({alert.data.actorOrg}).
                </p>
                <p className="text-[11px] text-red-200 mt-1">
                  Reason: "{alert.data.reason}"
                </p>
                <div className="mt-2.5 pt-2 border-t border-red-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-300">✓ SMS & IVR Dispatched</span>
                  {onOpenAudit && (
                    <button
                      onClick={() => onOpenAudit(alert.data.vaultId)}
                      className="font-bold underline text-white hover:text-yellow-200"
                    >
                      Review Audit & Revoke →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-slate-200">
                  Verification OTP Sent to <strong className="font-mono">{alert.data.phone}</strong>
                </p>
                <p className="mt-1 text-emerald-300 font-mono text-sm font-bold">
                  Code: {alert.data.code}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
