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
      trim: true,
      enum: ['page_view', 'click']
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
        min: 0,
        required: function () {
          return this.event_type === 'click';
        }
      },
      y: {
        type: Number,
        min: 0,
        required: function () {
          return this.event_type === 'click';
        }
      }
    },
    page_coordinates: {
      x: {
        type: Number,
        min: 0
      },
      y: {
        type: Number,
        min: 0
      }
    },
    viewport: {
      width: {
        type: Number,
        min: 0
      },
      height: {
        type: Number,
        min: 0
      },
      scroll_x: {
        type: Number,
        min: 0
      },
      scroll_y: {
        type: Number,
        min: 0
      },
      document_width: {
        type: Number,
        min: 0
      },
      document_height: {
        type: Number,
        min: 0
      }
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    versionKey: false
  }
);

eventSchema.index({ session_id: 1, timestamp: 1 });
eventSchema.index({ page_url: 1, event_type: 1, timestamp: 1 });

module.exports = mongoose.model('Event', eventSchema);
