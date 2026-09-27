const mongoose = require('mongoose');

const judgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true }, // e.g. "Professional Kathak Dancer"
    experienceYears: { type: Number, min: 0 },
    photoUrl: { type: String, trim: true },
    introVideoUrl: { type: String, trim: true },
  },
  { _id: false }
);

const importantDatesSchema = new mongoose.Schema(
  {
    registrationOpensAt: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    submissionStartsAt: { type: Date, required: true },
    submissionEndsAt: { type: Date, required: true },
    resultDate: { type: Date, required: true },
  },
  { _id: false }
);

const winnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rank: { type: Number, required: true, min: 1 },
    label: { type: String, trim: true }, // e.g. "1st Winner"
    imageUrl: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
  },
  { _id: false }
);

const rewardSchema = new mongoose.Schema(
  {
    rank: { type: Number, required: true, min: 1 },
    label: { type: String, required: true, trim: true }, // e.g. "1st Winner"
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const paymentInfoSchema = new mongoose.Schema(
  {
    provider: { type: String, default: 'Razorpay', trim: true },
    refundPolicyUrl: { type: String, trim: true },
    payoutInfoVideoUrl: { type: String, trim: true },
  },
  { _id: false }
);

const referralSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true },
    link: { type: String, trim: true },
    rewardAmount: { type: Number, min: 0 },
  },
  { _id: false }
);

const competitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true }, // e.g. "Dance"
    tags: { type: [String], default: [] },
    hasCertificate: { type: Boolean, default: false },

    prizePool: { type: Number, required: true, min: 0 },
    entryFee: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },

    // `totalSpots` never changes after creation. `spotsLeft` is the single field that
    // the concurrency-safe registration flow atomically decrements — see
    // services/registrationService.js. Deriving "left" on the fly by COUNT()-ing the
    // Registration collection on every read would be more "normalized" but would make
    // the write path a read-then-write across two collections, which is exactly the
    // race condition the assignment asks us to avoid. Denormalizing `spotsLeft` onto
    // the Competition document lets a single atomic `findOneAndUpdate` be the entire
    // concurrency guarantee for capacity.
    totalSpots: { type: Number, required: true, min: 0 },
    spotsLeft: { type: Number, required: true, min: 0 },

    judge: { type: judgeSchema, required: true },
    importantDates: { type: importantDatesSchema, required: true },
    previousWinners: { type: [winnerSchema], default: [] },

    about: { type: String, default: '' },
    judgingParameters: { type: String, default: '' },
    rulesAndEligibility: { type: String, default: '' },

    rewards: { type: [rewardSchema], default: [] },
    disclaimer: { type: String, default: '' },

    payment: { type: paymentInfoSchema, default: () => ({}) },
    referral: { type: referralSchema, default: () => ({}) },
  },
  { timestamps: true }
);

competitionSchema.index({ category: 1, 'importantDates.registrationDeadline': 1 });

// Guard against a bad seed/migration ever creating an inconsistent document: spotsLeft
// can never exceed totalSpots. (It CAN legitimately be less, obviously.) This is a
// belt-and-suspenders check, not the concurrency mechanism itself.
competitionSchema.pre('validate', function guardCapacity(next) {
  if (this.spotsLeft > this.totalSpots) {
    return next(new Error('spotsLeft cannot exceed totalSpots'));
  }
  next();
});

module.exports = mongoose.model('Competition', competitionSchema);
