import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SectionIntro } from '../components/UiBlocks'
import { apiFetch } from '../utils/api'

function InvestmentPage() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [amount, setAmount] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await apiFetch(`/projects/${projectId}`)
        setProject(data.project)
      } catch (err) {
        setError('Failed to load project details.')
      }
    }
    loadProject()
  }, [projectId])

  async function handleInvest(e) {
    e.preventDefault()
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Please enter a valid investment amount.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await apiFetch(`/investments/projects/${projectId}`, {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount) })
      })
      setConfirmed(true)
    } catch (err) {
      setError(err.message || 'Failed to submit investment.')
    } finally {
      setLoading(false)
    }
  }

  if (error && !project) return <div className="page"><p className="form-error">{error}</p></div>
  if (!project) return <div className="page"><p>Loading project...</p></div>

  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="Invest"
          title={`Invest in ${project.title}`}
          description="Support this project and become part of its growth journey."
        />
        <div className="info-strip">
          <strong>Funding Goal:</strong> ₹{project.fundingGoal?.toLocaleString() || 0} <br/>
          <strong>Raised So Far:</strong> ₹{project.fundingRaised?.toLocaleString() || 0}
        </div>
      </section>

      <section className="content-section">
        <form className="glass-panel form-card" onSubmit={handleInvest}>
          
          <label>
            Investment Amount (₹)
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={loading || confirmed}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="action-row">
            <button className="primary-button" type="submit" disabled={loading || confirmed}>
              {loading ? 'Processing...' : 'Confirm Investment'}
            </button>
          </div>

          {confirmed && (
            <div className="info-strip" style={{ marginTop: '1rem' }}>
              ✅ Investment of ₹{Number(amount).toLocaleString()} submitted successfully!
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/portfolio" className="secondary-button">
                    Go to Portfolio
                </Link>
                <Link to={`/workspace/${project._id}`} className="secondary-button" style={{ marginLeft: '1rem' }}>
                    Open Workspace
                </Link>
              </div>
            </div>
          )}
        </form>
      </section>
    </div>
  )
}

export default InvestmentPage