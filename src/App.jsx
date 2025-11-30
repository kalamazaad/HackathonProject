import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import AuthPage from './AuthPage'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import JobSeekerDashboard from './pages/JobSeekerDashboard'
import EmployerDashboard from './pages/EmployerDashboard'
import CareerFairs from './pages/CareerFairs'
import CareerFairDetail from './pages/CareerFairDetail'
import BoothDetail from './pages/BoothDetail'
import AdminFairs from './pages/AdminFairs'
import AdminBooths from './pages/AdminBooths'
import AdminRegistrations from './pages/AdminRegistrations'
import MyResumes from './pages/MyResumes'
import MyCompanies from './pages/MyCompanies'
import MyBooths from './pages/MyBooths'
import ReceivedResumes from './pages/ReceivedResumes'
import MyRegistrations from './pages/MyRegistrations'
import Opportunities from './pages/Opportunities'
import JobDetail from './pages/JobDetail'

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/career-fairs"
        element={
          <ProtectedRoute>
            <Layout>
              <CareerFairs />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/career-fairs/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <CareerFairDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booths/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <BoothDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fairs"
        element={
          <ProtectedRoute requireAdmin={true}>
            <Layout>
              <AdminFairs />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/booths"
        element={
          <ProtectedRoute requireAdmin={true}>
            <Layout>
              <AdminBooths />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/registrations"
        element={
          <ProtectedRoute requireAdmin={true}>
            <Layout>
              <AdminRegistrations />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-resumes"
        element={
          <ProtectedRoute>
            <Layout>
              <MyResumes />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/companies"
        element={
          <ProtectedRoute>
            <Layout>
              <MyCompanies />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/booths"
        element={
          <ProtectedRoute>
            <Layout>
              <MyBooths />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/resumes"
        element={
          <ProtectedRoute>
            <Layout>
              <ReceivedResumes />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobseeker/registrations"
        element={
          <ProtectedRoute>
            <Layout>
              <MyRegistrations />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobseeker/opportunities"
        element={
          <ProtectedRoute>
            <Layout>
              <Opportunities />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <JobDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
