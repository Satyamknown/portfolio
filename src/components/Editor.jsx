import { useRef, useState } from 'react';
import Markdown from './Markdown.jsx';

const Icon = ({ d, filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
       stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const icons = {
  link: <Icon d={<><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" /></>} />,
  quote: <Icon d={<><path d="M6 17h3l2-4V7H5v6h3z" /><path d="M15 17h3l2-4V7h-6v6h3z" /></>} />,
  bullets: <Icon d={<><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" fill="currentColor" /><circle cx="3.5" cy="12" r="1" fill="currentColor" /><circle cx="3.5" cy="18" r="1" fill="currentColor" /></>} />,
  numbers: <Icon d={<><path d="M10 6h11M10 12h11M10 18h11" /><path d="M3 8V4l-1 .8M2 20h3M2 20c0-1.5 3-1.8 3-3.2 0-.8-.7-1.3-1.5-1.3-.7 0-1.2.3-1.5.8" /></>} />,
  code: <Icon d={<><path d="m16 18 4-6-4-6M8 6l-4 6 4 6" /></>} />,
  image: <Icon d={<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m21 15-5-4-9 9" /></>} />,
  rule: <Icon d={<><path d="M4 12h16" /></>} />
};

export default function Editor({ value, onChange, placeholder }) {
  const ref = useRef(null);
  const [mode, setMode] = useState('write');
  const [imageOpen, setImageOpen] = useState(false);
  const [img, setImg] = useState({ url: '', alt: '', caption: '' });

  const text = value || '';

  function commit(next, selStart, selEnd) {
    onChange(next);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selStart, selEnd ?? selStart);
    });
  }

  function wrap(before, after, fallback) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = text.slice(s, e) || fallback;
    const next = text.slice(0, s) + before + selected + after + text.slice(e);
    commit(next, s + before.length, s + before.length + selected.length);
  }

  // Applies a per-line marker across the whole selection, toggling it off if
  // every line already has one.
  function prefixLines(markFor, stripPattern) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const from = text.lastIndexOf('\n', s - 1) + 1;
    const toIdx = text.indexOf('\n', e);
    const to = toIdx === -1 ? text.length : toIdx;

    const lines = text.slice(from, to).split('\n');
    const allMarked = lines.every((l) => stripPattern.test(l));
    const out = lines
      .map((l, i) => (allMarked ? l.replace(stripPattern, '') : markFor(i) + l))
      .join('\n');

    const next = text.slice(0, from) + out + text.slice(to);
    commit(next, from, from + out.length);
  }

  function insertBlock(block) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const needsLead = s > 0 && text[s - 1] !== '\n';
    const chunk = (needsLead ? '\n\n' : '') + block + '\n\n';
    const next = text.slice(0, s) + chunk + text.slice(e);
    commit(next, s + chunk.length);
  }

  function addImage() {
    const url = img.url.trim();
    if (!url) return;
    const safeUrl = /[\s()]/.test(url) ? `<${url}>` : url;
    const caption = img.caption.trim().replace(/"/g, "'");
    const alt = img.alt.trim().replace(/[[\]]/g, '');
    insertBlock(`![${alt}](${safeUrl}${caption ? ` "${caption}"` : ''})`);
    setImg({ url: '', alt: '', caption: '' });
    setImageOpen(false);
  }

  function onKeyDown(e) {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    if (k === 'b') { e.preventDefault(); wrap('**', '**', 'bold text'); }
    else if (k === 'i') { e.preventDefault(); wrap('_', '_', 'italic text'); }
    else if (k === 'k') { e.preventDefault(); wrap('[', '](https://)', 'link text'); }
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  const showWrite = mode === 'write' || mode === 'split';
  const showPreview = mode === 'preview' || mode === 'split';

  return (
    <div className="editor">
      <div className="editor-bar">
        <button type="button" className="editor-btn mono" title="Heading"
                onClick={() => prefixLines(() => '## ', /^#{1,6}\s/)}>H2</button>
        <button type="button" className="editor-btn mono" title="Subheading"
                onClick={() => prefixLines(() => '### ', /^#{1,6}\s/)}>H3</button>
        <span className="editor-sep" />
        <button type="button" className="editor-btn" title="Bold (⌘B)"
                onClick={() => wrap('**', '**', 'bold text')}><b>B</b></button>
        <button type="button" className="editor-btn" title="Italic (⌘I)"
                onClick={() => wrap('_', '_', 'italic text')}><i>I</i></button>
        <button type="button" className="editor-btn" title="Link (⌘K)"
                onClick={() => wrap('[', '](https://)', 'link text')}>{icons.link}</button>
        <span className="editor-sep" />
        <button type="button" className="editor-btn" title="Quote"
                onClick={() => prefixLines(() => '> ', /^>\s?/)}>{icons.quote}</button>
        <button type="button" className="editor-btn" title="Bulleted list"
                onClick={() => prefixLines(() => '- ', /^[-*]\s/)}>{icons.bullets}</button>
        <button type="button" className="editor-btn" title="Numbered list"
                onClick={() => prefixLines((i) => `${i + 1}. `, /^\d+\.\s/)}>{icons.numbers}</button>
        <button type="button" className="editor-btn" title="Code block"
                onClick={() => insertBlock('```\ncode here\n```')}>{icons.code}</button>
        <span className="editor-sep" />
        <button type="button" className="editor-btn" title="Insert image"
                onClick={() => setImageOpen((v) => !v)}>{icons.image}</button>
        <button type="button" className="editor-btn" title="Divider"
                onClick={() => insertBlock('---')}>{icons.rule}</button>

        <span className="editor-spacer" />

        <div className="editor-modes">
          {['write', 'split', 'preview'].map((m) => (
            <button key={m} type="button"
                    className={`editor-mode ${mode === m ? 'active' : ''}`}
                    onClick={() => setMode(m)}>
              {m[0].toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {imageOpen && (
        <div className="editor-dialog">
          <div className="editor-dialog-grid">
            <div className="field">
              <label htmlFor="img-url">Image URL</label>
              <input id="img-url" value={img.url} placeholder="https://…" autoFocus
                     onChange={(e) => setImg({ ...img, url: e.target.value })}
                     onKeyDown={(e) => e.key === 'Enter' && addImage()} />
            </div>
            <div className="field">
              <label htmlFor="img-alt">Alt text</label>
              <input id="img-alt" value={img.alt} placeholder="Describes the image for screen readers"
                     onChange={(e) => setImg({ ...img, alt: e.target.value })}
                     onKeyDown={(e) => e.key === 'Enter' && addImage()} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="img-cap">Caption <span style={{ color: 'var(--ink-faint)', fontWeight: 400 }}>— optional, shown under the image</span></label>
            <input id="img-cap" value={img.caption} placeholder="The checkout flow after the rebuild"
                   onChange={(e) => setImg({ ...img, caption: e.target.value })}
                   onKeyDown={(e) => e.key === 'Enter' && addImage()} />
          </div>
          <div className="editor-dialog-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={addImage} disabled={!img.url.trim()}>
              Insert image
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setImageOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className={`editor-panes ${mode === 'split' ? 'split' : ''}`}>
        {showWrite && (
          <textarea
            ref={ref}
            className="editor-textarea"
            value={text}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
          />
        )}
        {showPreview && (
          <div className="editor-preview">
            {text.trim() ? (
              <Markdown>{text}</Markdown>
            ) : (
              <div className="editor-preview-empty">Nothing to preview yet.</div>
            )}
          </div>
        )}
      </div>

      <div className="editor-foot">
        <span>{words} words</span>
        <span>{minutes} min read</span>
        <span>Markdown · ⌘B bold · ⌘I italic · ⌘K link</span>
      </div>
    </div>
  );
}
