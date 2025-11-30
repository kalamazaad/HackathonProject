import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Briefcase, DollarSign, Building2, MapPin, Calendar, Search } from 'lucide-react'

export default function JobListings() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Salary not specified'
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`
    }
    if (min) {
      return `From $${min.toLocaleString()} ${currency}`
    }
    return `Up to $${max.toLocaleString()} ${currency}`
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.companyName && job.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return <div className="text-center py-12">Loading job opportunities...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Opportunities</h1>
        <p className="text-gray-600">Explore available positions and find your next career move</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search jobs by title, description, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No Jobs Found' : 'No Job Opportunities Available'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try adjusting your search terms.'
              : 'Check back later for new opportunities.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                  {job.companyName && (
                    <div className="flex items-center space-x-2 text-teal-600 mb-2">
                      <Building2 className="w-5 h-5" />
                      <span className="font-medium">{job.companyName}</span>
                      {job.industry && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{job.industry}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <Briefcase className="w-10 h-10 text-teal-600" />
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">{job.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-gray-900">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                  </span>
                </div>
                {job.careerFairTitle && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <span>{job.careerFairTitle}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                {job.companyWebsite && (
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-emerald-600 font-medium text-sm"
                  >
                    Visit Company Website →
                  </a>
                )}
                <Link
                  to={`/jobs/${job.id}`}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all text-sm font-medium"
                >
                  View Details & Apply
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

