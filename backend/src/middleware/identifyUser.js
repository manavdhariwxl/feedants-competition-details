const User = require('../models/User');

/**
 * Reads `x-device-id` from the request headers and attaches the corresponding User
 * document to `req.user` (creating it on first sight). Never throws for a *missing*
 * header on its own — some endpoints (e.g. viewing competition details) are meant to
 * work for anonymous/guest viewers too. Routes that require a known user (registering)
 * check `req.user` themselves and reject if it's missing — see requireUser below.
 */
async function identifyUser(req, res, next) {
  const deviceId = req.header('x-device-id');

  if (!deviceId) {
    req.user = null;
    return next();
  }

  if (typeof deviceId !== 'string' || deviceId.length < 6 || deviceId.length > 128) {
    req.user = null;
    return next();
  }

  req.user = await User.findOneAndUpdate(
    { deviceId },
    { $setOnInsert: { deviceId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  next();
}

const ApiError = require('../utils/ApiError');

/** Use after identifyUser on routes that require a known caller (e.g. registering). */
function requireUser(req, res, next) {
  if (!req.user) {
    throw ApiError.badRequest(
      'MISSING_DEVICE_ID',
      'A valid "x-device-id" header is required for this action.'
    );
  }
  next();
}

module.exports = { identifyUser, requireUser };
