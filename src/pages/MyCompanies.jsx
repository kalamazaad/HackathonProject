import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Building2, Plus, Edit, Trash2, Globe, Briefcase } from 'lucide-react'

export default function MyCompanies() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    industry: ''
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      const data = await response.json()
      // Filter companies for this user
      const userCompanies = data.filter(c => c.userId === user.id)
      setCompanies(userCompanies)
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingCompany 
        ? `/api/companies/${editingCompany.id}`
        : '/api/companies'
      const method = editingCompany ? 'PUT' : 'POST'
      const body = editingCompany 
        ? { ...formData }
        : { ...formData, userId: user.id }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        fetchCompanies()
        setShowForm(false)
        setEditingCompany(null)
        setFormData({ name: '', description: '', website: '', industry: '' })
      } else {
        const data = await response.json()
        alert(data.error || 'Error saving company')
      }
    } catch (error) {
      console.error('Error saving company:', error)
      alert('Error saving company. Please try again.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) return
    
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCompanies()
      } else {
        const data = await response.json()
        alert(data.error || 'Error deleting company')
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('Error deleting company. Please try again.')
    }
  }

  // Sample data for demonstration
  const sampleCompanies = [
    {
      id: 'sample-1',
      name: 'Tech Innovations Inc.',
      description: 'Leading software development company specializing in cloud solutions, AI, and enterprise applications. We build cutting-edge technology solutions for businesses worldwide.',
      website: 'https://techinnovations.example.com',
      industry: 'Technology',
      userId: user.id
    },
    {
      id: 'sample-2',
      name: 'Green Energy Solutions',
      description: 'Sustainable energy company focused on renewable energy projects, solar installations, and eco-friendly technology. Committed to creating a greener future.',
      website: 'https://greenenergy.example.com',
      industry: 'Energy & Sustainability',
      userId: user.id
    },
    {
      id: 'sample-3',
      name: 'Global Finance Partners',
      description: 'International financial services firm providing investment banking, wealth management, and financial consulting services to clients across the globe.',
      website: 'https://globalfinance.example.com',
      industry: 'Finance & Banking',
      userId: user.id
    }
  ]

  const displayCompanies = companies.length > 0 ? companies : sampleCompanies

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Companies</h1>
          <p className="text-gray-600">Manage your company profiles</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingCompany(null)
            setFormData({ name: '', description: '', website: '', industry: '' })
          }}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Company</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingCompany ? 'Edit Company' : 'Create Company'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="4"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Technology, Healthcare"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
              >
                {editingCompany ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingCompany(null)
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {displayCompanies.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Companies Yet</h3>
          <p className="text-gray-600 mb-4">Create your first company profile to get started.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Add Company
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCompanies.map((company) => (
            <div key={company.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                <Building2 className="w-8 h-8 text-teal-600" />
              </div>
              
              {company.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">{company.description}</p>
              )}

              <div className="space-y-2 mb-4">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-teal-600 hover:text-emerald-600 text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Visit Website</span>
                  </a>
                )}
                {company.industry && (
                  <div className="flex items-center space-x-2 text-gray-600 text-sm">
                    <Briefcase className="w-4 h-4" />
                    <span>{company.industry}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                {!company.id.toString().startsWith('sample') && (
                  <>
                    <button
                      onClick={() => {
                        setEditingCompany(company)
                        setFormData({
                          name: company.name,
                          description: company.description || '',
                          website: company.website || '',
                          industry: company.industry || ''
                        })
                        setShowForm(true)
                      }}
                      className="flex-1 bg-teal-50 text-teal-700 px-3 py-2 rounded text-sm hover:bg-teal-100 flex items-center justify-center cursor-pointer"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-100 flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </>
                )}
                {company.id.toString().startsWith('sample') && (
                  <div className="flex-1 text-center text-xs text-gray-500 italic">
                    Sample Company
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
