import { useEffect } from 'react';

// /design pages set their own tab title, description and link-preview tags, and allow
// pinch-zoom, then put back the site's own values when the visitor leaves for another page.
// Crawlers that do not run JavaScript get the same tags from design.html instead. When the
// visit started on design.html, each tag's data-site attribute holds the index.html value,
// so a PM page reached from here still gets its own title and viewport back.
const DESCRIPTION =
  'Product design for B2B SaaS and web products: permission models, flows and screens for clients in Canada, the UK and India. Case studies by Abhishek Manjhi, Design Lead.';

const TAGS = [
  ['name', 'description', () => DESCRIPTION],
  ['property', 'og:title', (title) => title],
  ['property', 'og:description', () => DESCRIPTION],
  ['name', 'twitter:title', (title) => title],
  ['name', 'viewport', () => 'width=device-width, initial-scale=1.0']
];

export default function useDesignHead(title) {
  useEffect(() => {
    if (!title) return undefined;
    const titleEl = document.head.querySelector('title');
    const before = { title: titleEl?.dataset.site ?? document.title, tags: [] };
    document.title = title;
    for (const [attr, key, value] of TAGS) {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      const created = !el;
      if (created) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      const site = el.dataset.site;
      before.tags.push({ el, created: created || site === '', content: site ?? el.getAttribute('content') });
      el.setAttribute('content', value(title));
    }
    return () => {
      document.title = before.title;
      for (const { el, created, content } of before.tags) {
        if (created) el.remove();
        else el.setAttribute('content', content);
      }
    };
  }, [title]);
}
