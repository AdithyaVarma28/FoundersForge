import { saveStoredRole } from './roleRouting'

const USERS_STORAGE_KEY = 'foundersforge-users'
const SESSION_STORAGE_KEY = 'foundersforge-session'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function readUsers() {
  if (!canUseStorage()) {
    return {}
  }

  const raw = window.localStorage.getItem(USERS_STORAGE_KEY)

  if (!raw) {
    return {}
  }

  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function writeUsers(users) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

function setSession(email) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, email)
}

function getSessionEmail() {
  if (!canUseStorage()) {
    return null
  }

  return window.localStorage.getItem(SESSION_STORAGE_KEY)
}

export function registerUser({ name, email, password, role }) {
  const normalizedEmail = email.trim().toLowerCase()
  const users = readUsers()

  if (users[normalizedEmail]) {
    return { ok: false, message: 'An account already exists for this email.' }
  }

  users[normalizedEmail] = {
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
  }

  writeUsers(users)
  setSession(normalizedEmail)
  saveStoredRole(role)

  return { ok: true, user: users[normalizedEmail] }
}

export function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const users = readUsers()
  const user = users[normalizedEmail]

  if (!user || user.password !== password) {
    return { ok: false, message: 'Invalid email or password.' }
  }

  setSession(normalizedEmail)
  saveStoredRole(user.role)
  return { ok: true, user }
}

export function getCurrentUser() {
  const sessionEmail = getSessionEmail()

  if (!sessionEmail) {
    return null
  }

  const users = readUsers()
  return users[sessionEmail] ?? null
}

export function isAuthenticated() {
  return Boolean(getCurrentUser())
}

export function logoutUser() {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}
