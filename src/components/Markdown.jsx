import { Marked } from 'marked';

function escapeAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const marked = new Marked({ breaks: true, gfm: true });

// ![alt](url "caption") renders as a figure so images can carry a caption.
marked.use({
  renderer: {
    image({ href, title, text }) {
      const src = escapeAttr(href);
      const alt = escapeAttr(text);
      const caption = title ? escapeAttr(title) : '';
      return (
        `<figure><img src="${src}" alt="${alt}" loading="lazy">` +
        (caption ? `<figcaption>${caption}</figcaption>` : '') +
        `</figure>`
      );
    }
  }
});

export default function Markdown({ children }) {
  const html = marked.parse(children || '');
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
