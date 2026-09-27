const Competition = require('../models/Competition');
const ApiError = require('../utils/ApiError');
const { presentCompetition } = require('../utils/competitionPresenter');
const { registerUserForCompetition, getRegistrationState } = require('../services/registrationService');

/** GET /api/competitions — minimal paginated listing (bonus; not required by the design, included to show the pattern for scaling beyond a single hardcoded screen). */
async function listCompetitions(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const [items, total] = await Promise.all([
    Competition.find({}, { title: 1, category: 1, tags: 1, prizePool: 1, entryFee: 1, spotsLeft: 1, totalSpots: 1 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Competition.countDocuments({}),
  ]);

  res.json({
    success: true,
    data: items.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      category: c.category,
      tags: c.tags,
      prizePool: c.prizePool,
      entryFee: c.entryFee,
      spotsLeft: c.spotsLeft,
      totalSpots: c.totalSpots,
    })),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

/** GET /api/competitions/:id — the main endpoint backing the Competition Details screen. */
async function getCompetitionDetails(req, res) {
  const competition = await Competition.findById(req.params.id);
  if (!competition) {
    throw ApiError.notFound('COMPETITION_NOT_FOUND', 'This competition does not exist.');
  }

  const registrationState = await getRegistrationState(competition._id, req.user ? req.user._id : null);
  res.json({ success: true, data: presentCompetition(competition, registrationState) });
}

/** GET /api/competitions/:id/registration-status — lighter, targeted endpoint for just this user's state. */
async function getMyRegistrationStatus(req, res) {
  const competition = await Competition.findById(req.params.id, { _id: 1 }).lean();
  if (!competition) {
    throw ApiError.notFound('COMPETITION_NOT_FOUND', 'This competition does not exist.');
  }

  const state = await getRegistrationState(competition._id, req.user ? req.user._id : null);
  res.json({ success: true, data: state });
}

/** POST /api/competitions/:id/register — the concurrency-critical write endpoint. */
async function registerForCompetition(req, res) {
  const { registration, competition } = await registerUserForCompetition({
    competitionId: req.params.id,
    userId: req.user._id,
  });

  const registrationState = { isRegistered: true, registeredAt: registration.registeredAt };
  res.status(201).json({
    success: true,
    data: {
      registration: {
        id: registration._id.toString(),
        registeredAt: registration.registeredAt,
      },
      competition: presentCompetition(competition, registrationState),
    },
  });
}

module.exports = {
  listCompetitions,
  getCompetitionDetails,
  getMyRegistrationStatus,
  registerForCompetition,
};
