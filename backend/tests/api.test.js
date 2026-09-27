require('./setup');
const request = require('supertest');
const { createApp } = require('../src/app');
const { createCompetition } = require('./factories');

const app = createApp();

describe('API — /api/competitions', () => {
  test('GET /api/competitions/:id returns full details with a CTA and lifecycle stage', async () => {
    const competition = await createCompetition();

    const res = await request(app).get(`/api/competitions/${competition._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(competition.title);
    expect(res.body.data.capacity.left).toBe(competition.totalSpots);
    expect(res.body.data.lifecycle.stage).toBe('REGISTRATION_OPEN');
    expect(res.body.data.cta.action).toBe('REGISTER');
    expect(res.body.data.registration.isRegistered).toBe(false);
  });

  test('GET /api/competitions/:id with an invalid id returns 400 INVALID_ID', async () => {
    const res = await request(app).get('/api/competitions/not-a-valid-id');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_ID');
  });

  test('GET /api/competitions/:id for a missing (but valid-shaped) id returns 404', async () => {
    const fakeId = new (require('mongoose').Types.ObjectId)();
    const res = await request(app).get(`/api/competitions/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('COMPETITION_NOT_FOUND');
  });

  test('POST /register without an x-device-id header is rejected', async () => {
    const competition = await createCompetition();
    const res = await request(app).post(`/api/competitions/${competition._id}/register`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MISSING_DEVICE_ID');
  });

  test('POST /register succeeds with a device id, and a repeat call is rejected as a duplicate', async () => {
    const competition = await createCompetition({ totalSpots: 3, spotsLeft: 3 });

    const first = await request(app)
      .post(`/api/competitions/${competition._id}/register`)
      .set('x-device-id', 'integration-test-device-1');

    expect(first.status).toBe(201);
    expect(first.body.data.competition.capacity.left).toBe(2);
    expect(first.body.data.competition.cta.action).toBe('UPLOAD_SUBMISSION');

    const second = await request(app)
      .post(`/api/competitions/${competition._id}/register`)
      .set('x-device-id', 'integration-test-device-1');

    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('ALREADY_REGISTERED');
  });

  test('GET /api/competitions/:id reflects isRegistered:true for a device that already registered', async () => {
    const competition = await createCompetition({ totalSpots: 3, spotsLeft: 3 });
    await request(app).post(`/api/competitions/${competition._id}/register`).set('x-device-id', 'integration-test-device-2');

    const res = await request(app)
      .get(`/api/competitions/${competition._id}`)
      .set('x-device-id', 'integration-test-device-2');

    expect(res.body.data.registration.isRegistered).toBe(true);
  });
});
