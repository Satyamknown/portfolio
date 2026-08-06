const TOKEN_KEY = 'portfolio_admin_token';

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty body, e.g. some error responses
  }

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

export const auth = {
  isSignedIn: () => Boolean(localStorage.getItem(TOKEN_KEY)),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY)
};

export const api = {
  login: async (email, password) => {
    const data = await request('/auth/login', { method: 'POST', body: { email, password } });
    auth.setToken(data.token);
    return data;
  },

  listProjects: (all = false) => request(`/projects${all ? '?all=1' : ''}`),
  getProject: (slug) => request(`/projects/${slug}`),
  createProject: (payload) => request('/projects', { method: 'POST', body: payload }),
  updateProject: (id, payload) => request(`/projects/${id}`, { method: 'PUT', body: payload }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  listPosts: (all = false) => request(`/posts${all ? '?all=1' : ''}`),
  getPost: (slug) => request(`/posts/${slug}`),
  createPost: (payload) => request('/posts', { method: 'POST', body: payload }),
  updatePost: (id, payload) => request(`/posts/${id}`, { method: 'PUT', body: payload }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' })
};

export function slugify(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
