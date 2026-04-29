import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { SectionIntro, PillList } from '../components/UiBlocks'
import { apiFetch } from '../utils/api'

function ProjectApplicationsPage() {
  const { id } = useParams()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchApps() {
      try {
        const data = await apiFetch(`/applications/projects/${id}`)
        setApplications(data.applications || [])
      } catch (err) {
        setError(err.message || 'Failed to load applications.')
      } finally {
        setLoading(false)
      }
    }
    fetchApps()
  }, [id])

  async function handleReview(appId, status) {
    try {
      await apiFetch(`/applications/${appId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      // Update UI
      setApplications(prev => prev.map(app => 
        app._id === appId ? { ...app, status } : app
      ))
    } catch (err) {
      alert('Failed to update application: ' + err.message)
    }
  }

  if (loading) return <div className="page"><p>Loading applications...</p></div>
  if (error) return <div className="page"><p className="form-error">{error}</p></div>

  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="Project applications"
          title={`Applications Management`}
          description="Review contributors and select the right team."
        />
      </section>

      <section className="content-section">
        {applications.length === 0 ? (
          <div className="glass-panel">No applications yet.</div>
        ) : (
          <div className="feature-grid">
            {applications.map((app) => {
              const profile = app.contributorProfile;
              const extractedSkills = profile?.contributor?.extractedSkills || [];
              const technologies = profile?.contributor?.technologies || [];
              const skills = [...new Set([...extractedSkills, ...technologies])];
              const experience = profile?.contributor?.experience || [];

              return (
                <article className="feature-card" key={app._id}>
                  <span className="status-pill">{app.status}</span>
                  <h3>{app.contributor?.fullName}</h3>
                  <p><strong>Message:</strong> {app.message}</p>

                  {skills.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <p className="muted-copy" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Parsed Skills</p>
                      <PillList items={skills} />
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <p className="muted-copy" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Recent Experience</p>
                      <ul className="stack-list" style={{ fontSize: '0.9rem' }}>
                        {experience.slice(0, 2).map((exp, idx) => (
                          <li key={idx} style={{ padding: '0.5rem 0', borderBottom: 'none' }}>
                            <strong>{exp.title}</strong> {exp.company && `at ${exp.company}`} <br/>
                            <span className="muted-copy">{exp.duration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {app.status === 'pending' && (
                    <div className="action-row" style={{ marginTop: '1rem' }}>
                      <button className="primary-button" onClick={() => handleReview(app._id, 'accepted')}>Accept</button>
                      <button className="secondary-button" onClick={() => handleReview(app._id, 'rejected')}>Reject</button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default ProjectApplicationsPage