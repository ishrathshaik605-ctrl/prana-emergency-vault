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
  onOpenAudit,
  onOpenDashboard,
  currentVaultId = 'AV-8842'
}) {
  const { t, speakText, lang } = useLanguage();
  const [manualId, setManualId] = useState('');
  const [showDemoProfiles, setShowDemoProfiles] = useState(true);
  const [showScanner, setShowScanner] = useState(true);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    onSelectVault(manualId.trim().toUpperCase());
  };

  const scrollToSection = (id) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex flex-col items-center justify-center gap-3 mb-2">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/25 via-teal-500/25 to-blue-500/25 rounded-[32px] blur-md opacity-75 group-hover:opacity-100 transition duration-500"></div>
            <img
              src="/logo-icon.png"
              alt="Prana Logo"
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] object-cover bg-black border border-slate-800 shadow-2xl group-hover:scale-105 transition-all duration-300 ring-1 ring-white/10"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs sm:text-sm font-bold tracking-wide shadow-xs">
            <HeartPulse className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
            <span className="font-semibold">{t('philosophy')}</span>
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
      </div>

      {/* 3 CORE CHOICES (OPTION A: TESTER DEMOS, CREATE VAULT, EMERGENCY SCANNER) */}
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            Choose What You Want To Do
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Button 1: Tester Demo Profiles */}
          <button
            type="button"
            onClick={() => {
              setShowDemoProfiles(prev => !prev);
              scrollToSection('demo-profiles-section');
            }}
            className={`p-6 rounded-3xl text-left border-2 transition-all group shadow-sm hover:shadow-lg ${
              showDemoProfiles 
                ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20' 
                : 'border-slate-200 bg-white hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                1. Testers
              </span>
            </div>
            <div className="font-black text-lg text-slate-900 group-hover:text-amber-700 transition-colors">
              Tester Demo Profiles
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              1-click test evaluation with pre-seeded clinical personas (Ramesh Patel & Priya Sharma).
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>{showDemoProfiles ? 'Hide Profiles ▲' : 'View Profiles ▼'}</span>
              <span className="font-mono text-[10px] bg-amber-200/60 px-2 py-0.5 rounded text-amber-900">
                AV-8842 / AV-7721
              </span>
            </div>
          </button>

          {/* Button 2: Create Your Own Vault */}
          <button
            type="button"
            onClick={onStartSetup}
            className="p-6 rounded-3xl text-left border-2 border-emerald-500 bg-gradient-to-b from-white to-emerald-50/50 hover:to-emerald-100/50 transition-all group shadow-sm hover:shadow-lg ring-2 ring-emerald-500/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-200">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                2. Families
              </span>
            </div>
            <div className="font-black text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
              Create Your Own Vault
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Register a real emergency vault for you or your family. Guided 2-minute setup. Free & encrypted.
            </p>
            <div className="mt-4 pt-3 border-t border-emerald-200/70 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Start Setup Wizard →</span>
              <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-900 font-mono">
                Get New ID
              </span>
            </div>
          </button>

          {/* Button 3: Emergency Scanner */}
          <button
            type="button"
            onClick={() => {
              setShowScanner(true);
              scrollToSection('emergency-scanner-section');
            }}
            className={`p-6 rounded-3xl text-left border-2 transition-all group shadow-sm hover:shadow-lg ${
              showScanner 
                ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500/20' 
                : 'border-slate-200 bg-white hover:border-red-400'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow-md shadow-red-200 animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300">
                3. First Responders
              </span>
            </div>
            <div className="font-black text-lg text-slate-900 group-hover:text-red-700 transition-colors">
              Emergency Scanner
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Scan physical QR badge or enter Vault ID to instantly unlock Tier-0 lifesaver data & 108 rescue.
            </p>
            <div className="mt-4 pt-3 border-t border-red-200/70 flex items-center justify-between text-xs font-bold text-red-700">
              <span>Open Scanner →</span>
              <span className="text-[10px] bg-red-200/60 px-2 py-0.5 rounded text-red-900 font-mono">
                Tier-0 Unlock
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 1: TESTER DEMO PROFILES (COLLAPSIBLE / ACCORDION) */}
      {showDemoProfiles && (
        <div id="demo-profiles-section" className="space-y-4 pt-2 animate-fade-in">
          <div className="flex items-center justify-between bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                  1. Instant Test Clinical Personas
                </h3>
                <p className="text-[11px] text-amber-700">
                  Select either test profile below to evaluate live medical data without signing up.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDemoProfiles(false)}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 px-3 py-1 bg-amber-200/50 rounded-lg"
            >
              Close ▲
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Persona 1: Ramesh Patel */}
            <div 
              onClick={() => onSelectVault('AV-8842')}
              className="p-5 rounded-3xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-amber-500 cursor-pointer shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {t('elderly_persona_badge')}
                  </span>
                  <h4 className="text-xl font-black text-slate-900 mt-1.5 group-hover:text-amber-700 transition-colors">
                    Ramesh Patel (68M)
                  </h4>
                  <p className="text-xs text-slate-500">Vault ID: <strong className="font-mono text-slate-900">AV-8842</strong></p>
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

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>Evaluate Ramesh's Vault →</span>
                <span className="text-[11px] font-normal text-slate-400">{t('qr_family_paramedic')}</span>
              </div>
            </div>

            {/* Persona 2: Priya Sharma */}
            <div 
              onClick={() => onSelectVault('AV-7721')}
              className="p-5 rounded-3xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-500 cursor-pointer shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    {t('urban_persona_badge')}
                  </span>
                  <h4 className="text-xl font-black text-slate-900 mt-1.5 group-hover:text-blue-700 transition-colors">
                    Priya Sharma (29F)
                  </h4>
                  <p className="text-xs text-slate-500">Vault ID: <strong className="font-mono text-slate-900">AV-7721</strong></p>
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

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>Evaluate Priya's Vault →</span>
                <span className="text-[11px] font-normal text-slate-400">{t('qr_family_paramedic')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: EMERGENCY SCANNER & VAULT ID ENTRY */}
      {showScanner && (
        <div id="emergency-scanner-section" className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-red-200 shadow-lg max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  3. Emergency Scanner & ID Access
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Scan QR badge or type Vault ID to unlock Tier-0 lifesaver data immediately.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenEmergency}
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-sm items-center gap-1.5"
            >
              <span>108 Hotline</span>
            </button>
          </div>

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
                className="flex-1 px-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none font-mono text-base font-bold text-slate-900 uppercase"
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs flex items-center gap-2 shadow-md"
              >
                <Search className="w-4 h-4" />
                <span>{t('unlock')}</span>
              </button>
            </div>
          </form>

          {/* Quick Scanner Simulation Helpers */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="text-slate-500 font-medium flex items-center gap-1.5">
              <span>Quick Test Fill:</span>
              <button
                type="button"
                onClick={() => setManualId('AV-8842')}
                className="font-mono font-bold text-slate-800 hover:text-red-600 px-2 py-1 bg-slate-100 rounded-lg"
              >
                AV-8842
              </button>
              <button
                type="button"
                onClick={() => setManualId('AV-7721')}
                className="font-mono font-bold text-slate-800 hover:text-red-600 px-2 py-1 bg-slate-100 rounded-lg"
              >
                AV-7721
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenEmergency}
              className="text-red-600 hover:text-red-800 font-black flex items-center gap-1"
            >
              <span>🚨 Open Full Emergency Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Profile Access Banner inside the card */}
          {onOpenDashboard && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-600 font-medium">
                  {t('my_vault_title')}: <strong className="font-mono text-slate-900">{currentVaultId}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenDashboard(currentVaultId)}
                className="text-emerald-700 hover:text-emerald-900 font-extrabold flex items-center gap-1 hover:underline"
              >
                <span>{t('my_vault_btn')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Creation & Actions Bar (Utilities) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <button
          onClick={() => onOpenDashboard && onOpenDashboard(currentVaultId)}
          className="p-5 rounded-3xl bg-slate-900 hover:bg-black text-white text-left shadow-lg transition-all group border border-slate-800"
        >
          <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="font-extrabold text-sm flex items-center justify-between">
            <span>{t('my_vault_title')}</span>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
              {currentVaultId}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{t('my_vault_desc')}</p>
        </button>

        <button
          onClick={onStartSetup}
          className="p-5 rounded-3xl bg-white hover:bg-slate-50 text-slate-900 text-left border border-slate-200 shadow-sm transition-all group"
        >
          <UserPlus className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="font-extrabold text-sm">{t('create_new_vault_title')}</div>
          <p className="text-xs text-slate-500 mt-1">{t('create_new_vault_desc')}</p>
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
