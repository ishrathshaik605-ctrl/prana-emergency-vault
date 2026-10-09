import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  HeartPulse, AlertTriangle, ShieldCheck, Phone, 
  Hospital, Volume2, UserCheck, Stethoscope, Lock, CheckCircle2 
} from 'lucide-react';

export function Tier0Card({ data, onUnlockFamily, onBreakGlass }) {
  const { t, speakText, lang, formatMedicalSpeech } = useLanguage();

  if (!data) return null;

  const handleVoiceReadout = () => {
    const speech = formatMedicalSpeech ? formatMedicalSpeech(data) : (data.owner_name + ', ' + data.blood_group);
    speakText(speech);
  };

  return (
    <div className="card bg-white rounded-3xl border-2 border-red-500 shadow-xl overflow-hidden transition-all">
      {/* Top Card Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 p-5 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
              {t('tier0_title')}
            </span>
            <h2 className="text-2xl font-black tracking-tight leading-none">
              {data.owner_name}
            </h2>
            <span className="text-xs text-red-100 font-medium">
              Vault ID: {data.vault_id} • Age: {data.age_group || 'Adult'} ({data.gender})
            </span>
          </div>
        </div>

        {/* Blood Group Badge & Voice Read Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleVoiceReadout}
            title={t('voice_read')}
            aria-label={t('voice_read')}
            className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center gap-1.5 transition-colors"
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline">{t('voice_read')}</span>
          </button>

          <div className="bg-white text-red-600 rounded-2xl px-4 py-2 text-center shadow-lg border border-red-100">
            <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">
              {t('blood_group')}
            </div>
            <div className="text-2xl font-black tracking-tight leading-none">
              {data.blood_group}
            </div>
          </div>
        </div>
      </div>

      {/* Card Content Grid */}
      <div className="p-6 space-y-6">
        {/* Critical Allergies Warning Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3.5">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-800">
              {t('critical_allergies')}
            </h3>
            <p className="text-base font-bold text-amber-950 mt-0.5">
              {data.critical_allergies || 'No known severe drug allergies reported'}
            </p>
          </div>
        </div>

        {/* Conditions & Lifesaver Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              {t('conditions')}
            </h4>
            <p className="text-sm font-bold text-slate-900">
              {data.critical_conditions || 'None reported'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              {t('organ_donor')}
            </h4>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <ShieldCheck className={`w-4 h-4 ${data.organ_donor ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{data.organ_donor ? t('donor_yes') : t('donor_no')}</span>
            </div>
          </div>
        </div>

        {/* Owner Emergency Instructions */}
        {data.emergency_instructions_summary && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-blue-800 mb-1">
              {t('emergency_instructions')} (In Owner's Words)
            </h4>
            <p className="text-sm italic font-semibold text-blue-950">
              "{data.emergency_instructions_summary}"
            </p>
          </div>
        )}

        {/* Preferred Hospital */}
        {data.preferred_hospital && (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm">
            <Hospital className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="text-xs text-slate-500 font-semibold block">
                {t('preferred_hospital')}:
              </span>
              <span className="font-bold text-slate-800">
                {data.preferred_hospital} ({data.preferred_hospital_city})
              </span>
            </div>
          </div>
        )}

        {/* Top 2 Ranked Emergency Contacts with Direct Call Buttons */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>{t('emergency_contacts')} (Top Priority)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.emergency_contacts?.map((contact, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-bold text-slate-400">
                    Priority #{contact.priority} • {contact.relationship}
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {contact.name}
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    {contact.phone}
                  </div>
                </div>

                <a
                  href={`tel:${contact.phone}`}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 shadow-sm shadow-emerald-200"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Data Masking & Tier Elevation Notice */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-xs text-slate-600 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong>Controlled Access Notice:</strong> Full medications, insurance policy numbers, home address, and diagnostic reports are encrypted and withheld in Tier 0. Verify identity below to unlock.
          </p>
        </div>

        {/* Two Elevation Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Family Member Unlock */}
          <button
            onClick={onUnlockFamily}
            className="p-4 rounded-2xl bg-slate-900 hover:bg-black text-white text-left font-bold transition-all shadow-md flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Family Member</span>
              </div>
              <div className="text-sm font-extrabold mt-0.5">
                {t('verified_family_unlock')}
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                Quick SMS OTP Verification
              </div>
            </div>
            <span className="text-lg">→</span>
          </button>

          {/* Paramedic / Doctor Break-Glass */}
          <button
            onClick={onBreakGlass}
            className="p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-left font-bold transition-all shadow-md shadow-red-200 flex items-center justify-between border-2 border-red-700"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs text-red-200 uppercase tracking-wider">
                <Stethoscope className="w-4 h-4 text-white" />
                <span>Paramedic / ER Staff</span>
              </div>
              <div className="text-sm font-extrabold mt-0.5">
                {t('break_glass_btn')}
              </div>
              <div className="text-[11px] text-red-100 font-normal">
                Time-Limited 30-Min Emergency
              </div>
            </div>
            <span className="text-lg">⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
}
