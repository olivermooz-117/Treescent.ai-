import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Analytics } from '../types/api';

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAnalytics()
      .then(setAnalytics)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load analytics.'))
      .finally(() => setIsLoading(false));
  }, []);

  const peak = Math.max(1, ...(analytics?.daily.map((day) => day.clicks) ?? [0]));
  const topLink = analytics?.per_link.slice().sort((left, right) => right.click_count - left.click_count)[0];

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Performance</p>
          <h1>Analytics</h1>
          <p className="page-subtitle">See how people are engaging with your page.</p>
        </div>
      </div>
      {isLoading ? <div className="panel loading-panel">Loading analytics…</div> : error ? (
        <div className="panel error-panel" role="alert"><p>{error}</p></div>
      ) : analytics && (
        <>
          <div className="stat-grid">
            <article className="stat-card"><span>Total clicks</span><strong>{analytics.total_clicks.toLocaleString()}</strong><small>All time</small></article>
            <article className="stat-card"><span>Active links</span><strong>{analytics.active_links.toLocaleString()}</strong><small>Of {analytics.total_links} total links</small></article>
            <article className="stat-card"><span>Top link</span><strong className="stat-top-link">{topLink?.title ?? '—'}</strong><small>{topLink ? `${topLink.click_count} clicks` : 'No clicks yet'}</small></article>
          </div>
          <section className="panel analytics-chart">
            <div className="panel-heading"><div><h2>Clicks over time</h2><p>Daily visits to your links in the last 14 days</p></div><span className="chart-legend"><i /> Clicks</span></div>
            <div className="bar-chart" role="img" aria-label="Daily click counts for the last fourteen days">
              {analytics.daily.map((day) => (
                <div className="bar-column" key={day.date} title={`${new Date(`${day.date}T00:00:00`).toLocaleDateString()}: ${day.clicks} clicks`}>
                  <span className="bar-value">{day.clicks || ''}</span>
                  <div className="bar-track"><i style={{ height: `${Math.max(day.clicks ? 7 : 2, (day.clicks / peak) * 100)}%` }} /></div>
                  <time dateTime={day.date}>{new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>
                </div>
              ))}
            </div>
          </section>
          <section className="panel analytics-table">
            <div className="panel-heading"><div><h2>Link performance</h2><p>Clicks across all of your links</p></div></div>
            {analytics.per_link.length === 0 ? <p className="empty-state">Add your first link to start tracking engagement.</p> : (
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Link</th><th>Status</th><th>Clicks</th></tr></thead>
                  <tbody>{analytics.per_link.map((link) => (
                    <tr key={link.id}><td><strong>{link.title}</strong><a href={link.url} target="_blank" rel="noreferrer">{link.url}</a></td><td><span className={`link-status${link.is_active ? ' is-active' : ''}`}>{link.is_active ? 'Live' : 'Hidden'}</span></td><td>{link.click_count.toLocaleString()}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
      <p className="analytics-note">Profile views are not currently tracked. Click totals reflect visitors who open a link through your Treescent page.</p>
    </section>
  );
};
