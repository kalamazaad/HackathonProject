import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Building2, Calendar, MapPin, Users, ArrowRight } from 'lucide-react'

export default function MyBooths() {
  const { user } = useAuth()
  const [booths, setBooths] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooths()
  }, [])

  const fetchBooths = async () => {
    try {
      // Get user's companies
      const companiesRes = await fetch('/api/companies')
      const allCompanies = await companiesRes.json()
      const userCompanies = allCompanies.filter(c => c.userId === user.id)
      
      // Get all career fairs
      const fairsRes = await fetch('/api/career-fairs')
      const fairs = await fairsRes.json()
      
      // Get booths for each fair and filter by user's companies
      const allBooths = []
      for (const fair of fairs) {
        const boothsRes = await fetch(`/api/booths/fair/${fair.id}`)
        const boothsData = await boothsRes.json()
        const userBooths = boothsData.filter(b => 
          userCompanies.some(c => c.id === b.companyId)
        )
        userBooths.forEach(booth => {
          allBooths.push({ ...booth, fairTitle: fair.title, fairId: fair.id })
        })
      }
      
      setBooths(allBooths)
    } catch (error) {
      console.error('Error fetching booths:', error)
    } finally {
      setLoading(false)
    }
  }

  // Sample data for demonstration
  const sampleBooths = [
    {
      id: 'sample-1',
      companyName: 'Tech Innovations Inc.',
      fairTitle: 'Tech Career Expo 2024',
      boothNumber: 'A-12',
      description: 'Showcasing our latest AI and cloud solutions. Meet our team and learn about exciting career opportunities.',
      fairId: 1,
      companyId: 1
    },
    {
      id: 'sample-2',
      companyName: 'Green Energy Solutions',
      fairTitle: 'Healthcare Professionals Fair',
      boothNumber: 'B-05',
      description: 'Discover sustainable energy careers. Learn about our renewable energy projects and environmental initiatives.',
      fairId: 2,
      companyId: 2
    },
    {
      id: 'sample-3',
      companyName: 'Global Finance Partners',
      fairTitle: 'Finance & Banking Summit',
      boothNumber: 'C-18',
      description: 'Explore opportunities in finance, investment banking, and wealth management. Network with industry leaders.',
      fairId: 3,
      companyId: 3
    }
  ]

  const displayBooths = booths.length > 0 ? booths : sampleBooths

  if (loading) {
    return <div className="text-center py-12">Loading booths...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Company Booths</h1>
        <p className="text-gray-600">View and manage all your company booths across career fairs</p>
      </div>

      {displayBooths.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Booths Yet</h3>
          <p className="text-gray-600 mb-4">Your company booths will appear here once they're set up by administrators.</p>
          <Link
            to="/career-fairs"
            className="inline-block bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
          >
            Browse Career Fairs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBooths.map((booth) => {
            const isSample = booth.id.toString().startsWith('sample')
            return (
            <div
              key={booth.id}
              className={`bg-white rounded-lg shadow hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-teal-300 ${
                isSample ? '' : 'cursor-pointer'
              }`}
              onClick={() => {
                if (!isSample) {
                  window.location.href = `/booths/${booth.id}`
                }
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{booth.companyName}</h3>
                  <p className="text-sm text-teal-600 font-medium">{booth.fairTitle}</p>
                </div>
                <Building2 className="w-8 h-8 text-teal-600" />
              </div>

              {booth.boothNumber && (
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 text-sm font-medium rounded-full">
                    Booth {booth.boothNumber}
                  </span>
                </div>
              )}

              {booth.description && (
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">{booth.description}</p>
              )}

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span className="font-medium">{booth.fairTitle}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>{booth.companyName}</span>
                </div>
              </div>

              {!booth.id.toString().startsWith('sample') && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-teal-600 font-medium">
                    <span>View Booth Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              )}
              {booth.id.toString().startsWith('sample') && (
                <div className="pt-4 border-t border-gray-200 text-center">
                  <span className="text-xs text-gray-500 italic">Sample Booth</span>
                </div>
              )}
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

