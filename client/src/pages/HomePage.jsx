import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldAlert, HeartPulse, UserPlus, Search, 
  Smartphone, Printer, Sparkles, Stethoscope, ArrowRight, ShieldCheck 
} from 'lucide-react';

export function HomePage({ 
  onSelectVault, 
  onStartSetup, 
  onOpenEmergency, 
  onOpenPrintable, 
  onOpenFeaturePhone,
  onOpenAudit 
}) {
  const { t, speakText, lang } = useLanguage();
  const [manualId, setManualId] = useState('');

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    onSelectVault(manualId.trim().toUpperCase());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex flex-col items-center justify-center gap-2 mb-1">
          <img
            src="/logo.png"
            alt="Prana Logo"
            className="w-24 h-24 rounded-3xl object-cover bg-black border-2 border-slate-800 shadow-xl shadow-slate-300 hover:scale-105 transition-transform"
          />
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-extrabold tracking-wide shadow-xs">
            <span className="text-emerald-600">💚</span>
            <span>{t('philosophy')}</span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black tracking-wide uppercase">
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>{t('controlled_access')}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {t('hero_title_1')}<br />
          <span className="text-red-600">{t('hero_title_2')}</span>
        </h1>

        <p className="max-w-xl mx-auto text-slate-600 text-sm sm:text-base font-medium">
          {t('hero_subtitle')}
        </p>

        {/* Giant Emergency Mode Quick Action */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={onOpenEmergency}
            className="w-full max-w-md py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-red-200 transition-all border-2 border-red-700"
          >
            <ShieldAlert className="w-6 h-6 animate-bounce" />
            <span>{t('open_emergency_mode')}</span>
          </button>
        </div>
      </div>

      {/* Manual Vault ID Entry or QR scan simulator */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md max-w-xl mx-auto">
        <form onSubmit={handleManualSearch} className="space-y-3">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
            {t('scan_or_enter_vault_id')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="E.G. AV-8842 OR AV-7721"
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none font-mono text-base font-bold text-slate-900 uppercase"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Search className="w-4 h-4" />
              <span>{t('unlock')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Test Personas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t('instant_personas_title')}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Persona 1: Ramesh Patel */}
          <div 
            onClick={() => onSelectVault('AV-8842')}
            className="p-5 rounded-3xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-red-500 cursor-pointer shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {t('elderly_persona_badge')}
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-1.5 group-hover:text-red-600 transition-colors">
                  Ramesh Patel (68M)
                </h4>
                <p className="text-xs text-slate-500">Vault ID: <strong className="font-mono">AV-8842</strong></p>
              </div>

              <div className="bg-red-50 text-red-600 font-black text-base px-3 py-1.5 rounded-xl border border-red-200">
                B+ve
              </div>
            </div>

            <div className="mt-3 space-y-1 text-xs text-slate-700">
              <p>⚠️ <strong>Severe Penicillin Allergy</strong> (Anaphylaxis shock risk)</p>
              <p>❤️ <strong>Pacemaker Implanted</strong> (St. Jude Medical 2021)</p>
              <p>📱 Guardian: Suresh Patel (Son, +91 98250 99991)</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-red-600">
              <span>{t('test_emergency_flow')} →</span>
              <span className="text-[11px] font-normal text-slate-400">{t('qr_family_paramedic')}</span>
            </div>
          </div>

          {/* Persona 2: Priya Sharma */}
          <div 
            onClick={() => onSelectVault('AV-7721')}
            className="p-5 rounded-3xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-red-500 cursor-pointer shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                  {t('urban_persona_badge')}
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-1.5 group-hover:text-red-600 transition-colors">
                  Priya Sharma (29F)
                </h4>
                <p className="text-xs text-slate-500">Vault ID: <strong className="font-mono">AV-7721</strong></p>
              </div>

              <div className="bg-red-50 text-red-600 font-black text-base px-3 py-1.5 rounded-xl border border-red-200">
                O-ve
              </div>
            </div>

            <div className="mt-3 space-y-1 text-xs text-slate-700">
              <p>⚠️ <strong>Sulfa Drugs Allergy</strong> & Mild Asthma</p>
              <p>🏥 Hospital: Fortis Bannerghatta Road, Bengaluru</p>
              <p>📱 Guardian: Rahul Sharma (Brother, +91 98450 99991)</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-red-600">
              <span>{t('test_emergency_flow')} →</span>
              <span className="text-[11px] font-normal text-slate-400">{t('qr_family_paramedic')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Creation & Actions Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <button
          onClick={onStartSetup}
          className="p-5 rounded-3xl bg-slate-900 hover:bg-black text-white text-left shadow-lg transition-all group"
        >
          <UserPlus className="w-6 h-6 text-red-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="font-extrabold text-sm">{t('create_new_vault_title')}</div>
          <p className="text-xs text-slate-400 mt-1">{t('create_new_vault_desc')}</p>
        </button>

        <button
          onClick={onOpenPrintable}
          className="p-5 rounded-3xl bg-white hover:bg-slate-50 text-slate-900 text-left border border-slate-200 shadow-sm transition-all group"
        >
          <Printer className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="font-extrabold text-sm">{t('print_wallet_card_title')}</div>
          <p className="text-xs text-slate-500 mt-1">{t('print_wallet_card_desc')}</p>
        </button>

        <button
          onClick={onOpenFeaturePhone}
          className="p-5 rounded-3xl bg-white hover:bg-slate-50 text-slate-900 text-left border border-slate-200 shadow-sm transition-all group"
        >
          <Smartphone className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="font-extrabold text-sm">{t('feature_phone_title')}</div>
          <p className="text-xs text-slate-500 mt-1">{t('feature_phone_desc')}</p>
        </button>
      </div>
    </div>
  );
}
