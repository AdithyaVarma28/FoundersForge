import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getCurrentUser, logoutUser } from '../utils/authSession'
import { getDashboardRoute } from '../utils/roleRouting'

function AppShell() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()

  const navigation = [
    { label: 'Platform', to: '/' },
    { label: 'Projects', to: '/discover' },

    ...(currentUser
      ? [
          { label: 'Profile', to: '/profile' },

          ...(currentUser.role === 'Investor'
            ? [{ label: 'Portfolio', to: '/portfolio' }]
            : []),
        ]
      : []),
  ]

  if (currentUser) {
    navigation.splice(1, 0, {
      label: `${currentUser.role} Dashboard`,
      to: getDashboardRoute(currentUser.role),
    })
  }

  function handleLogout() {
    logoutUser()
    navigate('/auth')
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink className="brand" to="/">
          <span className="brand-mark">FF</span>
          <span>
            <strong>FoundersForge</strong>
            <small>LLM-powered collaboration and investment platform</small>
          </span>
        </NavLink>

        <nav className="main-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <NavLink className="ghost-link" to="/discover">
            Explore matches
          </NavLink>
          {currentUser ? (
            <button className="logout-button" onClick={handleLogout} type="button">
              Log out
            </button>
          ) : (
            <NavLink className="primary-button" to="/auth">
              Sign in
            </NavLink>
          )}
        </div>
      </header>

      <main className="page-frame">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div>
          <strong>Disclaimer!!</strong>
          <p>
          Engagement with this platform and its public forums is entirely at your own risk; because we do not track users or verify identities, you are responsible for your own safety and the security of your ideas.
          </p>
        </div>
        <div className="footer-links">
          <NavLink to="/discover">Discover projects</NavLink>
          {currentUser ? <NavLink to="/dashboard">Open dashboard</NavLink> : <NavLink to="/auth">Sign in</NavLink>}
        </div>
      </footer>
    </div>
  )
}

export default AppShell
