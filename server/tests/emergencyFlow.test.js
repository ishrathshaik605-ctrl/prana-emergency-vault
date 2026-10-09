const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { app } = require('../src/index');
const { initSchema } = require('../src/db');
const { seedData } = require('../src/seed');

let server;
let baseUrl;

test.before(async () => {
  await initSchema();
  await seedData();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Emergency Access End-to-End API Suite', async (t) => {
  await t.test('GET /api/emergency/AV-8842/tier0 should deliver Public Lifesaver card with zero sensitive leaks', async () => {
    const res = await fetch(`${baseUrl}/api/emergency/AV-8842/tier0`);
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.owner_name, 'Ramesh Patel');
    assert.equal(data.blood_group, 'B+ve');
    assert.match(data.critical_allergies, /Penicillin/);
    assert.equal(data.emergency_contacts.length, 2);

    // Verify sensitive data is NOT present
    assert.equal(data.medications, undefined);
    assert.equal(data.home_address, undefined);
    assert.equal(data.insurance, undefined);
  });

  await t.test('POST /api/emergency/AV-8842/family-request-otp should send OTP for registered guardian phone', async () => {
    const res = await fetch(`${baseUrl}/api/emergency/AV-8842/family-request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+919825099991' }) // Suresh Patel's phone
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.debug_otp, 'OTP code generated');

    // Verify OTP unlock
    const verifyRes = await fetch(`${baseUrl}/api/emergency/AV-8842/family-verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '+919825099991',
        code: data.debug_otp,
        location: 'Emergency Department Waiting Room'
      })
    });

    assert.equal(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.success, true);
    assert.equal(verifyData.access_tier, 'Tier 1 - Verified Family');
    assert.ok(verifyData.insurance, 'Family member should now have unlocked insurance');
    assert.match(verifyData.insurance.policy_number, /SH-8849/);
  });

  await t.test('POST /api/emergency/AV-8842/family-request-otp should reject unregistered phone numbers', async () => {
    const res = await fetch(`${baseUrl}/api/emergency/AV-8842/family-request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+919999999999' }) // Random stranger phone
    });

    assert.equal(res.status, 403);
    const data = await res.json();
    assert.match(data.error, /not registered/i);
  });

  await t.test('POST /api/emergency/AV-8842/break-glass should require responder name, org, and reason', async () => {
    // Missing reason
    const invalidRes = await fetch(`${baseUrl}/api/emergency/AV-8842/break-glass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responder_name: 'Dr. Anita',
        responder_org: 'Civil Hospital'
      })
    });
    assert.equal(invalidRes.status, 400);

    // Valid Break-Glass Request
    const validRes = await fetch(`${baseUrl}/api/emergency/AV-8842/break-glass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responder_name: 'EMT Anita Rao',
        responder_org: '108 GVK EMRI Gujarat',
        responder_badge: 'EMT-GUJ-904',
        reason: 'Severe head trauma from highway accident, patient unconscious'
      })
    });

    assert.equal(validRes.status, 200);
    const data = await validRes.json();
    assert.equal(data.success, true);
    assert.equal(data.access_tier, 'Tier 2 - Emergency Responder Break-Glass');
    assert.ok(data.session_token);
    assert.match(data.medications, /Metformin/);
    assert.match(data.implants, /Pacemaker/);
  });

  await t.test('POST /api/ussd should handle feature-phone SMS queries', async () => {
    const res = await fetch(`${baseUrl}/api/ussd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sms_text: 'HELP AV-8842' })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.match(data.sms_response, /Ramesh Patel/i);
    assert.match(data.sms_response, /B\+ve/i);
    assert.match(data.sms_response, /PENICILLIN/i);
    assert.match(data.sms_response, /108/);
  });
});
