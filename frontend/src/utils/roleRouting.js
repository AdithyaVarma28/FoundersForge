export const ROLE_ROUTES = {
  Founder: '/founder',
  Contributor: '/contributor',
  Investor: '/investor',
}

const ROLE_STORAGE_KEY = 'foundersforge-role'
const DEFAULT_ROLE = 'Founder'

export function isValidRole(role) {
  return Object.hasOwn(ROLE_ROUTES, role)
}

export function getDashboardRoute(role) {
  return ROLE_ROUTES[role] ?? ROLE_ROUTES[DEFAULT_ROLE]
}

export function getStoredRole() {
  if (typeof window === 'undefined') {
    return null
  }

  const role = window.localStorage.getItem(ROLE_STORAGE_KEY)
  return isValidRole(role) ? role : null
}

export function saveStoredRole(role) {
  if (typeof window === 'undefined') {
    return
  }

  if (!isValidRole(role)) {
    return
  }

  window.localStorage.setItem(ROLE_STORAGE_KEY, role)
}
