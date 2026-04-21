import { SectionIntro } from '../components/UiBlocks'
import { useParams } from 'react-router-dom'
const milestones = [
  'Finalize structured project brief and contributor onboarding',
  'Ship clickable MVP for internal testing',
  'Prepare investor update with usage and milestone evidence',
]

const members = [
  'Founder: Product direction and investor communication',
  'Frontend contributor: Interface implementation and UX refinement',
  'AI contributor: Prompt flows, embeddings, and search quality',
  'Investor observer: Progress review and milestone check-ins',
]

const messages = [
  'Founder: We should tighten the onboarding narrative before the next investor review.',
  'Frontend contributor: I can polish the dashboard flow and align the design language this sprint.',
  'AI contributor: Resume parsing confidence is good, but project ranking still needs better weighting.',
  'Investor: Share the updated milestone chart when the new build is ready.',
]

function WorkspacePage() {
  const { id } = useParams()

  return (
    <div className="page">
      <section className="page-hero split-section">
        <div>
          <SectionIntro
            eyebrow="FR7 and FR10"
            title={`Workspace for ${id}`}
            description="The SRS calls for dedicated project chat rooms, message history, and an investment-aware workspace. This page ties those parts together so the collaboration loop feels real."
          />
          <div className="info-strip">
            <strong>Project:</strong> {id}
          </div>

          <div className="glass-panel stacked-panel">
            <div className="panel-kicker">Current milestone lane</div>
            <ul className="stack-list">
              {milestones.map((milestone) => (
                <li key={milestone}>{milestone}</li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">Funding pulse</div>
          <div className="funding-meter">
            <span>Current round</span>
            <strong>₹6.2L of ₹10L committed</strong>
          </div>
          <div className="meter-bar">
            <span style={{ width: '62%' }} />
          </div>
          <p className="muted-copy">
            Investors can monitor progress while founders keep everyone aligned on outcomes,
            blockers, and delivery targets.
          </p>
        </aside>
      </section>

      <section className="content-section split-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">Project room</div>
          <div className="chat-log">
            {messages.map((message) => (
              <div className="chat-bubble" key={message}>
                {message}
              </div>
            ))}
          </div>
          <label>
            Send an update
            <input placeholder="Share a milestone, question, or project note" type="text" />
          </label>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">Participants</div>
          <ul className="stack-list">
            {members.map((member) => (
              <li key={member}>{member}</li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  )
}

export default WorkspacePage
