const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_REFRESH_BUFFER_MS = 5000;

let tokenCache = {
  token: null,
  expiresAt: 0,
};

function isTokenValid() {
  return Boolean(tokenCache.token) && Date.now() + TOKEN_REFRESH_BUFFER_MS < tokenCache.expiresAt;
}

async function requestToken() {
  const response = await fetch(`${API_BASE_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: 'ADMIN' }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get JWT token (${response.status}).`);
  }

  const payload = await response.json();
  tokenCache = {
    token: payload.token,
    expiresAt: Date.parse(payload.expiresAt),
  };

  return tokenCache.token;
}

async function getToken() {
  if (isTokenValid()) {
    return tokenCache.token;
  }

  return requestToken();
}

async function apiFetch(path, options = {}, retry = true) {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 && retry) {
    await requestToken();
    return apiFetch(path, options, false);
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const achievementsApi = {
  async list({ limit = 100, offset = 0 } = {}) {
    const query = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    return apiFetch(`/achievements?${query.toString()}`, { method: 'GET' });
  },

  async listAll(pageSize = 250) {
    let offset = 0;
    const all = [];

    while (true) {
      const page = await this.list({ limit: pageSize, offset });
      all.push(...page.items);

      if (all.length >= page.pagination.total) {
        break;
      }

      offset += page.items.length;
      if (page.items.length === 0) {
        break;
      }
    }

    return all;
  },

  async create(achievement) {
    return apiFetch('/achievements', {
      method: 'POST',
      body: JSON.stringify(achievement),
    });
  },

  async update(id, patch) {
    return apiFetch(`/achievements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    });
  },

  async remove(id) {
    return apiFetch(`/achievements/${id}`, {
      method: 'DELETE',
    });
  },
};
