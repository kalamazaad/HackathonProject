import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, Clock, MapPin, ArrowRight, Building2, Users, Briefcase, Search } from 'lucide-react'

export default function CareerFairs() {
  const { user } = useAuth()
  const [fairs, setFairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, ongoing, past

  useEffect(() => {
    fetchFairs()
  }, [filter])

  const fetchFairs = async () => {
    try {
      const response = await fetch('/api/career-fairs')
      const data = await response.json()
      
      // Filter by status
      let filteredFairs = data
      if (filter === 'upcoming') {
        filteredFairs = data.filter(f => f.status === 'upcoming')
      } else if (filter === 'ongoing') {
        filteredFairs = data.filter(f => f.status === 'ongoing')
      } else if (filter === 'past') {
        filteredFairs = data.filter(f => f.status === 'past')
      }

      // Get booth counts for each fair
      const fairsWithBooths = await Promise.all(
        filteredFairs.map(async (fair) => {
          try {
            const boothsRes = await fetch(`/api/booths/fair/${fair.id}`)
            const booths = await boothsRes.json()
            return { ...fair, boothCount: booths.length }
          } catch (error) {
            return { ...fair, boothCount: 0 }
          }
        })
      )

      setFairs(fairsWithBooths)
    } catch (error) {
      console.error('Error fetching career fairs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Sample data for demonstration
  const sampleFairs = [
    {
      id: 'sample-1',
      title: 'Tech Career Expo 2024',
      description: 'Join the largest technology career fair featuring top tech companies, startups, and innovative organizations. Network with industry leaders and discover exciting opportunities in software development, data science, and more.',
      status: 'upcoming',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Convention Center, Downtown',
      boothCount: 45
    },
    {
      id: 'sample-2',
      title: 'Healthcare Professionals Fair',
      description: 'Connect with leading healthcare institutions, hospitals, and medical facilities. Explore opportunities in nursing, medical research, administration, and patient care.',
      status: 'ongoing',
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Medical Center Auditorium',
      boothCount: 32
    },
    {
      id: 'sample-3',
      title: 'Finance & Banking Summit',
      description: 'Meet with major financial institutions, investment firms, and banking organizations. Discover roles in finance, accounting, risk management, and financial technology.',
      status: 'upcoming',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Financial District Plaza',
      boothCount: 28
    }
  ]

  const displayFairs = fairs.length > 0 ? fairs : sampleFairs

  if (loading) {
    return <div className="text-center py-12">Loading career fairs...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Fairs</h1>
        <p className="text-gray-600">Browse and participate in career fairs to showcase your company and connect with talented job seekers</p>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Fairs
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === 'upcoming'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('ongoing')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === 'ongoing'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === 'past'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Past Events
          </button>
        </div>
      </div>

      {displayFairs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center mb-8">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Career Fairs Available</h3>
            <p className="text-gray-600 mb-6">Check back later for upcoming events.</p>
          </div>
          
          <div className="bg-teal-50 rounded-lg p-6 border border-teal-100">
            <h4 className="font-semibold text-teal-900 mb-3">Benefits of Participating in Career Fairs</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">•</span>
                <span>Showcase your company brand and culture to potential candidates</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">•</span>
                <span>Collect resumes from qualified job seekers</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">•</span>
                <span>Network with industry professionals and build relationships</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">•</span>
                <span>Promote your job openings and company values</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayFairs.map((fair) => (
            <div
              key={fair.id}
              className="bg-white rounded-lg shadow hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-teal-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{fair.title}</h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    fair.status === 'upcoming' ? 'bg-teal-100 text-teal-800' :
                    fair.status === 'ongoing' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {fair.status}
                  </span>
                </div>
                <Calendar className="w-8 h-8 text-teal-600" />
              </div>
              
              {fair.description && (
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{fair.description}</p>
              )}

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span><strong>Start:</strong> {formatDate(fair.startDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span><strong>End:</strong> {formatDate(fair.endDate)}</span>
                </div>
                {fair.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>{fair.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span><strong>{fair.boothCount || 0}</strong> {fair.boothCount === 1 ? 'Booth' : 'Booths'} Available</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Link
                  to={fair.id.startsWith('sample') ? '#' : `/career-fairs/${fair.id}`}
                  className="flex items-center justify-between text-teal-600 font-medium hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  <span>View Details & Register</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


