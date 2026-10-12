import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPublicProfile(username)
      .then((data) => {
        setProfile(data.profile);
        setLinks(data.links);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="public-page">Loading…</div>;
  if (error) return <div className="public-page error-page">{error}</div>;

  return (
    <div className={`public-page theme-${profile.theme || "default"}`}>
      <div className="profile-card">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.display_name} className="avatar" />
        ) : (
          <div className="avatar placeholder">
            {(profile.display_name || profile.username)[0].toUpperCase()}
          </div>
        )}

        <h1>{profile.display_name || profile.username}</h1>
        {profile.bio && <p className="bio">{profile.bio}</p>}

        <div className="public-links">
          {links.map((link) => (
            <a
              key={link.id}
              href={`${API_URL}/api/public/r/${link.id}`}
              className="public-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
