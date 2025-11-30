import { useEffect, useState } from 'react'
import { Building2, Plus } from 'lucide-react'

export default function AdminBooths() {
  const [booths, setBooths] = useState([])
  const [fairs, setFairs] = useState([])
  const [companies, setCompanies] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [formData, setFormData] = useState({
    careerFairId: '',
    companyId: '',
    boothNumber: '',
    description: ''
  })
  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    description: '',
    website: '',
    industry: ''
  })

  useEffect(() => {
    fetchBooths()
    fetchFairs()
    fetchCompanies()
  }, [])

  const fetchBooths = async () => {
    try {
      // Get all booths by fetching from all fairs
      const fairsRes = await fetch('/api/career-fairs')
      const fairsData = await fairsRes.json()
      const allBooths = []
      for (const fair of fairsData) {
        const boothsRes = await fetch(`/api/booths/fair/${fair.id}`)
        const boothsData = await boothsRes.json()
        boothsData.forEach(booth => {
          allBooths.push({ ...booth, fairTitle: fair.title })
        })
      }
      setBooths(allBooths)
    } catch (error) {
      console.error('Error fetching booths:', error)
    }
  }

  const fetchFairs = async () => {
    try {
      const response = await fetch('/api/career-fairs')
      const data = await response.json()
      setFairs(data)
    } catch (error) {
      console.error('Error fetching fairs:', error)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      const data = await response.json()
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/booths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchBooths()
        fetchCompanies()
        setShowForm(false)
        setFormData({ careerFairId: '', companyId: '', boothNumber: '', description: '' })
      }
    } catch (error) {
      console.error('Error creating booth:', error)
    }
  }

  const handleCompanySubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyFormData)
      })

      if (response.ok) {
        fetchCompanies()
        setShowCompanyForm(false)
        setCompanyFormData({ name: '', description: '', website: '', industry: '' })
        alert('Company created successfully!')
      }
    } catch (error) {
      console.error('Error creating company:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Company Booths</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCompanyForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Company</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create Booth</span>
          </button>
        </div>
      </div>

      {showCompanyForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Company</h2>
          <form onSubmit={handleCompanySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyFormData.name}
                onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={companyFormData.description}
                onChange={(e) => setCompanyFormData({ ...companyFormData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={companyFormData.website}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={companyFormData.industry}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-all"
              >
                Create Company
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCompanyForm(false)
                  setCompanyFormData({ name: '', description: '', website: '', industry: '' })
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Company Booth</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Career Fair</label>
              <select
                value={formData.careerFairId}
                onChange={(e) => setFormData({ ...formData, careerFairId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select a career fair</option>
                {fairs.map(fair => (
                  <option key={fair.id} value={fair.id}>{fair.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select a company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booth Number</label>
              <input
                type="text"
                value={formData.boothNumber}
                onChange={(e) => setFormData({ ...formData, boothNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="3"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ careerFairId: '', companyId: '', boothNumber: '', description: '' })
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {booths.map((booth) => (
          <div key={booth.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{booth.companyName}</h3>
            <p className="text-sm text-gray-600 mb-2">{booth.fairTitle}</p>
            {booth.boothNumber && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mb-2">
                Booth {booth.boothNumber}
              </span>
            )}
            {booth.description && (
              <p className="text-gray-600 text-sm line-clamp-2">{booth.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

