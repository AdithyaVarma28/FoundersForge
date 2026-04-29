import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionIntro } from '../components/UiBlocks'
import { apiFetch } from '../utils/api'

function CreateProjectPage() {
  const navigate = useNavigate()
  const [rawIdea, setRawIdea] = useState('')
  const [fundingGoal, setFundingGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!rawIdea || rawIdea.trim().length < 20) {
      setError('Idea must be at least 20 characters long.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = { rawIdea }
      if (fundingGoal && !isNaN(Number(fundingGoal))) {
        payload.fundingGoal = Number(fundingGoal)
      }
      
      const data = await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      navigate(`/workspace/${data.project._id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="Create project"
          title="Turn your idea into a structured project"
          description="Enter your raw idea, and let our AI structure it to attract contributors and investors."
        />
      </section>

      <section className="content-section">
        <form className="glass-panel form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Raw Idea
              <textarea
                name="rawIdea"
                rows="8"
                placeholder="Describe your startup idea, the problem it solves, the target audience, and what kind of roles or funding you need..."
                onChange={(e) => setRawIdea(e.target.value)}
                value={rawIdea}
                disabled={loading}
              />
            </label>
            <label>
              Funding Goal (₹) (Optional)
              <input
                type="number"
                name="fundingGoal"
                placeholder="e.g. 500000"
                onChange={(e) => setFundingGoal(e.target.value)}
                value={fundingGoal}
                disabled={loading}
              />
            </label>
          </div>
          
          {error && <p className="form-error">{error}</p>}

          <div className="action-row">
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Structuring with AI...' : 'Create Project'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CreateProjectPage