import { saveStoredRole } from './roleRouting'
import { apiFetch, setAuthToken } from './api'

const USER_STORAGE_KEY = 'foundersforge-current-user'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function formatUser(user) {
  if (!user || !user.role) return user;
  const capitalizedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
  return { ...user, role: capitalizedRole };
}

export async function registerUser({ name, email, password, role }) {
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName: name, email, password, role: role.toLowerCase() }),
    })
    
    const user = formatUser(data.user)
    setAuthToken(data.token)
    if (canUseStorage()) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    }
    saveStoredRole(user.role)
    return { ok: true, user }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

export async function loginUser({ email, password }) {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    const user = formatUser(data.user)
    setAuthToken(data.token)
    if (canUseStorage()) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    }
    saveStoredRole(user.role)
    return { ok: true, user }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

export function getCurrentUser() {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getCurrentUser())
}

export function logoutUser() {
  if (!canUseStorage()) return
  setAuthToken(null)
  window.localStorage.removeItem(USER_STORAGE_KEY)
}
