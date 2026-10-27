import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Ambulance, ShieldAlert, HeartPulse, X, Volume2 } from 'lucide-react';

export function EmergencyModeModal({ isOpen, onClose, onShowMedical, topContact, defaultVaultId = 'AV-8842' }) {
  const { t, speakText, lang, translateName, translateRelationship } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      // Voice readout for non-literate and panicking users in active language
      speakText(t('voice_emergency_welcome'));
    }
  }, [isOpen, lang]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 modal-backdrop animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-red-600 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="text-2xl font-black tracking-tight text-red-600 uppercase">
                {t('emergency_mode')}
              </h2>
              <p className="text-xs text-slate-500 font-bold">
                {t('emergency_desc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                speakText(t('voice_buttons_instruction'));
              }}
              title="Voice Read Instructions"
              aria-label="Voice Read Instructions"
              className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <Volume2 className="w-5 h-5 text-red-600" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close emergency modal"
              className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* THREE GIANT BUTTONS */}
        <div className="mt-6 flex flex-col gap-4">
          {/* Button 1: Call Ambulance 108 / 112 */}
          <a
            href="tel:108"
            className="w-full min-h-[92px] p-5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-98 text-white flex items-center justify-between shadow-lg shadow-red-200 transition-all border-2 border-red-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <Ambulance className="w-9 h-9" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black tracking-wide leading-tight">
                  {t('call_ambulance')}
                </div>
                <div className="text-sm font-semibold text-red-100">
                  {t('ambulance_subtext')}
                </div>
              </div>
            </div>
            <div className="text-xl font-bold bg-white text-red-600 px-3 py-1.5 rounded-xl shadow-inner shrink-0">
              108
            </div>
          </a>

          {/* Button 2: Call Family */}
          <a
            href={`tel:${topContact?.phone || '+919825099991'}`}
            className="w-full min-h-[92px] p-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white flex items-center justify-between shadow-lg shadow-emerald-200 transition-all border-2 border-emerald-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <Phone className="w-8 h-8" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black tracking-wide leading-tight">
                  {t('call_family')}
                </div>
                <div className="text-sm font-semibold text-emerald-100">
                  {topContact ? `${translateName(topContact.name)} (${translateRelationship(topContact.relationship)})` : t('primary_guardian_default')}
                </div>
              </div>
            </div>
            <div className="text-sm font-bold bg-white text-emerald-700 px-3 py-1.5 rounded-xl shadow-inner shrink-0">
              {t('call_now_btn')}
            </div>
          </a>

          {/* Button 3: Show Medical Info */}
          <button
            onClick={() => {
              onClose();
              if (onShowMedical) onShowMedical();
            }}
            className="w-full min-h-[92px] p-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white flex items-center justify-between shadow-lg shadow-blue-200 transition-all border-2 border-blue-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <HeartPulse className="w-9 h-9" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black tracking-wide leading-tight">
                  {t('show_medical')}
                </div>
                <div className="text-sm font-semibold text-blue-100">
                  {t('medical_info_subtext')}
                </div>
              </div>
            </div>
            <div className="text-sm font-bold bg-white text-blue-700 px-3 py-1.5 rounded-xl shadow-inner shrink-0">
              {t('view_btn')}
            </div>
          </button>
        </div>

        {/* Secondary Call 112 option */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{t('other_emergency')}</span>
          <a href="tel:112" className="text-slate-800 font-bold hover:underline">
            {t('all_in_one_helpline')}: 112
          </a>
        </div>
      </div>
    </div>
  );
}
