const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// This unique compound index is the second half of the concurrency guarantee (the
// first half is the atomic $inc guarded by spotsLeft > 0 on the Competition document —
// see services/registrationService.js). Even if two concurrent requests from the same
// user both pass the earlier "are you already registered?" read, MongoDB will only let
// one of the resulting inserts succeed; the other throws a duplicate-key error (code
// 11000), which the service layer catches and turns into a friendly ALREADY_REGISTERED
// response (and refunds the spot it had provisionally reserved).
registrationSchema.index({ competition: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
