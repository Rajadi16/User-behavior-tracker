const express = require('express');
const Event = require('../models/Event');

const router = express.Router();

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
