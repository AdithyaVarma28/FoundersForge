import { Link } from 'react-router-dom'
import { PillList, SectionIntro, StatGrid } from '../components/UiBlocks'

const founderStats = [
  {
    value: '3 drafts',
    label: 'Ideas in progress',
    detail: 'Two are waiting for AI structuring and one is ready to publish.',
  },
  {
    value: '11 matches',
    label: 'Contributor leads',
    detail: 'Profiles aligned to product, design, and frontend needs.',
  },
  {
    value: '₹9.2L',
    label: 'Tracked interest',
    detail: 'Combined investor signals across active projects.',
  },
]

const structurePreview = [
  'Project title and one-line thesis',
  'Problem description and target user segment',
  'Proposed solution and delivery roadmap',
  'Required roles, skills, and collaboration expectations',
  'Funding ask, milestone timing, and visibility status',
]

const activeProjects = [
  {
    title: 'ForgePilot',
    phase: 'Seeking contributors',
    summary: 'A founder operations assistant for sprint planning, notes, and investor updates.',
  },
  {
    title: 'CropLynk',
    phase: 'Investor review',
    summary: 'A farm supply coordination product with demand forecasting and multilingual messaging.',
  },
]

const collaborators = ['Frontend engineer', 'AI engineer', 'Growth strategist', 'UI designer', 'Data analyst']

function FounderDashboardPage() {
  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="FR4, FR8, FR10"
          title="Founder studio for turning rough concepts into fundable project stories"
          description="This dashboard centers the founder flow from the SRS: submit ideas, receive structured posts, recruit collaborators, and keep funding visibility close to the work."
        />
        <StatGrid stats={founderStats} />
        <div className="action-row">
          <Link className="primary-button" to="/project/create">
            Create New Project
          </Link>
        </div>
      </section>

      <section className="content-section split-section">
        <div className="glass-panel form-card">
          <div className="panel-kicker">Idea submission workspace</div>
          <div className="form-grid">
            <label>
              Project title
              <input placeholder="FoundersForge Companion" type="text" />
            </label>
            <label>
              Problem statement
              <textarea
                placeholder="Describe the founder pain point you want to solve and the audience you want to serve."
                rows="5"
              />
            </label>
            <label>
              Proposed solution
              <textarea
                placeholder="Outline the product concept, competitive angle, and initial roadmap."
                rows="5"
              />
            </label>
          </div>
          <div className="action-row">
            <button className="primary-button" type="button">
              Structure with AI
            </button>
            <button className="secondary-button" type="button">
              Save as draft
            </button>
          </div>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">LLM structuring output</div>
          <ul className="stack-list">
            {structurePreview.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <PillList items={collaborators} />
        </aside>
      </section>

      <section className="content-section split-section">
        <div>
          <SectionIntro
            eyebrow="Project pipeline"
            title="Projects currently moving through the platform"
            description="Designed to make project health, team formation, and investor visibility readable at a glance."
          />

          <div className="feature-grid">
            {activeProjects.map((project) => (
             <article className="feature-card" key={project.title}>
                <span className="status-pill">{project.phase}</span>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                 <Link  className="feature-link"  to={`/project/${project.title}`} >
                   Manage Project  </Link>
              </article>
            ))}
          </div>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">Funding watch</div>
          <div className="funding-meter">
            <span>ForgePilot</span>
            <strong>62% of target raised</strong>
          </div>
          <div className="meter-bar">
            <span style={{ width: '62%' }} />
          </div>
          <ul className="stack-list">
            <li>5 interested investors in review</li>
            <li>2 contributors accepted into the workspace</li>
            <li>Next milestone: clickable beta and onboarding tests</li>
          </ul>
          <Link className="feature-link" to="/workspace">
            Jump into the active workspace
          </Link>
        </aside>
      </section>
    </div>
  )
}

export default FounderDashboardPage
