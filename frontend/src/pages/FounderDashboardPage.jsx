import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionIntro, StatGrid } from '../components/UiBlocks'
import { apiFetch } from '../utils/api'

function FounderDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiFetch('/dashboards/founder')
        setDashboard(data.dashboard)
      } catch (err) {
        console.error('Failed to load dashboard', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <div className="page"><p>Loading dashboard...</p></div>
  if (!dashboard) return <div className="page"><p>Error loading dashboard.</p></div>

  const founderStats = [
    {
      value: `${dashboard.totalProjects}`,
      label: 'Total Projects',
      detail: 'Projects currently under your management.',
    },
    {
      value: `${dashboard.activeApplications}`,
      label: 'Pending Applications',
      detail: 'Contributor applications waiting for your review.',
    },
    {
      value: `₹${dashboard.totalFundsReceived.toLocaleString()}`,
      label: 'Total Funding Received',
      detail: 'Combined investor funding across your projects.',
    },
  ]

  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="Founder Studio"
          title="Turn your concepts into structured projects"
          description="Monitor your active projects, review incoming applications, and track your funding."
        />
        <StatGrid stats={founderStats} />
        <div className="action-row">
          <Link className="primary-button" to="/project/create">
            Create New Project
          </Link>
        </div>
      </section>

      <section className="content-section split-section">
        <div>
          <SectionIntro
            eyebrow="Project pipeline"
            title="Projects currently moving through the platform"
            description="Manage your existing projects and team formations."
          />

          <div className="feature-grid">
            {dashboard.projects.map((project) => (
             <article className="feature-card" key={project._id}>
                <span className="status-pill">{project.status}</span>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <Link className="feature-link" to={`/workspace/${project._id}`}>
                  Open Workspace
                </Link>
                <br/>
                <Link className="feature-link" to={`/project/${project._id}`}>
                  Manage Details
                </Link>
              </article>
            ))}
            {dashboard.projects.length === 0 && <p>No projects yet. Create one to get started!</p>}
          </div>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">Recent Activity</div>
          <ul className="stack-list">
            <li>{dashboard.activeApplications} applications pending review.</li>
            <li>{dashboard.investments.length} investment commitments received.</li>
          </ul>
        </aside>
      </section>
    </div>
  )
}

export default FounderDashboardPage
