import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, Building2, Clock, Users, CheckCircle } from 'lucide-react'

export default function CareerFairDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [fair, setFair] = useState(null)
  const [booths, setBooths] = useState([])
  const [isRegistered, setIsRegistered] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFairDetails()
    checkRegistration()
  }, [id])

  const fetchFairDetails = async () => {
    try {
      const [fairRes, boothsRes] = await Promise.all([
        fetch(`/api/career-fairs/${id}`),
        fetch(`/api/booths/fair/${id}`)
      ])
      const fairData = await fairRes.json()
      const boothsData = await boothsRes.json()
      setFair(fairData)
      setBooths(boothsData)
    } catch (error) {
      console.error('Error fetching fair details:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkRegistration = async () => {
    try {
      const response = await fetch(`/api/registrations/user/${user.id}`)
      const registrations = await response.json()
      setIsRegistered(registrations.some(r => r.careerFairId === parseInt(id)))
    } catch (error) {
      console.error('Error checking registration:', error)
    }
  }

  const handleRegister = async () => {
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, careerFairId: parseInt(id) })
      })
      if (response.ok) {
        setIsRegistered(true)
        alert('Successfully registered for this career fair!')
      }
    } catch (error) {
      console.error('Error registering:', error)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!fair) return <div>Career fair not found</div>

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{fair.title}</h1>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              fair.status === 'upcoming' ? 'bg-teal-100 text-teal-800' :
              fair.status === 'ongoing' ? 'bg-emerald-100 text-emerald-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {fair.status}
            </span>
          </div>
          {!isRegistered && (
            <button
              onClick={handleRegister}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
            >
              Register for Fair
            </button>
          )}
          {isRegistered && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>Registered</span>
            </div>
          )}
        </div>

        {fair.description && (
          <p className="text-gray-700 mb-4">{fair.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Start: {new Date(fair.startDate).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>End: {new Date(fair.endDate).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Booths</h2>
        {booths.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No booths available for this career fair.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {booths.map((booth) => (
              <Link
                key={booth.id}
                to={`/booths/${booth.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{booth.companyName}</h3>
                  {booth.boothNumber && (
                    <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded">
                      Booth {booth.boothNumber}
                    </span>
                  )}
                </div>
                {booth.companyDescription && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{booth.companyDescription}</p>
                )}
                {booth.industry && (
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {booth.industry}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

