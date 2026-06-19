import { Search } from 'lucide-react';
import Heatmap from '../../components/Heatmap';

export const dynamic = 'force-dynamic';

export default async function HeatmapPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const pageUrl = resolvedSearchParams?.pageUrl || '';

  return (
    <>
      <section className="heatmap-toolbar">
        <div>
          <h1>Heatmap</h1>
          <p className="muted">Click activity by page URL.</p>
        </div>
        <form className="heatmap-form" action="/heatmap">
          <input
            type="text"
            name="pageUrl"
            defaultValue={pageUrl}
            placeholder="http://localhost:3000/dashboard"
            aria-label="Page URL"
          />
          <button className="icon-button" type="submit" aria-label="Load heatmap">
            <Search size={18} aria-hidden="true" />
          </button>
        </form>
      </section>

      <Heatmap pageUrl={pageUrl} />
    </>
  );
}
