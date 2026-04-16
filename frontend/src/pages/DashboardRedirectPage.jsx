import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../utils/authSession'
import { getDashboardRoute } from '../utils/roleRouting'

function DashboardRedirectPage() {
  const user = getCurrentUser()

  if (!user) {
    return <Navigate replace to="/auth" />
  }

  return <Navigate replace to={getDashboardRoute(user.role)} />
}

export default DashboardRedirectPage
