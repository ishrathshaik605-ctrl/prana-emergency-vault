const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { dbGet, dbRun, dbAll } = require('../db');
const { hashValue, generateOTP } = require('../crypto');
const { sanitizeTier0, sanitizeTier1, sanitizeTier2 } = require('../accessControl');
const { dispatchEmergencyAlert, dispatchOTP } = require('../notifications');

/**
 * GET /api/emergency/:vaultId/tier0
 * Public Lifesaver view - Instant 0-second access from QR/NFC/Lock screen
 */
router.get('/:vaultId/tier0', async (req, res) => {
  try {
    const vaultId = req.params.vaultId;
    const vault = await dbGet('SELECT * FROM vaults WHERE id = ?', [vaultId]);
    if (!vault) {
      return res.status(404).json({ error: 'Emergency Vault not found' });
    }

    const contacts = await dbAll(
      'SELECT name, relationship, phone, priority FROM emergency_contacts WHERE vault_id = ? ORDER BY priority ASC',
      [vaultId]
    );

    // Immutable audit log of public scan
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Public QR Scanner';
    
    await dbRun(
      `INSERT INTO access_logs (
        id, vault_id, actor_type, actor_identifier, actor_name, actor_org,
        reason, tier_accessed, categories_unlocked, ip_address, user_agent
      ) VALUES (?, ?, 'public_scanner', 'Anonymous QR Scan', 'Bystander / First Responder', 'Public', 'Instant Lifesaver Card Scan', 'Tier 0', ?, ?, ?)`,
      [logId, vaultId, JSON.stringify(['public_lifesaver']), clientIp, userAgent]
    );

    const tier0Data = sanitizeTier0(vault, contacts);
    return res.json({ success: true, ...tier0Data, audit_log_id: logId });
  } catch (err) {
    console.error('Error serving Tier 0:', err);
    return res.status(500).json({ error: 'Failed to retrieve emergency lifesaver card' });
  }
});

/**
 * POST /api/emergency/:vaultId/family-request-otp
 * Request OTP for family member verification
 */
router.post('/:vaultId/family-request-otp', async (req, res) => {
  try {
    const vaultId = req.params.vaultId;
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');

    // Check if phone is registered as authorized family member or emergency contact
    const permission = await dbGet(
      'SELECT * FROM access_permissions WHERE vault_id = ? AND grantee_phone = ?',
      [vaultId, cleanPhone]
    );

    const contact = await dbGet(
      'SELECT * FROM emergency_contacts WHERE vault_id = ? AND phone = ?',
      [vaultId, cleanPhone]
    );

    if (!permission && !contact) {
      return res.status(403).json({
        error: 'This phone number is not registered as an authorized family member or emergency contact for this vault.'
      });
    }

    const code = generateOTP();
    const codeHash = hashValue(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const otpId = uuidv4();

    await dbRun(
      `INSERT INTO otps (id, phone, code_hash, vault_id, action, expires_at)
       VALUES (?, ?, ?, ?, 'family_unlock', ?)`,
      [otpId, cleanPhone, codeHash, vaultId, expiresAt]
    );

    await dispatchOTP(cleanPhone, code, 'family_unlock');

    return res.json({
      success: true,
      message: `Verification code sent to registered family member (${cleanPhone})`,
      debug_otp: code, // Provided for instant prototype testing & panic-speed benchmarks
      recipient_name: permission?.grantee_name || contact?.name
    });
  } catch (err) {
    console.error('Error sending family OTP:', err);
    return res.status(500).json({ error: 'Failed to initiate family verification' });
  }
});

/**
 * POST /api/emergency/:vaultId/family-verify-otp
 * Unlocks Tier 1 filtered strictly by the family member's pre-assigned category matrix
 */
router.post('/:vaultId/family-verify-otp', async (req, res) => {
  try {
    const vaultId = req.params.vaultId;
    const { phone, code, location } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and OTP code are required' });
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const codeHash = hashValue(code);

    // Verify OTP
    const otpRecord = await dbGet(
      `SELECT * FROM otps 
       WHERE phone = ? AND code_hash = ? AND vault_id = ? AND action = 'family_unlock' AND verified = 0 AND expires_at > datetime('now')
       ORDER BY created_at DESC LIMIT 1`,
      [cleanPhone, codeHash, vaultId]
    );

    if (!otpRecord) {
      return res.status(401).json({ error: 'Invalid or expired verification code' });
    }

    await dbRun('UPDATE otps SET verified = 1 WHERE id = ?', [otpRecord.id]);

    // Fetch Vault and components
    const vault = await dbGet('SELECT * FROM vaults WHERE id = ?', [vaultId]);
    if (!vault) return res.status(404).json({ error: 'Vault not found' });

    let permission = await dbGet(
      'SELECT * FROM access_permissions WHERE vault_id = ? AND grantee_phone = ?',
      [vaultId, cleanPhone]
    );

    const contact = await dbGet(
      'SELECT * FROM emergency_contacts WHERE vault_id = ? AND phone = ?',
      [vaultId, cleanPhone]
    );

    // If registered as contact but not explicit permission record, assign standard family defaults
    if (!permission && contact) {
      permission = {
        grantee_name: contact.name,
        grantee_phone: contact.phone,
        relationship: contact.relationship,
        role: 'emergency_contact',
        allowed_categories: JSON.stringify(['medical_basics', 'medications', 'doctor_contacts', 'insurance', 'documents', 'home_address', 'emergency_instructions', 'incident_history'])
      };
    }

    const contacts = await dbAll('SELECT * FROM emergency_contacts WHERE vault_id = ? ORDER BY priority ASC', [vaultId]);
    const insurance = await dbGet('SELECT * FROM insurance_details WHERE vault_id = ?', [vaultId]);
    const documents = await dbAll('SELECT * FROM documents WHERE vault_id = ?', [vaultId]);
    const incidents = await dbAll('SELECT * FROM incident_history WHERE vault_id = ? ORDER BY incident_date DESC', [vaultId]);

    // Audit log
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Family Device';

    await dbRun(
      `INSERT INTO access_logs (
        id, vault_id, actor_type, actor_identifier, actor_name, actor_org,
        reason, tier_accessed, categories_unlocked, ip_address, user_agent, location_address
      ) VALUES (?, ?, 'verified_family', ?, ?, ?, 'Family Emergency Verification', 'Tier 1', ?, ?, ?, ?)`,
      [
        logId, vaultId, cleanPhone, permission.grantee_name, permission.relationship,
        permission.allowed_categories, clientIp, userAgent, location || 'Family App'
      ]
    );

    // Notify other contacts & owner
    await dispatchEmergencyAlert({
      vaultId,
      ownerName: vault.owner_name,
      actorType: 'Family Guardian',
      actorName: permission.grantee_name,
      actorOrg: permission.relationship,
      reason: 'Verified Family Emergency Access',
      location: location || 'Mobile App',
      tier: 'Tier 1'
    });

    const tier1Data = sanitizeTier1(vault, contacts, insurance, documents, permission, incidents);
    return res.json({ success: true, ...tier1Data, audit_log_id: logId });
  } catch (err) {
    console.error('Error verifying family OTP:', err);
    return res.status(500).json({ error: 'Family verification failed' });
  }
});

/**
 * POST /api/emergency/:vaultId/break-glass
 * Tier 2 Break-Glass for Paramedics, EMTs, and ER Doctors
 * Unlocks in seconds while enforcing full accountability and instant broadcast alerts
 */
router.post('/:vaultId/break-glass', async (req, res) => {
  try {
    const vaultId = req.params.vaultId;
    const {
      responder_name,
      responder_org,
      responder_badge,
      reason,
      location_lat,
      location_lng,
      location_address
    } = req.body;

    if (!responder_name || !responder_org || !reason) {
      return res.status(400).json({
        error: 'Responder Name, Organization (Hospital/Ambulance), and Emergency Reason are mandatory for Break-Glass'
      });
    }

    const vault = await dbGet('SELECT * FROM vaults WHERE id = ?', [vaultId]);
    if (!vault) {
      return res.status(404).json({ error: 'Vault not found' });
    }

    const contacts = await dbAll('SELECT * FROM emergency_contacts WHERE vault_id = ? ORDER BY priority ASC', [vaultId]);
    const insurance = await dbGet('SELECT * FROM insurance_details WHERE vault_id = ?', [vaultId]);
    const documents = await dbAll('SELECT * FROM documents WHERE vault_id = ?', [vaultId]);

    // 30-minute session expiration
    const sessionExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const logId = uuidv4();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Responder Device';

    const categoriesUnlocked = ['medical_basics', 'medications', 'doctor_contacts', 'insurance', 'emergency_instructions', 'medical_documents'];

    await dbRun(
      `INSERT INTO access_logs (
        id, vault_id, actor_type, actor_identifier, actor_name, actor_org,
        reason, tier_accessed, categories_unlocked, ip_address, user_agent,
        location_lat, location_lng, location_address, session_expires_at, status
      ) VALUES (?, ?, 'break_glass_responder', ?, ?, ?, ?, 'Tier 2', ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        logId, vaultId, responder_badge || 'EMT-UNSPECIFIED', responder_name, responder_org,
        reason, JSON.stringify(categoriesUnlocked), clientIp, userAgent,
        location_lat || null, location_lng || null, location_address || 'Emergency Response Site',
        sessionExpiresAt
      ]
    );

    // Instant emergency broadcast alerts to all contacts and owner
    const alertsDispatched = await dispatchEmergencyAlert({
      vaultId,
      ownerName: vault.owner_name,
      actorType: 'Emergency Paramedic / Doctor',
      actorName: responder_name,
      actorOrg: responder_org,
      reason,
      location: location_address || 'Ambulance / ER Location',
      tier: 'Tier 2'
    });

    const tier2Data = sanitizeTier2(vault, contacts, insurance, documents, {
      responder_name,
      responder_org,
      responder_badge,
      reason
    });

    return res.json({
      success: true,
      message: 'Tier 2 Break-Glass Emergency Access granted for 30 minutes.',
      session_token: logId,
      expires_at: sessionExpiresAt,
      alerts_dispatched_count: alertsDispatched.length,
      ...tier2Data
    });
  } catch (err) {
    console.error('Error in break-glass:', err);
    return res.status(500).json({ error: 'Failed to process break-glass request' });
  }
});

/**
 * POST /api/emergency/:vaultId/report-abuse
 * Rapid revocation / killswitch endpoint
 */
router.post('/:vaultId/report-abuse', async (req, res) => {
  try {
    const vaultId = req.params.vaultId;
    const { logId, reported_by, comments } = req.body;

    if (logId) {
      await dbRun(
        `UPDATE access_logs SET status = 'flagged_abuse', revoked_by = ?, revoked_at = CURRENT_TIMESTAMP
         WHERE id = ? AND vault_id = ?`,
        [reported_by || 'Family Member', logId, vaultId]
      );
    } else {
      // Emergency lockdown: revoke all active sessions for this vault
      await dbRun(
        `UPDATE access_logs SET status = 'revoked', revoked_by = ?, revoked_at = CURRENT_TIMESTAMP
         WHERE vault_id = ? AND status = 'active'`,
        [reported_by || 'Owner Lockdown', vaultId]
      );
    }

    return res.json({
      success: true,
      message: 'Access session immediately revoked and flagged for investigation. Medical records locked.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to report abuse' });
  }
});

module.exports = router;
