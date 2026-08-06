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

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null); // { kind, data, id }
  const [notice, setNotice] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!auth.isSignedIn()) {
      navigate('/login');
      return;
    }
    refresh();
  }, []);

  async function refresh() {
    try {
      const [pr, po] = await Promise.all([api.listProjects(true), api.listPosts(true)]);
      setProjects(pr);
      setPosts(po);
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
  const items = tab === 'projects' ? projects : posts;

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
      </div>

      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-primary btn-sm" onClick={() => startNew(tab)}>
          + New {tab === 'projects' ? 'case study' : 'post'}
        </button>
      </div>

      {!loaded ? (
        <div className="loading">Loading…</div>
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
