import { Navigate } from 'react-router-dom'
import { getCurrentUser, isAuthenticated } from '../utils/authSession'
import { getDashboardRoute } from '../utils/roleRouting'

function ProtectedRoute({ allowedRole, children }) {
  if (!isAuthenticated()) {
    return <Navigate replace to="/auth" />
  }

  const user = getCurrentUser()

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate replace to={getDashboardRoute(user?.role)} />
  }

  return children
}

export default ProtectedRoute
