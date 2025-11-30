import { useEffect, useState } from 'react'
import { Calendar, Plus, Edit, Trash2, Clock } from 'lucide-react'

export default function AdminFairs() {
  const [fairs, setFairs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingFair, setEditingFair] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchFairs()
  }, [])

  const fetchFairs = async () => {
    try {
      const response = await fetch('/api/career-fairs')
      const data = await response.json()
      setFairs(data)
    } catch (error) {
      console.error('Error fetching fairs:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingFair 
        ? `/api/career-fairs/${editingFair.id}`
        : '/api/career-fairs'
      const method = editingFair ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchFairs()
        setShowForm(false)
        setEditingFair(null)
        setFormData({ title: '', description: '', startDate: '', endDate: '' })
      }
    } catch (error) {
      console.error('Error saving fair:', error)
    }
  }

  const handleEdit = (fair) => {
    setEditingFair(fair)
    setFormData({
      title: fair.title,
      description: fair.description || '',
      startDate: fair.startDate.split('T')[0] + 'T' + fair.startDate.split('T')[1].slice(0, 5),
      endDate: fair.endDate.split('T')[0] + 'T' + fair.endDate.split('T')[1].slice(0, 5)
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this career fair?')) return
    try {
      const response = await fetch(`/api/career-fairs/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchFairs()
      }
    } catch (error) {
      console.error('Error deleting fair:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Career Fairs</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingFair(null)
            setFormData({ title: '', description: '', startDate: '', endDate: '' })
          }}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create Fair</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingFair ? 'Edit Career Fair' : 'Create Career Fair'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                rows="3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
              >
                {editingFair ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingFair(null)
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
        {fairs.map((fair) => (
          <div key={fair.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{fair.title}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                fair.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                fair.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {fair.status}
              </span>
            </div>
            {fair.description && (
              <p className="text-gray-600 mb-4 line-clamp-2">{fair.description}</p>
            )}
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{new Date(fair.startDate).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(fair)}
                className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-3 py-2 rounded text-sm hover:from-teal-700 hover:to-emerald-700 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(fair.id)}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

