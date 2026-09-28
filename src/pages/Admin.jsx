import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, auth, slugify, formatDate } from '../lib/api.js';
import Editor from '../components/Editor.jsx';

const EMPTY_PROJECT = {
  title: '', slug: '', summary: '', role: '', client: '', year: '', version: '',
  tags: '', metricsText: '', coverImage: '', body: '', published: false, order: 0
};

const EMPTY_POST = {
  title: '', slug: '', excerpt: '', tags: '', coverImage: '', body: '', published: false
};

const shareUrl = (link) => `${window.location.origin}/go/${link.token}`;

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null); // { kind, data, id }
  const [notice, setNotice] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [homeSettings, setHomeSettings] = useState({ videoUrl: '', videoPoster: '' });
  const [links, setLinks] = useState([]);
  const [linkLabel, setLinkLabel] = useState('');
  const [creatingLink, setCreatingLink] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!auth.isSignedIn()) {
      navigate('/login');
      return;
    }
    refresh();
  }, []);

  async function refresh() {
    try {
      const [pr, po, settings, ls] = await Promise.all([
        api.listProjects(true),
        api.listPosts(true),
        api.getHomeSettings(),
        api.listAccessLinks()
      ]);
      setProjects(pr);
      setPosts(po);
      setHomeSettings(settings);
      setLinks(ls);
    } catch (e) {
      if (e.message.toLowerCase().includes('sign in') || e.message.includes('expired')) {
        navigate('/login');
        return;
      }
      setNotice({ type: 'error', text: e.message });
    } finally {
      setLoaded(true);
    }
  }

  function signOut() {
    auth.clear();
    navigate('/');
  }

  function startNew(kind) {
    setNotice(null);
    setEditing({ kind, id: null, data: kind === 'projects' ? { ...EMPTY_PROJECT } : { ...EMPTY_POST } });
  }

  function startEdit(kind, item) {
    setNotice(null);
    const data =
      kind === 'projects'
        ? {
            ...item,
            tags: (item.tags || []).join(', '),
            metricsText: (item.metrics || []).map((m) => `${m.value} | ${m.label}`).join('\n')
          }
        : { ...item, tags: (item.tags || []).join(', ') };
    setEditing({ kind, id: item._id, data });
  }

  async function remove(kind, item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      if (kind === 'projects') await api.deleteProject(item._id);
      else await api.deletePost(item._id);
      setNotice({ type: 'ok', text: `Deleted "${item.title}".` });
      refresh();
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    }
  }

  async function save() {
    const { kind, id, data } = editing;
    const tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);

    let payload;
    if (kind === 'projects') {
      const metrics = (data.metricsText || '')
        .split('\n')
        .map((line) => line.split('|').map((s) => s.trim()))
        .filter((parts) => parts[0])
        .map(([value, label]) => ({ value, label: label || '' }));

      payload = {
        title: data.title,
        slug: data.slug || slugify(data.title),
        summary: data.summary,
        role: data.role,
        client: data.client,
        year: data.year,
        version: data.version,
        tags,
        metrics,
        coverImage: data.coverImage,
        body: data.body,
        published: data.published,
        order: Number(data.order) || 0
      };
    } else {
      payload = {
        title: data.title,
        slug: data.slug || slugify(data.title),
        excerpt: data.excerpt,
        tags,
        coverImage: data.coverImage,
        body: data.body,
        published: data.published
      };
    }

    try {
      if (kind === 'projects') {
        await (id ? api.updateProject(id, payload) : api.createProject(payload));
      } else {
        await (id ? api.updatePost(id, payload) : api.createPost(payload));
      }
      setNotice({ type: 'ok', text: `Saved "${payload.title}".` });
      setEditing(null);
      refresh();
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    }
  }

  async function createLink(event) {
    event.preventDefault();
    const label = linkLabel.trim();
    if (!label) return;

    setCreatingLink(true);
    try {
      const link = await api.createAccessLink(label);
      setLinks((prev) => [link, ...prev]);
      setLinkLabel('');
      setNotice({ type: 'ok', text: `Created a link for "${link.label}".` });
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setCreatingLink(false);
    }
  }

  async function copyLink(link) {
    try {
      await navigator.clipboard.writeText(shareUrl(link));
      setCopiedId(link._id);
      setTimeout(() => setCopiedId((current) => (current === link._id ? null : current)), 2000);
    } catch {
      setNotice({ type: 'error', text: 'Could not copy. Select the link and copy it by hand.' });
    }
  }

  async function toggleLink(link) {
    try {
      const updated = await api.setAccessLinkActive(link._id, !link.active);
      setLinks((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
      setNotice({ type: 'ok', text: `${updated.active ? 'Resumed' : 'Paused'} the link for "${updated.label}".` });
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    }
  }

  async function removeLink(link) {
    if (!window.confirm(`Delete the link for "${link.label}"? New visitors will see the password screen. Anyone who already opened it keeps access for up to 30 days.`)) return;
    try {
      await api.deleteAccessLink(link._id);
      setLinks((prev) => prev.filter((l) => l._id !== link._id));
      setNotice({ type: 'ok', text: `Deleted the link for "${link.label}".` });
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    }
  }

  const set = (key, value) => setEditing((prev) => ({ ...prev, data: { ...prev.data, [key]: value } }));

  // ---------- Editor view ----------
  if (editing) {
    const { kind, id, data } = editing;
    const isProject = kind === 'projects';

    return (
      <section className="first">
        <div className="section-head">
          <h2>{id ? 'Edit' : 'New'} {isProject ? 'case study' : 'post'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
        </div>

        {notice && <div className={`notice notice-${notice.type}`}>{notice.text}</div>}

        <div className="panel">
          <div className="field field-title">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              placeholder={isProject ? 'Rebuilding checkout to cut drop-off' : 'What I learned shipping this'}
              value={data.title}
              onChange={(e) => {
                set('title', e.target.value);
                if (!id && !data.slug) set('slug', slugify(e.target.value));
              }}
            />
          </div>

          <div className="field">
            <label htmlFor="slug">URL slug</label>
            <input id="slug" value={data.slug} onChange={(e) => set('slug', slugify(e.target.value))} />
            <div className="field-hint">
              Appears at /{isProject ? 'work' : 'writing'}/{data.slug || 'your-slug'}
            </div>
          </div>

          <div className="field">
            <label htmlFor="summary">{isProject ? 'Summary' : 'Excerpt'}</label>
            <textarea
              id="summary"
              rows={2}
              value={isProject ? data.summary : data.excerpt}
              onChange={(e) => set(isProject ? 'summary' : 'excerpt', e.target.value)}
            />
          </div>

          {isProject && (
            <>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="role">Role</label>
                  <input id="role" value={data.role} onChange={(e) => set('role', e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="client">Client</label>
                  <input id="client" value={data.client} onChange={(e) => set('client', e.target.value)} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="year">Year</label>
                  <input id="year" value={data.year} onChange={(e) => set('year', e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="version">Version label</label>
                  <input
                    id="version"
                    value={data.version}
                    placeholder="v1.4"
                    onChange={(e) => set('version', e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="metrics">Metrics</label>
                <textarea
                  id="metrics"
                  rows={3}
                  value={data.metricsText}
                  placeholder={'52 | calls\n$80 | CPA'}
                  onChange={(e) => set('metricsText', e.target.value)}
                />
                <div className="field-hint">One per line, formatted as value | label</div>
              </div>
            </>
          )}

          <div className="field">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              value={data.tags}
              placeholder="Growth, GA4, Landing Pages"
              onChange={(e) => set('tags', e.target.value)}
            />
            <div className="field-hint">Comma separated</div>
          </div>

          <div className="field">
            <label htmlFor="cover">Cover image URL</label>
            <input
              id="cover"
              value={data.coverImage}
              placeholder="https://…"
              onChange={(e) => set('coverImage', e.target.value)}
            />
            <div className="field-hint">Paste a link from Cloudinary, S3, or any image host</div>
          </div>

          <div className="field">
            <label htmlFor="body">Body</label>
            <Editor
              value={data.body}
              onChange={(v) => set('body', v)}
              placeholder={'Start writing…\n\nUse the toolbar above for headings, quotes, lists, code, and images. Switch to Split to see it render as you type.'}
            />
          </div>

          <div className="checkbox-row">
            <input
              id="published"
              type="checkbox"
              checked={data.published}
              onChange={(e) => set('published', e.target.checked)}
            />
            <label htmlFor="published">Published — visible to everyone</label>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={save} disabled={!data.title}>
              Save {isProject ? 'case study' : 'post'}
            </button>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      </section>
    );
  }

  // ---------- List view ----------
  const items = tab === 'projects' ? projects : tab === 'posts' ? posts : [];

  return (
    <section className="first">
      <div className="section-head">
        <h2>Dashboard</h2>
        <button className="btn btn-ghost btn-sm" onClick={signOut}>Sign out</button>
      </div>

      {notice && <div className={`notice notice-${notice.type}`}>{notice.text}</div>}

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === 'projects' ? 'active' : ''}`}
          onClick={() => setTab('projects')}
        >
          Case studies ({projects.length})
        </button>
        <button
          className={`admin-tab ${tab === 'posts' ? 'active' : ''}`}
          onClick={() => setTab('posts')}
        >
          Posts ({posts.length})
        </button>
        <button
          className={`admin-tab ${tab === 'links' ? 'active' : ''}`}
          onClick={() => setTab('links')}
        >
          Share links ({links.length})
        </button>
        <button
          className={`admin-tab ${tab === 'settings' ? 'active' : ''}`}
          onClick={() => setTab('settings')}
        >
          Settings
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        {(tab === 'projects' || tab === 'posts') && (
          <button className="btn btn-primary btn-sm" onClick={() => startNew(tab)}>
            + New {tab === 'projects' ? 'case study' : 'post'}
          </button>
        )}
      </div>

      {!loaded ? (
        <div className="loading">Loading…</div>
      ) : tab === 'settings' ? (
        <div className="panel">
          <div className="field">
            <label htmlFor="videoUrl">Hero video URL</label>
            <input
              id="videoUrl"
              value={homeSettings.videoUrl}
              placeholder="https://..."
              onChange={(e) => setHomeSettings((prev) => ({ ...prev, videoUrl: e.target.value }))}
            />
            <div className="field-hint">Paste a direct MP4 URL or an asset URL from your CDN.</div>
          </div>
          <div className="field">
            <label htmlFor="videoPoster">Hero video poster image</label>
            <input
              id="videoPoster"
              value={homeSettings.videoPoster}
              placeholder="https://..."
              onChange={(e) => setHomeSettings((prev) => ({ ...prev, videoPoster: e.target.value }))}
            />
            <div className="field-hint">Optional fallback image if the video cannot play.</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={async () => {
              try {
                await api.updateHomeSettings(homeSettings);
                setNotice({ type: 'ok', text: 'Home settings saved.' });
                refresh();
              } catch (e) {
                setNotice({ type: 'error', text: e.message });
              }
            }}>
              Save Settings
            </button>
          </div>
        </div>
      ) : tab === 'links' ? (
        <>
          <form className="panel share-form" onSubmit={createLink}>
            <div className="field">
              <label htmlFor="linkLabel">Who is this link for?</label>
              <div className="share-form-row">
                <input
                  id="linkLabel"
                  value={linkLabel}
                  maxLength={80}
                  placeholder="Cactus Communications"
                  onChange={(e) => setLinkLabel(e.target.value)}
                />
                <button className="btn btn-primary" type="submit" disabled={!linkLabel.trim() || creatingLink}>
                  {creatingLink ? 'Creating...' : 'Create link'}
                </button>
              </div>
              <div className="field-hint">
                Opening the link unlocks the site without the password for 30 days. Pausing or deleting it stops new unlocks only.
              </div>
            </div>
          </form>

          {links.length === 0 ? (
            <div className="empty">
              <h3>No share links yet</h3>
              <p>Create one for each company you send the portfolio to, then see when they open it.</p>
            </div>
          ) : (
            links.map((link) => (
              <div key={link._id} className="admin-row">
                <div className="share-row-main">
                  <div className="admin-row-title">{link.label}</div>
                  <div className="share-url">{shareUrl(link)}</div>
                  <div className="admin-row-meta">
                    {link.opens} {link.opens === 1 ? 'open' : 'opens'} · last opened{' '}
                    {link.lastOpenedAt ? formatDate(link.lastOpenedAt) : 'never'}
                  </div>
                </div>
                <div className="admin-row-actions share-row-actions">
                  <span className={`status-tag ${link.active ? '' : 'draft'}`}>
                    {link.active ? 'Active' : 'Paused'}
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={() => copyLink(link)}>
                    {copiedId === link._id ? 'Copied' : 'Copy'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleLink(link)}>
                    {link.active ? 'Pause' : 'Resume'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeLink(link)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </>
      ) : items.length === 0 ? (
        <div className="empty">
          <h3>Nothing here yet</h3>
          <p>Create your first {tab === 'projects' ? 'case study' : 'post'} to get started.</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item._id} className="admin-row">
            <div>
              <div className="admin-row-title">{item.title}</div>
              <div className="admin-row-meta">
                /{tab === 'projects' ? 'work' : 'writing'}/{item.slug} · updated {formatDate(item.updatedAt)}
              </div>
            </div>
            <div className="admin-row-actions">
              <span className={`status-tag ${item.published ? '' : 'draft'}`}>
                {item.published ? 'Live' : 'Draft'}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => startEdit(tab, item)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => remove(tab, item)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
