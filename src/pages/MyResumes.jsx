import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FileText, Building2, Calendar, CheckCircle, Clock } from 'lucide-react'

export default function MyResumes() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const response = await fetch(`/api/resumes/user/${user.id}`)
      const data = await response.json()
      setResumes(data)
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading resumes...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Resumes</h1>

      {resumes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center mb-8">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Resumes Submitted</h3>
            <p className="text-gray-600 mb-6">Visit company booths to submit your resume and start applying for positions.</p>
            <Link
              to="/career-fairs"
              className="inline-block bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
            >
              Browse Career Fairs
            </Link>
          </div>
          
          <div className="bg-violet-50 rounded-lg p-6 border border-violet-100">
            <h4 className="font-semibold text-violet-900 mb-3">How to Submit Your Resume</h4>
            <ol className="space-y-3 text-sm text-gray-700 list-decimal list-inside">
              <li>
                <span className="font-medium">Browse Career Fairs:</span> Find upcoming or ongoing career fairs that interest you
              </li>
              <li>
                <span className="font-medium">Explore Company Booths:</span> Click on a career fair to see participating companies
              </li>
              <li>
                <span className="font-medium">Visit Booth Details:</span> Click on a company booth to view job opportunities
              </li>
              <li>
                <span className="font-medium">Upload Resume:</span> Submit your resume (PDF, DOC, or DOCX format) directly to the company
              </li>
              <li>
                <span className="font-medium">Track Status:</span> Monitor your resume status (pending, accepted, or rejected) here
              </li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <div key={resume.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {resume.jobTitle || resume.companyName || 'Application'}
                  </h3>
                  {resume.jobTitle && (
                    <p className="text-gray-600 mb-2">Job Application</p>
                  )}
                  {resume.fairTitle && (
                    <p className="text-gray-600 mb-2">{resume.fairTitle}</p>
                  )}
                  {resume.boothNumber && (
                    <span className="inline-block px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded">
                      Booth {resume.boothNumber}
                    </span>
                  )}
                  {resume.coverLetter && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
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
                  {resume.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
                  {resume.status || 'pending'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>{resume.fileName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted: {new Date(resume.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

