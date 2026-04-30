import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SectionIntro, PillList } from '../components/UiBlocks'
import { getCurrentUser } from '../utils/authSession'
import { apiFetch } from '../utils/api'

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  )
}

function ProjectDetailsPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = getCurrentUser()

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await apiFetch(`/projects/${id}`)
        setProject(data.project)
      } catch (err) {
        setError('Project not found or you do not have permission.')
      } finally {
        setLoading(false)
      }
    }
    loadProject()
  }, [id])

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="page">
        <div className="glass-panel error-state">
          <span className="error-icon">⚠️</span>
          <h3>{error || 'Project not found'}</h3>
          <Link to="/discover" className="secondary-button">Browse Projects</Link>
        </div>
      </div>
    )
  }

  const roles = Array.isArray(project.rolesNeeded)
    ? project.rolesNeeded
    : typeof project.rolesNeeded === 'string'
    ? project.rolesNeeded.split(',').map((r) => r.trim())
    : []

  const skills = Array.isArray(project.requiredSkills)
    ? project.requiredSkills
    : typeof project.requiredSkills === 'string'
    ? project.requiredSkills.split(',').map((s) => s.trim())
    : []

  const objectives = Array.isArray(project.objectives)
    ? project.objectives
    : typeof project.objectives === 'string'
    ? project.objectives.split('\n').map((o) => o.trim()).filter(Boolean)
    : []

  const aiProvider = project.structuredVersion?.provider
  const wasAIStructured = aiProvider && aiProvider !== 'local' && aiProvider !== 'seed'

  return (
    <div className="page">
      {/* Hero */}
      <section className="page-hero project-hero">
        <div className="project-hero-content">
          {wasAIStructured && (
            <span className="ai-badge">🤖 AI-structured</span>
          )}
          <div className="project-meta-top">
            <span className="project-status-chip">{project.status}</span>
            {project.fundingGoal > 0 && (
              <span className="funding-chip">
                🎯 ₹{project.fundingGoal.toLocaleString()} goal
              </span>
            )}
          </div>
          <h1 className="project-detail-title">{project.title}</h1>
          {project.tagline && (
            <p className="project-detail-tagline">"{project.tagline}"</p>
          )}
          <p className="project-detail-summary">{project.summary}</p>
          <div className="founder-chip">
            🧑‍💻 <strong>Founder:</strong> {project.founder?.fullName || 'Unknown'}
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="content-section split-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">⚠️ The Problem</div>
          <p className="panel-body">{project.problem || 'Not specified.'}</p>
        </div>
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">💡 The Solution</div>
          <p className="panel-body">{project.solution || 'Not specified.'}</p>
        </div>
      </section>

      {/* Target Audience & Revenue */}
      {(project.targetAudience || project.revenueModel) && (
        <section className="content-section split-section">
          {project.targetAudience && (
            <div className="glass-panel stacked-panel">
              <div className="panel-kicker">🎯 Target Audience</div>
              <p className="panel-body">{project.targetAudience}</p>
            </div>
          )}
          {project.revenueModel && (
            <div className="glass-panel stacked-panel">
              <div className="panel-kicker">💰 Revenue Model</div>
              <p className="panel-body">{project.revenueModel}</p>
            </div>
          )}
        </section>
      )}

      {/* Skills & Roles */}
      <section className="content-section split-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">🛠️ Required Skills</div>
          {skills.length > 0 ? (
            <PillList items={skills} />
          ) : (
            <p className="panel-body muted">No skills specified.</p>
          )}
        </div>
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">👥 Open Roles</div>
          {roles.length > 0 ? (
            <ul className="role-list">
              {roles.map((role, idx) => (
                <li key={idx} className="role-list-item">
                  <span className="role-dot" />
                  {role.trim()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel-body muted">No roles specified.</p>
          )}
        </div>
      </section>

      {/* Objectives */}
      {objectives.length > 0 && (
        <section className="content-section">
          <div className="glass-panel">
            <div className="panel-kicker">🎯 Key Objectives</div>
            <ol className="objectives-numbered">
              {objectives.map((obj, idx) => (
                <li key={idx} className="objective-item">
                  <span className="objective-num">{idx + 1}</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Team & Stats */}
      <section className="content-section split-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">👤 Current Team</div>
          <ul className="stack-list">
            {project.members?.map((member) => (
              <li key={member.user?._id || member._id} className="team-member">
                <span className="member-role-badge">{member.role}</span>
                {member.user?.fullName}
              </li>
            ))}
            {(!project.members || project.members.length === 0) && (
              <li className="muted">No team members listed.</li>
            )}
          </ul>
        </div>
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">📊 Project Stats</div>
          <ul className="stack-list">
            <InfoRow label="Stage" value={project.status} />
            <InfoRow label="Team Size" value={`${project.members?.length || 1} members`} />
            <InfoRow label="Funding Goal" value={project.fundingGoal > 0 ? `₹${project.fundingGoal.toLocaleString()}` : 'Not seeking funding'} />
            <InfoRow label="Raised" value={project.fundingRaised > 0 ? `₹${project.fundingRaised.toLocaleString()}` : 'None yet'} />
            <InfoRow label="AI Provider" value={aiProvider || 'N/A'} />
          </ul>
        </div>
      </section>

      {/* Actions */}
      <section className="content-section">
        <div className="action-row project-actions">
          {user?.role === 'Contributor' && (
            <Link className="primary-button" to={`/applications?projectId=${project._id}`}>
              Apply to Project
            </Link>
          )}
          {user?.role === 'Founder' && String(project.founder?._id) === String(user._id) && (
            <Link to={`/project/${project._id}/applications`} className="primary-button">
              View Applications
            </Link>
          )}
          {user?.role === 'Investor' && (
            <Link to={`/invest/${project._id}`} className="primary-button">
              💰 Invest in Project
            </Link>
          )}
          <Link className="secondary-button" to={`/workspace/${project._id}`}>
            Open Workspace
          </Link>
          <Link className="ghost-button" to="/discover">
            ← Back to Discover
          </Link>
        </div>
      </section>
    </div>
  )
}

export default ProjectDetailsPage