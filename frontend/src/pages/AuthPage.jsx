import { startTransition, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionIntro } from '../components/UiBlocks'
import { getCurrentUser, isAuthenticated, loginUser, registerUser } from '../utils/authSession'
import { getDashboardRoute, getStoredRole } from '../utils/roleRouting'

const roles = ['Founder', 'Contributor', 'Investor']

const securityItems = [
  'Unique email validation during registration',
  'Password hashing aligned to the SRS security requirements',
  'JWT-based session creation after successful login',
  'Role-aware redirect to the correct dashboard experience',
]

function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('register')
  const [selectedRole, setSelectedRole] = useState(() => getStoredRole() ?? 'Founder')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      return
    }

    const user = getCurrentUser()
    startTransition(() => {
      navigate(getDashboardRoute(user?.role), { replace: true })
    })
  }, [navigate])

  function updateField(key, value) {
    setFormData((current) => ({ ...current, [key]: value }))
  }

  function handleAuthSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    if (mode === 'register' && !formData.name.trim()) {
      setErrorMessage('Please enter your full name to register.')
      return
    }

    const result =
      mode === 'register'
        ? registerUser({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: selectedRole,
          })
        : loginUser({
            email: formData.email,
            password: formData.password,
          })

    if (!result.ok) {
      setErrorMessage(result.message)
      return
    }

    startTransition(() => {
      navigate(getDashboardRoute(result.user.role))
    })
  }

  return (
    <div className="page">
      <section className="page-hero split-section">
        <div>
          <SectionIntro
            eyebrow="FR1, FR2, FR3"
            title="Authentication designed around secure onboarding and role clarity"
            description="The SRS emphasizes registration, login, and role-specific access. This page gives those flows a confident entry point instead of leaving them as plain starter forms."
          />

          <div className="tab-row">
            <button
              className={mode === 'register' ? 'tab-button tab-button-active' : 'tab-button'}
              onClick={() => setMode('register')}
              type="button"
            >
              Create account
            </button>
            <button
              className={mode === 'login' ? 'tab-button tab-button-active' : 'tab-button'}
              onClick={() => setMode('login')}
              type="button"
            >
              Sign in
            </button>
          </div>

          <form className="glass-panel form-card" onSubmit={handleAuthSubmit}>
            <div className="form-grid">
              {mode === 'register' && (
                <label>
                  Full name
                  <input
                    onChange={(event) => updateField('name', event.target.value)}
                    placeholder="Adithya Varma"
                    type="text"
                    value={formData.name}
                  />
                </label>
              )}
              <label>
                Email address
                <input
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="name@foundersforge.app"
                  type="email"
                  value={formData.email}
                />
              </label>
              <label>
                Password
                <input
                  onChange={(event) => updateField('password', event.target.value)}
                  placeholder="Enter a secure password"
                  type="password"
                  value={formData.password}
                />
              </label>
            </div>

            {mode === 'register' && (
              <div className="role-selector">
                <span className="field-label">Choose your platform role</span>
                <div className="pill-row">
                  {roles.map((role) => (
                    <button
                      className={selectedRole === role ? 'pill-button pill-button-active' : 'pill-button'}
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      type="button"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errorMessage && <p className="form-error">{errorMessage}</p>}

            <button className="primary-button full-width-button" type="submit">
              {mode === 'register' ? `Create ${selectedRole} account` : 'Sign in to your dashboard'}
            </button>
          </form>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">What happens after auth?</div>
          <div className="info-strip">
            <strong>{selectedRole}</strong>
            <p>
              {selectedRole === 'Founder' &&
                'Launch the idea studio, publish project posts, invite collaborators, and track funding.'}
              {selectedRole === 'Contributor' &&
                'Upload a resume, review extracted skills, discover matching projects, and apply.'}
              {selectedRole === 'Investor' &&
                'Review structured opportunities, compare traction, and manage your funding activity.'}
            </p>
          </div>

          <ul className="stack-list">
            {securityItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  )
}

export default AuthPage
