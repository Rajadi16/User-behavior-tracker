require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const eventRoutes = require('./routes/events');

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/user_analytics';

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.use('/tracker', express.static(path.join(__dirname, '..', 'tracker')));
app.use('/demo', express.static(path.join(__dirname, '..', 'demo')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/events', eventRoutes);

async function startServer() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
