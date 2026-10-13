import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Tier0Card } from '../components/Tier0Card';
import { FamilyUnlockModal } from '../components/FamilyUnlockModal';
import { BreakGlassModal } from '../components/BreakGlassModal';
import { 
  HeartPulse, ShieldAlert, FileText, Phone, Hospital, 
  Clock, AlertTriangle, Download, Lock, CheckCircle, Volume2 
} from 'lucide-react';

export function EmergencyPortal({ vaultId, onBack }) {
  const { t, speakText, lang } = useLanguage();
  const [tier0Data, setTier0Data] = useState(null);
  const [elevatedData, setElevatedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showBreakGlassModal, setShowBreakGlassModal] = useState(false);
  const [breakGlassTimer, setBreakGlassTimer] = useState(30 * 60); // 30 minutes in seconds

  useEffect(() => {
    fetchTier0();
  }, [vaultId]);

  useEffect(() => {
    let timer;
    if (elevatedData?.access_tier?.includes('Tier 2') && breakGlassTimer > 0) {
      timer = setInterval(() => {
        setBreakGlassTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setElevatedData(null); // Session expired, lock back to Tier 0
            alert('Break-glass 30-minute session has expired. Vault returned to locked state.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [elevatedData, breakGlassTimer]);

  const fetchTier0 = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/emergency/${vaultId}/tier0`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load emergency card');
      setTier0Data(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReportFraud = async () => {
    if (!window.confirm('Do you want to immediately REVOKE and LOCK this active emergency access session?')) return;
    try {
      const res = await fetch(`/api/emergency/${vaultId}/report-abuse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: elevatedData?.session_token || elevatedData?.audit_log_id,
          reported_by: 'User Emergency Killswitch',
          comments: 'Immediate manual revocation from viewer portal'
        })
      });
      const data = await res.json();
      alert(data.message || 'Access successfully revoked.');
      setElevatedData(null); // Lock back to Tier 0
    } catch (err) {
      alert('Failed to revoke access.');
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <HeartPulse className="w-12 h-12 text-red-600 animate-bounce mb-3" />
        <h3 className="text-xl font-bold text-slate-800">
          Decoupling & Retrieving Emergency Lifesaver Data...
        </h3>
        <p className="text-xs text-slate-500 mt-1">Sub-second emergency routing</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border-2 border-red-200 rounded-3xl text-center">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-800">Vault Access Error</h3>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
        >
          {t('back_to_home')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          {t('back_to_selection')}
        </button>

        {elevatedData && (
          <button
            onClick={handleReportFraud}
            className="px-3 py-1.5 rounded-xl bg-red-100 border border-red-300 text-red-700 font-bold text-xs hover:bg-red-200 flex items-center gap-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t('lock_and_revoke')}</span>
          </button>
        )}
      </div>

      {/* If elevated (Tier 1 or Tier 2) is active, show the unlocked view */}
      {elevatedData ? (
        <div className="space-y-6 animate-fade-in">
          {/* Elevation Status Banner */}
          <div className={`p-4 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-3 ${
            elevatedData.access_tier?.includes('Tier 2')
              ? 'bg-gradient-to-r from-red-600 to-rose-700 border-2 border-red-800'
              : 'bg-gradient-to-r from-emerald-600 to-teal-700 border-2 border-emerald-800'
          }`}>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
                ACCESS ELEVATED: {elevatedData.access_tier}
              </span>
              <h2 className="text-2xl font-black">{elevatedData.owner_name}</h2>
              <p className="text-xs text-slate-100">
                {t('blood_group')}: <strong>{elevatedData.blood_group}</strong> • Age: {elevatedData.age || 'Adult'}
              </p>
            </div>

            {elevatedData.access_tier?.includes('Tier 2') && (
              <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl text-center border border-white/20">
                <div className="text-[10px] uppercase font-black text-red-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t('session_expiration')}</span>
                </div>
                <div className="text-2xl font-mono font-black text-white">
                  {formatTimer(breakGlassTimer)}
                </div>
              </div>
            )}
          </div>

          {/* Elevated Clinical Details Grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
            {/* Medications & Dosages */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-red-600" />
                <span>{t('medications_dosage')}</span>
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 leading-relaxed">
                {elevatedData.medications || t('no_daily_meds')}
              </div>
            </div>

            {/* Implants & Medical Devices */}
            {elevatedData.implants && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <span>{t('implants_hardware')}</span>
                </h3>
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-sm font-bold text-indigo-950">
                  ⚠️ {elevatedData.implants}
                </div>
              </div>
            )}

            {/* Health Insurance Details */}
            {elevatedData.insurance && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Hospital className="w-4 h-4 text-emerald-600" />
                  <span>{t('insurance_cashless_title')}</span>
                </h3>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-sm text-emerald-950">
                    <span>{elevatedData.insurance.provider}</span>
                    <span>Expiry: {elevatedData.insurance.expiry_date}</span>
                  </div>
                  <div className="text-slate-800">
                    Policy Number: <strong className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">{elevatedData.insurance.policy_number}</strong>
                  </div>
                  <div className="text-slate-700">
                    TPA / Cashless Helpline: <strong className="font-mono">{elevatedData.insurance.cashless_helpline}</strong>
                  </div>
                  {elevatedData.insurance.notes && (
                    <div className="text-[11px] text-emerald-800 italic pt-1">
                      Note: {elevatedData.insurance.notes}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents (Medical reports, prescriptions, ID) */}
            {(elevatedData.documents || elevatedData.medical_documents) && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{t('clinical_reports_title')}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(elevatedData.documents || elevatedData.medical_documents).map((doc) => (
                    <div 
                      key={doc.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block truncate">
                          {doc.category}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 block truncate">
                          {doc.title}
                        </span>
                      </div>
                      <a
                        href={doc.download_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 shrink-0 font-bold text-xs flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>{t('view_doc')}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Home Address (If permitted in Tier 1) */}
            {elevatedData.home_address && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  {t('home_address_title')}
                </h3>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                  {elevatedData.home_address}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Default Public Tier 0 Card */
        <Tier0Card
          data={tier0Data}
          onUnlockFamily={() => setShowFamilyModal(true)}
          onBreakGlass={() => setShowBreakGlassModal(true)}
        />
      )}

      {/* Modals */}
      <FamilyUnlockModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
        vaultId={vaultId}
        onUnlocked={(data) => setElevatedData(data)}
      />

      <BreakGlassModal
        isOpen={showBreakGlassModal}
        onClose={() => setShowBreakGlassModal(false)}
        vaultId={vaultId}
        onBreakGlassSuccess={(data) => setElevatedData(data)}
      />
    </div>
  );
}
