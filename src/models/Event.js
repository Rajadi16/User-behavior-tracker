const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    session_id: {
      type: String,
      required: true,
      trim: true
    },
    event_type: {
      type: String,
      required: true,
      trim: true
    },
    page_url: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },
    coordinates: {
      x: {
        type: Number,
        required: function () {
          return this.event_type === 'click';
        }
      },
      y: {
        type: Number,
        required: function () {
          return this.event_type === 'click';
        }
      }
    }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model('Event', eventSchema);
