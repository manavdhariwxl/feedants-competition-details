require('express-async-errors'); // lets thrown/rejected errors in async route handlers reach errorHandler automatically

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const competitionRoutes = require('./routes/competitionRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*' ? process.env.CORS_ORIGIN.split(',') : '*',
    })
  );
  app.use(express.json());

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } }));

  app.use('/api/competitions', competitionRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
