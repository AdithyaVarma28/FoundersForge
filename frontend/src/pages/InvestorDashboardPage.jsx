import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionIntro, StatGrid } from '../components/UiBlocks'
import { apiFetch } from '../utils/api'

function InvestorDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiFetch('/dashboards/investor')
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

  const investorStats = [
    {
      value: `₹${dashboard.totalInvested.toLocaleString()}`,
      label: 'Capital Deployed',
      detail: 'Total funds committed across active projects.',
    },
    {
      value: `${dashboard.fundedProjectsCount}`,
      label: 'Active Investments',
      detail: 'Number of projects you are currently funding.',
    },
    {
      value: `${dashboard.investments.length}`,
      label: 'Total Transactions',
      detail: 'Number of individual investments made.',
    },
  ]

  // Extract unique funded projects to show enrolled projects
  const uniqueProjectsMap = new Map();
  dashboard.investments.forEach(inv => {
    if (inv.project && !uniqueProjectsMap.has(inv.project._id)) {
      uniqueProjectsMap.set(inv.project._id, inv.project);
    }
  });
  const fundedProjects = Array.from(uniqueProjectsMap.values());

  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="Investor Dashboard"
          title="Track your portfolio and discover new opportunities"
          description="Monitor your active investments and collaborate with founders in the workspace."
        />
        <StatGrid stats={investorStats} />
        <div className="action-row">
          <Link className="primary-button" to="/discover">
            Discover Projects
          </Link>
          <Link className="secondary-button" to="/portfolio">
            View Full Portfolio
          </Link>
        </div>
      </section>

      <section className="content-section">
        <SectionIntro
          eyebrow="Enrolled Projects"
          title="Projects you have funded"
          description="Jump into the workspace and review milestones."
        />

        <div className="feature-grid feature-grid-three">
          {fundedProjects.map((project) => (
            <article className="feature-card" key={project._id}>
              <span className="status-pill">{project.status || 'Funded'}</span>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <Link
                to={`/workspace/${project._id}`}
                className="secondary-button full-width-button">
                 Open Workspace
              </Link>
            </article>
          ))}
          {fundedProjects.length === 0 && <p>You haven't funded any projects yet.</p>}
        </div>
      </section>

      <section className="content-section split-section">
        <div>
          <SectionIntro
            eyebrow="Recent Transactions"
            title="Your latest investment commitments"
            description="A ledger of your recent platform activity."
          />

          <div className="feature-grid">
             {dashboard.investments.slice(0, 5).map((investment) => (
              <article className="feature-card" key={investment._id}>
                <span className="status-pill">₹{investment.amount.toLocaleString()}</span>
                <h3>{investment.project?.title}</h3>
                <p>Invested on {new Date(investment.transactionDate).toLocaleDateString()}</p>
              </article>
            ))}
            {dashboard.investments.length === 0 && <p>No transactions found.</p>}
          </div>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">Platform Insights</div>
          <ul className="stack-list">
            <li>We matched 15 new startups matching your thesis this week.</li>
            <li>3 of your portfolio companies hit new milestones.</li>
          </ul>
        </aside>
      </section>
    </div>
  )
}

export default InvestorDashboardPage
