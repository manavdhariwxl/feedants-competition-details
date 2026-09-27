/**
 * A small, explicit error type so every layer of the app (services, controllers,
 * middleware) can throw something that already knows its HTTP status code and a
 * stable machine-readable `code` the frontend can branch on, instead of guessing
 * from an error message string.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code to send.
   * @param {string} code Stable, machine-readable error code (e.g. "SPOTS_FULL").
   * @param {string} message Human-readable message, safe to show to a developer/user.
   * @param {object} [details] Optional extra context (e.g. validation field errors).
   */
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, ApiError);
  }

  static badRequest(code, message, details) {
    return new ApiError(400, code, message, details);
  }

  static notFound(code, message, details) {
    return new ApiError(404, code, message, details);
  }

  static forbidden(code, message, details) {
    return new ApiError(403, code, message, details);
  }

  static conflict(code, message, details) {
    return new ApiError(409, code, message, details);
  }
}

module.exports = ApiError;
