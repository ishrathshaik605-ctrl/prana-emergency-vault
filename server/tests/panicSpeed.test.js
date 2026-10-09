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

test('Panic Test Benchmark: Task Completion Under 60 Seconds', async (t) => {
  await t.test('Scenario: Bystander scans QR and retrieves Tier 0 in under 1 second', async () => {
    const startTime = Date.now();

    const res = await fetch(`${baseUrl}/api/emergency/AV-8842/tier0`);
    const data = await res.json();

    const elapsedMs = Date.now() - startTime;
    console.log(`[PANIC BENCHMARK] Tier 0 Public Lifesaver Retrieval: ${elapsedMs}ms`);

    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.blood_group);
    assert.ok(data.critical_allergies);
    assert.ok(data.emergency_contacts.length > 0);

    // Target: Must complete in < 1,000ms (Requirement is < 60,000ms)
    assert.ok(elapsedMs < 1000, `Tier 0 took ${elapsedMs}ms, should be well under 1000ms`);
  });

  await t.test('Scenario: Panicking Son unlocks Tier 1 full insurance in under 5 seconds', async () => {
    const startTime = Date.now();

    // Step 1: Request OTP
    const otpStart = Date.now();
    const otpRes = await fetch(`${baseUrl}/api/emergency/AV-8842/family-request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+919825099991' })
    });
    const otpData = await otpRes.json();
    assert.equal(otpRes.status, 200);
    const otpElapsed = Date.now() - otpStart;

    // Step 2: Submit OTP and unlock
    const verifyStart = Date.now();
    const verifyRes = await fetch(`${baseUrl}/api/emergency/AV-8842/family-verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '+919825099991',
        code: otpData.debug_otp,
        location: 'ER Triage Desk'
      })
    });
    const verifyData = await verifyRes.json();
    const verifyElapsed = Date.now() - verifyStart;

    const totalPanicElapsed = Date.now() - startTime;
    console.log(`[PANIC BENCHMARK] Step 1 (OTP Send): ${otpElapsed}ms, Step 2 (Verify & Decrypt): ${verifyElapsed}ms. Total: ${totalPanicElapsed}ms`);

    assert.equal(verifyRes.status, 200);
    assert.ok(verifyData.insurance.policy_number);

    // Assert that the entire programmatic flow completes in < 5,000ms (vs human 60-second limit)
    assert.ok(totalPanicElapsed < 5000, `Panic flow took ${totalPanicElapsed}ms, must easily pass 60-second window`);
  });

  await t.test('Scenario: Paramedic Break-Glass unlock in acute ER under 2 seconds', async () => {
    const startTime = Date.now();

    const res = await fetch(`${baseUrl}/api/emergency/AV-7721/break-glass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responder_name: 'Dr. Vikram Sethi',
        responder_org: 'Manipal ER Trauma Care',
        responder_badge: 'KMC-78291',
        reason: 'Acute respiratory distress, unconscious female',
        location_address: 'Old Airport Road, Bengaluru'
      })
    });

    const elapsedMs = Date.now() - startTime;
    console.log(`[PANIC BENCHMARK] Tier 2 Break-Glass Retrieval: ${elapsedMs}ms`);

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.medications);
    assert.ok(data.insurance);
    assert.ok(elapsedMs < 2000, `Break glass took ${elapsedMs}ms`);
  });
});
