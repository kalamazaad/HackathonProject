import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, Users, Building2, FileText, Settings } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    fairs: 0,
    totalUsers: 0,
    booths: 0,
    registrations: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [fairsRes, usersRes] = await Promise.all([
        fetch('/api/career-fairs'),
        fetch('/api/admin/users')
      ])
      const fairs = await fairsRes.json()
      const users = await usersRes.json()
      setStats({
        fairs: fairs.length,
        totalUsers: users.count || 0,
        booths: 0,
        registrations: 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'Admin'}!
        </h1>
        <p className="text-gray-600">Manage career fairs, companies, and user registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-50 text-sm mb-1">Career Fairs</p>
              <p className="text-4xl font-bold">{stats.fairs}</p>
            </div>
            <Calendar className="w-12 h-12 opacity-90" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-50 text-sm mb-1">Total Users</p>
              <p className="text-4xl font-bold">{stats.totalUsers}</p>
            </div>
            <Users className="w-12 h-12 opacity-90" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-50 text-sm mb-1">Company Booths</p>
              <p className="text-4xl font-bold">{stats.booths}</p>
            </div>
            <Building2 className="w-12 h-12 opacity-90" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-50 text-sm mb-1">Registrations</p>
              <p className="text-4xl font-bold">{stats.registrations}</p>
            </div>
            <FileText className="w-12 h-12 opacity-90" />
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/admin/fairs"
          className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border-2 border-transparent hover:border-teal-400 hover:bg-teal-50/30"
        >
          <Calendar className="w-10 h-10 text-teal-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Career Fairs</h3>
          <p className="text-gray-600 text-sm">Create, edit, and manage career fair events</p>
        </Link>

        <Link
          to="/admin/booths"
          className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border-2 border-transparent hover:border-amber-400 hover:bg-amber-50/30"
        >
          <Building2 className="w-10 h-10 text-amber-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Company Booths</h3>
          <p className="text-gray-600 text-sm">Set up and manage company booths for fairs</p>
        </Link>

        <Link
          to="/admin/registrations"
          className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border-2 border-transparent hover:border-rose-400 hover:bg-rose-50/30"
        >
          <Users className="w-10 h-10 text-rose-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">View Registrations</h3>
          <p className="text-gray-600 text-sm">Monitor user registrations for career fairs</p>
        </Link>
      </div>
    </div>
  )
}

