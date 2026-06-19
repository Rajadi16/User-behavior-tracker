# User Behavior Tracker

A small full-stack user analytics application for tracking page views and clicks, storing events in MongoDB, and viewing sessions, journeys, and click heatmaps in a Next.js dashboard.

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- Next.js
- React
- Axios
- lucide-react
- Standalone browser JavaScript tracker

## Features

- Tracks `page_view` and `click` events from a webpage.
- Persists `session_id` in `localStorage`.
- Stores events in MongoDB.
- Lists sessions with total event counts.
- Shows chronological user journeys for each session.
- Shows click positions for a selected page URL as a heatmap.
- Includes a demo webpage for testing the tracker.

## Project Structure

```text
app/                  Next.js dashboard routes
components/           Dashboard components
demo/                 Demo webpage that loads the tracker
src/models/           Mongoose schemas
src/routes/           Express API routes
src/server.js         Express API server
tracker/tracker.js    Standalone browser tracking script
```

## Setup

Install dependencies:

```powershell
npm.cmd install
```

Create an environment file:

```powershell
copy .env.example .env
```

Make sure MongoDB is running locally, then start the backend API:

```powershell
npm.cmd start
```

The API runs on:

```text
http://localhost:5000
```

Start the Next.js dashboard in a second terminal:

```powershell
npm.cmd run dashboard
```

The dashboard runs on:

```text
http://localhost:3000
```

Open the demo page:

```text
http://localhost:5000/demo/
```

Click around the demo page, then open the dashboard to view sessions and heatmap data.

## API Endpoints

Create an event:

```http
POST /api/events
```

Example payload:

```json
{
  "session_id": "8f4e2f8d-5b7f-4f2b-89f7-5e9d31d6f241",
  "event_type": "click",
  "page_url": "http://localhost:5000/demo/",
  "timestamp": "2026-06-20T10:30:00.000Z",
  "coordinates": {
    "x": 240,
    "y": 360
  }
}
```

Fetch sessions with event counts:

```http
GET /api/events/sessions
```

Fetch events for one session:

```http
GET /api/events/sessions/:sessionId
```

Fetch click data for a page:

```http
GET /api/events/heatmap/:pageUrl
```

For full page URLs, URL-encode the `pageUrl` value.

## Dashboard Views

- `/` lists all tracked sessions and total event counts.
- `/sessions/[sessionId]` shows the ordered event journey for a session.
- `/heatmap?pageUrl=<encoded-page-url>` shows click locations for a page.

## Tracker Usage

Add the standalone tracker to any page:

```html
<script src="http://localhost:5000/tracker/tracker.js"></script>
```

The tracker sends events to:

```text
http://localhost:5000/api/events
```

## Assumptions and Trade-offs

- `localStorage` is used for session persistence because it is simple and works well for this assignment scope.
- Click heatmap coordinates are rendered against a fixed reference size of `1440 x 900` and scaled into the dashboard container.
- The tracker uses `navigator.sendBeacon()` so events can be sent without blocking page navigation.
- The API allows CORS for local testing and demo usage.
- Authentication, rate limiting, batching, and production deployment configuration are outside the current assignment scope.

## Useful Commands

Build the dashboard:

```powershell
npm.cmd run dashboard:build
```

Run the API with file watching:

```powershell
npm.cmd run dev
```
