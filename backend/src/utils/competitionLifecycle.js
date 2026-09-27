/**
 * All the "what state is this competition in, and what should the user be able to do
 * right now" logic lives here, as pure functions of (dates, capacity, registration).
 * Keeping it out of Mongoose models / Express controllers means:
 *   1. It can be unit-tested with plain objects and fake clocks, no DB required.
 *   2. There is exactly one place that decides this, so the API is the single source
 *      of truth and the mobile app never has to re-implement (and risk diverging from)
 *      this logic on the client.
 *
 * The brief names four lifecycle states: Upcoming / Registration open /
 * Registration-submission closed / Results announced. The design mock also shows a
 * "Submission Starts" and "Submission Ends" date that don't map cleanly onto only
 * four buckets (e.g. submission can open *before* the registration deadline passes).
 * So internally we compute five fine-grained phases and then fold them down to the
 * brief's four labels for display, while still using the fine-grained phase to decide
 * exactly what the call-to-action button should say and do.
 */

/** Fine-grained phases used internally for business logic. */
const Phase = Object.freeze({
  UPCOMING: 'UPCOMING',
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED_SUBMISSION_OPEN: 'REGISTRATION_CLOSED_SUBMISSION_OPEN',
  SUBMISSION_CLOSED_AWAITING_RESULTS: 'SUBMISSION_CLOSED_AWAITING_RESULTS',
  RESULTS_ANNOUNCED: 'RESULTS_ANNOUNCED',
});

/** The four coarse stages named explicitly in the assignment brief. */
const Stage = Object.freeze({
  UPCOMING: 'UPCOMING',
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
  REGISTRATION_SUBMISSION_CLOSED: 'REGISTRATION_SUBMISSION_CLOSED',
  RESULTS_ANNOUNCED: 'RESULTS_ANNOUNCED',
});

const CtaAction = Object.freeze({
  REGISTER: 'REGISTER',
  UPLOAD_SUBMISSION: 'UPLOAD_SUBMISSION',
  VIEW_RESULTS: 'VIEW_RESULTS',
  NONE: 'NONE',
});

/**
 * @param {{registrationOpensAt: Date, registrationDeadline: Date, submissionStartsAt: Date, submissionEndsAt: Date, resultDate: Date}} dates
 * @param {Date} now
 * @returns {string} one of Phase
 */
function computePhase(dates, now) {
  const t = now.getTime();
  if (t < dates.registrationOpensAt.getTime()) return Phase.UPCOMING;
  if (t <= dates.registrationDeadline.getTime()) return Phase.REGISTRATION_OPEN;
  if (t < dates.submissionEndsAt.getTime()) return Phase.REGISTRATION_CLOSED_SUBMISSION_OPEN;
  if (t < dates.resultDate.getTime()) return Phase.SUBMISSION_CLOSED_AWAITING_RESULTS;
  return Phase.RESULTS_ANNOUNCED;
}

/** Folds a fine-grained phase down to the four stage labels named in the brief. */
function phaseToStage(phase) {
  switch (phase) {
    case Phase.UPCOMING:
      return Stage.UPCOMING;
    case Phase.REGISTRATION_OPEN:
      return Stage.REGISTRATION_OPEN;
    case Phase.REGISTRATION_CLOSED_SUBMISSION_OPEN:
    case Phase.SUBMISSION_CLOSED_AWAITING_RESULTS:
      return Stage.REGISTRATION_SUBMISSION_CLOSED;
    case Phase.RESULTS_ANNOUNCED:
      return Stage.RESULTS_ANNOUNCED;
    default:
      throw new Error(`Unknown phase: ${phase}`);
  }
}

/**
 * Whether a NEW registration attempt is allowed right now, from a pure timing point of
 * view (capacity is checked separately, atomically, at write time in the service layer
 * — this function must never be the thing that guarantees no-overselling).
 */
function isRegistrationWindowOpen(dates, now) {
  return computePhase(dates, now) === Phase.REGISTRATION_OPEN;
}

function isSubmissionWindowOpen(dates, now) {
  const t = now.getTime();
  return t >= dates.submissionStartsAt.getTime() && t < dates.submissionEndsAt.getTime();
}

/**
 * Decides what the single bottom call-to-action button should show.
 *
 * @param {object} params
 * @param {object} params.dates important dates (see computePhase)
 * @param {Date} params.now
 * @param {number} params.spotsLeft
 * @param {boolean} params.isRegistered whether the requesting user already has a registration
 * @returns {{label: string, secondaryLabel: string|null, enabled: boolean, action: string}}
 */
function computeCta({ dates, now, spotsLeft, isRegistered }) {
  const phase = computePhase(dates, now);
  const submissionOpen = isSubmissionWindowOpen(dates, now);

  if (isRegistered) {
    const secondaryLabel = 'Registered';
    if (submissionOpen) {
      return { label: 'Upload Submission', secondaryLabel, enabled: true, action: CtaAction.UPLOAD_SUBMISSION };
    }
    if (now.getTime() < dates.submissionStartsAt.getTime()) {
      return { label: 'Submission Opens Soon', secondaryLabel, enabled: false, action: CtaAction.NONE };
    }
    // Compare directly against resultDate (rather than trusting the coarse `phase`,
    // which is derived from registrationDeadline) so this stays correct even if a
    // competition's dates were hand-edited into an unusual combination.
    if (now.getTime() >= dates.resultDate.getTime()) {
      return { label: 'View Results', secondaryLabel, enabled: true, action: CtaAction.VIEW_RESULTS };
    }
    // submissionEndsAt has passed but resultDate has not.
    return { label: 'Awaiting Results', secondaryLabel, enabled: false, action: CtaAction.NONE };
  }

  // Not registered.
  if (phase === Phase.UPCOMING) {
    return { label: 'Registration Opens Soon', secondaryLabel: null, enabled: false, action: CtaAction.NONE };
  }
  if (phase === Phase.REGISTRATION_OPEN) {
    if (spotsLeft > 0) {
      return { label: 'Register Now', secondaryLabel: null, enabled: true, action: CtaAction.REGISTER };
    }
    return { label: 'Spots Full', secondaryLabel: null, enabled: false, action: CtaAction.NONE };
  }
  // Registration window has closed and the user never registered.
  return { label: 'Registration Closed', secondaryLabel: null, enabled: false, action: CtaAction.NONE };
}

module.exports = {
  Phase,
  Stage,
  CtaAction,
  computePhase,
  phaseToStage,
  isRegistrationWindowOpen,
  isSubmissionWindowOpen,
  computeCta,
};
