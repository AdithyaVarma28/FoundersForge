import { useParams, Link } from 'react-router-dom'
import { SectionIntro } from '../components/UiBlocks'

const fundingData = {
  ForgePilot: {
    goal: '₹10L',
    raised: '₹6.2L',
    investors: 4,
    description:
      'This project focuses on founder productivity and investor communication tools.',
    milestones: [
      'MVP completed',
      'User onboarding live',
      'Investor pitch refined',
    ],
  },
}

function FundingDetailsPage() {
  const { id } = useParams()
  const project = fundingData[id]

  if (!project) {
    return <div className="page">No funding data available</div>
  }

  return (
    <div className="page">
      {/* HERO */}
      <section className="page-hero">
        <SectionIntro
          eyebrow="Funding details"
          title={`Funding for ${id}`}
          description={project.description}
        />
      </section>

      {/* FUNDING INFO */}
      <section className="content-section split-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">Funding status</div>

          <div className="funding-meter">
            <span>{project.raised}</span>
            <strong>of {project.goal}</strong>
          </div>

          <div className="meter-bar">
            <span style={{ width: '62%' }} />
          </div>

          <p>{project.investors} investors participating</p>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">Milestones</div>
          <ul className="stack-list">
            {project.milestones.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </aside>
      </section>

      {/* ACTION */}
      <section className="content-section">
        <div className="action-row">
          <Link
            to={`/invest/${id}`}
            className="primary-button"
          >
            Invest in Project
          </Link>
        </div>
      </section>
    </div>
  )
}

export default FundingDetailsPage