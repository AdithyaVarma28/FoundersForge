import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { SectionIntro, PillList } from '../components/UiBlocks'
import { apiFetch } from '../utils/api'

function ContributorDetails({ profile }) {
  const [open, setOpen] = useState(false)

  if (!profile) return null

  const extractedSkills = profile.contributor?.extractedSkills || []
  const technologies = profile.contributor?.technologies || []
  const skills = [...new Set([...extractedSkills, ...technologies])]
  const experience = profile.contributor?.experience || []
  const education = profile.contributor?.education || []
  const certifications = profile.contributor?.certifications || []
  const links = profile.links || []
  const bio = profile.bio || ''
  const location = profile.location || ''
  const phone = profile.contributor?.phone || ''

  const hasData = skills.length > 0 || experience.length > 0 || education.length > 0 || certifications.length > 0 || bio

  if (!hasData) return null

  return (
    <div className="contributor-details-wrapper">
      <button
        className="contributor-details-toggle"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="toggle-icon">{open ? '▾' : '▸'}</span>
        <span>Contributor Profile Details</span>
        <span className="toggle-badge">{skills.length} skills • {experience.length} exp</span>
      </button>

      {open && (
        <div className="contributor-details-panel">
          {/* Bio & Personal Info */}
          {(bio || location || phone) && (
            <div className="cd-section">
              <div className="cd-section-label">About</div>
              {bio && <p className="cd-bio">{bio}</p>}
              <div className="cd-meta-row">
                {location && <span className="cd-meta-chip">📍 {location}</span>}
                {phone && <span className="cd-meta-chip">📞 {phone}</span>}
              </div>
            </div>
          )}

          {/* Links */}
          {links.length > 0 && (
            <div className="cd-section">
              <div className="cd-section-label">Links</div>
              <div className="cd-links-row">
                {links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="cd-link-chip">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Skills & Technologies */}
          {skills.length > 0 && (
            <div className="cd-section">
              <div className="cd-section-label">Skills & Technologies</div>
              <PillList items={skills} />
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="cd-section">
              <div className="cd-section-label">Experience ({experience.length})</div>
              <ul className="cd-list">
                {experience.map((exp, idx) => (
                  <li key={idx} className="cd-list-item">
                    <div className="cd-item-header">
                      <strong>{exp.title || 'Untitled Role'}</strong>
                      {exp.company && <span className="cd-company">at {exp.company}</span>}
                    </div>
                    {exp.duration && <span className="cd-duration">{exp.duration}</span>}
                    {exp.summary && <p className="cd-summary">{exp.summary}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="cd-section">
              <div className="cd-section-label">Education ({education.length})</div>
              <ul className="cd-list">
                {education.map((edu, idx) => (
                  <li key={idx} className="cd-list-item">
                    <strong>{edu.institution || 'Unknown Institution'}</strong>
                    {edu.degree && <span className="cd-degree">{edu.degree}</span>}
                    {edu.year && <span className="cd-duration">{edu.year}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="cd-section">
              <div className="cd-section-label">Certifications ({certifications.length})</div>
              <ul className="cd-list">
                {certifications.map((cert, idx) => (
                  <li key={idx} className="cd-list-item">
                    <strong>{cert.name || 'Unnamed Certification'}</strong>
                    {cert.issuer && <span className="cd-company">by {cert.issuer}</span>}
                    {cert.year && <span className="cd-duration">{cert.year}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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
            {applications.map((app) => (
              <article className="feature-card" key={app._id}>
                <span className="status-pill">{app.status}</span>
                <h3>{app.contributor?.fullName}</h3>
                <p><strong>Message:</strong> {app.message}</p>

                {/* Contributor profile details dropdown */}
                <ContributorDetails profile={app.contributorProfile} />

                {app.status === 'pending' && (
                  <div className="action-row" style={{ marginTop: '1rem' }}>
                    <button className="primary-button" onClick={() => handleReview(app._id, 'accepted')}>Accept</button>
                    <button className="secondary-button" onClick={() => handleReview(app._id, 'rejected')}>Reject</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default ProjectApplicationsPage