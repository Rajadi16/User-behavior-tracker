import axios from 'axios';
import { Flame } from 'lucide-react';
import { apiUrl } from '../src/config/api';

const REFERENCE_WIDTH = 1440;
const REFERENCE_HEIGHT = 900;

async function getClickEvents(pageUrl) {
  if (!pageUrl) {
    return { clicks: [], error: null };
  }

  try {
    const response = await axios.get(
      apiUrl(`/api/events/heatmap/${encodeURIComponent(pageUrl)}`)
    );
    return { clicks: response.data, error: null };
  } catch (error) {
    return { clicks: [], error: 'Unable to load heatmap data from the API.' };
  }
}

function toPercentage(value, maximum) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return '0%';
  }

  const boundedValue = Math.min(Math.max(numericValue, 0), maximum);
  return `${(boundedValue / maximum) * 100}%`;
}

export default async function Heatmap({ pageUrl }) {
  const { clicks, error } = await getClickEvents(pageUrl);

  return (
    <section className="heatmap-panel">
      <div className="section-title">
        <h2>{pageUrl || 'No page selected'}</h2>
        <div className="metric" aria-label={`${clicks.length} clicks`}>
          <Flame size={18} aria-hidden="true" />
          {clicks.length} clicks
        </div>
      </div>

      {error ? <div className="error-state">{error}</div> : null}

      <div className="webpage-frame" aria-label="Heatmap click container">
        <div className="browser-bar" aria-hidden="true">
          <span className="browser-dot" />
          <span className="browser-dot" />
          <span className="browser-dot" />
        </div>

        {clicks.map((click, index) => (
          <span
            className="click-point"
            key={`${click.timestamp}-${index}`}
            title={new Date(click.timestamp).toLocaleString()}
            style={{
              left: toPercentage(click.coordinates?.x, REFERENCE_WIDTH),
              top: toPercentage(click.coordinates?.y, REFERENCE_HEIGHT)
            }}
          />
        ))}
      </div>
    </section>
  );
}
