import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, HeartPulse, UserPlus, Trash2, 
  Download, Printer, FileText, Lock, AlertTriangle, CheckCircle,
  Users, ArrowRightLeft, PlusCircle, ExternalLink, Edit3, X
} from 'lucide-react';
import { 
  getUserVaults, 
  hasUserCreatedVaults, 
  getStoredDeviceIp, 
  setStoredVaultId 
} from '../utils/vaultStorage';

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
  const [showEditInsurance, setShowEditInsurance] = useState(false);
  const [insuranceForm, setInsuranceForm] = useState({
    provider: '',
    policy_number: '',
    cashless_helpline: '',
    tpa_name: ''
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    owner_name: '',
    blood_group: 'O+ve',
    allergies: '',
    conditions: '',
    hospital_name: '',
    contact1_name: '',
    contact1_rel: 'Father',
    contact1_phone: '',
    contact2_name: '',
    contact2_rel: 'Mother',
    contact2_phone: ''
  });

  useEffect(() => {
    fetchVault();
  }, [vaultId]);

  useEffect(() => {
    if (vault) {
      if (vault.insurance) {
        setInsuranceForm({
          provider: vault.insurance.provider || '',
          policy_number: vault.insurance.policy_number || '',
          cashless_helpline: vault.insurance.cashless_helpline || '',
          tpa_name: vault.insurance.tpa_name || ''
        });
      }
      setProfileForm({
        owner_name: vault.owner_name || '',
        blood_group: vault.blood_group || 'O+ve',
        allergies: vault.allergies || '',
        conditions: vault.conditions || '',
        hospital_name: vault.hospital_name || '',
        contact1_name: vault.emergency_contacts?.[0]?.name || '',
        contact1_rel: vault.emergency_contacts?.[0]?.relationship || 'Father',
        contact1_phone: vault.emergency_contacts?.[0]?.phone || '',
        contact2_name: vault.emergency_contacts?.[1]?.name || '',
        contact2_rel: vault.emergency_contacts?.[1]?.relationship || 'Mother',
        contact2_phone: vault.emergency_contacts?.[1]?.phone || ''
      });
    }
  }, [vault]);

  const fetchVault = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vault/${vaultId}`);
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.vault) {
          setVault(data.vault);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error fetching vault from backend:', err);
    }

    // Local device fallback if server is cold starting or waking up
    const local = getUserVaults().find(v => v.id && v.id.toUpperCase() === (vaultId || '').toUpperCase());
    if (local) {
      setVault(local);
    }
    setLoading(false);
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

  const handleSaveInsurance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/vault/${vaultId}/insurance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insuranceForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowEditInsurance(false);
        // Sync with local device storage
        const currentVaults = getUserVaults();
        const updated = currentVaults.map(v => {
          if (v.id && v.id.toUpperCase() === (vaultId || '').toUpperCase()) {
            return {
              ...v,
              insurance: insuranceForm
            };
          }
          return v;
        });
        localStorage.setItem('prana_user_vaults', JSON.stringify(updated));
        fetchVault();
      } else {
        alert(data.error || 'Failed to update insurance');
      }
    } catch (err) {
      alert('Error updating insurance details');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.owner_name.trim()) {
      alert('Full name is required');
      return;
    }

    const contacts = [];
    if (profileForm.contact1_name.trim() && profileForm.contact1_phone.trim()) {
      contacts.push({
        name: profileForm.contact1_name.trim(),
        relationship: profileForm.contact1_rel.trim() || 'Guardian',
        phone: profileForm.contact1_phone.trim(),
        priority: 1
      });
    }
    if (profileForm.contact2_name.trim() && profileForm.contact2_phone.trim()) {
      contacts.push({
        name: profileForm.contact2_name.trim(),
        relationship: profileForm.contact2_rel.trim() || 'Guardian',
        phone: profileForm.contact2_phone.trim(),
        priority: 2
      });
    }

    const payload = {
      owner_name: profileForm.owner_name.trim(),
      blood_group: profileForm.blood_group,
      allergies: profileForm.allergies.trim(),
      conditions: profileForm.conditions.trim(),
      hospital_name: profileForm.hospital_name.trim(),
      emergency_contacts: contacts
    };

    try {
      const res = await fetch(`/api/vault/${vaultId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowEditProfile(false);
        // Sync with local device storage
        const currentVaults = getUserVaults();
        const updated = currentVaults.map(v => {
          if (v.id && v.id.toUpperCase() === (vaultId || '').toUpperCase()) {
            return {
              ...v,
              owner_name: payload.owner_name,
              blood_group: payload.blood_group,
              allergies: payload.allergies,
              conditions: payload.conditions,
              hospital_name: payload.hospital_name,
              emergency_contacts: contacts
            };
          }
          return v;
        });
        localStorage.setItem('prana_user_vaults', JSON.stringify(updated));
        fetchVault();
        alert('Vault profile & emergency contacts updated successfully!');
      } else {
        alert(data.error || 'Failed to update vault details');
      }
    } catch (err) {
      alert('Error updating vault profile');
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

  const userVaults = getUserVaults();
  const hasUserVaults = userVaults && userVaults.length > 0;

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

  let householdList = [];
  if (hasUserVaults) {
    // When user has created vaults on their device, HIDE Ramesh Patel and Priya Sharma completely!
    householdList = userVaults.map(uv => ({
      id: uv.id,
      name: uv.owner_name,
      role: uv.id === vault.id ? 'Active Profile (You)' : 'Family Dependent',
      blood_group: uv.blood_group,
      critical: uv.allergies || 'No critical allergies',
    }));

    if (vault && !householdList.some(m => m.id === vault.id)) {
      householdList.unshift({
        id: vault.id,
        name: vault.owner_name,
        role: 'Active Profile',
        blood_group: vault.blood_group,
        critical: vault.allergies || 'No critical allergies',
      });
    }
  } else {
    // Show sample personas only for first-time testers before any custom vault is created
    householdList = [...baseMembers];
    if (vault && !baseMembers.some(m => m.id === vault.id)) {
      householdList.unshift({
        id: vault.id,
        name: vault.owner_name,
        role: 'Self (Household Member)',
        blood_group: vault.blood_group,
        critical: vault.allergies || 'No critical allergies',
      });
    }
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
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs text-slate-500 font-medium">
              Vault ID: <strong className="font-mono text-slate-900">{vault.id}</strong> • {t('blood_group')}: <strong className="text-red-600 font-bold">{vault.blood_group}</strong>
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>📱 Recognized Device • IP: {getStoredDeviceIp()}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEditProfile(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile & Contacts</span>
          </button>

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
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('insurance_and_hospital')}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setInsuranceForm({
                  provider: vault.insurance?.provider || '',
                  policy_number: vault.insurance?.policy_number || '',
                  cashless_helpline: vault.insurance?.cashless_helpline || '',
                  tpa_name: vault.insurance?.tpa_name || ''
                });
                setShowEditInsurance(true);
              }}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline px-2 py-0.5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>{vault.insurance?.provider ? 'Edit Policy' : '+ Add Policy'}</span>
            </button>
          </div>
          <p className="text-xs font-bold text-slate-900">
            Provider: <strong className="text-emerald-700">{vault.insurance?.provider || 'Not linked yet'}</strong>
          </p>
          <p className="text-xs text-slate-700 font-mono">
            Policy: {vault.insurance?.policy_number || 'None'}
          </p>
          <p className="text-xs text-slate-600">
            Cashless Helpline: {vault.insurance?.cashless_helpline || 'N/A'}
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
      {/* Edit Insurance Details Modal */}
      {showEditInsurance && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditInsurance(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 modal-backdrop animate-fade-in cursor-pointer"
          role="dialog"
          aria-modal="true"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900">Health Insurance Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditInsurance(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInsurance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  value={insuranceForm.provider}
                  onChange={(e) => setInsuranceForm({ ...insuranceForm, provider: e.target.value })}
                  placeholder="e.g. Star Health / Care Health / HDFC ERGO"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Policy Number
                </label>
                <input
                  type="text"
                  value={insuranceForm.policy_number}
                  onChange={(e) => setInsuranceForm({ ...insuranceForm, policy_number: e.target.value })}
                  placeholder="e.g. SH-8899-2231"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-semibold text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  TPA / Cashless Emergency Helpline
                </label>
                <input
                  type="text"
                  value={insuranceForm.cashless_helpline}
                  onChange={(e) => setInsuranceForm({ ...insuranceForm, cashless_helpline: e.target.value })}
                  placeholder="e.g. 1800-425-2255"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditInsurance(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-200 cursor-pointer"
                >
                  Save Insurance Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile & Contacts Modal */}
      {showEditProfile && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditProfile(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 modal-backdrop animate-fade-in cursor-pointer overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative cursor-default my-auto max-h-[92vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Edit Profile & Contacts</h3>
                  <span className="text-[11px] text-slate-500 font-medium font-mono">Vault ID: {vault.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="overflow-y-auto flex-1 pr-1 my-3 space-y-4">
              {/* Section 1: Personal Info */}
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  1. Personal Medical Profile
                </span>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileForm.owner_name}
                    onChange={(e) => setProfileForm({ ...profileForm, owner_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Blood Group *
                    </label>
                    <select
                      value={profileForm.blood_group}
                      onChange={(e) => setProfileForm({ ...profileForm, blood_group: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                    >
                      {['O+ve', 'O-ve', 'A+ve', 'A-ve', 'B+ve', 'B-ve', 'AB+ve', 'AB-ve'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Hospital
                    </label>
                    <input
                      type="text"
                      value={profileForm.hospital_name}
                      onChange={(e) => setProfileForm({ ...profileForm, hospital_name: e.target.value })}
                      placeholder="e.g. CMC-VELLORE"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Critical Allergies / Alerts
                  </label>
                  <input
                    type="text"
                    value={profileForm.allergies}
                    onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                    placeholder="e.g. Throat Infection, Penicillin Allergy"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medical Conditions
                  </label>
                  <input
                    type="text"
                    value={profileForm.conditions}
                    onChange={(e) => setProfileForm({ ...profileForm, conditions: e.target.value })}
                    placeholder="e.g. Hypertension, Asthma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Section 2: Emergency Contacts */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-black uppercase tracking-wider text-red-600 block">
                  2. Emergency Contacts & Mobile Numbers
                </span>

                {/* Contact 1 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Contact 1 (Primary Guardian)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={profileForm.contact1_name}
                      onChange={(e) => setProfileForm({ ...profileForm, contact1_name: e.target.value })}
                      placeholder="Full Name (e.g. Father)"
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                    />
                    <input
                      type="text"
                      value={profileForm.contact1_rel}
                      onChange={(e) => setProfileForm({ ...profileForm, contact1_rel: e.target.value })}
                      placeholder="Relationship (e.g. Father)"
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900"
                    />
                    <input
                      type="tel"
                      value={profileForm.contact1_phone}
                      onChange={(e) => setProfileForm({ ...profileForm, contact1_phone: e.target.value })}
                      placeholder="Mobile Phone"
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Contact 2 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Contact 2 (Secondary Guardian)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={profileForm.contact2_name}
                      onChange={(e) => setProfileForm({ ...profileForm, contact2_name: e.target.value })}
                      placeholder="Full Name (e.g. Mother)"
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                    />
                    <input
                      type="text"
                      value={profileForm.contact2_rel}
                      onChange={(e) => setProfileForm({ ...profileForm, contact2_rel: e.target.value })}
                      placeholder="Relationship (e.g. Mother)"
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900"
                    />
                    <input
                      type="tel"
                      value={profileForm.contact2_phone}
                      onChange={(e) => setProfileForm({ ...profileForm, contact2_phone: e.target.value })}
                      placeholder="Mobile Phone"
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-200 cursor-pointer active:scale-95 transition-transform"
                >
                  Save Profile & Contacts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
