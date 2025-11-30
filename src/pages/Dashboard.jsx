import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminDashboard from './AdminDashboard'
import JobSeekerDashboard from './JobSeekerDashboard'
import EmployerDashboard from './EmployerDashboard'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()

  // Route to appropriate dashboard based on user type
  useEffect(() => {
    console.log('User type:', user?.userType, 'isAdmin:', isAdmin)
  }, [user, isAdmin])

  if (!user) {
    return <Navigate to="/" replace />
  }

  // Admin dashboard
  if (isAdmin) {
    return <AdminDashboard />
  }

  // Job Seeker dashboard
  if (user.userType === 'jobseeker') {
    return <JobSeekerDashboard />
  }

  // Employer dashboard
  if (user.userType === 'employer') {
    return <EmployerDashboard />
  }

  // Default fallback
  return <JobSeekerDashboard />
}
