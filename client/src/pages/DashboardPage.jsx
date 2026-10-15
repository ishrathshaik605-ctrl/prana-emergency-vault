import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, HeartPulse, UserPlus, Trash2, 
  Download, Printer, FileText, Lock, AlertTriangle, CheckCircle,
  Users, ArrowRightLeft, PlusCircle, ExternalLink
} from 'lucide-react';

export function DashboardPage({ 
  vaultId, 
  onSelectVault, 
  onOpenEmergency, 
  onStartSetup, 
  onOpenPrintable, 
  onOpenAudit, 
  onBack 
}) {
  const { t } = useLanguage();
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMember, setNewMember] = useState({ name: '', phone: '', rel: 'Family Member' });
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    fetchVault();
  }, [vaultId]);

  const fetchVault = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vault/${vaultId}`);
      const data = await res.json();
      if (data.success) {
        setVault(data.vault);
      }
    } catch (err) {
      console.error('Error fetching vault:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/vault/${vaultId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grantee_name: newMember.name,
          grantee_phone: newMember.phone,
          relationship: newMember.rel,
          allowed_categories: ['medical_basics', 'medications', 'insurance', 'documents']
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddMember(false);
        setNewMember({ name: '', phone: '', rel: 'Family Member' });
        fetchVault();
      }
    } catch (err) {
      alert('Failed to add permission');
    }
  };

  const handleDeletePermission = async (permId) => {
    if (!window.confirm('Revoke access for this family member?')) return;
    try {
      await fetch(`/api/vault/${vaultId}/permissions/${permId}`, { method: 'DELETE' });
      fetchVault();
    } catch (err) {
      alert('Failed to delete permission');
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch(`/api/vault/${vaultId}/export`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data.export_data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Prana_${vaultId}_Export.json`;
      a.click();
    } catch (err) {
      alert('Export failed');
    }
  };

  const handleDeleteAllData = async () => {
    const confirmName = prompt(`CAUTION: Right to Erasure (DPDP Act 2023).\nType "${vault?.owner_name}" to permanently erase all records, contacts, and audit logs:`);
    if (confirmName !== vault?.owner_name) {
      alert('Confirmation name did not match. Deletion aborted.');
      return;
    }

    try {
      const res = await fetch(`/api/vault/${vaultId}/delete`, { method: 'DELETE' });
      const data = await res.json();
      alert(data.message || 'All personal data erased.');
      window.location.href = '/';
    } catch (err) {
      alert('Deletion failed');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading Vault Management Dashboard...</div>;
  }

  if (!vault) {
    return <div className="p-12 text-center text-red-500 font-bold">Vault not found</div>;
  }

  const baseMembers = [
    {
      id: 'AV-8842',
      name: 'Ramesh Patel',
      role: 'Father (Elderly Dependent • Age 68)',
      blood_group: 'B+ve',
      critical: 'Penicillin Allergy • Pacemaker',
    },
    {
      id: 'AV-7721',
      name: 'Priya Sharma',
      role: 'Daughter / Self (Tech Pro • Age 32)',
      blood_group: 'O-ve (Universal Donor)',
      critical: 'Sulfa Drugs • Mild Asthma',
    }
  ];

  const householdList = [...baseMembers];
  if (vault && !baseMembers.some(m => m.id === vault.id)) {
    householdList.unshift({
      id: vault.id,
      name: vault.owner_name,
      role: 'Self (Household Member)',
      blood_group: vault.blood_group,
      critical: vault.allergies || 'No critical allergies',
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button onClick={onBack} className="text-xs font-bold text-slate-500 hover:text-slate-900 mb-2 block">
            {t('back_to_home')}
          </button>
          <h2 className="text-2xl font-black text-slate-900">{vault.owner_name} - {t('app_name')}</h2>
          <span className="text-xs text-slate-500 font-medium">
            Vault ID: <strong className="font-mono">{vault.id}</strong> • {t('blood_group')}: <strong className="text-red-600 font-bold">{vault.blood_group}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onOpenPrintable(vault)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs hover:bg-indigo-100 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>{t('print_wallet_card_title')}</span>
          </button>

          <button
            onClick={() => onOpenAudit(vault.id)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('audit_log')}</span>
          </button>
        </div>
      </div>

      {/* Family Circle Vaults (Household Hub) */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 rounded-3xl text-white shadow-xl space-y-4 border border-indigo-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">{t('family_circle_title')}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Household Hub
                </span>
              </div>
              <p className="text-xs text-slate-300/80 mt-0.5">{t('family_circle_desc')}</p>
            </div>
          </div>

          <button
            onClick={onStartSetup}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('link_dependent_btn')}</span>
          </button>
        </div>

        {/* Family Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {householdList.map((m) => {
            const isActive = vault.id === m.id;
            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isActive 
                    ? 'bg-slate-800/95 border-emerald-400/60 ring-2 ring-emerald-500/30 shadow-md' 
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{m.name}</span>
                      <span className="text-[10px] font-mono bg-slate-900 text-indigo-300 px-2 py-0.5 rounded border border-indigo-900/60">
                        {m.id}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium block mt-0.5">
                      {m.role} • Blood: <strong className="text-red-400 font-bold">{m.blood_group}</strong>
                    </span>
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {t('currently_viewing')}
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectVault && onSelectVault(m.id)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/10"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-300" />
                      <span>{t('switch_to_vault')}</span>
                    </button>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-slate-300 text-[11px] truncate max-w-[220px]">
                    ⚠️ <span className="text-amber-300 font-semibold">{m.critical}</span>
                  </div>

                  <button
                    onClick={() => onOpenEmergency && onOpenEmergency(m.id)}
                    className="text-[11px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 underline underline-offset-2"
                  >
                    <span>{t('view_emergency_card')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Medical Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase">
            <HeartPulse className="w-4 h-4" />
            <span>{t('medical_highlights')}</span>
          </div>
          <p className="text-xs font-bold text-slate-900">
            {t('critical_allergies')}: <span className="text-amber-700">{vault.allergies || 'None'}</span>
          </p>
          <p className="text-xs text-slate-700">
            {t('conditions')}: <strong>{vault.conditions || 'None'}</strong>
          </p>
          <p className="text-xs text-slate-700">
            {t('medications')}: <strong>{vault.medications || 'None'}</strong>
          </p>
        </div>

        {/* Insurance Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('insurance_and_hospital')}</span>
          </div>
          <p className="text-xs font-bold text-slate-900">
            Provider: <strong>{vault.insurance?.provider || 'Not linked'}</strong>
          </p>
          <p className="text-xs text-slate-700 font-mono">
            Policy: {vault.insurance?.policy_number || 'N/A'}
          </p>
          <p className="text-xs text-slate-600">
            {t('preferred_hospital')}: {vault.hospital_name || 'Nearest ER'}
          </p>
        </div>

        {/* Contacts Count */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase">
            <FileText className="w-4 h-4" />
            <span>{t('guardians_and_docs')}</span>
          </div>
          <p className="text-xs text-slate-700">
            {t('emergency_contacts')}: <strong>{vault.emergency_contacts?.length || 0} registered</strong>
          </p>
          <p className="text-xs text-slate-700">
            Attached Documents: <strong>{vault.documents?.length || 0} encrypted files</strong>
          </p>
        </div>
      </div>

      {/* Permissions Matrix Manager */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">
              {t('family_matrix_title')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('family_matrix_desc')}
            </p>
          </div>
          <button
            onClick={() => setShowAddMember(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('add_family_member')}</span>
          </button>
        </div>

        {showAddMember && (
          <form onSubmit={handleAddPermission} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Full Name"
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                required
              />
              <input
                type="tel"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                placeholder="Phone (+91 98250 99991)"
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                required
              />
              <input
                type="text"
                value={newMember.rel}
                onChange={(e) => setNewMember({ ...newMember, rel: e.target.value })}
                placeholder="Relationship"
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="px-3 py-1.5 text-xs text-slate-500 font-bold hover:underline"
              >
                {t('cancel_btn')}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Save Permission
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-slate-100">
          {vault.permissions?.map((perm) => (
            <div key={perm.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <span className="text-sm font-bold text-slate-900">{perm.grantee_name}</span>
                <span className="text-xs text-slate-500 ml-2">({perm.relationship} • {perm.grantee_phone})</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {perm.allowed_categories?.map((cat) => (
                    <span key={cat} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                      ✓ {cat}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleDeletePermission(perm.id)}
                title="Revoke Permission"
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DPDP Act 2023 Compliance Panel */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
          {t('data_governance_title')}
        </h4>
        <p className="text-xs text-slate-600">
          {t('data_governance_desc')}
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{t('right_to_portability')}</span>
          </button>

          <button
            onClick={handleDeleteAllData}
            className="px-4 py-2.5 rounded-xl bg-white border border-red-300 hover:bg-red-50 text-xs font-bold text-red-600 flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('right_to_erasure')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
