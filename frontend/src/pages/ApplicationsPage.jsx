import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { SectionIntro } from '../components/UiBlocks'
import { apiFetch } from '../utils/api'

function ApplicationsPage() {
  const [searchParams] = useSearchParams()
  const projectIdToApply = searchParams.get('projectId')
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    async function loadApplications() {
      try {
        const data = await apiFetch('/applications/me')
        setApplications(data.applications || [])
      } catch (err) {
        setError('Failed to load applications')
      } finally {
        setLoading(false)
      }
    }
    loadApplications()
  }, [])

  async function handleApply(e) {
    e.preventDefault()
    setApplying(true)
    setError('')
    try {
      await apiFetch(`/applications/projects/${projectIdToApply}`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      })
      navigate('/contributor')
    } catch (err) {
      setError(err.message)
      setApplying(false)
    }
  }

  if (loading) return <div className="page"><p>Loading applications...</p></div>

  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="Your applications"
          title={projectIdToApply ? "Apply to Project" : "Track your project applications"}
          description={projectIdToApply ? "Send a message to the founder with your pitch." : "Monitor the status of projects you've applied to and stay updated on responses."}
        />
      </section>

      {projectIdToApply && (
        <section className="content-section">
          <form className="glass-panel form-card" onSubmit={handleApply}>
            <div className="form-grid">
              <label>
                Application Message
                <textarea
                  rows="4"
                  placeholder="Explain why you're a good fit for this project..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={applying}
                />
              </label>
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="action-row">
              <button className="primary-button" type="submit" disabled={applying || !message.trim()}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="content-section">
        <div className="feature-grid">
          {applications.map((app) => (
            <article className="feature-card" key={app._id}>
              <span className="status-pill">{app.status}</span>
              <h3>{app.project?.title || 'Unknown Project'}</h3>
              <p><strong>Message:</strong> {app.message}</p>

              <div className="action-row" style={{ marginTop: '1rem' }}>
                <Link
                  to={`/project/${app.project?._id}`}
                  className="secondary-button">
                  View Project
                </Link>
              </div>
            </article>
          ))}
          {applications.length === 0 && !projectIdToApply && <p>You haven't applied to any projects yet.</p>}
        </div>
      </section>
    </div>
  )
}

export default ApplicationsPage