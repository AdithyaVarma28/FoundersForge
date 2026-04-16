import { SectionIntro, StatGrid } from '../components/UiBlocks'

const investorStats = [
  {
    value: '₹14.8L',
    label: 'Capital committed',
    detail: 'Across health-tech, creator tooling, and agri-marketplace bets.',
  },
  {
    value: '6',
    label: 'Projects monitored',
    detail: 'Each one includes structured progress, traction, and team activity.',
  },
  {
    value: '3',
    label: 'Watchlist candidates',
    detail: 'High-fit opportunities discovered through semantic search.',
  },
]

const opportunities = [
  {
    title: 'ForgePilot',
    stage: 'Pre-seed',
    summary: 'Strong founder clarity, visible contributor momentum, and a realistic milestone plan.',
  },
  {
    title: 'CropLynk',
    stage: 'Seed readiness',
    summary: 'Operational need is clear and investor updates show measurable progress signals.',
  },
]

const portfolio = [
  'Total investments made',
  'List of funded projects',
  'Investment history with transaction dates',
  'Progress snapshots shared by founders',
]

function InvestorDashboardPage() {
  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="FR6, FR9, FR10"
          title="Investor desk for discovery, diligence, and transparent portfolio tracking"
          description="This experience reflects the investor requirements from the SRS: explore promising projects, review structured details, fund them, and monitor outcomes without losing context."
        />
        <StatGrid stats={investorStats} />
      </section>

      <section className="content-section split-section">
        <div>
          <SectionIntro
            eyebrow="Recommended projects"
            title="Structured opportunities surfaced through the discovery engine"
            description="Each opportunity combines semantic relevance with founder updates and team readiness signals."
          />

          <div className="feature-grid">
            {opportunities.map((opportunity) => (
              <article className="feature-card" key={opportunity.title}>
                <span className="status-pill">{opportunity.stage}</span>
                <h3>{opportunity.title}</h3>
                <p>{opportunity.summary}</p>
                <button className="primary-button full-width-button" type="button">
                  Review funding details
                </button>
              </article>
            ))}
          </div>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">Investor dashboard contents</div>
          <ul className="stack-list">
            {portfolio.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="info-strip">
            <strong>Latest activity</strong>
            <p>
              ForgePilot posted a milestone update, contributor applications increased by
              18%, and the founder opened the next funding tranche.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default InvestorDashboardPage
