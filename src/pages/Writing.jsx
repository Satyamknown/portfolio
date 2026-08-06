import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate } from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import { microcopy } from '../data/site.js';

export default function Writing() {
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .listPosts()
      .then(setPosts)
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section className="first">
      <div className="eyebrow">Writing</div>
      <h1 className="about-title">Notes</h1>
      <p className="section-intro">{microcopy.writingIntro}</p>

      {!loaded ? (
        <Loading />
      ) : posts.length === 0 ? (
        <div className="empty">
          <h3>Nothing here yet</h3>
          <p>{microcopy.writingEmpty}</p>
        </div>
      ) : (
        <div className="index-list">
          {posts.map((p) => (
            <Link to={`/writing/${p.slug}`} className="index-row" key={p._id}>
              <div className="index-top">
                <span className="index-date">{formatDate(p.updatedAt)}</span>
              </div>
              <div className="index-title">{p.title}</div>
              {p.excerpt && <div className="index-summary">{p.excerpt}</div>}
              {p.tags?.length > 0 && <div className="index-meta">{p.tags.join('  ·  ')}</div>}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
