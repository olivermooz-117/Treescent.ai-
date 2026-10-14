import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { Analytics, Link as ProfileLink } from '../types/api';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getLinks(), api.getAnalytics()])
      .then(([userLinks, stats]) => {
        setLinks(userLinks);
        setAnalytics(stats);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load dashboard data.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Good to see you, {user?.display_name || user?.username}</h1>
          <p className="page-subtitle">Your Treescent page is ready whenever you are.</p>
        </div>
        <button type="button" className="ui-button ui-button--primary" onClick={() => navigate('/dashboard/links')}>
          <span aria-hidden="true">＋</span> Add a link
        </button>
      </div>

      {error && <div className="dashboard-error" role="alert">{error}</div>}

      <div className="stat-grid">
        <article className="stat-card"><span>Total links</span><strong>{isLoading ? '—' : analytics?.total_links.toLocaleString() ?? 0}</strong><small>On your Treescent page</small></article>
        <article className="stat-card"><span>Total clicks</span><strong>{isLoading ? '—' : analytics?.total_clicks.toLocaleString() ?? 0}</strong><small>All-time link visits</small></article>
        <article className="stat-card"><span>Active links</span><strong>{isLoading ? '—' : analytics?.active_links.toLocaleString() ?? 0}</strong><small>Visible to visitors</small></article>
      </div>

      <section className="panel dashboard-links">
        <div className="panel-heading">
          <div><h2>Your links</h2><p>Quick look at the links on your page.</p></div>
          <Link className="text-button" to="/dashboard/links">Manage links <span aria-hidden="true">→</span></Link>
        </div>
        {isLoading ? <p className="empty-state">Loading your links…</p> : links.length === 0 ? (
          <div className="empty-state"><div className="empty-icon" aria-hidden="true">↗</div><h3>Start with one great link</h3><p>Add a website or social profile to your public page.</p><button className="ui-button ui-button--primary" onClick={() => navigate('/dashboard/links')}>Add your first link</button></div>
        ) : (
          <ul className="dashboard-link-list">
            {links.slice(0, 5).map((link) => (
              <li key={link.id}>
                <div><span className="link-mark" aria-hidden="true">↗</span><span><strong>{link.title}</strong><small>{link.url}</small></span></div>
                <span className="dashboard-clicks">{(link.click_count ?? 0).toLocaleString()} clicks</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="profile-share">Your public page <a href={`/${user?.username}`} target="_blank" rel="noreferrer">treescent.ai/{user?.username} ↗</a></p>
    </section>
  );
};
