const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

/** Ensures req.params[paramName] is a syntactically valid Mongo ObjectId before it ever reaches a query. */
function validateObjectIdParam(paramName) {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!mongoose.isValidObjectId(value)) {
      throw ApiError.badRequest('INVALID_ID', `"${value}" is not a valid ${paramName}.`);
    }
    next();
  };
}

module.exports = { validateObjectIdParam };
