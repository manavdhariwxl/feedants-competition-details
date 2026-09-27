const { computePhase, phaseToStage, computeCta } = require('./competitionLifecycle');

/**
 * Shapes a Competition document (+ optional registration state) into the exact JSON
 * the mobile screen renders. Centralizing this means the client never has to compute
 * countdowns, "is this full", or CTA copy itself - it just renders server-computed
 * values, so every user sees consistent state and business-rule changes only ever
 * happen in one place.
 *
 * @param {import('mongoose').Document} competition
 * @param {{isRegistered: boolean, registeredAt: Date|null}} registrationState
 * @param {Date} [now]
 */
function presentCompetition(competition, registrationState, now = new Date()) {
  const dates = competition.importantDates;
  const phase = computePhase(dates, now);
  const stage = phaseToStage(phase);
  const cta = computeCta({
    dates,
    now,
    spotsLeft: competition.spotsLeft,
    isRegistered: registrationState.isRegistered,
  });

  return {
    id: competition._id.toString(),
    title: competition.title,
    category: competition.category,
    tags: competition.tags,
    hasCertificate: competition.hasCertificate,

    prizePool: competition.prizePool,
    entryFee: competition.entryFee,
    currency: competition.currency,

    capacity: {
      total: competition.totalSpots,
      left: competition.spotsLeft,
      booked: competition.totalSpots - competition.spotsLeft,
      isFull: competition.spotsLeft <= 0,
    },

    judge: competition.judge,

    importantDates: {
      registrationOpensAt: dates.registrationOpensAt,
      registrationDeadline: dates.registrationDeadline,
      submissionStartsAt: dates.submissionStartsAt,
      submissionEndsAt: dates.submissionEndsAt,
      resultDate: dates.resultDate,
    },

    previousWinners: [...competition.previousWinners].sort((a, b) => a.rank - b.rank),

    about: competition.about,
    judgingParameters: competition.judgingParameters,
    rulesAndEligibility: competition.rulesAndEligibility,

    rewards: [...competition.rewards].sort((a, b) => a.rank - b.rank),
    disclaimer: competition.disclaimer,
    payment: competition.payment,
    referral: competition.referral,

    lifecycle: {
      phase, // fine-grained, for anyone who needs it
      stage, // one of the 4 stages named in the brief
    },

    registration: {
      isRegistered: registrationState.isRegistered,
      registeredAt: registrationState.registeredAt,
    },

    cta,

    serverTime: now.toISOString(),
  };
}

module.exports = { presentCompetition };
