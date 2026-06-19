import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Clock, ExternalLink, MousePointerClick } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getSessionEvents(sessionId) {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/events/sessions/${encodeURIComponent(sessionId)}`
    );
    return { events: response.data, error: null };
  } catch (error) {
    return { events: [], error: 'Unable to load events for this session.' };
  }
}

function formatTimestamp(timestamp) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  }).format(new Date(timestamp));
}

export default async function SessionJourneyPage({ params }) {
  const { sessionId } = await params;
  const decodedSessionId = decodeURIComponent(sessionId);
  const { events, error } = await getSessionEvents(decodedSessionId);

  return (
    <>
      <section className="page-heading">
        <div>
          <Link className="back-link" href="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Sessions
          </Link>
          <h1>Journey</h1>
          <p className="session-id muted">{decodedSessionId}</p>
        </div>
        <div className="metric" aria-label={`${events.length} events`}>
          <MousePointerClick size={18} aria-hidden="true" />
          {events.length} events
        </div>
      </section>

      <section className="timeline-panel">
        {error ? (
          <div className="error-state">{error}</div>
        ) : events.length === 0 ? (
          <div className="empty-state">No events recorded for this session.</div>
        ) : (
          <ol className="timeline">
            {events.map((event) => (
              <li className="timeline-item" key={event._id}>
                <time className="timestamp" dateTime={event.timestamp}>
                  <Clock size={14} aria-hidden="true" />
                  {' '}
                  {formatTimestamp(event.timestamp)}
                </time>
                <div className="event-body">
                  <div className="event-type">
                    <MousePointerClick size={17} aria-hidden="true" />
                    {event.event_type}
                  </div>
                  <div className="event-details">
                    <span className="pill">{event.page_url}</span>
                    {event.coordinates ? (
                      <span className="pill">
                        x {event.coordinates.x}, y {event.coordinates.y}
                      </span>
                    ) : null}
                    <Link
                      className="inline-link"
                      href={`/heatmap?pageUrl=${encodeURIComponent(event.page_url)}`}
                    >
                      Heatmap
                      <ExternalLink size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
