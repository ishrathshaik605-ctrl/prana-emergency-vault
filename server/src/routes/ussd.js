const express = require('express');
const router = express.Router();
const { dbGet, dbAll } = require('../db');
const { decryptField } = require('../crypto');

/**
 * POST /api/ussd
 * Simulates USSD Code dial (*999*VAULT_ID#) or incoming SMS (HELP <VAULT_ID>)
 * Body: { dial_code?: string, sms_text?: string, sender_phone?: string }
 */
router.post('/', async (req, res) => {
  try {
    const { dial_code, sms_text, sender_phone = '+919876500000' } = req.body;
    let vaultId = '';

    if (dial_code) {
      // Format: *999*AV-1234#
      const match = dial_code.match(/\*999\*([A-Za-z0-9\-]+)#?/);
      if (match) vaultId = match[1].toUpperCase();
    } else if (sms_text) {
      // Format: HELP AV-1234
      const parts = sms_text.trim().split(/\s+/);
      if (parts.length >= 2) vaultId = parts[1].toUpperCase();
      else if (parts.length === 1 && parts[0].startsWith('AV-')) vaultId = parts[0].toUpperCase();
    }

    if (!vaultId) {
      return res.json({
        response_type: 'SMS_REPLY',
        message: 'AapatVault SMS Gateway: Invalid request. Text "HELP <VAULT-ID>" (e.g. HELP AV-8842) to get instant emergency lifesaver data, or dial 108 for ambulance.'
      });
    }

    const vault = await dbGet('SELECT * FROM vaults WHERE UPPER(id) = ?', [vaultId]);
    if (!vault) {
      return res.json({
        response_type: 'SMS_REPLY',
        message: `AapatVault: Vault ID "${vaultId}" not found. Please re-check code printed on wallet card or lock screen. Ambulance: Dial 108.`
      });
    }

    const contacts = await dbAll(
      'SELECT name, relationship, phone, priority FROM emergency_contacts WHERE vault_id = ? ORDER BY priority ASC LIMIT 2',
      [vault.id]
    );

    const allergies = decryptField(vault.allergies_enc) || 'None Reported';
    const conditions = decryptField(vault.conditions_enc) || 'None';
    const instructions = decryptField(vault.emergency_instructions_enc) || '';

    const contactStr = contacts.map(c => `${c.name} (${c.relationship}): ${c.phone}`).join('\n');

    const smsMessage = 
`[AAPAT-VAULT EMERGENCY]
PATIENT: ${vault.owner_name}
BLOOD GROUP: ${vault.blood_group}
ALLERGIES: ${allergies}
CONDITIONS: ${conditions}
${instructions ? 'INSTRUCTIONS: ' + instructions + '\n' : ''}EMERGENCY CONTACTS:
${contactStr}
AMBULANCE: DIAL 108 / 112`;

    return res.json({
      success: true,
      response_type: 'SMS_REPLY',
      vault_id: vault.id,
      patient_name: vault.owner_name,
      sms_response: smsMessage
    });
  } catch (err) {
    console.error('USSD error:', err);
    return res.status(500).json({ error: 'USSD Gateway processing error' });
  }
});

module.exports = router;
