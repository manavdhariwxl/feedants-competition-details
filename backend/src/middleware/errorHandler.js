const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

/** 404 handler for routes that don't match anything - mounted after all routes. */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: { code: 'ROUTE_NOT_FOUND', message: `No route: ${req.method} ${req.originalUrl}` },
  });
}

/**
 * Centralized error handler. Every controller in this app is wrapped by
 * express-async-errors, so a thrown/rejected error from an async route handler ends up
 * here automatically without needing try/catch boilerplate in every controller.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'One or more fields are invalid.',
        details: Object.fromEntries(
          Object.entries(err.errors).map(([field, e]) => [field, e.message])
        ),
      },
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ID', message: `Invalid identifier: ${err.value}` },
    });
  }

  if (err && err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE', message: 'This resource already exists.' },
    });
  }

  // Anything unexpected: log full detail server-side, but never leak internals to the
  // client in production.
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd ? 'Something went wrong. Please try again.' : err.message,
    },
  });
}

module.exports = { notFoundHandler, errorHandler };
