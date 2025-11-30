import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, FileText, CheckCircle, Search, ArrowRight } from 'lucide-react'

export default function JobSeekerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    fairs: 0,
    registrations: 0,
    resumes: 0,
    opportunities: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [fairsRes, registrationsRes, resumesRes] = await Promise.all([
        fetch('/api/career-fairs'),
        fetch(`/api/registrations/user/${user.id}`),
        fetch(`/api/resumes/user/${user.id}`)
      ])
      const fairs = await fairsRes.json()
      const registrations = await registrationsRes.json()
      const resumes = await resumesRes.json()
      setStats({
        fairs: fairs.length,
        registrations: registrations.length,
        resumes: resumes.length,
        opportunities: fairs.filter(f => f.status === 'ongoing' || f.status === 'upcoming').length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'Job Seeker'}!
        </h1>
        <p className="text-gray-600">Explore career opportunities and connect with employers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/career-fairs"
          className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg shadow-md border border-teal-100 p-6 hover:shadow-lg hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-teal-700 text-sm font-medium">Available Fairs</p>
            <ArrowRight className="w-5 h-5 text-teal-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-teal-900">{stats.fairs}</p>
            <Calendar className="w-12 h-12 text-teal-500 group-hover:text-teal-600 transition-colors" />
          </div>
        </Link>

        <Link
          to="/jobseeker/registrations"
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md border border-green-100 p-6 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-700 text-sm font-medium">My Registrations</p>
            <ArrowRight className="w-5 h-5 text-green-400 group-hover:text-green-600 transition-colors" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-green-900">{stats.registrations}</p>
            <CheckCircle className="w-12 h-12 text-green-500 group-hover:text-green-600 transition-colors" />
          </div>
        </Link>

        <Link
          to="/my-resumes"
          className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg shadow-md border border-violet-100 p-6 hover:shadow-lg hover:border-violet-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-violet-700 text-sm font-medium">Resumes Submitted</p>
            <ArrowRight className="w-5 h-5 text-violet-400 group-hover:text-violet-600 transition-colors" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-violet-900">{stats.resumes}</p>
            <FileText className="w-12 h-12 text-violet-500 group-hover:text-violet-600 transition-colors" />
          </div>
        </Link>

        <Link
          to="/jobseeker/opportunities"
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-md border border-amber-100 p-6 hover:shadow-lg hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-amber-700 text-sm font-medium">Opportunities</p>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-amber-900">{stats.opportunities}</p>
            <Search className="w-12 h-12 text-amber-500 group-hover:text-amber-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/career-fairs"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-teal-400 hover:bg-teal-50/50 transition-all cursor-pointer"
          >
            <Calendar className="w-8 h-8 text-teal-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Browse Career Fairs</h3>
            <p className="text-sm text-gray-600">Explore upcoming events</p>
          </Link>

          <Link
            to="/my-resumes"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-violet-400 hover:bg-violet-50/50 transition-all cursor-pointer"
          >
            <FileText className="w-8 h-8 text-violet-600 mb-2" />
            <h3 className="font-semibold text-gray-900">My Resumes</h3>
            <p className="text-sm text-gray-600">View submitted resumes</p>
          </Link>

          <Link
            to="/jobseeker/opportunities"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-amber-400 hover:bg-amber-50/50 transition-all cursor-pointer"
          >
            <Search className="w-8 h-8 text-amber-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Find Opportunities</h3>
            <p className="text-sm text-gray-600">Discover new job openings</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

