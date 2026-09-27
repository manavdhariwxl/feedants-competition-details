const mongoose = require('mongoose');

/**
 * A deliberately lightweight "user" record.
 *
 * The assignment brief doesn't ask for a login/auth system, and building one (signup,
 * password hashing, JWT issuance/refresh, session handling) would add a large amount
 * of surface area without demonstrating any of the competition/registration business
 * logic this assignment is actually evaluating. Instead, the mobile app generates a
 * random, persistent `deviceId` on first launch (stored in AsyncStorage) and sends it
 * on every request via the `x-device-id` header. This backend "identifies" a user by
 * upserting a User document for that deviceId the first time it's seen.
 *
 * This is explicitly called out as an assumption/trade-off in the README: in a real
 * production system this would be replaced by proper authentication, and the server
 * would derive the user from a verified session/JWT rather than a trusted header.
 */
const userSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      default: 'Guest User',
      trim: true,
      maxlength: 60,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
