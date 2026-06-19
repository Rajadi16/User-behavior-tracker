import './globals.css';
import Link from 'next/link';
import { Activity, Flame, MousePointerClick } from 'lucide-react';

export const metadata = {
  title: 'User Analytics Dashboard',
  description: 'Session analytics and click heatmaps'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <Link className="brand" href="/">
            <Activity size={22} aria-hidden="true" />
            <span>User Analytics</span>
          </Link>
          <nav className="nav-links" aria-label="Dashboard navigation">
            <Link href="/">
              <MousePointerClick size={17} aria-hidden="true" />
              Sessions
            </Link>
            <Link href="/heatmap">
              <Flame size={17} aria-hidden="true" />
              Heatmap
            </Link>
          </nav>
        </header>
        <main className="page-shell">{children}</main>
      </body>
    </html>
  );
}
