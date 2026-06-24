import axios from 'axios';
import Link from 'next/link';
import { ArrowRight, Database, MousePointerClick } from 'lucide-react';
import { apiUrl } from '../src/config/api';

export const dynamic = 'force-dynamic';

async function getSessions() {
  try {
    const response = await axios.get(apiUrl('/api/events/sessions'));
    return { sessions: response.data, error: null };
  } catch (error) {
    return { sessions: [], error: 'Unable to load sessions from the API.' };
  }
}

export default async function SessionsPage() {
  const { sessions, error } = await getSessions();

  return (
    <>
      <section className="page-heading">
        <div>
          <h1>Sessions</h1>
          <p className="muted">Recorded user journeys grouped by session.</p>
        </div>
        <div className="metric" aria-label={`${sessions.length} sessions`}>
          <Database size={18} aria-hidden="true" />
          {sessions.length} sessions
        </div>
      </section>

      <section className="table-panel">
        {error ? (
          <div className="error-state">{error}</div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">No sessions recorded.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Total Events</th>
                <th>Journey</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.session_id}>
                  <td className="session-id">{session.session_id}</td>
                  <td>
                    <span className="metric">
                      <MousePointerClick size={17} aria-hidden="true" />
                      {session.totalEvents}
                    </span>
                  </td>
                  <td>
                    <Link className="inline-link" href={`/sessions/${encodeURIComponent(session.session_id)}`}>
                      Open
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
