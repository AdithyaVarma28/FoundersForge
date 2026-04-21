import { Link } from 'react-router-dom'
import { SectionIntro, PillList } from '../components/UiBlocks'

// Mock investment data
const portfolio = [
  {
    project: 'ForgePilot',
    amount: '₹50,000',
    status: 'Active',
    progress: '62%',
    tags: ['AI', 'SaaS'],
  },
  {
    project: 'CropLynk',
    amount: '₹30,000',
    status: 'Growing',
    progress: '45%',
    tags: ['AgriTech', 'Marketplace'],
  },
]

function PortfolioPage() {
  return (
    <div className="page">
      {/* HERO */}
      <section className="page-hero">
        <SectionIntro
          eyebrow="Your portfolio"
          title="Track your investments"
          description="Detailed view of all your funded projects and their progress."
        />
      </section>

      {/* PORTFOLIO LIST */}
      <section className="content-section">
        <div className="feature-grid">
          {portfolio.map((item) => (
            <article className="feature-card" key={item.project}>
              <span className="status-pill">{item.status}</span>

              <h3>{item.project}</h3>
              <p><strong>Invested:</strong> {item.amount}</p>

              <PillList items={item.tags} />

              {/* Progress */}
              <div className="meter-bar">
                <span style={{ width: item.progress }} />
              </div>

              <p>Progress: {item.progress}</p>

              {/* ACTIONS */}
              <div className="action-row">
                <Link
                  to={`/project/${item.project}`}
                  className="secondary-button"
                >
                  View Project
                </Link>

                <Link
                  to={`/workspace/${item.project}`}
                  className="secondary-button"
                >
                  Open Workspace
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default PortfolioPage