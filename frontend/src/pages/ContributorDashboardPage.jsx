import { SectionIntro, StatGrid } from '../components/UiBlocks'
import { Link } from 'react-router-dom'

const contributorStats = [
  {
    value: '86%',
    label: 'Profile completeness',
    detail: 'Most skills were extracted from the uploaded resume and verified.',
  },
  {
    value: '7',
    label: 'Matched opportunities',
    detail: 'Recommended through semantic similarity and role fit.',
  },
  {
    value: '3',
    label: 'Active applications',
    detail: 'Two awaiting review and one already shortlisted.',
  },
]

const extractedSkills = ['React', 'Node.js', 'MongoDB', 'Prompt engineering', 'REST APIs', 'Figma']

const matchedProjects = [
  {
    title: 'ForgePilot',
    fit: 'Frontend systems and product storytelling',
    score: '0.92 match',
  },
  {
    title: 'HealthCanvas',
    fit: 'Design systems, patient dashboards, and data visualization',
    score: '0.88 match',
  },
  {
    title: 'CropLynk',
    fit: 'Responsive web interface for marketplace workflows',
    score: '0.84 match',
  },
]

function ContributorDashboardPage() {
  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="FR5, FR6, FR8"
          title="Contributor hub focused on resume intelligence and project fit"
          description="The SRS calls for resume parsing, structured skill profiles, semantic discovery, and project applications. This page gives contributors a clear path through each one."
        />
        <StatGrid stats={contributorStats} />
        <div className="action-row">
          <Link className="primary-button" to="/applications">
            View your applications
          </Link>
        </div>
      </section>

      <section className="content-section split-section">
        <div className="glass-panel upload-card">
          <div className="panel-kicker">Resume upload</div>
          <div className="upload-dropzone">
            <strong>Drop PDF or DOCX here</strong>
            <p>Parse work experience, skills, education, and technologies into a structured profile.</p>
            <button className="primary-button" type="button">
              Upload resume
            </button>
          </div>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">AI-extracted profile</div>
          <p className="muted-copy">
            Experience in product-focused frontend work, API integration, and collaborative delivery.
          </p>
          <div className="pill-row">
            {extractedSkills.map((skill) => (
              <span className="pill" key={skill}>
                {skill}
              </span>
            ))}
          </div>
          <ul className="stack-list">
            <li>Education: B.Tech in Artificial Intelligence Engineering</li>
            <li>Preferred roles: Frontend engineer, product designer, AI integrator</li>
            <li>Availability: 18 hours per week for early-stage teams</li>
          </ul>
          <Link className="feature-link" to="/profile">
            View your full profile →
          </Link>
        </aside>
      </section>

      <section className="content-section">
        <SectionIntro
          eyebrow="Matched opportunities"
          title="Projects discovered through semantic understanding"
          description="Instead of searching exact words, the interface highlights why each project feels relevant to the contributor profile."
        />

        <div className="feature-grid feature-grid-three">
          {matchedProjects.map((project) => (
            <article className="feature-card" key={project.title}>
              <span className="status-pill">{project.score}</span>
              <h3>{project.title}</h3>
              <p>{project.fit}</p>
              <Link
                to={`/project/${project.title}`}
                className="secondary-button full-width-button">
                 View & Apply
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ContributorDashboardPage
