const Competition = require('../src/models/Competition');
const User = require('../src/models/User');

const DAY = 24 * 60 * 60 * 1000;

/** Builds a competition that is currently open for registration, unless dateOverrides says otherwise. */
async function createCompetition(overrides = {}) {
  const now = Date.now();
  const base = {
    title: 'Test Competition',
    category: 'Dance',
    tags: ['Dance'],
    hasCertificate: true,
    prizePool: 1000,
    entryFee: 50,
    totalSpots: 10,
    spotsLeft: 10,
    judge: { name: 'Test Judge', title: 'Expert', experienceYears: 5 },
    importantDates: {
      registrationOpensAt: new Date(now - DAY),
      registrationDeadline: new Date(now + DAY),
      submissionStartsAt: new Date(now - DAY),
      submissionEndsAt: new Date(now + 5 * DAY),
      resultDate: new Date(now + 10 * DAY),
    },
    previousWinners: [],
    about: 'about',
    judgingParameters: 'params',
    rulesAndEligibility: 'rules',
    rewards: [{ rank: 1, label: '1st Winner', amount: 100 }],
    disclaimer: 'disclaimer',
  };

  return Competition.create({ ...base, ...overrides, importantDates: { ...base.importantDates, ...(overrides.importantDates || {}) } });
}

async function createUser(deviceId) {
  return User.create({ deviceId });
}

module.exports = { createCompetition, createUser };
