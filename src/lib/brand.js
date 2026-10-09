import { brandIcons } from '../data/site.js';

// Brand icon for a project, matched by slug prefix so that
// "stratalite-platform-testing" also gets Stratalite's mark.
export function brandIcon(slug = '') {
  const key = Object.keys(brandIcons).find((k) => slug === k || slug.startsWith(`${k}-`));
  return key ? brandIcons[key] : null;
}

export function monogram(text = '') {
  return text
    .split(/[\s:·]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
