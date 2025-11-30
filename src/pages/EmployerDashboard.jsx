import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Building2, FileText, Users, Briefcase, ArrowRight } from 'lucide-react'

export default function EmployerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    companies: 0,
    booths: 0,
    resumes: 0,
    fairs: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [companiesRes, fairsRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/career-fairs')
      ])
      const allCompanies = await companiesRes.json()
      const fairs = await fairsRes.json()
      
      // Filter companies for this user
      const userCompanies = allCompanies.filter(c => c.userId === user.id)
      
      // Get booths for user's companies
      let totalBooths = 0
      let totalResumes = 0
      
      for (const company of userCompanies) {
        try {
          // Get all booths and filter by company
          for (const fair of fairs) {
            const boothsRes = await fetch(`/api/booths/fair/${fair.id}`)
            const booths = await boothsRes.json()
            const companyBooths = booths.filter(b => b.companyId === company.id)
            totalBooths += companyBooths.length
            
            for (const booth of companyBooths) {
              const resumesRes = await fetch(`/api/resumes/booth/${booth.id}`)
              const resumes = await resumesRes.json()
              totalResumes += resumes.length
            }
          }
        } catch (error) {
          console.error('Error fetching booth data:', error)
        }
      }
      
      setStats({
        companies: userCompanies.length,
        booths: totalBooths,
        resumes: totalResumes,
        fairs: fairs.length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'Employer'}!
        </h1>
        <p className="text-gray-600">Manage your company booths and review candidate resumes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/employer/companies"
          className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg shadow-md border border-slate-100 p-6 hover:shadow-lg hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-700 text-sm font-medium">My Companies</p>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-slate-900">{stats.companies}</p>
            <Building2 className="w-12 h-12 text-slate-500 group-hover:text-teal-600 transition-colors" />
          </div>
        </Link>

        <Link
          to="/employer/booths"
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg shadow-md border border-emerald-100 p-6 hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-emerald-700 text-sm font-medium">Company Booths</p>
            <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-emerald-900">{stats.booths}</p>
            <Briefcase className="w-12 h-12 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
          </div>
        </Link>

        <Link
          to="/employer/resumes"
          className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg shadow-md border border-rose-100 p-6 hover:shadow-lg hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-rose-700 text-sm font-medium">Resumes Received</p>
            <ArrowRight className="w-5 h-5 text-rose-400 group-hover:text-rose-600 transition-colors" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-rose-900">{stats.resumes}</p>
            <FileText className="w-12 h-12 text-rose-500 group-hover:text-rose-600 transition-colors" />
          </div>
        </Link>

        <Link
          to="/career-fairs"
          className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg shadow-md border border-amber-100 p-6 hover:shadow-lg hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-amber-700 text-sm font-medium">Career Fairs</p>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-amber-900">{stats.fairs}</p>
            <Users className="w-12 h-12 text-amber-500 group-hover:text-amber-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/career-fairs"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50/50 transition-all cursor-pointer"
          >
            <Briefcase className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Browse Career Fairs</h3>
            <p className="text-sm text-gray-600">Find events to participate</p>
          </Link>

          <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
            <FileText className="w-8 h-8 text-gray-400 mb-2" />
            <h3 className="font-semibold text-gray-900">Review Resumes</h3>
            <p className="text-sm text-gray-600">View submitted applications</p>
          </div>

          <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
            <Building2 className="w-8 h-8 text-gray-400 mb-2" />
            <h3 className="font-semibold text-gray-900">Manage Booths</h3>
            <p className="text-sm text-gray-600">Set up company booths</p>
          </div>
        </div>
      </div>
    </div>
  )
}

