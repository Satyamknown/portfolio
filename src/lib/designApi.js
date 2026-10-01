// Read-only client for /api/design-studies. Kept apart from lib/api.js so the
// existing API client stays untouched.
async function get(path) {
  const res = await fetch(`/api/design-studies${path}`, { credentials: 'same-origin' });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty body
  }
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data;
}

export const designApi = {
  list: () => get(''),
  get: (slug) => get(`/${encodeURIComponent(slug)}`)
};
