import { startTransition, useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PillList, SectionIntro } from '../components/UiBlocks'
import { isAuthenticated } from '../utils/authSession'

const sampleQueries = [
  'AI project needing frontend developers',
  'Blockchain startup looking for investors',
  'Health platform seeking product designers',
]

const resultPool = [
  {
    title: 'ForgePilot',
    summary: 'Founder operations workspace looking for a React-heavy builder and an AI systems generalist.',
    tags: ['frontend', 'AI', 'collaboration'],
    score: '0.92',
  },
  {
    title: 'BlockShelf',
    summary: 'A compliance-friendly blockchain product preparing investor materials and MVP refinement.',
    tags: ['blockchain', 'investor', 'fintech'],
    score: '0.89',
  },
  {
    title: 'HealthCanvas',
    summary: 'Remote care interface seeking designers and frontend contributors with dashboard experience.',
    tags: ['health', 'design', 'frontend'],
    score: '0.86',
  },
]

function DiscoverPage() {
  const [query, setQuery] = useState(sampleQueries[0])
  const deferredQuery = useDeferredValue(query)
  const loggedIn = isAuthenticated()

  const filteredResults = useMemo(() => {
    const normalizedQuery = deferredQuery.toLowerCase()

    return resultPool.filter((result) => {
      const haystack = `${result.title} ${result.summary} ${result.tags.join(' ')}`.toLowerCase()
      return haystack.includes(normalizedQuery.split(' ')[0]) || normalizedQuery.length < 5
    })
  }, [deferredQuery])

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
                  onClick={() =>
                    startTransition(() => {
                      setQuery(sample)
                    })
                  }
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
          title="Projects ranked by similarity"
          description={`Showing results for "${deferredQuery}"`}
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

        <div className="feature-grid">
          {filteredResults.map((result) => (
            <article className="feature-card" key={result.title}>
              <span className="status-pill">Similarity {result.score}</span>
              <h3>{result.title}</h3>
              <p>{result.summary}</p>
              <PillList items={result.tags} />
              <button className="secondary-button full-width-button" disabled={!loggedIn} type="button">
                {loggedIn ? 'Open project workspace' : 'Login required'}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DiscoverPage
