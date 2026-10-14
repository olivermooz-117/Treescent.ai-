import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { PublicProfileResponse } from '../types/api';

export const PublicProfilePage = () => {
  const { username = '' } = useParams();
  const [data, setData] = useState<PublicProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedUsername, setLoadedUsername] = useState<string | null>(null);
  const [notFoundUsername, setNotFoundUsername] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    api.getPublicProfile(username)
      .then((result) => { if (isCurrent) setData(result); })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setNotFoundUsername(username);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoadedUsername(username);
          setIsLoading(false);
        }
      });
    return () => { isCurrent = false; };
  }, [username]);

  if (isLoading || loadedUsername !== username) {
    return <main className="public-page"><div className="public-card public-loading">Loading profile…</div></main>;
  }

  if (!data) {
    return (
      <main className="public-page">
        <div className="public-card public-empty">
          <span className="public-brand">Treescent</span>
          <div className="empty-icon" aria-hidden="true">✳</div>
          <h1>{notFoundUsername === username ? 'This page does not exist' : 'We could not load this page'}</h1>
          <p>{notFoundUsername === username ? `There is no public profile for @${username}.` : 'Check your connection and try again.'}</p>
          <Link className="ui-button ui-button--secondary" to="/login">Create your page</Link>
        </div>
      </main>
    );
  }

  const { profile, links } = data;
  return (
    <main className={`public-page public-theme--${profile.theme}`}>
      <section className="public-card">
        <span className="public-brand">Treescent</span>
        {profile.avatar_url ? (
          <img className="public-avatar" src={profile.avatar_url} alt={`${profile.display_name}'s avatar`} />
        ) : (
          <div className="public-avatar public-avatar--initial" aria-hidden="true">{profile.display_name.slice(0, 1).toUpperCase()}</div>
        )}
        <h1>{profile.display_name}</h1>
        <p className="public-username">@{profile.username}</p>
        {profile.bio && <p className="public-bio">{profile.bio}</p>}
        <div className="public-links">
          {links.map((link) => (
            <a className="public-link" key={link.id} href={api.getTrackedLinkUrl(link.id)} target="_blank" rel="noreferrer">
              <span>{link.title}</span><span aria-hidden="true">↗</span>
            </a>
          ))}
          {links.length === 0 && <p className="public-no-links">No links shared yet.</p>}
        </div>
        <Link className="public-footer" to="/register">Create your own Treescent page <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
};
