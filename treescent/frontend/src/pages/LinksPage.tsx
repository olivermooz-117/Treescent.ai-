import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../components/ui/toastContext';
import type { Link } from '../types/api';

type LinkDraft = { title: string; url: string };
const blankDraft: LinkDraft = { title: '', url: '' };

export const LinksPage = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [draft, setDraft] = useState<LinkDraft>(blankDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [error, setError] = useState('');
  const showToast = useToast();

  const loadLinks = useCallback(async () => {
    try {
      setLinks(await api.getLinks());
      setError('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not load your links.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    api.getLinks()
      .then((result) => { if (isCurrent) setLinks(result); })
      .catch((err: unknown) => {
        if (isCurrent) setError(err instanceof Error ? err.message : 'Could not load your links.');
      })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    if (isEditorOpen && editingId === null) document.getElementById('link-title')?.focus();
  }, [editingId, isEditorOpen]);

  const startCreate = () => {
    setEditingId(null);
    setDraft(blankDraft);
    setIsEditorOpen(true);
    setError('');
  };

  const startEdit = (link: Link) => {
    setEditingId(link.id);
    setIsEditorOpen(true);
    setDraft({ title: link.title, url: link.url });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(blankDraft);
    setIsEditorOpen(false);
    setError('');
  };

  const saveLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      if (editingId === null) {
        const created = await api.createLink({ ...draft, position: links.length });
        setLinks((current) => [...current, created]);
        showToast('Link added to your page.');
      } else {
        const updated = await api.updateLink(editingId, draft);
        setLinks((current) => current.map((link) => link.id === editingId ? updated : link));
        showToast('Link updated.');
      }
      cancelEdit();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save this link.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (link: Link) => {
    try {
      const updated = await api.updateLink(link.id, { is_active: !link.is_active });
      setLinks((current) => current.map((item) => item.id === link.id ? updated : item));
      showToast(updated.is_active ? 'Link is now visible on your profile.' : 'Link hidden from your profile.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Could not update this link.', 'error');
    }
  };

  const deleteLink = async (link: Link) => {
    if (!window.confirm(`Delete “${link.title}”? This cannot be undone.`)) return;
    try {
      await api.deleteLink(link.id);
      setLinks((current) => current.filter((item) => item.id !== link.id));
      if (editingId === link.id) cancelEdit();
      showToast('Link deleted.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Could not delete this link.', 'error');
    }
  };

  const moveLink = async (index: number, direction: -1 | 1) => {
    if (isReordering) return;
    const destination = index + direction;
    if (destination < 0 || destination >= links.length) return;
    const next = [...links];
    [next[index], next[destination]] = [next[destination], next[index]];
    setLinks(next);
    setIsReordering(true);
    try {
      setLinks(await api.reorderLinks(next.map((link) => link.id)));
    } catch (err: unknown) {
      setLinks(links);
      showToast(err instanceof Error ? err.message : 'Could not reorder your links.', 'error');
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your page</p>
          <h1>Links</h1>
          <p className="page-subtitle">Add, arrange, and control what visitors see.</p>
        </div>
        <button type="button" className="ui-button ui-button--primary" onClick={startCreate}>
          <span aria-hidden="true">＋</span> Add link
        </button>
      </div>

      {isEditorOpen && (
        <form className="link-editor" onSubmit={saveLink}>
          <div className="link-editor-heading">
            <div>
              <h2>{editingId === null ? 'Add a link' : 'Edit link'}</h2>
              <p>Use a full web address beginning with http:// or https://.</p>
            </div>
            <button type="button" className="icon-button" aria-label="Close editor" onClick={cancelEdit}>×</button>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <label className="field">
            <span>Title</span>
            <input id="link-title" required maxLength={100} value={draft.title} placeholder="My website" onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </label>
          <label className="field">
            <span>URL</span>
            <input required type="url" maxLength={2048} value={draft.url} placeholder="https://example.com" onChange={(event) => setDraft({ ...draft, url: event.target.value })} />
          </label>
          <div className="form-actions">
            <button className="ui-button ui-button--primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : editingId === null ? 'Add link' : 'Save changes'}
            </button>
            <button className="ui-button ui-button--secondary" type="button" onClick={cancelEdit}>Cancel</button>
          </div>
        </form>
      )}

      <div className="links-list">
        <div className="list-heading">
          <div><h2>Your links</h2><span>{links.length} total</span></div>
          <p>Use the arrows to change the order on your public page.</p>
        </div>
        {isLoading ? <p className="empty-state">Loading your links…</p> : error && links.length === 0 ? (
          <div className="empty-state"><p>{error}</p><button className="text-button" onClick={() => { setIsLoading(true); void loadLinks(); }}>Try again</button></div>
        ) : links.length === 0 ? (
          <div className="empty-state"><div className="empty-icon" aria-hidden="true">↗</div><h3>Your page is ready for its first link</h3><p>Add a website, social profile, or anything you want to share.</p><button className="ui-button ui-button--primary" onClick={startCreate}>Add your first link</button></div>
        ) : (
          <ol className="link-items">
            {links.map((link, index) => (
              <li className={`link-item${link.is_active ? '' : ' link-item--inactive'}`} key={link.id}>
                <div className="reorder-controls" aria-label={`Reorder ${link.title}`}>
                  <button type="button" className="icon-button" title="Move up" aria-label={`Move ${link.title} up`} disabled={isReordering || index === 0} onClick={() => void moveLink(index, -1)}>↑</button>
                  <button type="button" className="icon-button" title="Move down" aria-label={`Move ${link.title} down`} disabled={isReordering || index === links.length - 1} onClick={() => void moveLink(index, 1)}>↓</button>
                </div>
                <div className="link-item-main">
                  <span className="link-mark" aria-hidden="true">↗</span>
                  <div className="link-item-copy">
                    <strong>{link.title}</strong>
                    <a href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
                  </div>
                  <span className={`link-status${link.is_active ? ' is-active' : ''}`}>{link.is_active ? 'Live' : 'Hidden'}</span>
                  <span className="click-count">{link.click_count ?? 0} clicks</span>
                </div>
                <div className="link-actions">
                  <button type="button" className="text-button" onClick={() => void toggleActive(link)}>{link.is_active ? 'Hide' : 'Show'}</button>
                  <button type="button" className="text-button" onClick={() => startEdit(link)}>Edit</button>
                  <button type="button" className="text-button text-button--danger" onClick={() => void deleteLink(link)}>Delete</button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
};
