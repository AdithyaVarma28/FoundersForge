import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SectionIntro, PillList } from '../components/UiBlocks'
import { getCurrentUser } from '../utils/authSession'
import { apiFetch } from '../utils/api'

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

  if (loading) return <div className="page"><p>Loading project...</p></div>
  if (error || !project) return <div className="page"><p>{error || 'Project not found'}</p></div>

  const roles = project.rolesNeeded && Array.isArray(project.rolesNeeded) 
    ? project.rolesNeeded 
    : typeof project.rolesNeeded === 'string' ? project.rolesNeeded.split(',') : []
  
  const skills = project.requiredSkills && Array.isArray(project.requiredSkills) 
    ? project.requiredSkills 
    : typeof project.requiredSkills === 'string' ? project.requiredSkills.split(',') : []
  
  const objectives = project.objectives && Array.isArray(project.objectives)
    ? project.objectives
    : typeof project.objectives === 'string' ? project.objectives.split('\n') : []

  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="Project overview"
          title={project.title}
          description={project.summary}
        />
        <div className="info-strip">
          <strong>Founder:</strong> {project.founder?.fullName || 'Unknown'}
        </div>
      </section>

      <section className="content-section split-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">Roles needed</div>
          <ul className="stack-list">
            {roles.map((role, idx) => (
              <li key={idx}>{role.trim()}</li>
            ))}
            {roles.length === 0 && <li>Not specified</li>}
          </ul>

          <div className="panel-kicker" style={{ marginTop: '2rem' }}>Skills required</div>
          <PillList items={skills.map(s => s.trim())} />
        </div>

        <aside className="glass-panel stacked-panel">
            <div className="panel-kicker">Project status</div>
            <ul className="stack-list">
              <li>Stage: {project.status}</li>
              <li>Team size: {project.members?.length || 1} members</li>
              <li>Funding Goal: ₹{project.fundingGoal?.toLocaleString() || 0}</li>
              <li>Raised: ₹{project.fundingRaised?.toLocaleString() || 0}</li>
            </ul>
       </aside>
      </section>

      <section className="content-section split-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">Current team</div>
          <ul className="stack-list">
            {project.members?.map((member) => (
              <li key={member.user?._id || member._id}>
                 <strong>{member.role}:</strong> {member.user?.fullName}
              </li>
            ))}
          </ul>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">Objectives</div>
          <ul className="stack-list">
            {objectives.map((m, idx) => (
              <li key={idx}>{m}</li>
            ))}
             {objectives.length === 0 && <li>No specific objectives set</li>}
          </ul>
        </aside>
      </section>

      <section className="content-section">
      <div className="action-row">

          {user?.role === 'Contributor' && (
            <Link className="primary-button" to={`/applications?projectId=${project._id}`}>
              Apply to project
            </Link>
          )}

          {user?.role === 'Founder' && (
            <Link
              to={`/project/${project._id}/applications`}
              className="primary-button"
            >
              View Applications
            </Link>
          )}

          {user?.role === 'Investor' && (
            <Link
              to={`/invest/${project._id}`}
              className="primary-button"
            >
              Invest in Project
            </Link>
          )}

          <Link
            className="secondary-button"
            to={`/workspace/${project._id}`}
          >
            Open workspace
          </Link>

        </div>
      </section>
    </div>
  )
}

export default ProjectDetailsPage