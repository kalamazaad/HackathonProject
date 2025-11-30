import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FileText, Download, User, Calendar, Building2, CheckCircle, XCircle, Clock, Briefcase } from 'lucide-react'

export default function ReceivedResumes() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooth, setSelectedBooth] = useState('all')

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      // Get user's companies
      const companiesRes = await fetch('/api/companies')
      const allCompanies = await companiesRes.json()
      const userCompanies = allCompanies.filter(c => c.userId === user.id)
      
      // Get all career fairs
      const fairsRes = await fetch('/api/career-fairs')
      const fairs = await fairsRes.json()
      
      // Get booths and resumes for user's companies
      const allResumes = []
      for (const fair of fairs) {
        const boothsRes = await fetch(`/api/booths/fair/${fair.id}`)
        const boothsData = await boothsRes.json()
        const userBooths = boothsData.filter(b => 
          userCompanies.some(c => c.id === b.companyId)
        )
        
        for (const booth of userBooths) {
          const resumesRes = await fetch(`/api/resumes/booth/${booth.id}`)
          const resumesData = await resumesRes.json()
          resumesData.forEach(resume => {
            allResumes.push({
              ...resume,
              boothNumber: booth.boothNumber,
              companyName: booth.companyName,
              fairTitle: fair.title,
              boothId: booth.id,
              type: 'booth'
            })
          })
        }
      }

      // Get resumes for jobs posted by user's companies
      const jobsRes = await fetch('/api/jobs')
      const allJobs = await jobsRes.json()
      const userJobs = allJobs.filter(j => 
        userCompanies.some(c => c.id === j.companyId)
      )

      for (const job of userJobs) {
        try {
          const resumesRes = await fetch(`/api/resumes/job/${job.id}`)
          const resumesData = await resumesRes.json()
          resumesData.forEach(resume => {
            allResumes.push({
              ...resume,
              jobTitle: job.title,
              companyName: job.companyName,
              jobId: job.id,
              type: 'job'
            })
          })
        } catch (error) {
          console.error('Error fetching job resumes:', error)
        }
      }
      
      setResumes(allResumes)
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (resumeId, newStatus) => {
    // Check if it's a sample resume - don't call API for samples
    if (resumeId.toString().startsWith('sample')) {
      // Just update local state for sample resumes
      setResumes(prev => prev.map(r => 
        r.id === resumeId ? { ...r, status: newStatus } : r
      ))
      return
    }

    try {
      const response = await fetch(`/api/resumes/${resumeId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update status')
      }

      // Update local state
      setResumes(prev => prev.map(r => 
        r.id === resumeId ? { ...r, status: newStatus } : r
      ))
    } catch (error) {
      console.error('Error updating status:', error)
      alert(`Failed to update resume status: ${error.message}. Please try again.`)
    }
  }

  const handleDownload = (filePath, resumeId) => {
    // Don't download sample resumes
    if (resumeId.toString().startsWith('sample')) {
      alert('This is a sample resume. In a real scenario, you would be able to download the actual resume file.')
      return
    }
    // Open resume file in new tab
    window.open(`http://localhost:3001${filePath}`, '_blank')
  }

  // Sample data for demonstration
  const sampleResumes = [
    {
      id: 'sample-1',
      fileName: 'John_Doe_Resume.pdf',
      userName: 'John Doe',
      email: 'john.doe@example.com',
      companyName: 'Tech Innovations Inc.',
      jobTitle: 'Senior Software Developer',
      fairTitle: 'Tech Career Expo 2024',
      boothNumber: 'A-12',
      coverLetter: 'I am excited to apply for the Senior Software Developer position. With over 6 years of experience in full-stack development, I have a proven track record of building scalable applications and leading development teams. I am particularly interested in your AI and cloud solutions division.',
      status: 'pending',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      filePath: '/uploads/resumes/sample-1.pdf',
      type: 'job'
    },
    {
      id: 'sample-2',
      fileName: 'Sarah_Johnson_Resume.pdf',
      userName: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      companyName: 'Green Energy Solutions',
      fairTitle: 'Healthcare Professionals Fair',
      boothNumber: 'B-05',
      coverLetter: 'As a passionate environmental advocate with a background in renewable energy engineering, I am thrilled to apply for a position at Green Energy Solutions. Your commitment to sustainability aligns perfectly with my career goals.',
      status: 'accepted',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      filePath: '/uploads/resumes/sample-2.pdf',
      type: 'booth'
    },
    {
      id: 'sample-3',
      fileName: 'Michael_Chen_Resume.pdf',
      userName: 'Michael Chen',
      email: 'michael.chen@example.com',
      companyName: 'Global Finance Partners',
      jobTitle: 'Junior Software Developer',
      fairTitle: 'Finance & Banking Summit',
      boothNumber: 'C-18',
      coverLetter: 'I am a recent computer science graduate with a strong interest in fintech. I am eager to contribute to your development team and learn from experienced professionals in the finance industry.',
      status: 'pending',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      filePath: '/uploads/resumes/sample-3.pdf',
      type: 'job'
    }
  ]

  const displayResumes = resumes.length > 0 ? resumes : sampleResumes
  const uniqueBooths = [...new Set(displayResumes.map(r => ({ id: r.boothId, name: `${r.companyName} - ${r.fairTitle || 'Career Fair'}` })).filter(b => b.id))]
  
  const filteredResumes = selectedBooth === 'all' 
    ? displayResumes 
    : displayResumes.filter(r => r.boothId === parseInt(selectedBooth))

  if (loading) {
    return <div className="text-center py-12">Loading resumes...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Received Resumes</h1>
        <p className="text-gray-600">Review resumes submitted to your company booths and job opportunities</p>
      </div>

      {displayResumes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Booth</label>
          <select
            value={selectedBooth}
            onChange={(e) => setSelectedBooth(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="all">All Booths</option>
            {uniqueBooths.map(booth => (
              <option key={booth.id} value={booth.id}>{booth.name}</option>
            ))}
          </select>
        </div>
      )}

      {filteredResumes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {displayResumes.length === 0 ? 'No Resumes Received' : 'No Resumes for Selected Booth'}
          </h3>
          <p className="text-gray-600">Resumes submitted to your booths and job opportunities will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResumes.map((resume) => (
            <div key={resume.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="w-6 h-6 text-teal-600" />
                    <h3 className="text-lg font-bold text-gray-900">{resume.fileName}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{resume.userName || resume.userEmail || resume.email || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span>{resume.companyName}</span>
                    </div>
                    {resume.jobTitle && (
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4" />
                        <span className="font-medium text-teal-600">{resume.jobTitle}</span>
                      </div>
                    )}
                    {resume.fairTitle && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{resume.fairTitle}</span>
                      </div>
                    )}
                    {resume.boothNumber && (
                      <div className="flex items-center space-x-2">
                        <span className="text-teal-600 font-medium">Booth {resume.boothNumber}</span>
                      </div>
                    )}
                  </div>
                  {resume.coverLetter && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 font-medium mb-1">Cover Letter:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{resume.coverLetter}</p>
                    </div>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                  resume.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                  resume.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {resume.status === 'accepted' && <CheckCircle className="w-4 h-4 mr-1" />}
                  {resume.status === 'rejected' && <XCircle className="w-4 h-4 mr-1" />}
                  {resume.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                  {resume.status || 'pending'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Submitted: {new Date(resume.submittedAt).toLocaleString()}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(resume.filePath, resume.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors text-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  {resume.status !== 'accepted' && (
                    <button
                      onClick={() => handleStatusChange(resume.id, 'accepted')}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm cursor-pointer"
                    >
                      Accept
                    </button>
                  )}
                  {resume.status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusChange(resume.id, 'rejected')}
                      className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm cursor-pointer"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

