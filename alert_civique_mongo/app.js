const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const messageRoutes = require('./routes/messageRoutes');
const videoRoutes = require('./routes/videoRoutes');
const livestreamRoutes = require('./routes/livestreamRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  app.use('/api', messageRoutes);
  app.use('/api', videoRoutes);
  app.use('/api', livestreamRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  app.get('/', (req, res) => {
    res.json({ name: 'Alert Civique Server', version: '2.1.0' });
  });

  app.post('/api/alert', require('./controllers/messageController').sendAlert);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
