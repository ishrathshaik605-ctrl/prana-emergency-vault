const { v4: uuidv4 } = require('uuid');
const { dbRun, dbAll } = require('./db');

// In-memory event listeners for real-time live push/broadcast
const activeListeners = new Set();

function registerEventListener(res) {
  activeListeners.add(res);
  res.on('close', () => activeListeners.delete(res));
}

function broadcastEvent(eventType, data) {
  const payload = `data: ${JSON.stringify({ event: eventType, data, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of activeListeners) {
    try {
      client.write(payload);
    } catch (err) {
      activeListeners.delete(client);
    }
  }
}

/**
 * Dispatch emergency alerts to all designated emergency contacts
 */
async function dispatchEmergencyAlert({ vaultId, ownerName, actorType, actorName, actorOrg, reason, location, tier }) {
  // 1. Fetch all emergency contacts for this vault
  const contacts = await dbAll(
    'SELECT * FROM emergency_contacts WHERE vault_id = ? AND notify_on_access = 1',
    [vaultId]
  );

  const notifications = [];
  const alertSummary = `${tier} Emergency Access on ${ownerName}'s Vault by ${actorName || actorType} (${actorOrg || 'Direct'}). Reason: "${reason || 'Immediate life-safety care'}". Location: ${location || 'GPS Acquired'}.`;

  // 2. Dispatch SMS and IVR voice call to each contact
  for (const contact of contacts) {
    // SMS Notification
    const smsId = uuidv4();
    const smsMessage = `[AAPAT-VAULT ALERT] Emergency access opened for ${ownerName} by ${actorOrg || actorName}. If fraudulent, reply STOP or call 1800-AAPAT. Details: https://aapatvault.in/audit/${vaultId}`;
    await dbRun(
      `INSERT INTO notifications_queue (id, vault_id, recipient_phone, recipient_name, channel, message, status)
       VALUES (?, ?, ?, ?, 'SMS', ?, 'sent')`,
      [smsId, vaultId, contact.phone, contact.name, smsMessage]
    );
    notifications.push({ id: smsId, to: contact.phone, name: contact.name, channel: 'SMS', message: smsMessage });

    // For Tier 2 Break-Glass, also trigger automated IVR Voice Call
    if (tier === 'Tier 2') {
      const ivrId = uuidv4();
      const ivrMessage = `Automated Voice Call: This is AapatVault Emergency Dispatch. Responder ${actorName} from ${actorOrg} has accessed medical vault for ${ownerName}. Location coordinates logged.`;
      await dbRun(
        `INSERT INTO notifications_queue (id, vault_id, recipient_phone, recipient_name, channel, message, status)
         VALUES (?, ?, ?, ?, 'VOICE_IVR', ?, 'sent')`,
        [ivrId, vaultId, contact.phone, contact.name, ivrMessage]
      );
      notifications.push({ id: ivrId, to: contact.phone, name: contact.name, channel: 'VOICE_IVR', message: ivrMessage });
    }
  }

  // 3. Broadcast to all active browser SSE streams
  broadcastEvent('EMERGENCY_ACCESS_TRIGGERED', {
    vaultId,
    ownerName,
    actorType,
    actorName,
    actorOrg,
    tier,
    reason,
    location,
    notificationsDispatched: notifications.length
  });

  return notifications;
}

/**
 * Dispatch OTP via SMS
 */
async function dispatchOTP(phone, code, action = 'login') {
  const id = uuidv4();
  const message = `[AapatVault] Your verification code is: ${code}. Valid for 5 minutes. NEVER share this code with anyone.`;
  await dbRun(
    `INSERT INTO notifications_queue (id, recipient_phone, channel, message, status)
     VALUES (?, ?, 'SMS', ?, 'sent')`,
    [id, phone, message]
  );

  broadcastEvent('OTP_SENT', { phone, code, action });
  console.log(`[SMS GATEWAY SIMULATOR] Sent OTP ${code} to ${phone} for ${action}`);
  return { id, phone, code, message };
}

module.exports = {
  dispatchEmergencyAlert,
  dispatchOTP,
  registerEventListener,
  broadcastEvent
};
