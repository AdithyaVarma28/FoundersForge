import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PillList, SectionIntro } from '../components/UiBlocks'
import { isAuthenticated } from '../utils/authSession'
import { apiFetch } from '../utils/api'

const sampleQueries = [
  'AI project needing frontend developers',
  'Blockchain startup looking for investors',
  'Health platform seeking product designers',
]

function DiscoverPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const loggedIn = isAuthenticated()

  useEffect(() => {
    async function fetchResults() {
      setLoading(true)
      try {
        const endpoint = query.trim() 
          ? `/projects/search/semantic?q=${encodeURIComponent(query)}` 
          : '/projects'
        const data = await apiFetch(endpoint)
        setResults(data.projects || [])
      } catch (err) {
        console.error('Failed to fetch projects', err)
      } finally {
        setLoading(false)
      }
    }
    
    // Simple debounce
    const timeoutId = setTimeout(() => {
      fetchResults()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query])

  return (
    <div className="page">
      <section className="page-hero split-section">
        <div>
          <SectionIntro
            eyebrow="FR6"
            title="Semantic search that matches intent, not just exact wording"
            description="The SRS explicitly calls for RAG-based project discovery. This page shows how contributors and investors can search in natural language and still receive high-fit results."
          />

          <div className="glass-panel form-card">
            <label>
              Search for projects, roles, or investment themes
              <textarea
                onChange={(event) => setQuery(event.target.value)}
                rows="4"
                value={query}
              />
            </label>
            <div className="pill-row">
              {sampleQueries.map((sample) => (
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

        <aside className="glass-panel stacked-panel">
          <div className="panel-kicker">RAG search behavior</div>
          <ul className="stack-list">
            <li>Convert the user query into embeddings</li>
            <li>Retrieve similar project vectors from the database</li>
            <li>Rank results by semantic closeness and relevance</li>
            <li>Present project title, summary, required skills, and founder context</li>
          </ul>
        </aside>
      </section>

      <section className="content-section">
        <SectionIntro
          eyebrow="Search results"
          title={query ? "Projects ranked by similarity" : "Recent Projects"}
          description={query ? `Showing results for "${query}"` : "Showing all recent projects"}
        />
        {!loggedIn && (
          <div className="glass-panel gated-banner">
            <strong>Browse is open. Project actions require login.</strong>
            <p>
              You can view available projects, but applying, joining workspace, and funding actions are enabled only
              after sign in.
            </p>
            <Link className="primary-button" to="/auth">
              Sign in to unlock access
            </Link>
          </div>
        )}

        {loading && <p>Searching...</p>}

        <div className="feature-grid">
          {results.map((result) => (
            <article className="feature-card" key={result.id || result._id}>
              {result.similarity !== undefined && (
                <span className="status-pill">Similarity {result.similarity}</span>
              )}
              <h3>{result.title}</h3>
              <p>{result.summary}</p>
              {result.requiredSkills && (
                <PillList items={typeof result.requiredSkills === 'string' ? result.requiredSkills.split(',') : result.requiredSkills} />
              )}
              <Link to={`/project/${result.id || result._id}`}
                className="secondary-button full-width-button">View Project
              </Link>
            </article>
          ))}
          {!loading && results.length === 0 && <p>No projects found.</p>}
        </div>
      </section>
    </div>
  )
}

export default DiscoverPage
