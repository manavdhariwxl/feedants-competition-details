const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const ApiError = require('../utils/ApiError');
const { computePhase, Phase } = require('../utils/competitionLifecycle');

/**
 * Looks up whether `user` has an existing registration for `competitionId`.
 * Used both for building the read-side DTO and, sometimes, for producing friendlier
 * error messages (never for the correctness guarantee itself - see below).
 */
async function getRegistrationState(competitionId, userId) {
  if (!userId) return { isRegistered: false, registeredAt: null };
  const existing = await Registration.findOne({ competition: competitionId, user: userId }).lean();
  return existing
    ? { isRegistered: true, registeredAt: existing.registeredAt }
    : { isRegistered: false, registeredAt: null };
}

/**
 * Registers `user` for `competition`, concurrency-safely.
 *
 * THE CORE GUARANTEE THIS FUNCTION PROVIDES:
 *   1. spotsLeft can never go negative, even if far more requests arrive at once than
 *      there are remaining spots ("no overselling").
 *   2. The same user can never end up with two Registration documents for the same
 *      competition, even if their own client fires duplicate/concurrent requests.
 *
 * HOW:
 *   Step 2 below performs a single atomic `findOneAndUpdate` with the capacity check
 *   (`spotsLeft: { $gt: 0 }`) baked into the *query filter itself*, not as a separate
 *   read beforehand. MongoDB guarantees atomicity for a single document's update, so
 *   there is no window in which two requests can both observe `spotsLeft: 1` and both
 *   proceed to decrement - if 10 requests race for the last spot, the database
 *   serializes them and only one `findOneAndUpdate` call will actually match and
 *   decrement; the rest naturally get `null` back because by the time MongoDB
 *   evaluates their filter, spotsLeft is already 0. This intentionally avoids the
 *   classic (and broken) "read spotsLeft, check in application code, then write"
 *   pattern, which has a race window between the read and the write.
 *
 *   Step 4 relies on the unique compound index on { competition, user } (see
 *   Registration model) to guarantee the no-duplicate-registration property even under
 *   concurrency, for the same reason: a unique index violation is enforced atomically
 *   by the database's storage engine, not by application-level "check then insert"
 *   code. If the duplicate-key error fires, the spot we optimistically reserved in
 *   step 2 is handed back in step 5 (compensating action), since that attempt did not
 *   actually end up consuming a spot.
 *
 * An alternative considered: wrapping steps 2 and 4 in a multi-document ACID
 * transaction (mongoose session) instead of "atomic op + compensation". That would
 * also be correct, but requires MongoDB to be running as a replica set (transactions
 * are not available on a single standalone `mongod`, which is what most local dev
 * setups and this assignment's default `.env.example` use). The atomic-update +
 * compensating-rollback approach gives the same correctness guarantees while working
 * against a plain standalone MongoDB instance. This trade-off is discussed further in
 * the README.
 */
async function registerUserForCompetition({ competitionId, userId }) {
  const now = new Date();

  // --- Step 1: fetch once, purely to produce a precise, friendly error message if
  // registration isn't allowed for a *timing* reason. This read is NOT relied upon for
  // correctness - it's fine if it's stale by the time step 2 runs, because step 2
  // re-checks the deadline atomically as part of its own filter.
  const competition = await Competition.findById(competitionId);
  if (!competition) {
    throw ApiError.notFound('COMPETITION_NOT_FOUND', 'This competition does not exist.');
  }

  const phase = computePhase(competition.importantDates, now);
  if (phase === Phase.UPCOMING) {
    throw ApiError.forbidden('REGISTRATION_NOT_OPEN', 'Registration has not opened yet for this competition.');
  }
  if (phase !== Phase.REGISTRATION_OPEN) {
    throw ApiError.forbidden('REGISTRATION_CLOSED', 'The registration window for this competition has closed.');
  }

  // --- Step 2: THE atomic capacity check + reservation. This one call is the entire
  // "never oversell" guarantee.
  const updated = await Competition.findOneAndUpdate(
    {
      _id: competitionId,
      spotsLeft: { $gt: 0 },
      'importantDates.registrationDeadline': { $gte: now },
    },
    { $inc: { spotsLeft: -1 } },
    { new: true }
  );

  if (!updated) {
    // Someone else consumed the last spot (or the deadline lapsed) between step 1 and
    // step 2 - re-check to report the precise reason.
    const fresh = await Competition.findById(competitionId).lean();
    if (fresh && fresh.spotsLeft <= 0) {
      throw ApiError.conflict('SPOTS_FULL', 'All spots for this competition have just been taken.');
    }
    throw ApiError.forbidden('REGISTRATION_CLOSED', 'The registration window for this competition has closed.');
  }

  // --- Steps 3-5: persist the registration; the unique index is the duplicate-proof
  // guarantee. If it fires, refund the spot reserved in step 2 and report a clean error.
  try {
    const registration = await Registration.create({
      competition: competitionId,
      user: userId,
      registeredAt: now,
    });

    return { registration, competition: updated };
  } catch (err) {
    await Competition.updateOne({ _id: competitionId }, { $inc: { spotsLeft: 1 } });

    if (err && err.code === 11000) {
      throw ApiError.conflict('ALREADY_REGISTERED', 'You are already registered for this competition.');
    }
    throw err;
  }
}

module.exports = { registerUserForCompetition, getRegistrationState };
