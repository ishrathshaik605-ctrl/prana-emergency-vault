const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { dbGet, dbRun, dbAll } = require('../db');
const { encryptField, decryptField, generateVaultId } = require('../crypto');

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
    const vaultId = req.params.id;
    const vault = await dbGet('SELECT * FROM vaults WHERE id = ?', [vaultId]);
    if (!vault) {
      return res.status(404).json({ error: 'Vault not found' });
    }

    const contacts = await dbAll('SELECT * FROM emergency_contacts WHERE vault_id = ? ORDER BY priority ASC', [vaultId]);
    const insurance = await dbGet('SELECT * FROM insurance_details WHERE vault_id = ?', [vaultId]);
    const documents = await dbAll('SELECT * FROM documents WHERE vault_id = ?', [vaultId]);
    const permissions = await dbAll('SELECT * FROM access_permissions WHERE vault_id = ?', [vaultId]);
    const incidents = await dbAll('SELECT * FROM incident_history WHERE vault_id = ? ORDER BY incident_date DESC', [vaultId]);

    // Decrypt fields for owner view
    const fullVault = {
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

    return res.json({ success: true, vault: fullVault });
  } catch (err) {
    console.error('Error fetching vault:', err);
    return res.status(500).json({ error: 'Failed to fetch vault' });
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
      emergency_contacts
    } = req.body;

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

    return res.json({ success: true, message: 'Vault details and emergency contacts updated successfully' });
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
