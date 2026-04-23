import { useParams,Link } from 'react-router-dom'
import { useState } from 'react'
import { SectionIntro } from '../components/UiBlocks'

function InvestmentPage() {
  const { projectId } = useParams()

  const [amount, setAmount] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  function handleInvest(e) {
    e.preventDefault()
    setConfirmed(true)
  }

  return (
    <div className="page">
      {/* HERO */}
      <section className="page-hero">
        <SectionIntro
          eyebrow="Invest"
          title={`Invest in ${projectId}`}
          description="Support this project and become part of its growth journey."
        />
      </section>

      {/* FORM */}
      <section className="content-section">
        <form className="glass-panel form-card" onSubmit={handleInvest}>
          
          <label>
            Investment Amount (₹)
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </label>

          <div className="action-row">
            <button className="primary-button" type="submit">
              Confirm Investment
            </button>
          </div>

          {confirmed && (
            <div className="info-strip">
              ✅ Investment of ₹{amount} submitted successfully!
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/portfolio" className="secondary-button">
                    Go to Portfolio
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