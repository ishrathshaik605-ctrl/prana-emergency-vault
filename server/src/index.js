const express = require('express');
const cors = require('cors');
const path = require('path');
const { initSchema } = require('./db');
const { seedData } = require('./seed');
const { registerEventListener } = require('./notifications');

const authRoutes = require('./routes/auth');
const vaultRoutes = require('./routes/vault');
const emergencyRoutes = require('./routes/emergency');
const auditRoutes = require('./routes/audit');
const documentRoutes = require('./routes/documents');
const ussdRoutes = require('./routes/ussd');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for Vite frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Real-Time Server-Sent Events (SSE) Stream for push alerts
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ event: 'CONNECTED', message: 'Real-time alert stream active' })}\n\n`);
  registerEventListener(res);
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ussd', ussdRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'AapatVault Emergency Access Engine',
    version: '1.0.0-mvp',
    timestamp: new Date().toISOString()
  });
});

// Serve static client bundle if built
const clientDistPath = path.join(__dirname, '../../client/dist');
if (require('fs').existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Initialize DB and launch server
async function startServer() {
  try {
    await initSchema();
    await seedData();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  AapatVault API Server running at http://localhost:${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`  Real-time Alerts: http://localhost:${PORT}/api/events`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
