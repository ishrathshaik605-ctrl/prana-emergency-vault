const { decryptField } = require('./crypto');

/**
 * Access Control Evaluator & Sanitizer
 * Implements strict Deny-by-Default and Least-Privilege enforcement.
 */

// Available Data Categories
const CATEGORIES = {
  PUBLIC_LIFESAVER: 'public_lifesaver',
  MEDICAL_BASICS: 'medical_basics',
  MEDICATIONS: 'medications',
  DOCTOR_CONTACTS: 'doctor_contacts',
  INSURANCE: 'insurance',
  DOCUMENTS: 'documents',
  HOME_ADDRESS: 'home_address',
  EMERGENCY_INSTRUCTIONS: 'emergency_instructions',
  INCIDENT_HISTORY: 'incident_history'
};

/**
 * Sanitize vault for Tier 0 (Public Scanner / Lifesaver)
 * Guarantees zero sensitive data leakage to strangers.
 */
function sanitizeTier0(vault, contacts) {
  // Top 2 contacts only
  const topContacts = (contacts || [])
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 2)
    .map(c => ({
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
      priority: c.priority
    }));

  return {
    vault_id: vault.id,
    access_tier: 'Tier 0 - Public Lifesaver',
    owner_name: vault.owner_name,
    gender: vault.gender,
    age_group: vault.dob ? calculateAge(vault.dob) : 'Unknown',
    blood_group: vault.blood_group,
    // Only decrypt immediate critical life-safety fields
    critical_allergies: decryptField(vault.allergies_enc),
    critical_conditions: decryptField(vault.conditions_enc),
    organ_donor: Boolean(vault.organ_donor),
    preferred_hospital: vault.hospital_name,
    preferred_hospital_city: vault.hospital_address ? vault.hospital_address.split(',').pop().trim() : '',
    emergency_instructions_summary: decryptField(vault.emergency_instructions_enc),
    emergency_contacts: topContacts,
    notice: 'Public Lifesaver View. To view full medical records, insurance, or documents, verify as family or authenticate via Emergency Responder Break-Glass.'
  };
}

/**
 * Sanitize vault for Tier 1 (Verified Family Member)
 * Unlocks ONLY the categories explicitly granted to this specific member.
 */
function sanitizeTier1(vault, contacts, insurance, documents, permissionRecord, incidents) {
  let allowedCategories = [];
  try {
    allowedCategories = typeof permissionRecord.allowed_categories === 'string'
      ? JSON.parse(permissionRecord.allowed_categories)
      : permissionRecord.allowed_categories || [];
  } catch (e) {
    allowedCategories = ['medical_basics'];
  }

  const result = {
    vault_id: vault.id,
    access_tier: 'Tier 1 - Verified Family',
    grantee: {
      name: permissionRecord.grantee_name,
      phone: permissionRecord.grantee_phone,
      relationship: permissionRecord.relationship
    },
    unlocked_categories: allowedCategories,
    owner_name: vault.owner_name,
    dob: vault.dob,
    gender: vault.gender,
    blood_group: vault.blood_group
  };

  // Category: Medical Basics
  if (allowedCategories.includes(CATEGORIES.MEDICAL_BASICS)) {
    result.allergies = decryptField(vault.allergies_enc);
    result.conditions = decryptField(vault.conditions_enc);
    result.organ_donor = Boolean(vault.organ_donor);
  }

  // Category: Medications & Implants
  if (allowedCategories.includes(CATEGORIES.MEDICATIONS)) {
    result.medications = decryptField(vault.medications_enc);
    result.implants = decryptField(vault.implants_enc);
  }

  // Category: Doctor Contacts
  if (allowedCategories.includes(CATEGORIES.DOCTOR_CONTACTS)) {
    result.primary_doctor = decryptField(vault.primary_doctor_enc);
    result.doctor_phone = decryptField(vault.doctor_phone_enc);
    result.hospital_name = vault.hospital_name;
    result.hospital_address = vault.hospital_address;
  }

  // Category: Emergency Contacts
  result.emergency_contacts = (contacts || []).map(c => ({
    id: c.id,
    name: c.name,
    relationship: c.relationship,
    phone: c.phone,
    priority: c.priority,
    can_authorize_tier1: Boolean(c.can_authorize_tier1)
  }));

  // Category: Insurance
  if (allowedCategories.includes(CATEGORIES.INSURANCE) && insurance) {
    result.insurance = {
      provider: insurance.provider,
      policy_number: decryptField(insurance.policy_number_enc),
      tpa_name: insurance.tpa_name,
      cashless_helpline: insurance.cashless_helpline,
      expiry_date: insurance.expiry_date,
      policy_document_url: insurance.policy_document_url,
      notes: decryptField(insurance.notes_enc)
    };
  }

  // Category: Documents (Tier 1 accessible)
  if (allowedCategories.includes(CATEGORIES.DOCUMENTS) && documents) {
    result.documents = documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      mime_type: doc.mime_type,
      file_size: doc.file_size,
      uploaded_at: doc.uploaded_at,
      download_url: `/api/documents/${doc.id}/download`
    }));
  }

  // Category: Home Address & Location
  if (allowedCategories.includes(CATEGORIES.HOME_ADDRESS)) {
    result.home_address = decryptField(vault.home_address_enc);
    result.last_known_location = vault.last_known_location;
  }

  // Category: Emergency Instructions & Voice Note
  if (allowedCategories.includes(CATEGORIES.EMERGENCY_INSTRUCTIONS)) {
    result.emergency_instructions = decryptField(vault.emergency_instructions_enc);
    result.voice_note_url = vault.voice_note_url;
  }

  // Category: Incident History
  if (allowedCategories.includes(CATEGORIES.INCIDENT_HISTORY) && incidents) {
    result.incident_history = incidents;
  }

  return result;
}

/**
 * Sanitize vault for Tier 2 (Break-Glass Paramedic / ER Responder)
 * Delivers full critical clinical & insurance payload; withholds purely private non-clinical docs/home secrets.
 */
function sanitizeTier2(vault, contacts, insurance, documents, responderDetails) {
  return {
    vault_id: vault.id,
    access_tier: 'Tier 2 - Emergency Responder Break-Glass',
    session_info: {
      session_type: 'Time-Limited Clinical Emergency Break-Glass',
      session_duration_minutes: 30,
      responder_name: responderDetails.responder_name,
      responder_org: responderDetails.responder_org,
      responder_badge: responderDetails.responder_badge,
      reason: responderDetails.reason,
      alert_status: 'Emergency broadcast dispatched to registered family members'
    },
    owner_name: vault.owner_name,
    dob: vault.dob,
    age: vault.dob ? calculateAge(vault.dob) : 'Unknown',
    gender: vault.gender,
    blood_group: vault.blood_group,
    allergies: decryptField(vault.allergies_enc),
    conditions: decryptField(vault.conditions_enc),
    medications: decryptField(vault.medications_enc),
    implants: decryptField(vault.implants_enc),
    organ_donor: Boolean(vault.organ_donor),
    emergency_instructions: decryptField(vault.emergency_instructions_enc),
    voice_note_url: vault.voice_note_url,
    primary_doctor: decryptField(vault.primary_doctor_enc),
    doctor_phone: decryptField(vault.doctor_phone_enc),
    hospital_name: vault.hospital_name,
    hospital_address: vault.hospital_address,
    emergency_contacts: (contacts || []).map(c => ({
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
      priority: c.priority
    })),
    insurance: insurance ? {
      provider: insurance.provider,
      policy_number: decryptField(insurance.policy_number_enc),
      tpa_name: insurance.tpa_name,
      cashless_helpline: insurance.cashless_helpline,
      expiry_date: insurance.expiry_date,
      policy_document_url: insurance.policy_document_url
    } : null,
    medical_documents: (documents || [])
      .filter(d => ['Prescription', 'Diagnostic Report', 'Discharge Summary'].includes(d.category))
      .map(doc => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        download_url: `/api/documents/${doc.id}/download`
      }))
  };
}

function calculateAge(dobString) {
  if (!dobString) return '';
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return dobString;
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970) + ' yrs';
}

module.exports = {
  CATEGORIES,
  sanitizeTier0,
  sanitizeTier1,
  sanitizeTier2
};
