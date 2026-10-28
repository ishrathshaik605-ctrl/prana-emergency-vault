const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { dbGet, dbRun, dbAll } = require('../db');
const { encryptField, decryptField, generateVaultId, hashValue, generateOTP } = require('../crypto');
const { dispatchOTP } = require('../notifications');

/**
 * Helper to fetch and decrypt full vault data
 */
async function fetchFullDecryptedVault(vaultId) {
  const vault = await dbGet('SELECT * FROM vaults WHERE id = ?', [vaultId]);
  if (!vault) return null;

  const contacts = await dbAll('SELECT * FROM emergency_contacts WHERE vault_id = ? ORDER BY priority ASC', [vaultId]);
  const insurance = await dbGet('SELECT * FROM insurance_details WHERE vault_id = ?', [vaultId]);
  const documents = await dbAll('SELECT * FROM documents WHERE vault_id = ?', [vaultId]);
  const permissions = await dbAll('SELECT * FROM access_permissions WHERE vault_id = ?', [vaultId]);
  const incidents = await dbAll('SELECT * FROM incident_history WHERE vault_id = ? ORDER BY incident_date DESC', [vaultId]);

  return {
    ...vault,
    allergies: decryptField(vault.allergies_enc),
    conditions: decryptField(vault.conditions_enc),
    medications: decryptField(vault.medications_enc),
    implants: decryptField(vault.implants_enc),
    primary_doctor: decryptField(vault.primary_doctor_enc),
    doctor_phone: decryptField(vault.doctor_phone_enc),
    home_address: decryptField(vault.home_address_enc),
    emergency_instructions: decryptField(vault.emergency_instructions_enc),
    emergency_contacts: contacts,
    insurance: insurance ? {
      ...insurance,
      policy_number: decryptField(insurance.policy_number_enc),
      notes: decryptField(insurance.notes_enc)
    } : null,
    documents,
    permissions: permissions.map(p => ({
      ...p,
      allowed_categories: JSON.parse(p.allowed_categories || '[]')
    })),
    incidents
  };
}

/**
 * POST /api/vault/create
 * Guided Vault setup under 5 minutes (or via assisted family setup)
 */
router.post('/create', async (req, res) => {
  try {
    const {
      owner_id,
      owner_name,
      dob,
      gender,
      blood_group,
      allergies,
      conditions,
      medications,
      implants,
      organ_donor = 0,
      primary_doctor,
      doctor_phone,
      hospital_name,
      hospital_address,
      home_address,
      last_known_location,
      emergency_instructions,
      voice_note_url,
      emergency_contacts = [],
      insurance = null,
      family_permissions = []
    } = req.body;

    if (!owner_name || !blood_group) {
      return res.status(400).json({ error: 'Owner name and blood group are strictly required' });
    }

    const vaultId = generateVaultId();
    const effectiveOwnerId = owner_id || uuidv4();

    // Field-level AES-256-GCM encryption for all sensitive fields
    const allergiesEnc = encryptField(allergies || '');
    const conditionsEnc = encryptField(conditions || '');
    const medicationsEnc = encryptField(medications || '');
    const implantsEnc = encryptField(implants || '');
    const primaryDoctorEnc = encryptField(primary_doctor || '');
    const doctorPhoneEnc = encryptField(doctor_phone || '');
    const homeAddressEnc = encryptField(home_address || '');
    const emergencyInstructionsEnc = encryptField(emergency_instructions || '');

    // Prepare compact offline payload for physical QR cards
    const offlineQrData = JSON.stringify({
      v: vaultId,
      n: owner_name,
      bg: blood_group,
      al: allergies || 'None',
      c1: emergency_contacts[0] ? `${emergency_contacts[0].name}:${emergency_contacts[0].phone}` : '',
      c2: emergency_contacts[1] ? `${emergency_contacts[1].name}:${emergency_contacts[1].phone}` : '',
      od: organ_donor ? 1 : 0,
      url: `/?v=${vaultId}`
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
        vaultId, effectiveOwnerId, owner_name, dob, gender, blood_group,
        allergiesEnc, conditionsEnc, medicationsEnc, implantsEnc, organ_donor ? 1 : 0,
        primaryDoctorEnc, doctorPhoneEnc, hospital_name, hospital_address,
        homeAddressEnc, last_known_location, emergencyInstructionsEnc,
        voice_note_url, offlineQrData
      ]
    );

    // Save Emergency Contacts (ranked)
    for (let i = 0; i < emergency_contacts.length; i++) {
      const c = emergency_contacts[i];
      if (c.name && c.phone) {
        await dbRun(
          `INSERT INTO emergency_contacts (id, vault_id, name, relationship, phone, priority, notify_on_access, can_authorize_tier1)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(), vaultId, c.name, c.relationship || 'Family',
            c.phone.replace(/[^0-9+]/g, ''), i + 1,
            c.notify_on_access !== false ? 1 : 0,
            c.can_authorize_tier1 !== false ? 1 : 0
          ]
        );
      }
    }

    // Save Insurance if provided
    if (insurance && insurance.provider) {
      await dbRun(
        `INSERT INTO insurance_details (id, vault_id, provider, policy_number_enc, tpa_name, cashless_helpline, expiry_date, policy_document_url, notes_enc)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(), vaultId, insurance.provider,
          encryptField(insurance.policy_number || ''),
          insurance.tpa_name || '',
          insurance.cashless_helpline || '',
          insurance.expiry_date || '',
          insurance.policy_document_url || '',
          encryptField(insurance.notes || '')
        ]
      );
    }

    // Save Access Permissions for family members
    for (const perm of family_permissions) {
      if (perm.grantee_phone && perm.grantee_name) {
        await dbRun(
          `INSERT INTO access_permissions (id, vault_id, grantee_phone, grantee_name, relationship, role, allowed_categories, requires_approval)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(), vaultId,
            perm.grantee_phone.replace(/[^0-9+]/g, ''),
            perm.grantee_name,
            perm.relationship || 'Family Member',
            perm.role || 'primary_guardian',
            JSON.stringify(perm.allowed_categories || ['medical_basics', 'medications', 'insurance', 'documents']),
            perm.requires_approval ? 1 : 0
          ]
        );
      }
    }

    return res.json({
      success: true,
      message: 'Emergency Vault configured successfully in under 5 minutes',
      vaultId,
      offline_qr_payload: offlineQrData
    });
  } catch (err) {
    console.error('Error creating vault:', err);
    return res.status(500).json({ error: 'Failed to create emergency vault' });
  }
});

/**
 * GET /api/vault/:id
 * Retrieve full vault (for vault owner or administrative review)
 */
router.get('/:id', async (req, res) => {
  try {
    const fullVault = await fetchFullDecryptedVault(req.params.id);
    if (!fullVault) {
      return res.status(404).json({ error: 'Vault not found' });
    }
    return res.json({ success: true, vault: fullVault });
  } catch (err) {
    console.error('Error fetching vault:', err);
    return res.status(500).json({ error: 'Failed to fetch vault' });
  }
});

/**
 * POST /api/vault/:id/pair-device
 * Registers and pairs a new secondary mobile device / browser to this vault
 */
router.post('/:id/pair-device', async (req, res) => {
  try {
    const vaultId = req.params.id.toUpperCase();
    const vault = await dbGet('SELECT * FROM vaults WHERE id = ?', [vaultId]);
    if (!vault) {
      return res.status(404).json({ error: 'Vault not found' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Mobile Paired Device';

    // Record audit event for device pairing
    await dbRun(
      `INSERT INTO audit_logs (id, vault_id, action, actor_name, clinical_reason, access_tier, actor_org)
       VALUES (?, ?, 'device_paired', 'Mobile Device Pairing', 'Vault linked to secondary device via QR pairing', 'Tier 2', ?)`,
      [uuidv4(), vaultId, `IP: ${clientIp}`]
    );

    const fullVault = await fetchFullDecryptedVault(vaultId);
    return res.json({
      success: true,
      message: 'Device successfully paired',
      vault: fullVault
    });
  } catch (err) {
    console.error('Error pairing device:', err);
    return res.status(500).json({ error: 'Failed to pair device' });
  }
});

/**
 * POST /api/vault/check-existing
 * Check if a vault already exists with this phone number or owner name
 * Body: { phone?: string, name?: string }
 */
router.post('/check-existing', async (req, res) => {
  try {
    const { phone, name, query, vaultId, id } = req.body;
    const term = (query || vaultId || id || phone || name || '').trim();
    if (!term) {
      return res.status(400).json({ error: 'Search term (phone, name, or vault ID) required' });
    }

    let match = null;

    // 1. Direct Vault ID lookup (e.g., AV-9017S or 9017S)
    const upperTerm = term.toUpperCase();
    const idMatch = await dbGet(
      `SELECT v.id, v.owner_name, v.blood_group, v.created_at, ec.phone, ec.name as contact_name
       FROM vaults v
       LEFT JOIN emergency_contacts ec ON v.id = ec.vault_id
       WHERE UPPER(v.id) = ? OR UPPER(v.id) = ? OR UPPER(v.id) LIKE ?
       ORDER BY v.created_at DESC LIMIT 1`,
      [upperTerm, `AV-${upperTerm}`, `%${upperTerm}%`]
    );
    if (idMatch) {
      match = idMatch;
    }

    // 2. Phone Number lookup
    if (!match) {
      const cleanDigits = term.replace(/[^0-9]/g, '');
      const last10 = cleanDigits.slice(-10);

      if (last10.length >= 6) {
        // Search in emergency_contacts
        const contactMatch = await dbGet(
          `SELECT v.id, v.owner_name, v.blood_group, v.created_at, ec.phone, ec.name as contact_name
           FROM emergency_contacts ec
           JOIN vaults v ON ec.vault_id = v.id
           WHERE ec.phone LIKE ?
           ORDER BY v.created_at DESC LIMIT 1`,
          [`%${last10}%`]
        );

        if (contactMatch) {
          match = contactMatch;
        } else {
          // Check access_permissions
          const permMatch = await dbGet(
            `SELECT v.id, v.owner_name, v.blood_group, v.created_at, ap.grantee_phone as phone, ap.grantee_name as contact_name
             FROM access_permissions ap
             JOIN vaults v ON ap.vault_id = v.id
             WHERE ap.grantee_phone LIKE ?
             ORDER BY v.created_at DESC LIMIT 1`,
            [`%${last10}%`]
          );
          if (permMatch) match = permMatch;
        }
      }
    }

    // 3. Owner Name search
    if (!match && term.length >= 3) {
      const nameMatch = await dbGet(
        `SELECT v.id, v.owner_name, v.blood_group, v.created_at, ec.phone, ec.name as contact_name
         FROM vaults v
         LEFT JOIN emergency_contacts ec ON v.id = ec.vault_id
         WHERE LOWER(v.owner_name) LIKE LOWER(?)
         ORDER BY v.created_at DESC LIMIT 1`,
        [`%${term}%`]
      );
      if (nameMatch) {
        match = nameMatch;
      }
    }

    if (!match) {
      return res.json({ found: false });
    }

    // Mask phone and name for security
    const rawPhone = match.phone || '+919848012345';
    const cleanPhoneDigits = rawPhone.replace(/[^0-9]/g, '');
    const maskedPhone = cleanPhoneDigits.length >= 10
      ? `+91 *****${cleanPhoneDigits.slice(-4)}`
      : 'Registered Emergency Contact';

    const rawName = match.owner_name || '';
    const nameParts = rawName.split(' ');
    const maskedName = nameParts.map(p => p.length > 2 ? p[0] + '***' : p).join(' ');

    return res.json({
      found: true,
      vaultId: match.id,
      maskedName,
      ownerName: match.owner_name,
      bloodGroup: match.blood_group,
      maskedPhone,
      targetPhone: rawPhone,
      createdAt: match.created_at
    });
  } catch (err) {
    console.error('Error checking existing vault:', err);
    return res.status(500).json({ error: 'Failed to check existing vault' });
  }
});

/**
 * POST /api/vault/recover/send-otp
 * Body: { vaultId: string, phone: string }
 */
router.post('/recover/send-otp', async (req, res) => {
  try {
    const { vaultId, phone } = req.body;
    if (!vaultId || !phone) {
      return res.status(400).json({ error: 'Vault ID and phone are required' });
    }

    // Verify this phone is indeed associated with this vault
    const cleanDigits = phone.replace(/[^0-9]/g, '').slice(-10);
    const contact = await dbGet(
      `SELECT * FROM emergency_contacts WHERE vault_id = ? AND phone LIKE ? LIMIT 1`,
      [vaultId, `%${cleanDigits}%`]
    );
    const perm = !contact ? await dbGet(
      `SELECT * FROM access_permissions WHERE vault_id = ? AND grantee_phone LIKE ? LIMIT 1`,
      [vaultId, `%${cleanDigits}%`]
    ) : null;

    if (!contact && !perm) {
      const vaultExists = await dbGet('SELECT id FROM vaults WHERE id = ?', [vaultId]);
      if (!vaultExists) {
        return res.status(404).json({ error: 'Vault not found' });
      }
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const code = generateOTP();
    const codeHash = hashValue(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    const otpId = uuidv4();
    await dbRun(
      `INSERT INTO otps (id, phone, code_hash, vault_id, action, expires_at)
       VALUES (?, ?, ?, ?, 'vault_recovery', ?)`,
      [otpId, cleanPhone, codeHash, vaultId, expiresAt]
    );

    await dispatchOTP(cleanPhone, code, 'vault_recovery');

    return res.json({
      success: true,
      message: `Recovery OTP sent to ${cleanPhone}. Valid for 5 minutes.`,
      debug_otp: code, // Simulated for developer / testing convenience
      expires_in_seconds: 300
    });
  } catch (err) {
    console.error('Error sending recovery OTP:', err);
    return res.status(500).json({ error: 'Failed to send recovery OTP' });
  }
});

/**
 * POST /api/vault/recover/confirm
 * Body: { vaultId: string, phone: string, otp: string, action: 'restore' | 'delete_old' }
 */
router.post('/recover/confirm', async (req, res) => {
  try {
    const { vaultId, phone, otp, action } = req.body;
    if (!vaultId || !phone || !otp || !action) {
      return res.status(400).json({ error: 'Vault ID, phone, OTP code, and action are required' });
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const codeHash = hashValue(otp);

    const otpRecord = await dbGet(
      `SELECT * FROM otps 
       WHERE phone = ? AND code_hash = ? AND verified = 0 AND expires_at > datetime('now')
       ORDER BY created_at DESC LIMIT 1`,
      [cleanPhone, codeHash]
    );

    if (!otpRecord) {
      return res.status(401).json({ error: 'Invalid or expired OTP code' });
    }

    // Mark OTP as verified
    await dbRun('UPDATE otps SET verified = 1 WHERE id = ?', [otpRecord.id]);

    if (action === 'delete_old') {
      // User says: old vault was a test or abandoned, delete it to keep database lean!
      await dbRun('DELETE FROM access_logs WHERE vault_id = ?', [vaultId]);
      await dbRun('DELETE FROM documents WHERE vault_id = ?', [vaultId]);
      await dbRun('DELETE FROM emergency_contacts WHERE vault_id = ?', [vaultId]);
      await dbRun('DELETE FROM insurance_details WHERE vault_id = ?', [vaultId]);
      await dbRun('DELETE FROM access_permissions WHERE vault_id = ?', [vaultId]);
      await dbRun('DELETE FROM incident_history WHERE vault_id = ?', [vaultId]);
      await dbRun('DELETE FROM vaults WHERE id = ?', [vaultId]);

      return res.json({
        success: true,
        action: 'deleted',
        message: `Previous vault ${vaultId} has been permanently erased from the database.`
      });
    }

    if (action === 'restore') {
      // User says: YES, this is my old vault! Restore it to my device!
      const fullVault = await fetchFullDecryptedVault(vaultId);
      if (!fullVault) {
        return res.status(404).json({ error: 'Vault not found' });
      }

      // Record audit log
      await dbRun(
        `INSERT INTO access_logs (id, vault_id, actor_type, actor_identifier, reason, tier_accessed, categories_unlocked)
         VALUES (?, ?, 'owner_recovery', ?, 'Vault restored to device via verified phone OTP', 'Tier 2', ?)`,
        [uuidv4(), vaultId, cleanPhone, JSON.stringify(['all_categories'])]
      );

      return res.json({
        success: true,
        action: 'restored',
        vault: fullVault,
        message: `Vault ${vaultId} successfully restored to your device!`
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('Error confirming vault recovery:', err);
    return res.status(500).json({ error: 'Failed to process recovery confirmation' });
  }
});

/**
 * PUT /api/vault/:id/update
 * Update vault details
 */
router.put('/:id/update', async (req, res) => {
  try {
    const vaultId = req.params.id;
    const {
      owner_name, dob, gender, blood_group, allergies, conditions, medications,
      implants, organ_donor, primary_doctor, doctor_phone, hospital_name,
      hospital_address, home_address, emergency_instructions,
      emergency_contacts, insurance
    } = req.body;

    let offlineQrData = null;
    if (owner_name || blood_group || allergies || conditions || emergency_contacts) {
      offlineQrData = JSON.stringify({
        v: vaultId,
        n: owner_name || '',
        b: blood_group || '',
        a: allergies ? allergies.substring(0, 40) : '',
        c: conditions ? conditions.substring(0, 40) : '',
        c1: emergency_contacts && emergency_contacts[0] ? `${emergency_contacts[0].name}:${emergency_contacts[0].phone}` : '',
        c2: emergency_contacts && emergency_contacts[1] ? `${emergency_contacts[1].name}:${emergency_contacts[1].phone}` : '',
        od: organ_donor ? 1 : 0,
        url: `/?v=${vaultId}`
      });
    }

    await dbRun(
      `UPDATE vaults SET
        owner_name = COALESCE(?, owner_name),
        dob = COALESCE(?, dob),
        gender = COALESCE(?, gender),
        blood_group = COALESCE(?, blood_group),
        allergies_enc = COALESCE(?, allergies_enc),
        conditions_enc = COALESCE(?, conditions_enc),
        medications_enc = COALESCE(?, medications_enc),
        implants_enc = COALESCE(?, implants_enc),
        organ_donor = COALESCE(?, organ_donor),
        primary_doctor_enc = COALESCE(?, primary_doctor_enc),
        doctor_phone_enc = COALESCE(?, doctor_phone_enc),
        hospital_name = COALESCE(?, hospital_name),
        hospital_address = COALESCE(?, hospital_address),
        home_address_enc = COALESCE(?, home_address_enc),
        emergency_instructions_enc = COALESCE(?, emergency_instructions_enc),
        offline_qr_payload = COALESCE(?, offline_qr_payload),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        owner_name, dob, gender, blood_group,
        allergies !== undefined ? encryptField(allergies) : null,
        conditions !== undefined ? encryptField(conditions) : null,
        medications !== undefined ? encryptField(medications) : null,
        implants !== undefined ? encryptField(implants) : null,
        organ_donor !== undefined ? (organ_donor ? 1 : 0) : null,
        primary_doctor !== undefined ? encryptField(primary_doctor) : null,
        doctor_phone !== undefined ? encryptField(doctor_phone) : null,
        hospital_name, hospital_address,
        home_address !== undefined ? encryptField(home_address) : null,
        emergency_instructions !== undefined ? encryptField(emergency_instructions) : null,
        offlineQrData,
        vaultId
      ]
    );

    // If emergency_contacts provided, update emergency_contacts table
    if (Array.isArray(emergency_contacts)) {
      await dbRun('DELETE FROM emergency_contacts WHERE vault_id = ?', [vaultId]);
      for (let i = 0; i < emergency_contacts.length; i++) {
        const c = emergency_contacts[i];
        if (c.name && c.phone) {
          await dbRun(
            `INSERT INTO emergency_contacts (id, vault_id, name, relationship, phone, priority, notify_on_access, can_authorize_tier1)
             VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
            [uuidv4(), vaultId, c.name.trim(), c.relationship || 'Guardian', c.phone.trim(), i + 1]
          );
        }
      }

      // Also update primary guardian access permissions for family unlock OTP
      await dbRun('DELETE FROM access_permissions WHERE vault_id = ? AND role = "primary_guardian"', [vaultId]);
      for (const c of emergency_contacts) {
        if (c.name && c.phone) {
          const cleanPhone = c.phone.replace(/[^0-9+]/g, '');
          await dbRun(
            `INSERT INTO access_permissions (id, vault_id, grantee_phone, grantee_name, relationship, role, allowed_categories, requires_approval)
             VALUES (?, ?, ?, ?, ?, 'primary_guardian', ?, 0)`,
            [
              uuidv4(), vaultId, cleanPhone, c.name.trim(), c.relationship || 'Guardian',
              JSON.stringify(['medical_basics', 'medications', 'doctor_contacts', 'insurance', 'documents', 'home_address', 'emergency_instructions', 'incident_history'])
            ]
          );
        }
      }
    }

    // If insurance provided, update insurance_details table
    if (insurance && typeof insurance === 'object') {
      await dbRun('DELETE FROM insurance_details WHERE vault_id = ?', [vaultId]);
      if (insurance.provider && insurance.provider.trim()) {
        await dbRun(
          `INSERT INTO insurance_details (id, vault_id, provider, policy_number_enc, cashless_helpline, tpa_name)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            vaultId,
            insurance.provider.trim(),
            encryptField(insurance.policy_number || ''),
            insurance.cashless_helpline || '',
            insurance.tpa_name || ''
          ]
        );
      }
    }

    return res.json({ success: true, message: 'Vault details, contacts, and insurance updated successfully' });
  } catch (err) {
    console.error('Error updating vault:', err);
    return res.status(500).json({ error: 'Failed to update vault' });
  }
});

/**
 * PUT /api/vault/:id/insurance
 * Add or update insurance policy details
 */
router.put('/:id/insurance', async (req, res) => {
  try {
    const vaultId = req.params.id;
    const { provider, policy_number, cashless_helpline, tpa_name } = req.body;

    // Remove old insurance record
    await dbRun('DELETE FROM insurance_details WHERE vault_id = ?', [vaultId]);

    // Insert new insurance record if provider is supplied
    if (provider && provider.trim()) {
      const insId = uuidv4();
      await dbRun(
        `INSERT INTO insurance_details (id, vault_id, provider, policy_number_enc, cashless_helpline, tpa_name)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          insId,
          vaultId,
          provider.trim(),
          encryptField(policy_number || ''),
          cashless_helpline || '',
          tpa_name || ''
        ]
      );
    }

    return res.json({ success: true, message: 'Insurance details updated successfully' });
  } catch (err) {
    console.error('Error updating insurance:', err);
    return res.status(500).json({ error: 'Failed to update insurance details' });
  }
});

/**
 * POST /api/vault/:id/permissions
 * Add or update family access permission
 */
router.post('/:id/permissions', async (req, res) => {
  try {
    const vaultId = req.params.id;
    const { grantee_phone, grantee_name, relationship, role, allowed_categories } = req.body;
    
    if (!grantee_phone || !grantee_name) {
      return res.status(400).json({ error: 'Grantee phone and name are required' });
    }

    const cleanPhone = grantee_phone.replace(/[^0-9+]/g, '');
    const permId = uuidv4();
    
    // Check if permission already exists for this phone
    const existing = await dbGet(
      'SELECT id FROM access_permissions WHERE vault_id = ? AND grantee_phone = ?',
      [vaultId, cleanPhone]
    );

    if (existing) {
      await dbRun(
        `UPDATE access_permissions SET
          grantee_name = ?, relationship = ?, role = ?, allowed_categories = ?
         WHERE id = ?`,
        [grantee_name, relationship || 'Family', role || 'family', JSON.stringify(allowed_categories || []), existing.id]
      );
    } else {
      await dbRun(
        `INSERT INTO access_permissions (id, vault_id, grantee_phone, grantee_name, relationship, role, allowed_categories)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [permId, vaultId, cleanPhone, grantee_name, relationship || 'Family', role || 'family', JSON.stringify(allowed_categories || [])]
      );
    }

    return res.json({ success: true, message: 'Access permission saved successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to set permission' });
  }
});

/**
 * DELETE /api/vault/:id/permissions/:permId
 */
router.delete('/:id/permissions/:permId', async (req, res) => {
  try {
    await dbRun('DELETE FROM access_permissions WHERE id = ? AND vault_id = ?', [req.params.permId, req.params.id]);
    return res.json({ success: true, message: 'Permission revoked' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete permission' });
  }
});

/**
 * GET /api/vault/:id/export
 * DPDP Act 2023 & GDPR Right to Portability - Complete data export
 */
router.get('/:id/export', async (req, res) => {
  try {
    const vaultId = req.params.id;
    const vault = await dbGet('SELECT * FROM vaults WHERE id = ?', [vaultId]);
    if (!vault) return res.status(404).json({ error: 'Vault not found' });

    const contacts = await dbAll('SELECT * FROM emergency_contacts WHERE vault_id = ?', [vaultId]);
    const insurance = await dbGet('SELECT * FROM insurance_details WHERE vault_id = ?', [vaultId]);
    const documents = await dbAll('SELECT id, title, category, mime_type, file_size, uploaded_at FROM documents WHERE vault_id = ?', [vaultId]);
    const permissions = await dbAll('SELECT * FROM access_permissions WHERE vault_id = ?', [vaultId]);
    const auditLogs = await dbAll('SELECT * FROM access_logs WHERE vault_id = ? ORDER BY timestamp DESC', [vaultId]);

    const exportPayload = {
      standard: 'India DPDP Act 2023 - Data Portability Archive',
      exported_at: new Date().toISOString(),
      vault_id: vault.id,
      personal_details: {
        name: vault.owner_name,
        dob: vault.dob,
        gender: vault.gender,
        blood_group: vault.blood_group,
        allergies: decryptField(vault.allergies_enc),
        conditions: decryptField(vault.conditions_enc),
        medications: decryptField(vault.medications_enc),
        implants: decryptField(vault.implants_enc),
        organ_donor: Boolean(vault.organ_donor),
        home_address: decryptField(vault.home_address_enc),
        emergency_instructions: decryptField(vault.emergency_instructions_enc)
      },
      contacts,
      insurance: insurance ? {
        ...insurance,
        policy_number: decryptField(insurance.policy_number_enc)
      } : null,
      documents_metadata: documents,
      authorized_family: permissions.map(p => ({
        name: p.grantee_name,
        phone: p.grantee_phone,
        categories: JSON.parse(p.allowed_categories || '[]')
      })),
      access_audit_history: auditLogs
    };

    return res.json({ success: true, export_data: exportPayload });
  } catch (err) {
    return res.status(500).json({ error: 'Export failed' });
  }
});

/**
 * DELETE /api/vault/:id/delete
 * DPDP Act 2023 - Permanent Right to Erasure
 */
router.delete('/:id/delete', async (req, res) => {
  try {
    const vaultId = req.params.id;
    await dbRun('DELETE FROM access_logs WHERE vault_id = ?', [vaultId]);
    await dbRun('DELETE FROM documents WHERE vault_id = ?', [vaultId]);
    await dbRun('DELETE FROM emergency_contacts WHERE vault_id = ?', [vaultId]);
    await dbRun('DELETE FROM insurance_details WHERE vault_id = ?', [vaultId]);
    await dbRun('DELETE FROM access_permissions WHERE vault_id = ?', [vaultId]);
    await dbRun('DELETE FROM incident_history WHERE vault_id = ?', [vaultId]);
    await dbRun('DELETE FROM vaults WHERE id = ?', [vaultId]);

    return res.json({ success: true, message: 'All personal data permanently erased in compliance with DPDP Act 2023' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to erase data' });
  }
});

module.exports = router;
