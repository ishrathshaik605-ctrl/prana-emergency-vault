import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Stethoscope, ShieldAlert, Radio, Clock, AlertTriangle, X, Check } from 'lucide-react';

export function BreakGlassModal({ isOpen, onClose, vaultId, onBreakGlassSuccess }) {
  const { t } = useLanguage();
  const [responderName, setResponderName] = useState('');
  const [responderOrg, setResponderOrg] = useState('');
  const [responderBadge, setResponderBadge] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFillDemo = () => {
    setResponderName('Dr. Rajesh Mehta (EMT)');
    setResponderOrg('108 GVK EMRI Emergency Response');
    setResponderBadge('EMT-9082');
    setReason('Patient unconscious at accident scene; suspected traumatic head injury.');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/emergency/${vaultId}/break-glass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responder_name: responderName,
          responder_org: responderOrg,
          responder_badge: responderBadge,
          reason,
          location_address: 'Emergency Response Location'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Break-Glass failed');
      }

      onBreakGlassSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 modal-backdrop animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="break-glass-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-red-600 relative overflow-hidden">
        {/* Top Warning Strip */}
        <div className="flex items-center justify-between pb-3 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-600">
            <Radio className="w-6 h-6 animate-pulse" />
            <h3 id="break-glass-title" className="text-xl font-black uppercase tracking-tight">
              {t('break_glass_btn')}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close break glass modal"
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trade-Off & Legal Accountability Disclosure Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-xs text-red-900 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-black text-red-700 uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{t('speed_vs_security')}</span>
          </div>
          <p>
            {t('speed_tradeoff_desc')}
          </p>
          <p className="font-semibold text-red-950">
            {t('mandatory_accountability_desc')}
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-100 text-xs text-red-800 font-bold">
            {error}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-0.5">
            <span className="font-semibold text-slate-600">{t('enter_responder_credentials')}</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 transition-colors"
            >
              {t('tester_fill_sample')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('responder_name_label')}
              </label>
              <input
                type="text"
                value={responderName}
                onChange={(e) => setResponderName(e.target.value)}
                placeholder="e.g. Dr. Rajesh Mehta / Paramedic Name"
                autoComplete="off"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-red-600 focus:outline-none text-sm font-semibold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t('badge_reg_label')}
              </label>
              <input
                type="text"
                value={responderBadge}
                onChange={(e) => setResponderBadge(e.target.value)}
                placeholder="e.g. EMT-9082 or Medical Reg #"
                autoComplete="off"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-red-600 focus:outline-none text-sm font-semibold text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {t('hospital_org_label')}
            </label>
            <input
              type="text"
              value={responderOrg}
              onChange={(e) => setResponderOrg(e.target.value)}
              placeholder="e.g. 108 GVK EMRI Emergency Response"
              autoComplete="off"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-red-600 focus:outline-none text-sm font-semibold text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {t('clinical_reason_label')}
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Patient unconscious at accident scene; suspected traumatic head injury."
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-red-600 focus:outline-none text-sm font-semibold text-slate-900"
              required
            />
          </div>

          {/* Giant Execute Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-red-200 transition-all border-2 border-red-700 disabled:opacity-50"
          >
            <Stethoscope className="w-5 h-5" />
            <span>{loading ? t('transmitting_broadcast') : t('confirm_unlock_tier2')}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
