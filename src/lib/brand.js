import { brandIcons, projectLinks } from '../data/site.js';

// Brand icon for a project, matched by slug prefix so that
// "stratalite-platform-testing" also gets Stratalite's mark.
export function brandIcon(slug = '') {
  const key = Object.keys(brandIcons).find((k) => slug === k || slug.startsWith(`${k}-`));
  return key ? brandIcons[key] : null;
}

const matchKey = (map, slug = '') =>
  Object.keys(map).find((k) => slug === k || slug.startsWith(`${k}-`));

// Live links for a project: the CMS Website URL (if set) first, then the
// client's sites from site.js, without duplicates.
export function linksFor(project) {
  const key = matchKey(projectLinks, project.slug);
  const list = key ? [...projectLinks[key]] : [];
  if (project.url && !list.some((l) => l.url === project.url)) list.unshift({ label: 'Website', url: project.url });
  return list;
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
