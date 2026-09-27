const mongoose = require('mongoose');

/**
 * Connects to MongoDB using MONGODB_URI. Kept as a single small module so tests can
 * import and manage the connection independently of the HTTP server (see tests/setup).
 */
async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and configure it.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    // Fail fast in dev instead of hanging silently if Mongo is unreachable.
    serverSelectionTimeoutMS: 8000,
  });

  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
