const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'aapat_vault.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite AapatVault database at', DB_PATH);
  }
});

// Promisified DB helpers
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Initialize Database Schema
 */
async function initSchema() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      pin_hash TEXT,
      role TEXT DEFAULT 'owner',
      language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS vaults (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      dob TEXT,
      gender TEXT,
      blood_group TEXT NOT NULL,
      allergies_enc TEXT,
      conditions_enc TEXT,
      medications_enc TEXT,
      implants_enc TEXT,
      organ_donor INTEGER DEFAULT 0,
      primary_doctor_enc TEXT,
      doctor_phone_enc TEXT,
      hospital_name TEXT,
      hospital_address TEXT,
      home_address_enc TEXT,
      last_known_location TEXT,
      emergency_instructions_enc TEXT,
      voice_note_url TEXT,
      is_locked INTEGER DEFAULT 0,
      offline_qr_payload TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id TEXT PRIMARY KEY,
      vault_id TEXT NOT NULL,
      name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      phone TEXT NOT NULL,
      priority INTEGER DEFAULT 1,
      notify_on_access INTEGER DEFAULT 1,
      can_authorize_tier1 INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vault_id) REFERENCES vaults(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS insurance_details (
      id TEXT PRIMARY KEY,
      vault_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      policy_number_enc TEXT NOT NULL,
      tpa_name TEXT,
      cashless_helpline TEXT,
      expiry_date TEXT,
      policy_document_url TEXT,
      notes_enc TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vault_id) REFERENCES vaults(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      vault_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      file_path TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      tier_required INTEGER DEFAULT 1,
      checksum TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vault_id) REFERENCES vaults(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS access_permissions (
      id TEXT PRIMARY KEY,
      vault_id TEXT NOT NULL,
      grantee_phone TEXT NOT NULL,
      grantee_name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      role TEXT DEFAULT 'family',
      allowed_categories TEXT NOT NULL, -- JSON array of allowed categories
      requires_approval INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vault_id) REFERENCES vaults(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS access_logs (
      id TEXT PRIMARY KEY,
      vault_id TEXT NOT NULL,
      actor_type TEXT NOT NULL, -- 'public_scanner', 'verified_family', 'break_glass_responder'
      actor_identifier TEXT, -- phone or responder badge number
      actor_name TEXT,
      actor_org TEXT,
      reason TEXT,
      tier_accessed TEXT NOT NULL, -- 'Tier 0', 'Tier 1', 'Tier 2'
      categories_unlocked TEXT NOT NULL, -- JSON array
      ip_address TEXT,
      user_agent TEXT,
      location_lat REAL,
      location_lng REAL,
      location_address TEXT,
      session_expires_at DATETIME,
      status TEXT DEFAULT 'active', -- 'active', 'expired', 'revoked', 'flagged_abuse'
      revoked_by TEXT,
      revoked_at DATETIME,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vault_id) REFERENCES vaults(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS otps (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      vault_id TEXT,
      action TEXT NOT NULL, -- 'family_unlock', 'login', 'assisted_setup'
      expires_at DATETIME NOT NULL,
      verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS notifications_queue (
      id TEXT PRIMARY KEY,
      vault_id TEXT,
      recipient_phone TEXT NOT NULL,
      recipient_name TEXT,
      channel TEXT NOT NULL, -- 'SMS', 'PUSH', 'VOICE_IVR'
      message TEXT NOT NULL,
      status TEXT DEFAULT 'sent', -- 'queued', 'sent', 'failed'
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS incident_history (
      id TEXT PRIMARY KEY,
      vault_id TEXT NOT NULL,
      incident_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      summary TEXT NOT NULL,
      hospital TEXT,
      attending_staff TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vault_id) REFERENCES vaults(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS device_ip_vaults (
      ip_address TEXT NOT NULL,
      vault_id TEXT NOT NULL,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (ip_address, vault_id)
    )
  `);

  console.log('Database tables verified and initialized successfully.');
}

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll,
  initSchema
};
