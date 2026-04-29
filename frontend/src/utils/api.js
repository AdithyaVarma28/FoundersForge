const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function getAuthToken() {
  return localStorage.getItem('foundersforge-token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('foundersforge-token', token);
  } else {
    localStorage.removeItem('foundersforge-token');
  }
}

export async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}
