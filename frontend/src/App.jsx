import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import AuthPage from './pages/AuthPage'
import ContributorDashboardPage from './pages/ContributorDashboardPage'
import DashboardRedirectPage from './pages/DashboardRedirectPage'
import DiscoverPage from './pages/DiscoverPage'
import FounderDashboardPage from './pages/FounderDashboardPage'
import HomePage from './pages/HomePage'
import InvestorDashboardPage from './pages/InvestorDashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import WorkspacePage from './pages/WorkspacePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardRedirectPage />} />
          <Route
            path="/founder"
            element={
              <ProtectedRoute allowedRole="Founder">
                <FounderDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contributor"
            element={
              <ProtectedRoute allowedRole="Contributor">
                <ContributorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor"
            element={
              <ProtectedRoute allowedRole="Investor">
                <InvestorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <WorkspacePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
