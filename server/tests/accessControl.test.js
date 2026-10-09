const test = require('node:test');
const assert = require('node:assert/strict');
const { encryptField } = require('../src/crypto');
const { sanitizeTier0, sanitizeTier1, sanitizeTier2, CATEGORIES } = require('../src/accessControl');

test('Access Control Matrix Tests', async (t) => {
  const mockVault = {
    id: 'AV-TEST-1',
    owner_name: 'Ramesh Patel',
    dob: '1958-04-12',
    gender: 'Male',
    blood_group: 'B+ve',
    allergies_enc: encryptField('Severe Penicillin Allergy'),
    conditions_enc: encryptField('Type-2 Diabetes Mellitus'),
    medications_enc: encryptField('Metformin 500mg, Aspirin 75mg'),
    implants_enc: encryptField('St. Jude Medical Dual-Chamber Pacemaker'),
    organ_donor: 1,
    primary_doctor_enc: encryptField('Dr. K. Mehta'),
    doctor_phone_enc: encryptField('+919825012345'),
    hospital_name: 'Shree Krishna Hospital',
    hospital_address: 'Karamsad, Anand, Gujarat',
    home_address_enc: encryptField('Farmhouse #4, Near Canal Road, Anand'),
    emergency_instructions_enc: encryptField('Give sugar candy if unconscious.')
  };

  const mockContacts = [
    { name: 'Suresh Patel', relationship: 'Son', phone: '+919825099991', priority: 1 },
    { name: 'Geeta Patel', relationship: 'Daughter', phone: '+919825099992', priority: 2 },
    { name: 'Distant Neighbor', relationship: 'Neighbor', phone: '+919825099993', priority: 3 }
  ];

  const mockInsurance = {
    provider: 'Star Health Senior Citizen',
    policy_number_enc: encryptField('SH-8849-2048-01'),
    tpa_name: 'Medi Assist',
    cashless_helpline: '1800-425-2255',
    expiry_date: '2027-03-31'
  };

  const mockDocs = [
    { id: 'doc-1', title: 'Pacemaker ID Card', category: 'Diagnostic Report' },
    { id: 'doc-2', title: 'Property Will / Legal Proof', category: 'Legal' }
  ];

  await t.test('Tier 0 (Public Scanner) MUST NOT leak medications, insurance, address, or non-critical docs', () => {
    const tier0 = sanitizeTier0(mockVault, mockContacts);

    // Allowed in Tier 0
    assert.equal(tier0.owner_name, 'Ramesh Patel');
    assert.equal(tier0.blood_group, 'B+ve');
    assert.equal(tier0.critical_allergies, 'Severe Penicillin Allergy');
    assert.equal(tier0.critical_conditions, 'Type-2 Diabetes Mellitus');
    assert.equal(tier0.organ_donor, true);
    assert.equal(tier0.emergency_contacts.length, 2, 'Must only expose top 2 emergency contacts to public');

    // Forbidden in Tier 0 - STRICT DENIAL CHECKS
    assert.equal(tier0.medications, undefined, 'Medications must NOT be exposed in Tier 0');
    assert.equal(tier0.implants, undefined, 'Implants must NOT be exposed in Tier 0');
    assert.equal(tier0.home_address, undefined, 'Home address must NOT be exposed in Tier 0');
    assert.equal(tier0.insurance, undefined, 'Insurance policy numbers must NOT be exposed in Tier 0');
    assert.equal(tier0.documents, undefined, 'Document repository must NOT be exposed in Tier 0');
  });

  await t.test('Tier 1 (Verified Family) respects granular permission matrix', () => {
    // Permission record with ONLY medical_basics and insurance (NO home_address or documents)
    const permission = {
      grantee_name: 'Suresh Patel',
      grantee_phone: '+919825099991',
      relationship: 'Son',
      allowed_categories: JSON.stringify([CATEGORIES.MEDICAL_BASICS, CATEGORIES.INSURANCE])
    };

    const tier1 = sanitizeTier1(mockVault, mockContacts, mockInsurance, mockDocs, permission, []);

    assert.equal(tier1.allergies, 'Severe Penicillin Allergy');
    assert.ok(tier1.insurance, 'Insurance must be included since permission was granted');
    assert.equal(tier1.insurance.policy_number, 'SH-8849-2048-01');

    // Withheld because not in allowed_categories
    assert.equal(tier1.home_address, undefined, 'Home address was not granted, must remain hidden');
    assert.equal(tier1.documents, undefined, 'Documents were not granted, must remain hidden');
  });

  await t.test('Tier 2 (Break-Glass Paramedic) unlocks clinical emergency fields and excludes private legal records', () => {
    const responderDetails = {
      responder_name: 'EMT Rajesh',
      responder_org: '108 GVK EMRI',
      responder_badge: 'EMT-4821',
      reason: 'Trauma accident unconscious'
    };

    const tier2 = sanitizeTier2(mockVault, mockContacts, mockInsurance, mockDocs, responderDetails);

    assert.equal(tier2.access_tier, 'Tier 2 - Emergency Responder Break-Glass');
    assert.equal(tier2.medications, 'Metformin 500mg, Aspirin 75mg');
    assert.equal(tier2.implants, 'St. Jude Medical Dual-Chamber Pacemaker');
    assert.equal(tier2.insurance.policy_number, 'SH-8849-2048-01');
    assert.equal(tier2.medical_documents.length, 1, 'Only clinical/diagnostic docs should be exposed, not private legal docs');
    assert.equal(tier2.medical_documents[0].category, 'Diagnostic Report');
    assert.equal(tier2.session_info.session_duration_minutes, 30);
  });
});
