require('./setup');
const { registerUserForCompetition } = require('../src/services/registrationService');
const Competition = require('../src/models/Competition');
const Registration = require('../src/models/Registration');
const { createCompetition, createUser } = require('./factories');

describe('registerUserForCompetition — business rules', () => {
  test('1. a valid registration succeeds and decrements spotsLeft by exactly 1', async () => {
    const competition = await createCompetition({ totalSpots: 10, spotsLeft: 10 });
    const user = await createUser('user-1');

    const { registration, competition: updated } = await registerUserForCompetition({
      competitionId: competition._id,
      userId: user._id,
    });

    expect(registration).toBeTruthy();
    expect(updated.spotsLeft).toBe(9);

    const stored = await Registration.findOne({ competition: competition._id, user: user._id });
    expect(stored).toBeTruthy();
  });

  test('2. a second registration attempt by the same user is rejected as ALREADY_REGISTERED, and the spot is refunded', async () => {
    const competition = await createCompetition({ totalSpots: 10, spotsLeft: 10 });
    const user = await createUser('user-2');

    await registerUserForCompetition({ competitionId: competition._id, userId: user._id });

    await expect(
      registerUserForCompetition({ competitionId: competition._id, userId: user._id })
    ).rejects.toMatchObject({ code: 'ALREADY_REGISTERED', statusCode: 409 });

    const fresh = await Competition.findById(competition._id);
    expect(fresh.spotsLeft).toBe(9); // still 9, not 8 — the failed 2nd attempt must not consume a spot

    const count = await Registration.countDocuments({ competition: competition._id, user: user._id });
    expect(count).toBe(1);
  });

  test('3. registering for a full competition (spotsLeft = 0) is rejected as SPOTS_FULL', async () => {
    const competition = await createCompetition({ totalSpots: 5, spotsLeft: 0 });
    const user = await createUser('user-3');

    await expect(
      registerUserForCompetition({ competitionId: competition._id, userId: user._id })
    ).rejects.toMatchObject({ code: 'SPOTS_FULL', statusCode: 409 });

    const fresh = await Competition.findById(competition._id);
    expect(fresh.spotsLeft).toBe(0); // never goes negative
  });

  test('4. registering after the registration deadline has passed is rejected as REGISTRATION_CLOSED', async () => {
    const past = Date.now() - 1000;
    const competition = await createCompetition({
      totalSpots: 10,
      spotsLeft: 10,
      importantDates: {
        registrationOpensAt: new Date(past - 10000),
        registrationDeadline: new Date(past),
      },
    });
    const user = await createUser('user-4');

    await expect(
      registerUserForCompetition({ competitionId: competition._id, userId: user._id })
    ).rejects.toMatchObject({ code: 'REGISTRATION_CLOSED', statusCode: 403 });

    const fresh = await Competition.findById(competition._id);
    expect(fresh.spotsLeft).toBe(10); // untouched
  });

  test('registering before the registration window has opened is rejected as REGISTRATION_NOT_OPEN', async () => {
    const future = Date.now() + 10 * 24 * 60 * 60 * 1000;
    const competition = await createCompetition({
      importantDates: {
        registrationOpensAt: new Date(future),
        registrationDeadline: new Date(future + 100000),
      },
    });
    const user = await createUser('user-5');

    await expect(
      registerUserForCompetition({ competitionId: competition._id, userId: user._id })
    ).rejects.toMatchObject({ code: 'REGISTRATION_NOT_OPEN', statusCode: 403 });
  });

  test('registering for a non-existent competition is rejected as COMPETITION_NOT_FOUND', async () => {
    const user = await createUser('user-6');
    const fakeId = new (require('mongoose').Types.ObjectId)();

    await expect(
      registerUserForCompetition({ competitionId: fakeId, userId: user._id })
    ).rejects.toMatchObject({ code: 'COMPETITION_NOT_FOUND', statusCode: 404 });
  });
});
