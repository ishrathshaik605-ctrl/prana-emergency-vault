import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { saveUserVault } from '../utils/vaultStorage';
import { 
  ShieldCheck, HeartPulse, Phone, Hospital, 
  ArrowRight, ArrowLeft, Check, Sparkles, User, FileText, Volume2 
} from 'lucide-react';

export function VaultSetupPage({ onComplete, onCancel }) {
  const { t, speakText, lang } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isAssistedSetup, setIsAssistedSetup] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    owner_name: '',
    dob: '1970-01-01',
    gender: 'Male',
    blood_group: 'O+ve',
    allergies: '',
    conditions: '',
    medications: '',
    implants: '',
    organ_donor: 1,
    primary_doctor: '',
    doctor_phone: '',
    hospital_name: '',
    hospital_address: '',
    home_address: '',
    emergency_instructions: '',
    contact1_name: '',
    contact1_rel: 'Son',
    contact1_phone: '',
    contact2_name: '',
    contact2_rel: 'Daughter',
    contact2_phone: '',
    insurance_provider: '',
    insurance_policy: '',
    insurance_helpline: ''
  });

  const handleQuickPreFill = (type) => {
    if (type === 'elder') {
      setFormData({
        owner_name: 'Harish Bhai Patel',
        dob: '1955-08-10',
        gender: 'Male',
        blood_group: 'AB+ve',
        allergies: 'Severe Aspirin & NSAID sensitivity',
        conditions: 'Coronary Artery Disease, Hypertension',
        medications: 'Clopidogrel 75mg, Amlodipine 5mg',
        implants: 'Cardiac Stent placed in LAD (2020)',
        organ_donor: 1,
        primary_doctor: 'Dr. S. Bhatt (Cardiologist)',
        doctor_phone: '+919825001122',
        hospital_name: 'Sterling Hospital, Ahmedabad',
        hospital_address: 'Gurukul Road, Memnagar, Ahmedabad',
        home_address: 'B-12, Shanti Niketan Society, Satellite, Ahmedabad',
        emergency_instructions: 'Keep patient calm, check BP, carry cardiac reports in bedside drawer. Call son immediately.',
        contact1_name: 'Ketan Patel',
        contact1_rel: 'Son (Primary Guardian)',
        contact1_phone: '+919825091111',
        contact2_name: 'Bhavna Patel',
        contact2_rel: 'Daughter',
        contact2_phone: '+919825092222',
        insurance_provider: 'Care Health Senior Citizen',
        insurance_policy: 'CH-9948-1029',
        insurance_helpline: '1800-102-4488'
      });
      speakText('Elderly profile loaded. Verify details and complete setup.');
    } else {
      setFormData({
        owner_name: 'Neha Roy',
        dob: '1995-12-04',
        gender: 'Female',
        blood_group: 'A-ve',
        allergies: 'Peanuts, Shellfish (carry EpiPen)',
        conditions: 'Severe Food Allergies, Mild Migraine',
        medications: 'Sumatriptan 50mg (PRN)',
        implants: 'None',
        organ_donor: 1,
        primary_doctor: 'Dr. Rita Sen',
        doctor_phone: '+919830012345',
        hospital_name: 'AMRI Hospital, Kolkata',
        hospital_address: 'Dhakuria, Kolkata',
        home_address: 'Flat 3B, Lake View Enclave, Southern Avenue, Kolkata',
        emergency_instructions: 'EpiPen is inside brown purse. If tongue swells, inject into outer thigh immediately.',
        contact1_name: 'Amit Roy',
        contact1_rel: 'Spouse',
        contact1_phone: '+919830099991',
        contact2_name: 'Mitali Roy',
        contact2_rel: 'Mother',
        contact2_phone: '+919830099992',
        insurance_provider: 'Star Health Family Optima',
        insurance_policy: 'SH-4421-9988',
        insurance_helpline: '1800-425-2255'
      });
      speakText('Profile loaded. Review details and save.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contacts = [];
      if (formData.contact1_name && formData.contact1_phone) {
        contacts.push({
          name: formData.contact1_name,
          relationship: formData.contact1_rel,
          phone: formData.contact1_phone,
          priority: 1
        });
      }
      if (formData.contact2_name && formData.contact2_phone) {
        contacts.push({
          name: formData.contact2_name,
          relationship: formData.contact2_rel,
          phone: formData.contact2_phone,
          priority: 2
        });
      }

      const payload = {
        owner_name: formData.owner_name,
        dob: formData.dob,
        gender: formData.gender,
        blood_group: formData.blood_group,
        allergies: formData.allergies,
        conditions: formData.conditions,
        medications: formData.medications,
        implants: formData.implants,
        organ_donor: formData.organ_donor,
        primary_doctor: formData.primary_doctor,
        doctor_phone: formData.doctor_phone,
        hospital_name: formData.hospital_name,
        hospital_address: formData.hospital_address,
        home_address: formData.home_address,
        emergency_instructions: formData.emergency_instructions,
        emergency_contacts: contacts,
        insurance: formData.insurance_provider ? {
          provider: formData.insurance_provider,
          policy_number: formData.insurance_policy,
          cashless_helpline: formData.insurance_helpline
        } : null,
        family_permissions: contacts.map(c => ({
          grantee_name: c.name,
          grantee_phone: c.phone,
          relationship: c.relationship,
          allowed_categories: ['medical_basics', 'medications', 'doctor_contacts', 'insurance', 'documents', 'home_address', 'emergency_instructions', 'incident_history']
        }))
      };

      const res = await fetch('/api/vault/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create vault');

      const createdVault = {
        id: data.vaultId,
        owner_name: formData.owner_name,
        dob: formData.dob,
        gender: formData.gender,
        blood_group: formData.blood_group,
        allergies: formData.allergies,
        conditions: formData.conditions,
        medications: formData.medications,
        implants: formData.implants,
        organ_donor: formData.organ_donor,
        primary_doctor: formData.primary_doctor,
        doctor_phone: formData.doctor_phone,
        hospital_name: formData.hospital_name,
        hospital_address: formData.hospital_address,
        home_address: formData.home_address,
        emergency_instructions: formData.emergency_instructions,
        emergency_contacts: contacts,
        insurance: payload.insurance,
        offline_qr_payload: data.offline_qr_payload || null,
        created_at: new Date().toISOString()
      };

      // Persist to device storage immediately
      saveUserVault(createdVault);

      speakText(`Vault ${data.vaultId} configured successfully.`);
      onComplete(data.vaultId, createdVault);
    } catch (err) {
      alert('Error creating vault: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
            {t('under_5_min_setup')}
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            {isAssistedSetup ? t('assisted_setup_for_parent') : t('setup_title')}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Step {step} of 4: {
              step === 1 ? t('step_1') :
              step === 2 ? t('step_2') :
              step === 3 ? t('step_3') : t('step_4')
            }
          </p>
        </div>

        {/* Quick Pre-fill helper for test evaluation */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleQuickPreFill('elder')}
            className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs hover:bg-amber-200 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('prefill_elder')}</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreFill('urban')}
            className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-900 font-bold text-xs hover:bg-blue-200 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('prefill_urban')}</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              s <= step ? 'bg-red-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* STEP 1: Personal & Blood Group */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700">
                  {t('assisted_setup_for_parent')}
                </div>
                <input
                  type="checkbox"
                  checked={isAssistedSetup}
                  onChange={(e) => setIsAssistedSetup(e.target.checked)}
                  className="w-5 h-5 accent-red-600 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('full_name_owner')}
                </label>
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none text-base font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('blood_group')} *
                  </label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full px-3 py-3 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none font-bold text-slate-900"
                  >
                    {['O+ve', 'O-ve', 'A+ve', 'A-ve', 'B+ve', 'B-ve', 'AB+ve', 'AB-ve'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('date_of_birth')}
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none font-semibold text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('gender')}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-3 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none font-semibold text-slate-900"
                  >
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                    <option value="Other">{t('other')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('home_address_encrypted')}
                </label>
                <input
                  type="text"
                  value={formData.home_address}
                  onChange={(e) => setFormData({ ...formData, home_address: e.target.value })}
                  placeholder="Street, Landmark, City, State"
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none text-sm font-semibold text-slate-900"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Critical Medical Details */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-red-700 uppercase mb-1 flex items-center gap-1">
                  <span>{t('critical_allergies_req')}</span>
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g. Severe Penicillin Allergy, Sulfa Drugs, Peanuts"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-amber-400 bg-amber-50/50 focus:border-red-600 focus:outline-none text-sm font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('chronic_conditions')}
                </label>
                <input
                  type="text"
                  value={formData.conditions}
                  onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                  placeholder="e.g. Type-2 Diabetes, Hypertension, Asthma"
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('medications_dosages_label')}
                </label>
                <textarea
                  rows={2}
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  placeholder="e.g. Metformin 500mg (twice daily), Telmisartan 40mg (morning)"
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none text-sm font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('implants_mri')}
                  </label>
                  <input
                    type="text"
                    value={formData.implants}
                    onChange={(e) => setFormData({ ...formData, implants: e.target.value })}
                    placeholder="e.g. St. Jude Dual Pacemaker (2021)"
                    className="w-full px-3 py-2.5 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('organ_donor')}
                  </label>
                  <select
                    value={formData.organ_donor}
                    onChange={(e) => setFormData({ ...formData, organ_donor: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none text-xs font-bold text-slate-900"
                  >
                    <option value={1}>{t('donor_yes')}</option>
                    <option value={0}>{t('donor_no')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('primary_doc_phone')}
                  </label>
                  <input
                    type="text"
                    value={formData.primary_doctor}
                    onChange={(e) => setFormData({ ...formData, primary_doctor: e.target.value })}
                    placeholder="Dr. K. Mehta (+919825012345)"
                    className="w-full px-3 py-2.5 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('preferred_emergency_hospital')}
                  </label>
                  <input
                    type="text"
                    value={formData.hospital_name}
                    onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                    placeholder="e.g. Shree Krishna Hospital, Anand"
                    className="w-full px-3 py-2.5 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Emergency Contacts */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold">
                Emergency contacts will receive instant SMS & Voice alerts if emergency responder break-glass is triggered.
              </div>

              {/* Priority 1 Contact */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-black uppercase text-red-600 block">
                  {t('primary_guardian_contact')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={formData.contact1_name}
                    onChange={(e) => setFormData({ ...formData, contact1_name: e.target.value })}
                    placeholder="Full Name (e.g. Suresh Patel)"
                    className="px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900"
                    required
                  />
                  <input
                    type="text"
                    value={formData.contact1_rel}
                    onChange={(e) => setFormData({ ...formData, contact1_rel: e.target.value })}
                    placeholder="Relationship (e.g. Son)"
                    className="px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900"
                    required
                  />
                  <input
                    type="tel"
                    value={formData.contact1_phone}
                    onChange={(e) => setFormData({ ...formData, contact1_phone: e.target.value })}
                    placeholder="Phone (+91 98250 99991)"
                    className="px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Priority 2 Contact */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-black uppercase text-slate-600 block">
                  {t('secondary_contact')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={formData.contact2_name}
                    onChange={(e) => setFormData({ ...formData, contact2_name: e.target.value })}
                    placeholder="Full Name (e.g. Geeta Patel)"
                    className="px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    value={formData.contact2_rel}
                    onChange={(e) => setFormData({ ...formData, contact2_rel: e.target.value })}
                    placeholder="Relationship (e.g. Daughter)"
                    className="px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900"
                  />
                  <input
                    type="tel"
                    value={formData.contact2_phone}
                    onChange={(e) => setFormData({ ...formData, contact2_phone: e.target.value })}
                    placeholder="Phone (+91 98250 99992)"
                    className="px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Insurance & Emergency Instructions */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-black uppercase text-slate-700 block">
                  {t('health_insurance_policy')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={formData.insurance_provider}
                    onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
                    placeholder="Provider (e.g. Star Health / HDFC)"
                    className="px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    value={formData.insurance_policy}
                    onChange={(e) => setFormData({ ...formData, insurance_policy: e.target.value })}
                    placeholder="Policy Number"
                    className="px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    value={formData.insurance_helpline}
                    onChange={(e) => setFormData({ ...formData, insurance_helpline: e.target.value })}
                    placeholder="TPA Cashless Helpline"
                    className="px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t('owner_instructions_words')}
                </label>
                <textarea
                  rows={3}
                  value={formData.emergency_instructions}
                  onChange={(e) => setFormData({ ...formData, emergency_instructions: e.target.value })}
                  placeholder="e.g. If found unconscious or sweating, give sugar candy immediately. Pacemaker is MRI conditional. Call son Suresh immediately."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-red-600 focus:outline-none text-sm font-semibold text-slate-900"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-100 text-[11px] text-slate-600 leading-relaxed">
                🛡️ {t('dpdp_consent_notice')}
              </div>
            </div>
          )}

          {/* Stepper Buttons */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('back_btn')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-bold text-slate-500 hover:underline"
              >
                {t('cancel_btn')}
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !formData.owner_name) {
                    alert('Please enter the owner full name');
                    return;
                  }
                  setStep(step + 1);
                }}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md"
              >
                <span>{t('continue_btn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-red-200 disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                <span>{loading ? 'Configuring Vault...' : t('create_vault_btn')}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
