import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldAlert, HeartPulse, UserPlus, Search, 
  Smartphone, Printer, Sparkles, Stethoscope, ArrowRight, ShieldCheck,
  CheckCircle2, Laptop, UserCheck, Edit3, RotateCcw, AlertTriangle, Trash2, X, Volume2
} from 'lucide-react';
import { 
  hasUserCreatedVaults, 
  getUserVaults, 
  getActiveUserVault, 
  detectAndSaveDeviceIp,
  setStoredVaultId,
  saveUserVault
} from '../utils/vaultStorage';

export function HomePage({ 
  onSelectVault, 
  onStartSetup, 
  onOpenEmergency, 
  onOpenPrintable, 
  onOpenPairing,
  onOpenFeaturePhone,
  onOpenAudit,
  onOpenDashboard,
  currentVaultId = 'AV-8842',
  triggerRecovery = false,
  onRecoveryClosed
}) {
  const { t, speakText, lang, formatMedicalSpeech, translateName, translateRelationship } = useLanguage();
  const [manualId, setManualId] = useState('');
  const [userVaults, setUserVaults] = useState(getUserVaults());
  const [showDemoProfiles, setShowDemoProfiles] = useState(false);
  const [showScanner, setShowScanner] = useState(true);

  // Vault Recovery State (for recovering previously created vaults)
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  useEffect(() => {
    if (triggerRecovery) {
      setShowRecoveryModal(true);
      setRecoveryStep('phone');
      setRecoveryError('');
      if (onRecoveryClosed) onRecoveryClosed();
    }
  }, [triggerRecovery]);
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [recoveryStep, setRecoveryStep] = useState('phone'); // 'phone' | 'otp'
  const [recoveryMatch, setRecoveryMatch] = useState(null);
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [recoveryOtpDebug, setRecoveryOtpDebug] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');

  const hasVaults = userVaults && userVaults.length > 0;
  const activeVault = getActiveUserVault() || (hasVaults ? userVaults[0] : null);

  useEffect(() => {
    // Store device IP in background storage for device-level recognition
    detectAndSaveDeviceIp();
    const loaded = getUserVaults();
    setUserVaults(loaded);
    // If no custom vaults exist yet, show demo profiles so the first-time evaluator can explore
    if (!loaded || loaded.length === 0) {
      setShowDemoProfiles(true);
    }
  }, []);

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

  const handleSelectUserVault = (vault) => {
    setStoredVaultId(vault.id);
    onSelectVault(vault.id);
  };

  const handleSearchVaultForRecovery = async (e) => {
    e.preventDefault();
    const queryTerm = recoveryPhone.trim();
    if (!queryTerm || queryTerm.length < 2) {
      setRecoveryError('Please enter your Vault ID (e.g. AV-9017S), registered mobile number, or full name');
      return;
    }
    setRecoveryLoading(true);
    setRecoveryError('');
    try {
      const res = await fetch('/api/vault/check-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryTerm, phone: queryTerm, name: queryTerm, id: queryTerm })
      });
      const data = await res.json();
      if (!data.found) {
        setRecoveryLoading(false);
        setRecoveryError(`No emergency vault found matching "${queryTerm}". Please check your Vault ID, phone, or name.`);
        return;
      }

      setRecoveryMatch(data);

      // Automatically dispatch recovery OTP to that registered phone
      const otpRes = await fetch('/api/vault/recover/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaultId: data.vaultId,
          phone: data.targetPhone || recoveryPhone
        })
      });
      const otpData = await otpRes.json();
      setRecoveryLoading(false);

      if (otpData.success) {
        setRecoveryOtpDebug(otpData.debug_otp || '');
        setRecoveryStep('otp');
      } else {
        setRecoveryError(otpData.error || 'Failed to send recovery OTP');
      }
    } catch (err) {
      setRecoveryLoading(false);
      setRecoveryError('Network error while searching for vault: ' + err.message);
    }
  };

  const handleConfirmHomeRecovery = async (e) => {
    e.preventDefault();
    if (!recoveryOtp.trim() || recoveryOtp.trim().length < 4) {
      setRecoveryError('Please enter the 6-digit verification code');
      return;
    }
    setRecoveryLoading(true);
    setRecoveryError('');

    try {
      const res = await fetch('/api/vault/recover/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaultId: recoveryMatch.vaultId,
          phone: recoveryMatch.targetPhone || recoveryPhone,
          otp: recoveryOtp.trim(),
          action: 'restore'
        })
      });
      const data = await res.json();
      setRecoveryLoading(false);

      if (!res.ok || !data.success || !data.vault) {
        setRecoveryError(data.error || 'Invalid or expired OTP code');
        return;
      }

      // Save to device storage
      saveUserVault(data.vault);
      const updatedVaults = getUserVaults();
      setUserVaults(updatedVaults);
      setShowDemoProfiles(false);
      setShowRecoveryModal(false);
      setRecoveryPhone('');
      setRecoveryOtp('');
      setRecoveryMatch(null);
      setRecoveryStep('phone');

      alert(`Success! Emergency vault (${data.vault.id}) for ${data.vault.owner_name} has been restored to this device.`);
      onOpenDashboard(data.vault.id);
    } catch (err) {
      setRecoveryLoading(false);
      setRecoveryError('Error verifying recovery code: ' + err.message);
    }
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

        {/* Device Recognition Badge */}
        {hasVaults && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>📱 Recognized Device</span>
          </div>
        )}

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

      {/* PERSONALIZED USER VAULT COMMAND CENTER (WHEN USER HAS CREATED A VAULT) */}
      {hasVaults && activeVault && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-emerald-500/40 relative overflow-hidden space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-mono">
                    {t('your_registered_vault')}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">
                    {t('vault_id_label')}: {activeVault.id}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mt-1">
                  {translateName(activeVault.owner_name)}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const speech = formatMedicalSpeech({
                    owner_name: activeVault.owner_name,
                    blood_group: activeVault.blood_group,
                    critical_allergies: activeVault.allergies,
                    critical_conditions: activeVault.conditions,
                    emergency_contacts: activeVault.emergency_contacts
                  });
                  speakText(speech);
                }}
                title={t('voice_read')}
                aria-label={t('voice_read')}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">{t('voice_read')}</span>
              </button>
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">{t('blood_group')}</span>
                <span className="text-xl font-black text-red-400">{activeVault.blood_group || 'O+ve'}</span>
              </div>
            </div>
          </div>

          {/* Key Emergency Details Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block font-bold text-[10px] uppercase">{t('allergies_critical')}</span>
              <span className="text-yellow-300 font-semibold mt-0.5 block line-clamp-1">
                {activeVault.allergies || t('no_allergies_reported')}
              </span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block font-bold text-[10px] uppercase">{t('emergency_contacts')}</span>
              <span className="text-white font-semibold mt-0.5 block">
                {activeVault.emergency_contacts?.length 
                  ? `${translateName(activeVault.emergency_contacts[0].name)} (${activeVault.emergency_contacts[0].phone})` 
                  : t('guardians_configured')}
              </span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block font-bold text-[10px] uppercase">{t('device_link')}</span>
              <span className="text-emerald-300 font-semibold mt-0.5 block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {t('persistent_to_device')}
              </span>
            </div>
          </div>

          {/* Action Buttons for User's Vault */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenPrintable(activeVault)}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('print_qr_badge')}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenPairing && onOpenPairing(activeVault)}
              className="p-3.5 rounded-2xl bg-cyan-700 hover:bg-cyan-600 text-white font-extrabold text-xs shadow-md shadow-cyan-950 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              title="Pair this vault to your mobile phone via QR code"
            >
              <Smartphone className="w-4 h-4 text-cyan-200" />
              <span>{t('pair_device_btn')}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenDashboard(activeVault.id, { autoEdit: true })}
              className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-950 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>{t('edit_whole_vault')}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectVault(activeVault.id)}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <HeartPulse className="w-4 h-4 text-red-400" />
              <span>{t('test_tier0_unlock')}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenDashboard(activeVault.id)}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('household_hub')}</span>
            </button>

            <button
              type="button"
              onClick={onStartSetup}
              className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-950 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('add_family_btn')}</span>
            </button>
          </div>

          {/* Family Profiles Switcher & Recovery Link */}
          {userVaults.length > 0 && (
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400 font-bold">{t('switch_profile')}</span>
              {userVaults.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSelectUserVault(v)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    v.id === activeVault.id
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {translateName(v.owner_name)} ({v.blood_group})
                </button>
              ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowRecoveryModal(true);
                  setRecoveryStep('phone');
                  setRecoveryError('');
                }}
                className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 underline underline-offset-2 ml-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('recover_earlier_vault')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* CORE 3 CHOICES (SHOWN WHEN NO USER VAULT EXISTS OR WHEN USER HAS NOT CREATED YET) */}
      {!hasVaults && (
        <div className="space-y-4">
          {/* Prominent Recovery / Restore Card for Existing Vault Owners */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-xl border-2 border-indigo-500/60 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-900">
                <RotateCcw className="w-6 h-6 text-indigo-200" />
              </div>
              <div className="text-left">
                <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>Already Created an Emergency Vault Before?</span>
                  <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Instant Restore
                  </span>
                </h4>
                <p className="text-xs text-indigo-200/90 mt-0.5">
                  Lost your vault on this browser or switching devices? Enter your <strong>Vault ID (e.g. AV-9017S)</strong>, registered phone, or name to restore it immediately.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowRecoveryModal(true);
                setRecoveryStep('phone');
                setRecoveryError('');
              }}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-950 shrink-0 transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore My Vault</span>
            </button>
          </div>

          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              {t('choose_action_title')}
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
                  {t('testers_label')}
                </span>
              </div>
              <div className="font-black text-lg text-slate-900 group-hover:text-amber-700 transition-colors">
                {t('tester_profiles_title')}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {t('tester_profiles_desc')}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>{showDemoProfiles ? t('hide_profiles') : t('view_profiles')}</span>
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
                  {t('families_label')}
                </span>
              </div>
              <div className="font-black text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                {t('create_own_vault_title')}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {t('create_own_vault_desc')}
              </p>
              <div className="mt-4 pt-3 border-t border-emerald-200/70 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>{t('start_setup_wizard')}</span>
                <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-900 font-mono">
                  {t('get_new_id')}
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
                  {t('first_responders_label')}
                </span>
              </div>
              <div className="font-black text-lg text-slate-900 group-hover:text-red-700 transition-colors">
                {t('emergency_scanner_box_title')}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {t('emergency_scanner_box_desc')}
              </p>
              <div className="mt-4 pt-3 border-t border-red-200/70 flex items-center justify-between text-xs font-bold text-red-700">
                <span>{t('open_scanner_btn')}</span>
                <span className="text-[10px] bg-red-200/60 px-2 py-0.5 rounded text-red-900 font-mono">
                  Tier-0 Unlock
                </span>
              </div>
            </button>
          </div>

          {/* Multi-Device Vault Sync & Recovery Card (Option C) */}
          <div className="bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/90 p-4 sm:p-5 rounded-3xl border border-indigo-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left mt-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  {t('link_existing_vault_card_title')}
                </span>
                <span className="text-[11px] text-slate-600 block mt-0.5">
                  {t('link_existing_vault_card_desc')}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowRecoveryModal(true);
                setRecoveryStep('phone');
                setRecoveryError('');
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-100 shrink-0 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('link_this_device_btn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* DEMO PROFILES SECTION (HIDDEN WHEN USER HAS CREATED VAULTS, UNLESS EXPLICITLY TOGGLED) */}
      {showDemoProfiles && (
        <div id="demo-profiles-section" className="space-y-4 pt-2 animate-fade-in">
          <div className="flex items-center justify-between bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                  {t('clinical_demo_personas_title')}
                </h3>
                <p className="text-[11px] text-amber-700">
                  {t('clinical_demo_personas_desc')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDemoProfiles(false)}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 px-3 py-1 bg-amber-200/50 rounded-lg cursor-pointer"
            >
              {t('hide_profiles')}
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
                    {translateName('Ramesh Patel')} (68{t('male_initial')})
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
                <p>📱 {translateRelationship('Guardian')}: {translateName('Suresh Patel')} ({translateRelationship('Son')}, +91 98250 99991)</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>{t('evaluate_ramesh')}</span>
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
                    {translateName('Priya Sharma')} (29{t('female_initial')})
                  </h4>
                  <p className="text-xs text-slate-500">{t('vault_id_label')}: <strong className="font-mono text-slate-900">AV-7721</strong></p>
                </div>

                <div className="bg-red-50 text-red-600 font-black text-base px-3 py-1.5 rounded-xl border border-red-200">
                  O-ve
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-700">
                <p>⚠️ <strong>Sulfa Drugs Allergy</strong> & Mild Asthma</p>
                <p>🏥 Hospital: Fortis Bannerghatta Road, Bengaluru</p>
                <p>📱 {translateRelationship('Guardian')}: {translateName('Rahul Sharma')} ({translateRelationship('Brother')}, +91 98450 99991)</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>{t('evaluate_priya')}</span>
                <span className="text-[11px] font-normal text-slate-400">{t('qr_family_paramedic')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY SCANNER & VAULT ID ENTRY */}
      {showScanner && (
        <div id="emergency-scanner-section" className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-red-200 shadow-lg max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  {t('emergency_scanner_title')}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t('emergency_scanner_subtitle')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenEmergency}
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-sm items-center gap-1.5"
            >
              <span>{t('hotline_108')}</span>
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
                placeholder={hasVaults ? `E.G. ${activeVault.id}` : 'E.G. AV-8842 OR AV-7721'}
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

          {/* Quick Scanner Fill Helpers */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="text-slate-500 font-medium flex items-center gap-1.5">
              <span>Quick Test Fill:</span>
              {hasVaults ? (
                userVaults.map(uv => (
                  <button
                    key={uv.id}
                    type="button"
                    onClick={() => setManualId(uv.id)}
                    className="font-mono font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg"
                  >
                    {uv.id} ({translateName(uv.owner_name).split(' ')[0]})
                  </button>
                ))
              ) : (
                <>
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
                </>
              )}
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
        </div>
      )}

      {/* Creation & Actions Bar (Utilities) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <button
          onClick={() => onOpenDashboard && onOpenDashboard(activeVault ? activeVault.id : currentVaultId)}
          className="p-5 rounded-3xl bg-slate-900 hover:bg-black text-white text-left shadow-lg transition-all group border border-slate-800"
        >
          <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="font-extrabold text-sm flex items-center justify-between">
            <span>{t('my_vault_title')}</span>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
              {activeVault ? activeVault.id : currentVaultId}
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
          onClick={() => onOpenPrintable(activeVault || null)}
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

      {/* Subtle Tester Mode Toggle at Bottom */}
      {hasVaults && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setShowDemoProfiles(prev => !prev)}
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold underline decoration-dotted cursor-pointer"
          >
            {showDemoProfiles ? t('hide_clinical_profiles') : t('switch_to_tester_mode')}
          </button>
        </div>
      )}

      {/* Vault Recovery Modal (For lost vaults / device switching) */}
      {showRecoveryModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRecoveryModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 modal-backdrop animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-scale-up"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {t('recover_existing_vault_title')}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {t('recover_existing_vault_desc')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowRecoveryModal(false);
                  setRecoveryStep('phone');
                  setRecoveryError('');
                }}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {recoveryError && (
              <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {recoveryError}
              </div>
            )}

            {/* STEP 1: ENTER PHONE NUMBER */}
            {recoveryStep === 'phone' && (
              <form onSubmit={handleSearchVaultForRecovery} className="py-4 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('enter_primary_mobile_desc')}
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Vault ID, Registered Mobile Number, or Full Name
                  </label>
                  <input
                    type="text"
                    value={recoveryPhone}
                    onChange={(e) => setRecoveryPhone(e.target.value)}
                    placeholder="e.g. AV-9017S, +91 98480 12345, or Ishrath Shaik"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-indigo-600 focus:outline-none text-base font-bold text-slate-900"
                    autoFocus
                    required
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Tip: Enter your Vault ID (like <strong>AV-9017S</strong>) to immediately find your records.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    {t('cancel_btn')}
                  </button>
                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-200 disabled:opacity-50 cursor-pointer active:scale-95 transition-all"
                  >
                    {recoveryLoading ? t('searching_vault') : t('find_my_vault_btn')}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: ENTER OTP */}
            {recoveryStep === 'otp' && recoveryMatch && (
              <form onSubmit={handleConfirmHomeRecovery} className="py-4 space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="flex justify-between items-center text-emerald-900 font-bold">
                    <span>{t('vault_id_label')}: {recoveryMatch.vaultId}</span>
                    <span className="text-red-600">{recoveryMatch.bloodGroup}</span>
                  </div>
                  <div className="text-emerald-800">
                    Owner: <strong>{recoveryMatch.ownerName}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  {t('verify_otp_authorization_desc')}
                </p>

                {recoveryOtpDebug && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono flex items-center justify-between">
                    <span>{t('demo_sms_code')}: <strong>{recoveryOtpDebug}</strong></span>
                    <button
                      type="button"
                      onClick={() => setRecoveryOtp(recoveryOtpDebug)}
                      className="text-[11px] bg-amber-200 hover:bg-amber-300 px-2 py-0.5 rounded font-bold cursor-pointer"
                    >
                      {t('auto_fill')}
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('verify_phone_prompt')}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={recoveryOtp}
                    onChange={(e) => setRecoveryOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-indigo-600 focus:outline-none text-center text-2xl font-mono font-black tracking-widest text-slate-900"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryStep('phone');
                      setRecoveryOtp('');
                      setRecoveryError('');
                    }}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    {t('back_btn')}
                  </button>

                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="flex-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black text-xs text-white shadow-md shadow-indigo-200 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
                  >
                    {recoveryLoading ? t('verifying_otp') : t('confirm_and_restore_vault')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
