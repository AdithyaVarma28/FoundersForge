import { useParams, Link } from 'react-router-dom'
import { SectionIntro, PillList } from '../components/UiBlocks'
import { getCurrentUser } from '../utils/authSession'
// Temporary mock data (later will come from backend)
const projects = {
  ForgePilot: {
    title: 'ForgePilot',
    founder: 'Adithya Varma',
    description:
      'A founder operations assistant that helps manage sprint planning, notes, and investor updates.',
    roles: ['Frontend Engineer', 'AI Engineer', 'UI Designer'],
    skills: ['React', 'Node.js', 'LLMs', 'Figma'],
    funding: {
      raised: '₹6.2L',
      goal: '₹10L',
    },
    team: ['Founder', 'Frontend Dev', 'AI Dev'],
    milestones: [
      'MVP ready',
      'User onboarding flow',
      'Investor pitch update',
    ],
  },
}
const user = getCurrentUser()
function ProjectDetailsPage() {
  const { id } = useParams()
  const project = projects[id]

  if (!project) {
    return <div className="page">Project not found</div>
  }

  return (
    <div className="page">
      {/* HERO */}
      <section className="page-hero">
        <SectionIntro
          eyebrow="Project overview"
          title={project.title}
          description={project.description}
        />
        <div className="info-strip">
          <strong>Founder:</strong> {project.founder}
        </div>
      </section>

      {/* ROLES + SKILLS */}
      <section className="content-section split-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">Roles needed</div>
          <ul className="stack-list">
            {project.roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
          </ul>

          <div className="panel-kicker">Skills required</div>
          <PillList items={project.skills} />
        </div>

        <aside className="glass-panel stacked-panel">
      
            <div className="panel-kicker">Project status</div>
            <ul className="stack-list">
              <li>Stage: MVP</li>
              <li>Team size: 3 members</li>
              <li>Actively onboarding contributors</li>
            </ul>
       </aside>
      </section>

      {/* TEAM + MILESTONES */}
      <section className="content-section split-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">Current team</div>
          <ul className="stack-list">
            {project.team.map((member) => (
              <li key={member}>{member}</li>
            ))}
          </ul>
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

      {/* ACTIONS */}
      <section className="content-section">
      <div className="action-row">

          {user?.role === 'Contributor' && (
            <button className="primary-button">Apply to project</button>
          )}

          {user?.role === 'Founder' && (
            <Link
              to={`/project/${project.title}/applications`}
              className="primary-button"
            >
              View Applications
            </Link>
          )}

          {user?.role === 'Investor' && (
            <Link
              to={`/project/${project.title}/funding`}
              className="primary-button"
            >
              View Funding
            </Link>
          )}

          <Link
            className="secondary-button"
            to={`/workspace/${project.title}`}
          >
            Open workspace
          </Link>

        </div>
      </section>
    </div>
  )
}

export default ProjectDetailsPage