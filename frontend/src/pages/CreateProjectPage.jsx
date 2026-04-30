import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionIntro, PillList } from '../components/UiBlocks'
import { apiFetch } from '../utils/api'

function CreateProjectPage() {
  const navigate = useNavigate()
  const [rawIdea, setRawIdea] = useState('')
  const [fundingGoal, setFundingGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)
  const [step, setStep] = useState('input') // 'input' | 'preview'

  async function handlePreview(e) {
    e.preventDefault()
    if (!rawIdea || rawIdea.trim().length < 20) {
      setError('Idea must be at least 20 characters long.')
      return
    }
    setLoading(true)
    setError('')
    setPreview(null)

    try {
      // Call a preview endpoint that structures without saving
      const data = await apiFetch('/ai/structure-idea', {
        method: 'POST',
        body: JSON.stringify({ rawIdea }),
      })
      setPreview(data.structured)
      setStep('preview')
    } catch (err) {
      // Fallback: show raw form, let user submit directly
      setError('AI preview unavailable. Click "Publish Project" to submit directly.')
      setStep('preview')
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
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
      setStep('preview')
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
          description="Describe your startup idea in your own words. Our AI will generate a title, structure your problem/solution, identify required skills and roles, and more."
        />
      </section>

      <section className="content-section">
        {step === 'input' && (
          <form className="glass-panel form-card" onSubmit={handlePreview}>
            <div className="form-grid">
              <label>
                Your Raw Idea <span className="required-star">*</span>
                <textarea
                  name="rawIdea"
                  rows="10"
                  placeholder="Describe your startup idea in full detail. What problem does it solve? Who is the target audience? What technology would be used? What kind of team do you need?&#10;&#10;Example: I want to build a platform that uses AI to analyze bioinformatics data and help researchers discover new drug compounds faster..."
                  onChange={(e) => setRawIdea(e.target.value)}
                  value={rawIdea}
                  disabled={loading}
                />
                <small className="field-hint">{rawIdea.length} chars (minimum 20)</small>
              </label>
              <label>
                Funding Goal (₹) <span className="field-hint-inline">Optional</span>
                <input
                  type="number"
                  name="fundingGoal"
                  placeholder="e.g. 500000"
                  onChange={(e) => setFundingGoal(e.target.value)}
                  value={fundingGoal}
                  disabled={loading}
                  min="0"
                />
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="action-row">
              <button className="primary-button" type="submit" disabled={loading || rawIdea.trim().length < 20}>
                {loading ? '🤖 AI is structuring your idea...' : '✨ Preview AI Structure'}
              </button>
            </div>
          </form>
        )}

        {step === 'preview' && (
          <div className="project-preview-wrapper">
            {preview ? (
              <>
                <div className="preview-header glass-panel">
                  <div className="preview-badge">🤖 AI-Generated Preview</div>
                  <h2 className="preview-title">{preview.title}</h2>
                  {preview.tagline && <p className="preview-tagline">"{preview.tagline}"</p>}
                </div>

                <div className="preview-grid">
                  <div className="glass-panel preview-section">
                    <h4>📋 Summary</h4>
                    <p>{preview.summary}</p>
                  </div>

                  <div className="glass-panel preview-section">
                    <h4>⚠️ Problem</h4>
                    <p>{preview.problem}</p>
                  </div>

                  <div className="glass-panel preview-section">
                    <h4>💡 Solution</h4>
                    <p>{preview.solution}</p>
                  </div>

                  {preview.targetAudience && (
                    <div className="glass-panel preview-section">
                      <h4>🎯 Target Audience</h4>
                      <p>{preview.targetAudience}</p>
                    </div>
                  )}

                  {preview.revenueModel && (
                    <div className="glass-panel preview-section">
                      <h4>💰 Revenue Model</h4>
                      <p>{preview.revenueModel}</p>
                    </div>
                  )}
                </div>

                <div className="preview-grid">
                  <div className="glass-panel preview-section">
                    <h4>🛠️ Required Skills</h4>
                    <PillList items={preview.requiredSkills || []} />
                  </div>

                  <div className="glass-panel preview-section">
                    <h4>👥 Roles Needed</h4>
                    <PillList items={preview.rolesNeeded || []} />
                  </div>
                </div>

                {preview.objectives && preview.objectives.length > 0 && (
                  <div className="glass-panel preview-section">
                    <h4>🎯 Key Objectives</h4>
                    <ul className="objectives-list">
                      {preview.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-panel preview-section">
                <p>AI preview unavailable. Your idea will still be structured when published.</p>
              </div>
            )}

            {error && <p className="form-error" style={{ marginTop: '1rem' }}>{error}</p>}

            <div className="action-row" style={{ marginTop: '2rem' }}>
              <button
                className="secondary-button"
                onClick={() => { setStep('input'); setError('') }}
                disabled={loading}
              >
                ← Edit Idea
              </button>
              <button
                className="primary-button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Publishing...' : '🚀 Publish Project'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default CreateProjectPage