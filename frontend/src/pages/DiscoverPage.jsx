import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PillList, SectionIntro } from '../components/UiBlocks'
import { isAuthenticated } from '../utils/authSession'
import { apiFetch } from '../utils/api'

const SAMPLE_QUERIES = [
  'AI bioinformatics project',
  'Blockchain health records startup',
  'EdTech personalized learning platform',
  'IoT smart farming app',
  'Fintech cash flow tool for SMEs',
]

function SimilarityBadge({ score }) {
  const pct = Math.round(score * 100)
  const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#94a3b8'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        borderRadius: '999px',
        padding: '0.2rem 0.75rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.03em',
      }}
    >
      ⚡ {pct}% match
    </span>
  )
}

function ProjectCard({ result, isSearch }) {
  const id = result.id || result._id
  const skills = Array.isArray(result.requiredSkills)
    ? result.requiredSkills
    : typeof result.requiredSkills === 'string'
    ? result.requiredSkills.split(',').map((s) => s.trim())
    : []

  const roles = Array.isArray(result.rolesNeeded)
    ? result.rolesNeeded
    : typeof result.rolesNeeded === 'string'
    ? result.rolesNeeded.split(',').map((s) => s.trim())
    : []

  return (
    <article className="project-card glass-panel">
      <div className="project-card-header">
        {isSearch && result.similarity !== undefined && (
          <SimilarityBadge score={result.similarity} />
        )}
        <span className="project-status-badge">
          {result.status || 'published'}
        </span>
      </div>

      <h3 className="project-card-title">{result.title}</h3>

      {result.tagline && (
        <p className="project-card-tagline">"{result.tagline}"</p>
      )}

      {result.summary && (
        <p className="project-card-summary">
          {result.summary.slice(0, 180)}{result.summary.length > 180 ? '…' : ''}
        </p>
      )}

      {skills.length > 0 && (
        <div className="project-card-skills">
          <span className="card-section-label">Skills</span>
          <PillList items={skills.slice(0, 6)} />
        </div>
      )}

      {roles.length > 0 && (
        <div className="project-card-roles">
          <span className="card-section-label">Hiring</span>
          <div className="roles-row">
            {roles.slice(0, 3).map((role, i) => (
              <span key={i} className="role-tag">{role}</span>
            ))}
            {roles.length > 3 && (
              <span className="role-tag role-tag-more">+{roles.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {result.founder?.fullName && (
        <p className="project-card-founder">
          🧑‍💻 by <strong>{result.founder.fullName}</strong>
        </p>
      )}

      <div className="project-card-footer">
        {result.fundingGoal > 0 && (
          <span className="funding-pill">
            🎯 ₹{result.fundingGoal.toLocaleString()}
          </span>
        )}
        <Link to={`/project/${id}`} className="secondary-button view-btn">
          View Project →
        </Link>
      </div>
    </article>
  )
}

function DiscoverPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const loggedIn = isAuthenticated()

  const fetchProjects = useCallback(async (q) => {
    setLoading(true)
    try {
      const endpoint = q.trim()
        ? `/projects/search/semantic?q=${encodeURIComponent(q)}&limit=12`
        : '/projects?limit=12'
      const data = await apiFetch(endpoint)
      setResults(data.projects || [])
      setHasSearched(true)
    } catch (err) {
      console.error('Failed to fetch projects', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchProjects(query), 450)
    return () => clearTimeout(timer)
  }, [query, fetchProjects])

  const isSearch = Boolean(query.trim())

  return (
    <div className="page">
      <section className="page-hero split-section">
        <div>
          <SectionIntro
            eyebrow="Discover Projects"
            title="Find your next venture with semantic search"
            description="Search in natural language. Our AI matches your intent to the most relevant projects — not just keywords."
          />

          <div className="glass-panel form-card search-card">
            <label className="search-label">
              <span>Search projects, skills, or domains</span>
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <textarea
                  className="search-textarea"
                  onChange={(e) => setQuery(e.target.value)}
                  rows="3"
                  value={query}
                  placeholder="e.g. AI bioinformatics project, blockchain health platform, IoT farming app..."
                />
              </div>
            </label>

            <div className="pill-row sample-queries">
              <span className="try-label">Try:</span>
              {SAMPLE_QUERIES.map((sample) => (
                <button
                  className="pill-button"
                  key={sample}
                  onClick={() => setQuery(sample)}
                  type="button"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="glass-panel stacked-panel how-it-works">
          <div className="panel-kicker">How semantic search works</div>
          <ul className="stack-list">
            <li>
              <strong>1.</strong> Your query is converted to a 512-dim vector
            </li>
            <li>
              <strong>2.</strong> All projects in the DB are vectorized by title, skills & description
            </li>
            <li>
              <strong>3.</strong> Cosine similarity ranks projects by semantic closeness
            </li>
            <li>
              <strong>4.</strong> Results show match % and relevant skills
            </li>
          </ul>
        </aside>
      </section>

      <section className="content-section">
        <div className="results-header">
          <SectionIntro
            eyebrow={isSearch ? `Results for "${query}"` : 'All Projects'}
            title={isSearch ? 'Projects ranked by semantic similarity' : 'Browse recent projects'}
            description={
              loading
                ? 'Searching...'
                : hasSearched
                ? `Found ${results.length} project${results.length !== 1 ? 's' : ''}`
                : 'Loading projects...'
            }
          />
        </div>

        {!loggedIn && (
          <div className="glass-panel gated-banner">
            <strong>Browsing is open to all.</strong>
            <p>
              To apply, join a workspace, or fund a project — you need to be signed in.
            </p>
            <Link className="primary-button" to="/auth">
              Sign in to unlock access
            </Link>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Searching projects...</p>
          </div>
        )}

        {!loading && (
          <div className="project-grid">
            {results.map((result) => (
              <ProjectCard
                key={result.id || result._id}
                result={result}
                isSearch={isSearch}
              />
            ))}
            {hasSearched && results.length === 0 && (
              <div className="empty-state glass-panel">
                <span className="empty-icon">🔍</span>
                <h3>No projects found</h3>
                <p>Try a different search term or browse all projects by clearing the search.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default DiscoverPage
