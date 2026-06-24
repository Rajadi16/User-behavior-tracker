const express = require('express');
const eventStore = require('../stores/eventStore');

const router = express.Router();

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await eventStore.getSessions();

    res.json(sessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const events = await eventStore.getSessionEvents(req.params.sessionId);

    res.json(events);
  } catch (error) {
    console.error('Failed to fetch session events:', error);
    res.status(500).json({ message: 'Failed to fetch session events' });
  }
});

router.get('/heatmap/:pageUrl', async (req, res) => {
  try {
    const events = await eventStore.getHeatmapEvents(req.params.pageUrl);

    res.json(events);
  } catch (error) {
    console.error('Failed to fetch heatmap events:', error);
    res.status(500).json({ message: 'Failed to fetch heatmap events' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      session_id,
      event_type,
      page_url,
      timestamp,
      coordinates,
      page_coordinates,
      viewport,
      metadata
    } = req.body;

    const event = await eventStore.createEvent({
      session_id,
      event_type,
      page_url,
      timestamp,
      coordinates: event_type === 'click' ? coordinates : undefined,
      page_coordinates: event_type === 'click' ? page_coordinates : undefined,
      viewport,
      metadata: metadata && typeof metadata === 'object' ? metadata : {}
    });

    res.status(201).json({
      message: 'Event saved successfully',
      event
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Invalid event payload',
        errors: Object.values(error.errors).map((err) => err.message)
      });
    }

    console.error('Failed to save event:', error);
    res.status(500).json({ message: 'Failed to save event' });
  }
});

module.exports = router;
