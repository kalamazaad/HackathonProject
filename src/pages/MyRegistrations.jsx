import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, Clock, CheckCircle, MapPin, Building2, XCircle } from 'lucide-react'

export default function MyRegistrations() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`/api/registrations/user/${user.id}`)
      const data = await response.json()
      setRegistrations(data)
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnregister = async (registrationId, fairId) => {
    // Check if it's a sample registration
    if (registrationId.toString().startsWith('sample')) {
      // Just update local state for sample registrations
      setRegistrations(prev => prev.filter(r => r.id !== registrationId))
      return
    }

    if (!confirm('Are you sure you want to unregister from this career fair?')) return
    
    try {
      // Note: You may want to add a DELETE endpoint for registrations
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchRegistrations()
      } else {
        const data = await response.json()
        alert(data.error || 'Error unregistering')
      }
    } catch (error) {
      console.error('Error unregistering:', error)
      alert('Error unregistering. Please try again.')
    }
  }

  // Sample data for demonstration
  const sampleRegistrations = [
    {
      id: 'sample-1',
      title: 'Tech Career Expo 2024',
      status: 'upcoming',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      careerFairId: 'sample-1'
    },
    {
      id: 'sample-2',
      title: 'Healthcare Professionals Fair',
      status: 'ongoing',
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      registeredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      careerFairId: 'sample-2'
    },
    {
      id: 'sample-3',
      title: 'Finance & Banking Summit',
      status: 'upcoming',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      careerFairId: 'sample-3'
    }
  ]

  const displayRegistrations = registrations.length > 0 ? registrations : sampleRegistrations

  if (loading) {
    return <div className="text-center py-12">Loading registrations...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Registrations</h1>
        <p className="text-gray-600">View and manage your career fair registrations</p>
      </div>

      {displayRegistrations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center mb-8">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Registrations Yet</h3>
            <p className="text-gray-600 mb-6">Register for career fairs to start exploring opportunities.</p>
            <Link
              to="/career-fairs"
              className="inline-block bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
            >
              Browse Career Fairs
            </Link>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6 border border-green-100">
            <h4 className="font-semibold text-green-900 mb-3">Benefits of Registering</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Get early access to company booths and job listings</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Receive notifications about fair updates and new opportunities</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Track your participation and manage your schedule</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Submit resumes to multiple companies at once</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRegistrations.map((registration) => {
            const isSample = registration.id.toString().startsWith('sample')
            return (
            <div key={registration.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-teal-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{registration.title}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                    registration.status === 'upcoming' ? 'bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800' :
                    registration.status === 'ongoing' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {registration.status}
                  </span>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span><strong>Start:</strong> {new Date(registration.startDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span><strong>End:</strong> {new Date(registration.endDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Registered: {new Date(registration.registeredAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                {!isSample ? (
                  <Link
                    to={`/career-fairs/${registration.careerFairId}`}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 text-center text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    View Details
                  </Link>
                ) : (
                  <button
                    onClick={() => alert('This is a sample registration. In a real scenario, you would view the career fair details.')}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 text-center text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    View Details
                  </button>
                )}
                <button
                  onClick={() => handleUnregister(registration.id, registration.careerFairId)}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm transition-colors flex items-center cursor-pointer"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Unregister
                </button>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

