require('./setup');
const { registerUserForCompetition } = require('../src/services/registrationService');
const Competition = require('../src/models/Competition');
const Registration = require('../src/models/Registration');
const User = require('../src/models/User');
const { createCompetition } = require('./factories');

describe('registerUserForCompetition — concurrency safety', () => {
  test('5. when only 1 spot remains and 10 different users race for it, exactly 1 succeeds and spotsLeft never goes negative', async () => {
    const competition = await createCompetition({ totalSpots: 10, spotsLeft: 1 });

    const users = await User.insertMany(
      Array.from({ length: 10 }, (_, i) => ({ deviceId: `race-user-${i}` }))
    );

    const results = await Promise.allSettled(
      users.map((u) => registerUserForCompetition({ competitionId: competition._id, userId: u._id }))
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');

    expect(succeeded).toHaveLength(1);
    expect(failed).toHaveLength(9);
    failed.forEach((r) => expect(r.reason).toMatchObject({ code: 'SPOTS_FULL' }));

    const fresh = await Competition.findById(competition._id);
    expect(fresh.spotsLeft).toBe(0);
    expect(fresh.spotsLeft).toBeGreaterThanOrEqual(0); // 6. explicit: never negative

    const registrationCount = await Registration.countDocuments({ competition: competition._id });
    expect(registrationCount).toBe(1);
  });

  test('the same user firing 5 truly concurrent registration requests only ever gets registered once, and only ever consumes 1 spot', async () => {
    const competition = await createCompetition({ totalSpots: 10, spotsLeft: 10 });
    const [user] = await User.insertMany([{ deviceId: 'same-user-race' }]);

    const results = await Promise.allSettled(
      Array.from({ length: 5 }, () =>
        registerUserForCompetition({ competitionId: competition._id, userId: user._id })
      )
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');

    expect(succeeded).toHaveLength(1);
    expect(failed).toHaveLength(4);
    failed.forEach((r) => expect(r.reason).toMatchObject({ code: 'ALREADY_REGISTERED' }));

    const fresh = await Competition.findById(competition._id);
    // Only 1 spot actually consumed — the other 4 provisional reservations were refunded.
    expect(fresh.spotsLeft).toBe(9);

    const registrationCount = await Registration.countDocuments({ competition: competition._id, user: user._id });
    expect(registrationCount).toBe(1);
  });

  test('50 different users racing for exactly 20 spots: exactly 20 succeed, 30 fail, spotsLeft lands at exactly 0', async () => {
    const competition = await createCompetition({ totalSpots: 20, spotsLeft: 20 });
    const users = await User.insertMany(Array.from({ length: 50 }, (_, i) => ({ deviceId: `bulk-race-${i}` })));

    const results = await Promise.allSettled(
      users.map((u) => registerUserForCompetition({ competitionId: competition._id, userId: u._id }))
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    expect(succeeded).toHaveLength(20);

    const fresh = await Competition.findById(competition._id);
    expect(fresh.spotsLeft).toBe(0);

    const registrationCount = await Registration.countDocuments({ competition: competition._id });
    expect(registrationCount).toBe(20);
  });
});
