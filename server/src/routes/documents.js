const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { dbGet, dbRun, dbAll } = require('../db');

/**
 * POST /api/documents/upload
 * Simulated encrypted document upload
 */
router.post('/upload', async (req, res) => {
  try {
    const { vaultId, title, category, mime_type, file_size, content_base64, tier_required = 1 } = req.body;
    if (!vaultId || !title || !category) {
      return res.status(400).json({ error: 'Vault ID, title, and category are required' });
    }

    const docId = uuidv4();
    const filePath = `uploads/${vaultId}/${docId}.enc`;

    await dbRun(
      `INSERT INTO documents (id, vault_id, title, category, file_path, mime_type, file_size, tier_required, checksum)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        docId, vaultId, title, category, filePath,
        mime_type || 'application/pdf',
        file_size || 1024 * 145, // default ~145 KB
        tier_required,
        'sha256-chk-' + Math.random().toString(36).substring(2, 10)
      ]
    );

    return res.json({
      success: true,
      message: 'Document encrypted and saved to vault',
      document: { id: docId, title, category, tier_required }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Document upload failed' });
  }
});

/**
 * GET /api/documents/:id/download
 * Download / view document
 */
router.get('/:id/download', async (req, res) => {
  try {
    const doc = await dbGet('SELECT * FROM documents WHERE id = ?', [req.params.id]);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Return mock PDF or medical document preview data
    return res.json({
      success: true,
      document: {
        id: doc.id,
        title: doc.title,
        category: doc.category,
        mime_type: doc.mime_type,
        file_size: doc.file_size,
        preview_text: `[ENCRYPTED DOCUMENT DECRYPTED FOR AUTHORIZED MEDICAL EMERGENCY REVIEW]\n\nTitle: ${doc.title}\nCategory: ${doc.category}\nVault Reference: ${doc.vault_id}\nChecksum Verified: ${doc.checksum}\n\nClinical Summary:\nPatient records verified. Document issued by recognized medical authority.`
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Download failed' });
  }
});

module.exports = router;
