const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const Event = require('../models/Event');

const projectRoot = path.resolve(__dirname, '..', '..');
const localEventsFile = path.resolve(
  projectRoot,
  process.env.LOCAL_EVENTS_FILE || 'data/events.json'
);

let storageMode = 'mongo';

function useMongoStore() {
  storageMode = 'mongo';
}

function useLocalStore() {
  storageMode = 'local';
}

function getStorageMode() {
  return storageMode;
}

async function readLocalEvents() {
  try {
    const file = await fs.readFile(localEventsFile, 'utf8');
    const events = JSON.parse(file);
    return Array.isArray(events) ? events : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function writeLocalEvents(events) {
  await fs.mkdir(path.dirname(localEventsFile), { recursive: true });
  await fs.writeFile(localEventsFile, `${JSON.stringify(events, null, 2)}\n`);
}

function normalizeEvent(event) {
  const normalized = {
    _id: event._id?.toString() || new mongoose.Types.ObjectId().toString(),
    session_id: event.session_id,
    event_type: event.event_type,
    page_url: event.page_url,
    timestamp: new Date(event.timestamp || Date.now()).toISOString()
  };

  if (event.coordinates) {
    normalized.coordinates = {
      x: event.coordinates.x,
      y: event.coordinates.y
    };
  }

  if (event.page_coordinates) {
    normalized.page_coordinates = {
      x: event.page_coordinates.x,
      y: event.page_coordinates.y
    };
  }

  if (event.viewport) {
    normalized.viewport = {
      width: event.viewport.width,
      height: event.viewport.height,
      scroll_x: event.viewport.scroll_x,
      scroll_y: event.viewport.scroll_y,
      document_width: event.viewport.document_width,
      document_height: event.viewport.document_height
    };
  }

  normalized.metadata = event.metadata || {};

  return normalized;
}

async function validateEvent(payload) {
  const event = new Event(payload);
  await event.validate();
  return normalizeEvent(event.toObject());
}

async function createEvent(payload) {
  if (storageMode === 'mongo') {
    return Event.create(payload);
  }

  const event = await validateEvent(payload);
  const events = await readLocalEvents();
  events.push(event);
  await writeLocalEvents(events);

  return event;
}

async function getSessions() {
  if (storageMode === 'mongo') {
    return Event.aggregate([
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
  }

  const counts = new Map();
  const events = await readLocalEvents();

  for (const event of events) {
    counts.set(event.session_id, (counts.get(event.session_id) || 0) + 1);
  }

  return Array.from(counts, ([session_id, totalEvents]) => ({
    session_id,
    totalEvents
  })).sort((a, b) => a.session_id.localeCompare(b.session_id));
}

async function getSessionEvents(sessionId) {
  if (storageMode === 'mongo') {
    return Event.find({ session_id: sessionId }).sort({ timestamp: 1 });
  }

  const events = await readLocalEvents();

  return events
    .filter((event) => event.session_id === sessionId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

async function getHeatmapEvents(pageUrl) {
  if (storageMode === 'mongo') {
    return Event.find(
      {
        event_type: 'click',
        page_url: pageUrl
      },
      {
        _id: 0,
        coordinates: 1,
        page_coordinates: 1,
        viewport: 1,
        metadata: 1,
        timestamp: 1
      }
    ).sort({ timestamp: 1 });
  }

  const events = await readLocalEvents();

  return events
    .filter((event) => event.event_type === 'click' && event.page_url === pageUrl)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map((event) => ({
      coordinates: event.coordinates,
      page_coordinates: event.page_coordinates,
      viewport: event.viewport,
      metadata: event.metadata || {},
      timestamp: event.timestamp
    }));
}

module.exports = {
  createEvent,
  getHeatmapEvents,
  getSessionEvents,
  getSessions,
  getStorageMode,
  useLocalStore,
  useMongoStore
};
