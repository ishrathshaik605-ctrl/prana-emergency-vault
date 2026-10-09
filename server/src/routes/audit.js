const express = require('express');
const router = express.Router();
const { dbGet, dbRun, dbAll } = require('../db');

/**
 * GET /api/audit/:vaultId
 * Plain-language, immutable audit log for post-incident recovery review
 */
router.get('/:vaultId', async (req, res) => {
  try {
    const vaultId = req.params.vaultId;
    const logs = await dbAll(
      'SELECT * FROM access_logs WHERE vault_id = ? ORDER BY timestamp DESC',
      [vaultId]
    );

    // Format into plain-language human readable summaries
    const humanLogs = logs.map(log => {
      let categories = [];
      try {
        categories = JSON.parse(log.categories_unlocked || '[]');
      } catch (e) {
        categories = [log.categories_unlocked];
      }

      let summary = '';
      if (log.tier_accessed === 'Tier 0') {
        summary = `Public Lifesaver Card was viewed via QR / Lock Screen scan by an anonymous bystander.`;
      } else if (log.tier_accessed === 'Tier 1') {
        summary = `Verified Family Member (${log.actor_name || 'Family'}, ${log.actor_org || 'Guardian'}) unlocked ${categories.join(', ')} via SMS OTP verification.`;
      } else if (log.tier_accessed === 'Tier 2') {
        summary = `EMERGENCY BREAK-GLASS: ${log.actor_name} (${log.actor_org}, Badge #${log.actor_identifier}) unlocked clinical emergency records for: "${log.reason}".`;
      }

      return {
        ...log,
        categories_unlocked: categories,
        plain_language_summary: summary,
        is_active: log.status === 'active' && (!log.session_expires_at || new Date(log.session_expires_at) > new Date())
      };
    });

    return res.json({ success: true, logs: humanLogs });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return res.status(500).json({ error: 'Failed to fetch audit records' });
  }
});

/**
 * POST /api/audit/revoke/:logId
 * Owner post-recovery revocation of access session
 */
router.post('/revoke/:logId', async (req, res) => {
  try {
    const logId = req.params.logId;
    const { revoked_by, reason } = req.body;

    const log = await dbGet('SELECT * FROM access_logs WHERE id = ?', [logId]);
    if (!log) {
      return res.status(404).json({ error: 'Audit log entry not found' });
    }

    await dbRun(
      `UPDATE access_logs SET status = 'revoked', revoked_by = ?, revoked_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [revoked_by || 'Vault Owner', logId]
    );

    return res.json({
      success: true,
      message: `Access granted under session ${logId.slice(0, 8)} has been successfully revoked.`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to revoke access' });
  }
});

/**
 * GET /api/audit/notifications/:vaultId
 * View simulated outgoing SMS and IVR notifications
 */
router.get('/notifications/:vaultId', async (req, res) => {
  try {
    const vaultId = req.params.vaultId;
    const notifs = await dbAll(
      'SELECT * FROM notifications_queue WHERE vault_id = ? ORDER BY sent_at DESC LIMIT 20',
      [vaultId]
    );
    return res.json({ success: true, notifications: notifs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
