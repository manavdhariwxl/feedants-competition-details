const { computePhase, phaseToStage, computeCta, Phase, Stage, CtaAction } = require('../src/utils/competitionLifecycle');

const DAY = 24 * 60 * 60 * 1000;
const now = new Date('2026-09-27T00:00:00.000Z');

function dates(overrides = {}) {
  return {
    registrationOpensAt: new Date(now.getTime() - 5 * DAY),
    registrationDeadline: new Date(now.getTime() + 1 * DAY),
    submissionStartsAt: new Date(now.getTime() - 2 * DAY),
    submissionEndsAt: new Date(now.getTime() + 10 * DAY),
    resultDate: new Date(now.getTime() + 15 * DAY),
    ...overrides,
  };
}

describe('computePhase', () => {
  test('before registrationOpensAt -> UPCOMING', () => {
    const d = dates({ registrationOpensAt: new Date(now.getTime() + DAY) });
    expect(computePhase(d, now)).toBe(Phase.UPCOMING);
  });

  test('between open and deadline -> REGISTRATION_OPEN', () => {
    expect(computePhase(dates(), now)).toBe(Phase.REGISTRATION_OPEN);
  });

  test('after deadline but before submissionEndsAt -> REGISTRATION_CLOSED_SUBMISSION_OPEN', () => {
    const d = dates({ registrationDeadline: new Date(now.getTime() - DAY) });
    expect(computePhase(d, now)).toBe(Phase.REGISTRATION_CLOSED_SUBMISSION_OPEN);
  });

  test('after submissionEndsAt but before resultDate -> SUBMISSION_CLOSED_AWAITING_RESULTS', () => {
    const d = dates({ registrationDeadline: new Date(now.getTime() - 5 * DAY), submissionEndsAt: new Date(now.getTime() - DAY) });
    expect(computePhase(d, now)).toBe(Phase.SUBMISSION_CLOSED_AWAITING_RESULTS);
  });

  test('after resultDate -> RESULTS_ANNOUNCED', () => {
    const d = dates({ resultDate: new Date(now.getTime() - DAY), submissionEndsAt: new Date(now.getTime() - 2 * DAY), registrationDeadline: new Date(now.getTime() - 5 * DAY) });
    expect(computePhase(d, now)).toBe(Phase.RESULTS_ANNOUNCED);
  });
});

describe('phaseToStage folds 5 phases down to the brief\'s 4 named stages', () => {
  test('both closed sub-phases map to the same coarse stage', () => {
    expect(phaseToStage(Phase.REGISTRATION_CLOSED_SUBMISSION_OPEN)).toBe(Stage.REGISTRATION_SUBMISSION_CLOSED);
    expect(phaseToStage(Phase.SUBMISSION_CLOSED_AWAITING_RESULTS)).toBe(Stage.REGISTRATION_SUBMISSION_CLOSED);
  });
});

describe('computeCta', () => {
  test('not registered, spots available, registration open -> Register Now', () => {
    const cta = computeCta({ dates: dates(), now, spotsLeft: 5, isRegistered: false });
    expect(cta).toMatchObject({ label: 'Register Now', enabled: true, action: CtaAction.REGISTER });
  });

  test('not registered, spots full, registration open -> Spots Full (disabled)', () => {
    const cta = computeCta({ dates: dates(), now, spotsLeft: 0, isRegistered: false });
    expect(cta).toMatchObject({ label: 'Spots Full', enabled: false, action: CtaAction.NONE });
  });

  test('not registered, still upcoming -> disabled, opens soon', () => {
    const d = dates({ registrationOpensAt: new Date(now.getTime() + DAY) });
    const cta = computeCta({ dates: d, now, spotsLeft: 5, isRegistered: false });
    expect(cta).toMatchObject({ enabled: false, action: CtaAction.NONE });
  });

  test('registered and submission window is open -> Upload Submission (matches the design mock)', () => {
    // This matches Objective_Page.png: registration is still open (countdown visible)
    // AND the CTA already reads "Upload Submission" because submissionStartsAt has passed.
    const cta = computeCta({ dates: dates(), now, spotsLeft: 5, isRegistered: true });
    expect(cta).toMatchObject({ label: 'Upload Submission', secondaryLabel: 'Registered', enabled: true, action: CtaAction.UPLOAD_SUBMISSION });
  });

  test('registered but submission has not started yet -> disabled, submission opens soon', () => {
    const d = dates({ submissionStartsAt: new Date(now.getTime() + DAY) });
    const cta = computeCta({ dates: d, now, spotsLeft: 5, isRegistered: true });
    expect(cta).toMatchObject({ enabled: false, secondaryLabel: 'Registered', action: CtaAction.NONE });
  });

  test('registered, submission window closed, awaiting results -> disabled, Awaiting Results', () => {
    const d = dates({ submissionEndsAt: new Date(now.getTime() - DAY) });
    const cta = computeCta({ dates: d, now, spotsLeft: 5, isRegistered: true });
    expect(cta).toMatchObject({ label: 'Awaiting Results', enabled: false, action: CtaAction.NONE });
  });

  test('registered, results announced -> View Results', () => {
    const d = dates({ resultDate: new Date(now.getTime() - DAY), submissionEndsAt: new Date(now.getTime() - 2 * DAY) });
    const cta = computeCta({ dates: d, now, spotsLeft: 5, isRegistered: true });
    expect(cta).toMatchObject({ label: 'View Results', enabled: true, action: CtaAction.VIEW_RESULTS });
  });

  test('not registered, registration deadline passed -> Registration Closed (disabled)', () => {
    const d = dates({ registrationDeadline: new Date(now.getTime() - DAY) });
    const cta = computeCta({ dates: d, now, spotsLeft: 5, isRegistered: false });
    expect(cta).toMatchObject({ label: 'Registration Closed', enabled: false, action: CtaAction.NONE });
  });
});
