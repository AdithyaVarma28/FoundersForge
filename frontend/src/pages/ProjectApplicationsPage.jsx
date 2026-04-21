import { useParams } from 'react-router-dom'
import { SectionIntro, PillList } from '../components/UiBlocks'

// Mock data (later → backend)
const applications = {
  ForgePilot: [
    {
      name: 'Rahul',
      role: 'Frontend Engineer',
      skills: ['React', 'CSS', 'UI'],
      status: 'Pending',
    },
    {
      name: 'Ananya',
      role: 'UI Designer',
      skills: ['Figma', 'UX', 'Design Systems'],
      status: 'Pending',
    },
  ],
}

function ProjectApplicationsPage() {
  const { id } = useParams()
  const projectApps = applications[id] || []

  return (
    <div className="page">
      {/* HERO */}
      <section className="page-hero">
        <SectionIntro
          eyebrow="Project applications"
          title={`Applications for ${id}`}
          description="Review contributors and select the right team."
        />
      </section>

      {/* APPLICATION LIST */}
      <section className="content-section">
        {projectApps.length === 0 ? (
          <div className="glass-panel">No applications yet.</div>
        ) : (
          <div className="feature-grid">
            {projectApps.map((app, index) => (
              <article className="feature-card" key={index}>
                <span className="status-pill">{app.status}</span>
                <h3>{app.name}</h3>
                <p>{app.role}</p>

                <PillList items={app.skills} />

                <div className="action-row">
                  <button className="primary-button">Accept</button>
                  <button className="secondary-button">Reject</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default ProjectApplicationsPage