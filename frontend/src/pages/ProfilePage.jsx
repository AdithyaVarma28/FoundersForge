import { SectionIntro, PillList } from '../components/UiBlocks'
import { getCurrentUser } from '../utils/authSession'

const sampleSkills = ['React', 'Node.js', 'MongoDB', 'UI/UX', 'Prompt Engineering']

function ProfilePage() {
  const user = getCurrentUser()

  if (!user) {
    return <div className="page">Please login to view profile</div>
  }

  return (
    <div className="page">
      {/* HERO */}
      <section className="page-hero">
        <SectionIntro
          eyebrow="Your profile"
          title={user.name}
          description={`Role: ${user.role}`}
        />
      </section>

      {/* PROFILE DETAILS */}
      <section className="content-section split-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">Basic information</div>
          <ul className="stack-list">
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>Role:</strong> {user.role}</li>
            <li><strong>Availability:</strong> 15–20 hrs/week</li>
          </ul>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">Skills</div>
          <PillList items={sampleSkills} />
        </aside>
      </section>

      {/* RESUME SECTION */}
      <section className="content-section">
        <div className="glass-panel upload-card">
          <div className="panel-kicker">Resume</div>
          <div className="upload-dropzone">
            <strong>Upload your resume</strong>
            <p>PDF or DOCX — used for AI skill extraction</p>
            <button className="primary-button">Upload Resume</button>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="content-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">Experience</div>
          <ul className="stack-list">
            <li>Frontend Developer Intern – Built React dashboards</li>
            <li>Worked on AI-based projects using Python</li>
            <li>Experience with REST APIs and UI systems</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

export default ProfilePage