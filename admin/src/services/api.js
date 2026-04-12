// API base URL — admin-api serves at /api (NOT /api/v1)
const _env = import.meta.env.VITE_ADMIN_API_URL || '';
// Fix legacy env values that incorrectly include /v1
const BASE_URL = _env.replace(/\/api\/v1\b/, '/api') || '/api';

function getToken() {
  return localStorage.getItem('rentr_admin_token');
}

function setToken(token) {
  localStorage.setItem('rentr_admin_token', token);
}

function clearToken() {
  localStorage.removeItem('rentr_admin_token');
}

async function request(method, url, data = null, { skipAuthRedirect = false } = {}) {
  const headers = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { method, headers, redirect: 'manual' };
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  let response = await fetch(`${BASE_URL}${url}`, config);

  // Handle 307/308 redirects manually to preserve Authorization header across ngrok
  if (response.type === 'opaqueredirect' || response.status === 307 || response.status === 308) {
    const location = response.headers.get('location');
    if (location) {
      // Use the full redirect URL but keep our auth headers
      response = await fetch(location, { method, headers, body: config.body });
    } else {
      // Opaque redirect — retry with trailing slash appended
      const retryUrl = `${BASE_URL}${url}${url.includes('?') ? '' : url.endsWith('/') ? '' : '/'}`;
      response = await fetch(retryUrl, { method, headers, body: config.body });
    }
  }

  if (response.status === 401 && !skipAuthRedirect) {
    if (token) {
      clearToken();
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || err.message || 'Request failed');
  }

  if (response.status === 204) return null;
  return response.json();
}

async function uploadFiles(url, formData) {
  const headers = { 'ngrok-skip-browser-warning': 'true' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: formData,
    redirect: 'manual',
  });

  if (response.type === 'opaqueredirect' || response.status === 307 || response.status === 308) {
    const location = response.headers.get('location');
    if (location) {
      response = await fetch(location, { method: 'POST', headers, body: formData });
    } else {
      const retryUrl = `${BASE_URL}${url}${url.endsWith('/') ? '' : '/'}`;
      response = await fetch(retryUrl, { method: 'POST', headers, body: formData });
    }
  }

  if (response.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }

  return response.json();
}

const api = {
  get: (url) => request('GET', url),
  post: (url, data) => request('POST', url, data),
  put: (url, data) => request('PUT', url, data),
  patch: (url, data) => request('PATCH', url, data),
  delete: (url) => request('DELETE', url),
  upload: (url, formData) => uploadFiles(url, formData),

  getToken,

  async login(email, password) {
    const res = await request('POST', '/auth/login', { email, password }, { skipAuthRedirect: true });
    if (res.access_token) {
      setToken(res.access_token);
    }
    return res;
  },

  logout() {
    clearToken();
  },
};

export default api;
