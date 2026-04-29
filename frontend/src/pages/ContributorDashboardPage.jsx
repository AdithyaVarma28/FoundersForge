import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionIntro, StatGrid } from '../components/UiBlocks'
import { apiFetch } from '../utils/api'

function ContributorDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiFetch('/dashboards/contributor')
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

  const contributorStats = [
    {
      value: `${dashboard.totalApplications}`,
      label: 'Total Applications',
      detail: 'Number of projects you applied for.',
    },
    {
      value: `${dashboard.acceptedApplications}`,
      label: 'Accepted Roles',
      detail: 'Projects where you are currently contributing.',
    },
    {
      value: `${dashboard.pendingApplications}`,
      label: 'Pending Reviews',
      detail: 'Applications waiting for founder approval.',
    },
  ]

  const enrolledApplications = dashboard.applications.filter(app => app.status === 'accepted')
  
  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="Contributor Hub"
          title="Track your project applications and contributions"
          description="View the projects you are enrolled in and discover new opportunities."
        />
        <StatGrid stats={contributorStats} />
        <div className="action-row">
          <Link className="primary-button" to="/discover">
            Discover Projects
          </Link>
          <Link className="secondary-button" to="/profile">
            Update Skills
          </Link>
        </div>
      </section>

      <section className="content-section">
        <SectionIntro
          eyebrow="Enrolled Projects"
          title="Projects you are actively contributing to"
          description="Jump into the workspace and collaborate."
        />

        <div className="feature-grid feature-grid-three">
          {enrolledApplications.map((app) => (
            <article className="feature-card" key={app._id}>
              <span className="status-pill">{app.project?.status}</span>
              <h3>{app.project?.title}</h3>
              <p>{app.project?.summary}</p>
              <Link
                to={`/workspace/${app.project?._id}`}
                className="secondary-button full-width-button">
                 Open Workspace
              </Link>
            </article>
          ))}
          {enrolledApplications.length === 0 && <p>You are not enrolled in any projects yet.</p>}
        </div>
      </section>

      <section className="content-section">
        <SectionIntro
          eyebrow="All Applications"
          title="Your recent project applications"
          description="Track the status of your pitches to founders."
        />

        <div className="feature-grid">
          {dashboard.applications.map((app) => (
            <article className="feature-card" key={app._id}>
              <span className="status-pill">{app.status}</span>
              <h3>{app.project?.title}</h3>
              <p>{app.message}</p>
            </article>
          ))}
          {dashboard.applications.length === 0 && <p>You haven't applied to any projects yet.</p>}
        </div>
      </section>
    </div>
  )
}

export default ContributorDashboardPage
