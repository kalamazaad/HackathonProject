import { useEffect, useState } from 'react'
import { Users, Calendar } from 'lucide-react'

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [fairs, setFairs] = useState([])
  const [selectedFair, setSelectedFair] = useState('')

  useEffect(() => {
    fetchFairs()
  }, [])

  useEffect(() => {
    if (selectedFair) {
      fetchRegistrations(selectedFair)
    }
  }, [selectedFair])

  const fetchFairs = async () => {
    try {
      const response = await fetch('/api/career-fairs')
      const data = await response.json()
      setFairs(data)
      if (data.length > 0) {
        setSelectedFair(data[0].id.toString())
      }
    } catch (error) {
      console.error('Error fetching fairs:', error)
    }
  }

  const fetchRegistrations = async (fairId) => {
    try {
      const response = await fetch(`/api/registrations/fair/${fairId}`)
      const data = await response.json()
      setRegistrations(data)
    } catch (error) {
      console.error('Error fetching registrations:', error)
    }
  }

  // Sample data for demonstration
  const sampleRegistrations = [
    {
      id: 'sample-1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      userType: 'Job Seeker',
      registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'sample-2',
      email: 'sarah.johnson@example.com',
      name: 'Sarah Johnson',
      userType: 'Job Seeker',
      registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'sample-3',
      email: 'michael.chen@example.com',
      name: 'Michael Chen',
      userType: 'Job Seeker',
      registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'sample-4',
      email: 'emily.williams@example.com',
      name: 'Emily Williams',
      userType: 'Job Seeker',
      registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'sample-5',
      email: 'david.brown@example.com',
      name: 'David Brown',
      userType: 'Employer',
      registeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  const displayRegistrations = registrations.length > 0 ? registrations : sampleRegistrations
  const sampleFairs = [
    { id: 'sample-1', title: 'Tech Career Expo 2024' },
    { id: 'sample-2', title: 'Healthcare Professionals Fair' },
    { id: 'sample-3', title: 'Finance & Banking Summit' }
  ]
  const displayFairs = fairs.length > 0 ? fairs : sampleFairs

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrations</h1>
        <p className="text-gray-600">View all registrations for career fairs</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Career Fair</label>
        <select
          value={selectedFair}
          onChange={(e) => setSelectedFair(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
        >
          {displayFairs.map(fair => (
            <option key={fair.id} value={fair.id}>{fair.title}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-emerald-50">
          <h2 className="text-xl font-semibold text-gray-900">
            {displayRegistrations.length} Registration{displayRegistrations.length !== 1 ? 's' : ''}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayRegistrations.map((reg) => {
                const isSample = reg.id.toString().startsWith('sample')
                return (
                <tr key={reg.id} className={isSample ? 'bg-amber-50/30' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{reg.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reg.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      reg.userType === 'Job Seeker' 
                        ? 'bg-teal-100 text-teal-800' 
                        : reg.userType === 'Employer'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reg.userType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reg.registeredAt).toLocaleString()}
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {displayRegistrations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p>No registrations for this career fair yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

