import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UserCheck, ShieldCheck, KeyRound, X, ArrowRight, AlertCircle, Sparkles, Smartphone } from 'lucide-react';

export function FamilyUnlockModal({ isOpen, onClose, vaultId, onUnlocked, defaultPhone = '' }) {
  const { t } = useLanguage();
  const [phone, setPhone] = useState(defaultPhone || '');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [recipientName, setRecipientName] = useState('');

  // Sync phone with registered emergency contact when modal opens
  useEffect(() => {
    if (defaultPhone) {
      setPhone(defaultPhone);
    }
  }, [defaultPhone, isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/emergency/${vaultId}/family-request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request OTP');
      }

      setStep('otp');
      setRecipientName(data.recipient_name || 'Family Guardian');
      if (data.debug_otp) {
        setDebugOtp(data.debug_otp);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/emergency/${vaultId}/family-verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code: otpCode,
          location: 'Mobile Browser Session'
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      onUnlocked(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 modal-backdrop animate-fade-in cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="family-unlock-title"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative cursor-default"
      >
        <button
          onClick={onClose}
          aria-label="Close family unlock modal"
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 id="family-unlock-title" className="text-xl font-black text-slate-900 leading-tight">
              {t('verified_family_unlock')}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {t('tier1_subtitle')}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('verify_phone_prompt')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98250 99991"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-emerald-600 focus:outline-none text-base font-bold text-slate-900"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {t('phone_match_desc')}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
            >
              <span>{loading ? t('sending_otp') : t('get_otp')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="text-xs text-slate-600 mb-1 font-semibold">
                {t('verifying_label')} <span className="font-bold text-slate-900">{recipientName}</span> ({phone}):
              </div>

              {debugOtp && (
                <div className="mb-3.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t('sms_gateway_sim')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(debugOtp)}
                      className="text-xs font-black text-amber-900 underline px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                    >
                      Auto-Fill Code
                    </button>
                  </div>
                  <div className="text-xs font-semibold text-slate-900">
                    Verification code generated for <strong className="font-mono text-slate-950">{phone}</strong>: <strong className="font-mono text-base px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-950 shadow-xs">{debugOtp}</strong>
                  </div>
                  <p className="text-[10px] text-amber-800 leading-tight">
                    ℹ️ <em>Sending physical SMS to SIM cards requires a paid telecom gateway (Twilio / Fast2SMS with TRAI DLT registration). For prototype testing, the secure OTP is shown above for instant verification.</em>
                  </p>
                </div>
              )}

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Enter 6-Digit SMS Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-emerald-600 focus:outline-none text-2xl font-black text-center tracking-widest text-slate-900"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
            >
              <KeyRound className="w-5 h-5" />
              <span>{loading ? 'Decrypting Vault...' : t('verify_otp')}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-xs text-slate-500 font-semibold hover:underline text-center pt-1"
            >
              ← Use a different phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
