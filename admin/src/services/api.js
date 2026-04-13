const _env = import.meta.env.VITE_RENTR_ADMIN_API_URL || import.meta.env.VITE_ADMIN_API_URL || '';
const BASE_URL = _env || '/api';

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

  const config = { method, headers };
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${url}`, config);

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

  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: formData,
  });

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
