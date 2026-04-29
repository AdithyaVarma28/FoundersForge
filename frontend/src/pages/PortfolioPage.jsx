import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionIntro, PillList } from '../components/UiBlocks'
import { apiFetch } from '../utils/api'

function PortfolioPage() {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const data = await apiFetch('/investments/me')
        setInvestments(data.investments || [])
      } catch (err) {
        setError(err.message || 'Failed to load portfolio')
      } finally {
        setLoading(false)
      }
    }
    loadPortfolio()
  }, [])

  if (loading) return <div className="page"><p>Loading portfolio...</p></div>
  if (error) return <div className="page"><p className="form-error">{error}</p></div>

  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="Your portfolio"
          title="Track your investments"
          description="Detailed view of all your funded projects and their progress."
        />
      </section>

      <section className="content-section">
        <div className="feature-grid">
          {investments.map((item) => (
            <article className="feature-card" key={item._id}>
              <span className="status-pill">{item.project?.status || 'Active'}</span>

              <h3>{item.project?.title || 'Unknown Project'}</h3>
              <p><strong>Invested:</strong> ₹{item.amount?.toLocaleString()}</p>

              {item.project?.requiredSkills && (
                <PillList items={typeof item.project.requiredSkills === 'string' ? item.project.requiredSkills.split(',') : item.project.requiredSkills} />
              )}

              {/* ACTIONS */}
              <div className="action-row" style={{ marginTop: '1rem' }}>
                <Link
                  to={`/project/${item.project?._id}`}
                  className="secondary-button"
                >
                  View Project
                </Link>

                <Link
                  to={`/workspace/${item.project?._id}`}
                  className="secondary-button"
                >
                  Open Workspace
                </Link>
              </div>
            </article>
          ))}
          {investments.length === 0 && <p>You have no active investments.</p>}
        </div>
      </section>
    </div>
  )
}

export default PortfolioPage