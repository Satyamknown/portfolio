import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, formatDate } from '../lib/api.js';
import Markdown from '../components/Markdown.jsx';
import Loading from '../components/Loading.jsx';

export default function WritingDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(null);
    api
      .getPost(slug)
      .then(setPost)
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, [slug]);

  if (!loaded) return <Loading />;

  if (error || !post) {
    return (
      <section className="first">
        <div className="empty">
          <h3>Post not found</h3>
          <p>{error || "This one doesn't exist or isn't published."}</p>
          <Link to="/writing" className="btn btn-ghost btn-sm">
            ← Back to writing
          </Link>
        </div>
      </section>
    );
  }

  const words = (post.body || '').trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));

  return (
    <article>
      <div className="article-head">
        <div className="eyebrow">Writing</div>
        <h1>{post.title}</h1>
        <div className="article-meta">
          <span>{formatDate(post.updatedAt)}</span>
          <span>
            <span className="index-dot">·</span> {minutes} min read
          </span>
          {post.tags?.length > 0 && (
            <span>
              <span className="index-dot">·</span> {post.tags.join(', ')}
            </span>
          )}
        </div>
      </div>

      {post.coverImage && <img className="cover" src={post.coverImage} alt={post.title} />}

      <Markdown>{post.body}</Markdown>

      <Link to="/writing" className="btn btn-ghost btn-sm" style={{ marginBottom: 60 }}>
        ← All writing
      </Link>
    </article>
  );
}
