import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SectionIntro } from '../components/UiBlocks'
import { apiFetch } from '../utils/api'

function FundingDetailsPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchFunding() {
      try {
        const [projectData, investmentsData] = await Promise.all([
          apiFetch(`/projects/${id}`),
          apiFetch(`/investments/projects/${id}`)
        ])
        setProject(projectData.project)
        setInvestments(investmentsData.investments || [])
      } catch (err) {
        setError(err.message || 'Failed to load funding details.')
      } finally {
        setLoading(false)
      }
    }
    fetchFunding()
  }, [id])

  if (loading) return <div className="page"><p>Loading funding data...</p></div>
  if (error || !project) return <div className="page"><p className="form-error">{error || 'Data not found'}</p></div>

  const raised = project.fundingRaised || 0
  const goal = project.fundingGoal || 1 // Avoid divide by 0
  const percentage = Math.min((raised / goal) * 100, 100)

  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="Funding details"
          title={`Funding for ${project.title}`}
          description={project.summary}
        />
      </section>

      <section className="content-section split-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">Funding status</div>

          <div className="funding-meter">
            <span>₹{raised.toLocaleString()}</span>
            <strong>of ₹{project.fundingGoal?.toLocaleString() || 0}</strong>
          </div>

          <div className="meter-bar">
            <span style={{ width: `${percentage}%` }} />
          </div>

          <p>{investments.length} investment transactions</p>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">Investor Commitments</div>
          <ul className="stack-list">
            {investments.map((inv) => (
              <li key={inv._id}>
                <strong>{inv.investor?.fullName || 'Anonymous'}:</strong> ₹{inv.amount.toLocaleString()} 
                <br/><small>{new Date(inv.transactionDate).toLocaleDateString()}</small>
              </li>
            ))}
            {investments.length === 0 && <li>No investments yet.</li>}
          </ul>
        </aside>
      </section>

      <section className="content-section">
        <div className="action-row">
          <Link
            to={`/project/${id}`}
            className="secondary-button"
          >
            Back to Project
          </Link>
        </div>
      </section>
    </div>
  )
}

export default FundingDetailsPage