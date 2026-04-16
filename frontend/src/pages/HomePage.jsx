import { Link } from 'react-router-dom'
import { PillList, SectionIntro, StatGrid } from '../components/UiBlocks'
import { getCurrentUser } from '../utils/authSession'
import { getDashboardRoute } from '../utils/roleRouting'

const heroStats = [
  {
    value: '1 workspace',
    label: 'For ideas, people, and funding',
    detail: 'Keep discovery, collaboration, and investor visibility in one focused flow.',
  },
  {
    value: 'Faster clarity',
    label: 'From rough idea to clear brief',
    detail: 'Turn notes and half-formed thinking into something people can respond to.',
  },
  {
    value: '3-sided network',
    label: 'Founders, builders, backers',
    detail: 'Built around momentum, team formation, and investor trust.',
  },
]

const rolePaths = [
  {
    title: 'For founders',
    role: 'Founder',
    description:
      'Turn a rough idea into a credible project page and attract the people you actually need.',
    highlights: ['Sharpen the pitch', 'Fill key roles', 'Share progress cleanly'],
    link: '/founder',
  },
  {
    title: 'For contributors',
    role: 'Contributor',
    description:
      'Find ambitious early-stage work with clearer context and less noise than generic job boards.',
    highlights: ['Smarter matching', 'Visible momentum', 'Serious project discovery'],
    link: '/contributor',
  },
  {
    title: 'For investors',
    role: 'Investor',
    description:
      'See which teams are moving and where execution looks credible before you commit capital.',
    highlights: ['Structured updates', 'Team visibility', 'Cleaner deal flow'],
    link: '/investor',
  },
]

const startupReality = [
  {
    title: 'The early stage is messy by default',
    text: 'Most teams start with voice notes, scattered docs, and incomplete thoughts. FoundersForge helps turn that chaos into something collaborators can trust.',
  },
  {
    title: 'Good builders want context',
    text: 'People join when the problem is clear, the ask is specific, and the founder sounds like they will ship.',
  },
  {
    title: 'Investors look for motion',
    text: 'A believable startup story comes from visible progress, working relationships, and a tighter narrative.',
  },
]

const launchBoard = [
  {
    title: 'Health-tech founder',
    meta: 'Bengaluru • pre-seed',
    text: 'Looking for a product designer and frontend engineer to turn a pilot dashboard into a calmer care experience.',
  },
  {
    title: 'Climate analytics team',
    meta: 'Remote • hiring now',
    text: 'Needs a full-stack contributor and a sharper investor update loop before the next outreach round.',
  },
  {
    title: 'Creator tools startup',
    meta: 'Chennai • live sprint',
    text: 'Already shipping with two builders and searching for a growth-focused operator for the next push.',
  },
]

const operatingPoints = [
  'Post one project page that works for collaborators and investors.',
  'Surface real role needs instead of vague startup hype.',
  'Keep chat, progress, and funding context close together.',
  'Help promising teams look more credible, more quickly.',
]

const trustSignals = [
  'Health-tech',
  'Climate',
  'Fintech',
  'Developer tools',
  'Creator software',
  'Campus startups',
]

const requirementTags = [
  'Find serious collaborators',
  'Clarify early-stage ideas',
  'Show visible momentum',
  'Recruit faster',
  'Share investor-ready updates',
]

function HomePage() {
  const currentUser = getCurrentUser()

  return (
    <div className="page">
      <section className="page-hero hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">FoundersForge</span>
          <h1>Build with people who want to ship, not just spectate.</h1>
          <p className="hero-text">
            FoundersForge is for the in-between stage of a startup: when the idea is
            real, the team is incomplete, and every week matters. Create a clearer
            project story, attract the right contributors, and give investors a better
            view of momentum.
          </p>
          <div className="action-row">
            <Link className="primary-button home-primary-cta" to={currentUser ? '/dashboard' : '/auth'}>
              {currentUser ? 'Open your dashboard' : 'Start your project'}
            </Link>
            <Link className="secondary-button" to="/discover">
              Explore opportunities
            </Link>
          </div>
          <PillList items={requirementTags} />
        </div>

        <aside className="hero-panel glass-panel home-hero-panel">
          <div className="panel-kicker">Live startup board</div>
          <div className="mini-board">
            {launchBoard.map((item) => (
              <article className="mini-board-card" key={item.title}>
                <div className="mini-board-head">
                  <strong>{item.title}</strong>
                  <span>{item.meta.replace(/\u00e2\u20ac\u00a2/g, '|')}</span>
                </div>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <StatGrid stats={heroStats} />

      <section className="content-section">
        <SectionIntro
          eyebrow="Who it is for"
          title="A cleaner product story for each side of the network"
          description="The homepage now leads with the people who use the platform and what they actually want from it."
        />

        <div className="feature-grid feature-grid-three">
          {rolePaths.map((role) => (
            <article className="feature-card" key={role.title}>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
              <ul className="compact-list">
                {role.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <Link className="feature-link" to={role.link}>
                {currentUser?.role === role.role ? 'Open your dashboard' : 'Role-restricted dashboard'}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section split-section">
        <div>
          <SectionIntro
            eyebrow="Why teams care"
            title="Built for the awkward middle stage every startup hits"
            description="Too early for a polished careers page. Too serious for a casual Discord post. Too dynamic for a static pitch deck."
          />

          <div className="feature-grid">
            {startupReality.map((feature) => (
              <article className="timeline-card" key={feature.title}>
                <span className="timeline-index">{feature.title}</span>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="glass-panel architecture-panel">
          <div className="panel-kicker">What teams need day to day</div>
          <ul className="stack-list">
            {operatingPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="content-section">
        <div className="glass-panel trust-band">
          <span className="panel-kicker">Where teams are building</span>
          <PillList items={trustSignals} />
        </div>
      </section>

      <section className="content-section cta-section">
        <SectionIntro
          eyebrow="Get moving"
          title="Start with the part of the journey you care about"
          description="Founders can shape a stronger pitch, contributors can browse better-fit work, and investors can look for teams that are visibly moving."
          align="center"
        />

        <div className="action-row action-row-center">
          <Link className="primary-button" to={currentUser ? getDashboardRoute(currentUser.role) : '/auth'}>
            {currentUser ? 'Open your dashboard' : 'Sign in to continue'}
          </Link>
          <Link className="secondary-button" to="/discover">
            Browse public projects
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
