import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="page not-found-page">
      <div className="glass-panel stacked-panel">
        <span className="eyebrow">404</span>
        <h1>This route is not part of the current frontend scope.</h1>
        <p>Return to the FoundersForge overview or continue exploring one of the SRS-based pages.</p>
        <div className="action-row">
          <Link className="primary-button" to="/">
            Back to platform
          </Link>
          <Link className="secondary-button" to="/discover">
            Open semantic search
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
