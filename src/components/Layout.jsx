import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, LayoutDashboard, Calendar, Building2, FileText, MessageSquare, Users, Briefcase, CheckCircle, Search } from 'lucide-react'

export function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Virtual Career Connect
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name || user?.email || 'User'}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-teal-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64">
            <nav className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/career-fairs"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/career-fairs') 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Career Fairs</span>
              </Link>

              {isAdmin && (
                <>
                  <Link
                    to="/admin/fairs"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/admin/fairs') 
                        ? 'bg-teal-50 text-teal-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Manage Fairs</span>
                  </Link>
                  <Link
                    to="/admin/booths"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/admin/booths') 
                        ? 'bg-teal-50 text-teal-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>Manage Booths</span>
                  </Link>
                  <Link
                    to="/admin/registrations"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/admin/registrations') 
                        ? 'bg-teal-50 text-teal-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>Registrations</span>
                  </Link>
                </>
              )}

              {user?.userType === 'jobseeker' && (
                <>
                  <Link
                    to="/my-resumes"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/my-resumes') 
                        ? 'bg-teal-50 text-teal-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span>My Resumes</span>
                  </Link>
                  <Link
                    to="/jobseeker/registrations"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/jobseeker/registrations') 
                        ? 'bg-teal-50 text-teal-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>My Registrations</span>
                  </Link>
                  <Link
                    to="/jobseeker/opportunities"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/jobseeker/opportunities') 
                        ? 'bg-teal-50 text-teal-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Search className="w-5 h-5" />
                    <span>Opportunities</span>
                  </Link>
                </>
              )}

              {user?.userType === 'employer' && (
                <>
                  <Link
                    to="/employer/companies"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/employer/companies') 
                        ? 'bg-teal-50 text-teal-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>My Companies</span>
                  </Link>
                  <Link
                    to="/employer/booths"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/employer/booths') 
                        ? 'bg-teal-50 text-teal-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Briefcase className="w-5 h-5" />
                    <span>My Booths</span>
                  </Link>
                  <Link
                    to="/employer/resumes"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/employer/resumes') 
                        ? 'bg-teal-50 text-teal-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span>Received Resumes</span>
                  </Link>
                </>
              )}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

