import { SectionIntro } from '../components/UiBlocks'

// Mock data (later comes from backend)
const applications = [
  {
    project: 'ForgePilot',
    role: 'Frontend Engineer',
    status: 'Pending',
  },
  {
    project: 'HealthCanvas',
    role: 'UI Designer',
    status: 'Accepted',
  },
  {
    project: 'CropLynk',
    role: 'Frontend Developer',
    status: 'Rejected',
  },
]

function ApplicationsPage() {
  return (
    <div className="page">
      {/* HERO */}
      <section className="page-hero">
        <SectionIntro
          eyebrow="Your applications"
          title="Track your project applications"
          description="Monitor the status of projects you've applied to and stay updated on responses."
        />
      </section>

      {/* APPLICATION LIST */}
      <section className="content-section">
        <div className="feature-grid">
          {applications.map((app) => (
            <article className="feature-card" key={app.project}>
              <span className="status-pill">{app.status}</span>
              <h3>{app.project}</h3>
              <p>Role: {app.role}</p>

              <div className="action-row">
                <Link
                  to={`/project/${app.project}`}
                  className="secondary-button">
                  View Project
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ApplicationsPage