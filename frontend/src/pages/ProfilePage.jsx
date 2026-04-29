import { useEffect, useState, useRef } from 'react'
import { SectionIntro, PillList } from '../components/UiBlocks'
import { getCurrentUser } from '../utils/authSession'
import { apiFetch, getAuthToken } from '../utils/api'

function ProfilePage() {
  const user = getCurrentUser()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      try {
        const data = await apiFetch('/profiles/me')
        setProfile(data.profile)
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [user])

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('resume', file)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/resumes/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')

      // Use the newly returned profile directly from the upload response
      if (data.profile) {
        setProfile(data.profile)
      } else {
        // Fallback in case backend structure changed unexpectedly
        const updatedProfileRes = await apiFetch('/profiles/me', { cache: 'no-store' })
        setProfile(updatedProfileRes.profile)
      }

      alert('Resume parsed and profile updated successfully!')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (!user) return <div className="page">Please login to view profile</div>
  if (loading) return <div className="page"><p>Loading profile...</p></div>

  const extractedSkills = profile?.contributor?.extractedSkills || []
  const technologies = profile?.contributor?.technologies || []
  const skills = [...new Set([...extractedSkills, ...technologies])]

  const experience = profile?.contributor?.experience || []
  const education = profile?.contributor?.education || []
  const certifications = profile?.contributor?.certifications || []
  const links = profile?.links || []

  return (
    <div className="page">
      {/* HERO */}
      <section className="page-hero">
        <SectionIntro
          eyebrow="Your profile"
          title={user.fullName || user.name}
          description={`Role: ${user.role}`}
        />
      </section>

      {error && <p className="form-error" style={{marginBottom: '1rem'}}>{error}</p>}

      {/* PROFILE DETAILS */}
      <section className="content-section split-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">Basic information</div>
          <ul className="stack-list">
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>Role:</strong> {user.role}</li>
            {profile?.location && <li><strong>Location:</strong> {profile.location}</li>}
            <li><strong>Bio:</strong> {profile?.bio || 'No bio provided.'}</li>
            {links.length > 0 && (
              <li>
                <strong>Links:</strong>{' '}
                {links.map((link, idx) => (
                  <span key={idx}>
                    <a href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
                    {idx < links.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </li>
            )}
          </ul>
        </div>

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">Skills</div>
          <PillList items={skills.length > 0 ? skills : ['No skills added yet']} />
        </aside>
      </section>

      {/* RESUME SECTION */}
      <section className="content-section">
        <div className="glass-panel upload-card">
          <div className="panel-kicker">Resume (AI Parsing)</div>
          <div className="upload-dropzone">
            <strong>Upload your resume</strong>
            <p>PDF or DOCX — used for AI skill extraction</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
            <button 
              className="primary-button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Parsing...' : 'Upload Resume'}
            </button>
          </div>
        </div>
      </section>

      {/* EXPERIENCE & EDUCATION */}
      <section className="content-section split-section">
        <div className="glass-panel stacked-panel">
          <div className="panel-kicker">Experience</div>
          <ul className="stack-list">
            {experience.map((exp, idx) => (
              <li key={idx}>
                <strong>{exp.title}</strong> {exp.company && `at ${exp.company}`} <br/>
                {exp.duration && <small className="muted-copy">{exp.duration}</small>}
                {exp.summary && <p style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>{exp.summary}</p>}
              </li>
            ))}
            {experience.length === 0 && <li>No experience extracted yet. Upload a resume!</li>}
          </ul>
        </div>

        <aside className="glass-panel stacked-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div className="panel-kicker">Education</div>
            <ul className="stack-list">
              {education.map((edu, idx) => (
                <li key={idx} style={{ padding: '0.5rem 0' }}>
                  <strong>{edu.institution}</strong> <br/>
                  {edu.degree} <br/>
                  <small className="muted-copy">{edu.year}</small>
                </li>
              ))}
              {education.length === 0 && <li>No education data.</li>}
            </ul>
          </div>

          <div>
            <div className="panel-kicker">Certifications</div>
            <ul className="stack-list">
              {certifications.map((cert, idx) => (
                <li key={idx} style={{ padding: '0.5rem 0' }}>
                  <strong>{cert.name}</strong> <br/>
                  {cert.issuer} <br/>
                  <small className="muted-copy">{cert.year}</small>
                </li>
              ))}
              {certifications.length === 0 && <li>No certifications found.</li>}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default ProfilePage