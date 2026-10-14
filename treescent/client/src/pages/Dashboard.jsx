import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const THEMES = ["default", "light", "dark", "forest", "sunset"];

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [links, setLinks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("links");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [theme, setTheme] = useState(user?.theme || "default");
  const [savingProfile, setSavingProfile] = useState(false);

  const [dragIndex, setDragIndex] = useState(null);

  const load = async () => {
    try {
      const [linksData, analyticsData] = await Promise.all([
        api.getLinks(),
        api.getAnalytics().catch(() => null),
      ]);
      setLinks(linksData.links);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatar_url || "");
      setTheme(user.theme || "default");
    }
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setAdding(true);
    try {
      const data = await api.createLink({ title, url });
      setLinks((prev) => [...prev, data.link]);
      setTitle("");
      setUrl("");
      try {
        setAnalytics(await api.getAnalytics());
      } catch {
        /* optional */
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this link?")) return;
    try {
      await api.deleteLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      try {
        setAnalytics(await api.getAnalytics());
      } catch {
        /* optional */
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (link) => {
    try {
      const data = await api.updateLink(link.id, { is_active: !link.is_active });
      setLinks((prev) => prev.map((l) => (l.id === link.id ? data.link : l)));
    } catch (err) {
      setError(err.message);
    }
  };

  const onDragStart = (index) => setDragIndex(index);
  const onDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...links];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setLinks(updated);
    setDragIndex(index);
  };
  const onDragEnd = async () => {
    setDragIndex(null);
    try {
      const order = links.map((l) => l.id);
      const data = await api.reorderLinks(order);
      setLinks(data.links);
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSavingProfile(true);
    try {
      const data = await api.updateMe({
        display_name: displayName,
        bio,
        avatar_url: avatarUrl || null,
        theme,
      });
      updateUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="page dashboard dash-bg">
        <div className="dash-orbs" aria-hidden="true">
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="orb orb-3" />
        </div>
        <div className="dash-grid" aria-hidden="true" />
        <div className="dash-inner">Loading…</div>
      </div>
    );
  }

  const maxDaily = analytics
    ? Math.max(...analytics.daily.map((d) => d.clicks), 1)
    : 1;

  return (
    <div className="page dashboard dash-bg">
      {/* Animated background layers */}
      <div className="dash-orbs" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
      </div>
      <div className="dash-grid" aria-hidden="true" />
      <div className="dash-particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={`particle p-${i + 1}`} />
        ))}
      </div>

      <div className="dash-inner">
        <header className="dash-header">
          <div>
            <h1>Dashboard</h1>
            <p className="muted">
              Your page:{" "}
              <Link to={`/${user.username}`} target="_blank" rel="noreferrer">
                /{user.username}
              </Link>
            </p>
          </div>
          <button
            className="ghost"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Log out
          </button>
        </header>

        <div className="tabs">
          <button
            className={tab === "links" ? "active" : ""}
            onClick={() => setTab("links")}
          >
            Links
          </button>
          <button
            className={tab === "profile" ? "active" : ""}
            onClick={() => setTab("profile")}
          >
            Profile
          </button>
          <button
            className={tab === "analytics" ? "active" : ""}
            onClick={() => setTab("analytics")}
          >
            Analytics
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {tab === "links" && (
          <>
            <section className="card glass">
              <h2>Add link</h2>
              <form onSubmit={handleAdd} className="inline-form">
                <input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <input
                  placeholder="https://…"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <button type="submit" disabled={adding}>
                  {adding ? "Adding…" : "Add"}
                </button>
              </form>
            </section>

            <section className="card glass">
              <h2>
                Your links{" "}
                <span className="muted" style={{ fontWeight: 400, fontSize: "0.85rem" }}>
                  — drag to reorder
                </span>
              </h2>
              {links.length === 0 ? (
                <p className="muted">No links yet. Add your first one above.</p>
              ) : (
                <ul className="link-list">
                  {links.map((link, index) => (
                    <li
                      key={link.id}
                      className={`${!link.is_active ? "inactive" : ""} ${
                        dragIndex === index ? "dragging" : ""
                      }`}
                      draggable
                      onDragStart={() => onDragStart(index)}
                      onDragOver={(e) => onDragOver(e, index)}
                      onDragEnd={onDragEnd}
                    >
                      <span className="drag-handle" title="Drag to reorder">
                        ⠿
                      </span>
                      <div className="link-info">
                        <strong>{link.title}</strong>
                        <span className="muted">{link.url}</span>
                        <span className="clicks">{link.click_count} clicks</span>
                      </div>
                      <div className="link-actions">
                        <button className="ghost" onClick={() => handleToggle(link)}>
                          {link.is_active ? "Hide" : "Show"}
                        </button>
                        <button className="danger" onClick={() => handleDelete(link.id)}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {tab === "profile" && (
          <section className="card glass">
            <h2>Edit profile</h2>
            <form onSubmit={handleSaveProfile} className="profile-form">
              <label>
                Display name
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={80}
                />
              </label>
              <label>
                Bio
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={280}
                  rows={3}
                />
              </label>
              <label>
                Avatar URL
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://…"
                />
              </label>
              <label>
                Theme
                <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                  {THEMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" disabled={savingProfile}>
                {savingProfile ? "Saving…" : "Save profile"}
              </button>
            </form>
          </section>
        )}

        {tab === "analytics" && (
          <>
            {analytics ? (
              <>
                <div className="stats-row">
                  <div className="stat-card glass">
                    <span className="stat-value">{analytics.total_clicks}</span>
                    <span className="stat-label">Total clicks</span>
                  </div>
                  <div className="stat-card glass">
                    <span className="stat-value">{analytics.total_links}</span>
                    <span className="stat-label">Links</span>
                  </div>
                  <div className="stat-card glass">
                    <span className="stat-value">{analytics.active_links}</span>
                    <span className="stat-label">Active</span>
                  </div>
                </div>

                <section className="card glass">
                  <h2>Clicks (last 14 days)</h2>
                  <div className="chart">
                    {analytics.daily.map((d) => (
                      <div
                        key={d.date}
                        className="chart-bar-wrap"
                        title={`${d.date}: ${d.clicks}`}
                      >
                        <div
                          className="chart-bar"
                          style={{ height: `${(d.clicks / maxDaily) * 100}%` }}
                        />
                        <span className="chart-label">{d.date.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="card glass">
                  <h2>Per link</h2>
                  <ul className="link-list">
                    {analytics.per_link.map((l) => (
                      <li key={l.id} className={!l.is_active ? "inactive" : ""}>
                        <div className="link-info">
                          <strong>{l.title}</strong>
                          <span className="muted">{l.url}</span>
                        </div>
                        <span className="clicks">{l.click_count} clicks</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <section className="card glass">
                <p className="muted">Analytics unavailable. Is the API running?</p>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
