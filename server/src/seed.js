const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet, initSchema } = require('./db');
const { encryptField, hashValue } = require('./crypto');

async function seedData() {
  await initSchema();

  // Check if Ramesh Patel already exists
  const existingRamesh = await dbGet('SELECT id FROM vaults WHERE id = ?', ['AV-8842']);
  if (existingRamesh) {
    console.log('Seed data already present. Skipping re-seed.');
    return;
  }

  console.log('Seeding initial clinical personas...');

  // ==========================================
  // Persona 1: Ramesh Patel (Elderly Rural User)
  // ==========================================
  const rameshUserId = 'user-ramesh-patel-001';
  await dbRun(
    `INSERT INTO users (id, phone, name, pin_hash, role, language)
     VALUES (?, ?, ?, ?, 'owner', 'gu')`,
    [rameshUserId, '+919825099990', 'Ramesh Patel', hashValue('1234')]
  );

  const rameshOfflinePayload = JSON.stringify({
    v: 'AV-8842',
    n: 'Ramesh Patel',
    bg: 'B+ve',
    al: 'Severe Penicillin Allergy',
    c1: 'Suresh (Son):+919825099991',
    c2: 'Geeta (Daughter):+919825099992',
    od: 1,
    url: 'https://aapatvault.in/e/AV-8842'
  });

  await dbRun(
    `INSERT INTO vaults (
      id, owner_id, owner_name, dob, gender, blood_group,
      allergies_enc, conditions_enc, medications_enc, implants_enc, organ_donor,
      primary_doctor_enc, doctor_phone_enc, hospital_name, hospital_address,
      home_address_enc, last_known_location, emergency_instructions_enc,
      voice_note_url, offline_qr_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'AV-8842',
      rameshUserId,
      'Ramesh Patel',
      '1958-04-12',
      'Male',
      'B+ve',
      encryptField('Severe Penicillin Allergy (Anaphylaxis shock risk)'),
      encryptField('Type-2 Diabetes Mellitus (prone to hypoglycemic fainting), Hypertension'),
      encryptField('Metformin 500mg (twice daily), Telmisartan 40mg (morning), Aspirin 75mg'),
      encryptField('St. Jude Medical Dual-Chamber Pacemaker (Implanted 2021) - MRI Conditional only with protocol'),
      1, // Organ donor
      encryptField('Dr. K. Mehta (Cardiologist)'),
      encryptField('+919825012345'),
      'Shree Krishna Hospital',
      'Gokal Nagar, Karamsad, Anand, Gujarat 388325',
      encryptField('Farmhouse #4, Near Canal Road, Mogar Village, Anand District, Gujarat'),
      'Anand Railway Station Junction',
      encryptField('If found sweating profusely, disoriented or unconscious, administer sugar candy/glucose immediately. Do NOT inject penicillin. Contact son Suresh immediately.'),
      'https://aapatvault.in/audio/ramesh_voice_instruction.mp3',
      rameshOfflinePayload
    ]
  );

  // Ramesh's Emergency Contacts
  await dbRun(
    `INSERT INTO emergency_contacts (id, vault_id, name, relationship, phone, priority, notify_on_access, can_authorize_tier1)
     VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
    [uuidv4(), 'AV-8842', 'Suresh Patel', 'Son (Primary Guardian)', '+919825099991', 1]
  );
  await dbRun(
    `INSERT INTO emergency_contacts (id, vault_id, name, relationship, phone, priority, notify_on_access, can_authorize_tier1)
     VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
    [uuidv4(), 'AV-8842', 'Geeta Patel', 'Daughter', '+919825099992', 2]
  );

  // Ramesh's Insurance
  await dbRun(
    `INSERT INTO insurance_details (id, vault_id, provider, policy_number_enc, tpa_name, cashless_helpline, expiry_date, policy_document_url, notes_enc)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
      'AV-8842',
      'Star Health Senior Citizen Red Carpet',
      encryptField('SH-8849-2048-01'),
      'Medi Assist India TPA',
      '1800-425-2255 / 044-28288800',
      '2027-03-31',
      '/api/documents/doc-ramesh-ins/download',
      encryptField('Cashless pre-authorization required within 24 hrs of emergency hospital admission.')
    ]
  );

  // Ramesh's Access Permissions
  await dbRun(
    `INSERT INTO access_permissions (id, vault_id, grantee_phone, grantee_name, relationship, role, allowed_categories)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
      'AV-8842',
      '+919825099991',
      'Suresh Patel',
      'Son',
      'primary_guardian',
      JSON.stringify(['medical_basics', 'medications', 'doctor_contacts', 'insurance', 'documents', 'home_address', 'emergency_instructions', 'incident_history'])
    ]
  );

  // Ramesh's Documents
  await dbRun(
    `INSERT INTO documents (id, vault_id, title, category, file_path, mime_type, file_size, tier_required, checksum)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    ['doc-ramesh-card', 'AV-8842', 'Pacemaker Implant Identification Card', 'Diagnostic Report', 'uploads/ramesh/pacemaker.pdf', 'application/pdf', 184000, 'chk-pacemaker-8842']
  );
  await dbRun(
    `INSERT INTO documents (id, vault_id, title, category, file_path, mime_type, file_size, tier_required, checksum)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    ['doc-ramesh-ecg', 'AV-8842', 'Recent 2D-Echocardiogram & Cardiac Summary', 'Diagnostic Report', 'uploads/ramesh/echo_2025.pdf', 'application/pdf', 312000, 'chk-echo-8842']
  );

  // Ramesh's Past Incident History
  await dbRun(
    `INSERT INTO incident_history (id, vault_id, incident_date, summary, hospital, attending_staff, notes)
     VALUES (?, ?, '2024-11-14 14:30:00', 'Mild Hypoglycemia episode during summer farm work', 'Civil Hospital Anand', 'Dr. J. Joshi', 'Recovered within 20 mins with IV 25% Dextrose. Blood sugar was 48 mg/dL.')`,
    [uuidv4(), 'AV-8842']
  );


  // ==========================================
  // Persona 2: Priya Sharma (Tech-Savvy Urban)
  // ==========================================
  const priyaUserId = 'user-priya-sharma-002';
  await dbRun(
    `INSERT INTO users (id, phone, name, pin_hash, role, language)
     VALUES (?, ?, ?, ?, 'owner', 'en')`,
    [priyaUserId, '+919845099990', 'Priya Sharma', hashValue('4321')]
  );

  const priyaOfflinePayload = JSON.stringify({
    v: 'AV-7721',
    n: 'Priya Sharma',
    bg: 'O-ve',
    al: 'Sulfa Drugs / Bactrim',
    c1: 'Rahul (Brother):+919845099991',
    c2: 'Ananya (Flatmate):+919845099992',
    od: 1,
    url: 'https://aapatvault.in/e/AV-7721'
  });

  await dbRun(
    `INSERT INTO vaults (
      id, owner_id, owner_name, dob, gender, blood_group,
      allergies_enc, conditions_enc, medications_enc, implants_enc, organ_donor,
      primary_doctor_enc, doctor_phone_enc, hospital_name, hospital_address,
      home_address_enc, last_known_location, emergency_instructions_enc,
      voice_note_url, offline_qr_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'AV-7721',
      priyaUserId,
      'Priya Sharma',
      '1997-09-18',
      'Female',
      'O-ve', // Rare Universal donor
      encryptField('Sulfa Drugs (Sulfonamides), NSAIDs cause severe urticaria'),
      encryptField('Mild Asthma (exercise-induced), Titanium Plate in Left Ankle (2022)'),
      encryptField('Budesonide + Formoterol Inhaler (PRN), Montelukast 10mg'),
      encryptField('Titanium bone plate in left fibula (MRI Safe)'),
      1,
      encryptField('Dr. Radhika Rao (Pulmonologist)'),
      encryptField('+919845012345'),
      'Fortis Hospital, Bannerghatta Road',
      '154/9, Bannerghatta Main Rd, Opposite IIMB, Bengaluru, Karnataka 560076',
      encryptField('Flat 402, Greenwoods Apartments, 17th Cross, HSR Layout Sector 3, Bengaluru'),
      'HSR Layout BDA Complex',
      encryptField('Asthma inhaler is kept in front zipper of my backpack. Administer 2 puffs if wheezing. Blood group is O-negative (universal donor). Contact brother Rahul immediately.'),
      'https://aapatvault.in/audio/priya_voice_instruction.mp3',
      priyaOfflinePayload
    ]
  );

  // Priya's Emergency Contacts
  await dbRun(
    `INSERT INTO emergency_contacts (id, vault_id, name, relationship, phone, priority, notify_on_access, can_authorize_tier1)
     VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
    [uuidv4(), 'AV-7721', 'Rahul Sharma', 'Brother', '+919845099991', 1]
  );
  await dbRun(
    `INSERT INTO emergency_contacts (id, vault_id, name, relationship, phone, priority, notify_on_access, can_authorize_tier1)
     VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
    [uuidv4(), 'AV-7721', 'Ananya Sen', 'Flatmate / Close Friend', '+919845099992', 2]
  );

  // Priya's Insurance
  await dbRun(
    `INSERT INTO insurance_details (id, vault_id, provider, policy_number_enc, tpa_name, cashless_helpline, expiry_date, policy_document_url, notes_enc)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
      'AV-7721',
      'HDFC ERGO Optima Secure',
      encryptField('HE-7738-2910-88'),
      'HDFC Health Care Direct',
      '1800-266-6400',
      '2027-08-15',
      '/api/documents/doc-priya-ins/download',
      encryptField('Sum insured: 25 Lakhs. Corporate top-up active.')
    ]
  );

  // Priya's Permissions
  await dbRun(
    `INSERT INTO access_permissions (id, vault_id, grantee_phone, grantee_name, relationship, role, allowed_categories)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
      'AV-7721',
      '+919845099991',
      'Rahul Sharma',
      'Brother',
      'primary_guardian',
      JSON.stringify(['medical_basics', 'medications', 'doctor_contacts', 'insurance', 'documents', 'home_address', 'emergency_instructions', 'incident_history'])
    ]
  );

  // Priya's Documents
  await dbRun(
    `INSERT INTO documents (id, vault_id, title, category, file_path, mime_type, file_size, tier_required, checksum)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    ['doc-priya-ins', 'AV-7721', 'HDFC ERGO Health Card & Policy Schedule', 'Insurance', 'uploads/priya/hdfc_card.pdf', 'application/pdf', 142000, 'chk-ins-7721']
  );
  await dbRun(
    `INSERT INTO documents (id, vault_id, title, category, file_path, mime_type, file_size, tier_required, checksum)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    ['doc-priya-rx', 'AV-7721', 'Current Asthma Prescription & Pulmonary Report', 'Prescription', 'uploads/priya/inhaler_rx.pdf', 'application/pdf', 98000, 'chk-rx-7721']
  );

  console.log('Seed database ready with Ramesh Patel (AV-8842) and Priya Sharma (AV-7721)!');
}

module.exports = { seedData };

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
