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
import ProjectDetailsPage from './pages/ProjectDetailsPage'
import ProfilePage from './pages/ProfilePage'
import ApplicationsPage from './pages/ApplicationsPage'
import CreateProjectPage from './pages/CreateProjectPage'
import ProjectApplicationsPage from './pages/ProjectApplicationsPage'
import FundingDetailsPage from './pages/FundingDetailsPage'
import InvestmentPage from './pages/InvestmentPage'
import PortfolioPage from './pages/PortfolioPage'
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
            path="/workspace/:id"
            element={
              <ProtectedRoute>
                <WorkspacePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
      
        <Route path="/project/:id" element={<ProjectDetailsPage />} />
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRole="Contributor">
              <ApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/create"
          element={
            <ProtectedRoute allowedRole="Founder">
              <CreateProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:id/applications"
          element={
            <ProtectedRoute allowedRole="Founder">
              <ProjectApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
            path="/project/:id/funding"
            element={
              <ProtectedRoute allowedRole="Investor">
                <FundingDetailsPage />
              </ProtectedRoute>
            }
          />
        <Route
          path="/invest/:projectId"
          element={
            <ProtectedRoute allowedRole="Investor">
              <InvestmentPage />
            </ProtectedRoute>
          }
        />
        <Route
            path="/portfolio"
            element={
              <ProtectedRoute allowedRole="Investor">
                <PortfolioPage />
              </ProtectedRoute>
            }
          />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}/>
      </Route>    
      </Routes>
    </BrowserRouter>
  )
}

export default App
