import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, Clock, Building2, Users, Search, MapPin, Briefcase } from 'lucide-react'
import JobListings from './JobListings'

export default function Opportunities() {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, ongoing
  const [view, setView] = useState('fairs') // fairs, jobs

  useEffect(() => {
    fetchOpportunities()
  }, [filter])

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/career-fairs')
      const allFairs = await response.json()
      
      // Filter by status
      let filteredFairs = allFairs.filter(f => 
        f.status === 'ongoing' || f.status === 'upcoming'
      )
      
      if (filter === 'upcoming') {
        filteredFairs = filteredFairs.filter(f => f.status === 'upcoming')
      } else if (filter === 'ongoing') {
        filteredFairs = filteredFairs.filter(f => f.status === 'ongoing')
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

      setOpportunities(fairsWithBooths)
    } catch (error) {
      console.error('Error fetching opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading opportunities...</div>
  }

  if (view === 'jobs') {
    return <JobListings />
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Opportunities</h1>
        <p className="text-gray-600">Discover available career fairs and job opportunities</p>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">View:</span>
          <button
            onClick={() => setView('fairs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              view === 'fairs'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Career Fairs
          </button>
          <button
            onClick={() => setView('jobs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              view === 'jobs'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Job Listings
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Opportunities
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === 'upcoming'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('ongoing')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === 'ongoing'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ongoing
          </button>
        </div>
      </div>

      {opportunities.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center mb-8">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Career Fair Opportunities</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'There are currently no upcoming or ongoing career fairs.'
                : `There are currently no ${filter} career fairs.`}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/career-fairs"
                className="inline-block bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
              >
                View All Career Fairs
              </Link>
              <button
                onClick={() => setView('jobs')}
                className="inline-block bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-amber-700 hover:to-orange-700 shadow-md hover:shadow-lg transition-all"
              >
                View Job Listings
              </button>
            </div>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-6 border border-amber-100">
            <h4 className="font-semibold text-amber-900 mb-3">Explore Job Opportunities</h4>
            <p className="text-sm text-gray-700 mb-3">
              While there are no active career fairs at the moment, you can still explore available job positions:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <Briefcase className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>View job listings with detailed descriptions and salary information</span>
              </li>
              <li className="flex items-start">
                <Briefcase className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Search for positions by title, company, or keywords</span>
              </li>
              <li className="flex items-start">
                <Briefcase className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Find opportunities matching your skills and experience</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((fair) => (
            <Link
              key={fair.id}
              to={`/career-fairs/${fair.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{fair.title}</h3>
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
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{fair.description}</p>
              )}

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Start: {new Date(fair.startDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>End: {new Date(fair.endDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>{fair.boothCount} {fair.boothCount === 1 ? 'Booth' : 'Booths'} Available</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-teal-600 font-medium">View Details</span>
                  <Users className="w-5 h-5 text-teal-600" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

