const express = require('express');
const Event = require('../models/Event');

const router = express.Router();

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: '$session_id',
          totalEvents: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          session_id: '$_id',
          totalEvents: 1
        }
      },
      {
        $sort: {
          session_id: 1
        }
      }
    ]);

    res.json(sessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const events = await Event.find({ session_id: req.params.sessionId }).sort({
      timestamp: 1
    });

    res.json(events);
  } catch (error) {
    console.error('Failed to fetch session events:', error);
    res.status(500).json({ message: 'Failed to fetch session events' });
  }
});

router.get('/heatmap/:pageUrl', async (req, res) => {
  try {
    const events = await Event.find(
      {
        event_type: 'click',
        page_url: req.params.pageUrl
      },
      {
        _id: 0,
        coordinates: 1,
        timestamp: 1
      }
    ).sort({ timestamp: 1 });

    res.json(events);
  } catch (error) {
    console.error('Failed to fetch heatmap events:', error);
    res.status(500).json({ message: 'Failed to fetch heatmap events' });
  }
});

router.post('/', async (req, res) => {
  try {
    const event = await Event.create(req.body);

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
