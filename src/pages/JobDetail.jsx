import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Briefcase, DollarSign, Building2, Calendar, Upload, FileText, CheckCircle } from 'lucide-react'

export default function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showResumeForm, setShowResumeForm] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [submittingResume, setSubmittingResume] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    fetchJobDetails()
  }, [id])

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${id}`)
      if (response.ok) {
        const data = await response.json()
        setJob(data)
      }
    } catch (error) {
      console.error('Error fetching job details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResumeSubmit = async (e) => {
    e.preventDefault()
    if (!resumeFile) {
      alert('Please select a resume file')
      return
    }

    setSubmittingResume(true)
    try {
      if (!user || !user.id) {
        alert('You must be logged in to submit a resume')
        setSubmittingResume(false)
        return
      }

      if (!id) {
        alert('Invalid job opportunity ID')
        setSubmittingResume(false)
        return
      }

      const formData = new FormData()
      formData.append('resume', resumeFile)
      formData.append('userId', user.id.toString())
      formData.append('jobOpportunityId', id.toString())
      formData.append('coverLetter', coverLetter || '')

      console.log('Submitting resume:', {
        userId: user.id,
        jobOpportunityId: id,
        fileName: resumeFile.name,
        fileSize: resumeFile.size,
        hasCoverLetter: !!coverLetter
      })

      const response = await fetch('/api/resumes/submit-job', {
        method: 'POST',
        body: formData
      })

      let data
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError)
          const text = await response.text()
          console.error('Response text:', text)
          alert('Server returned invalid response. Please check the server console.')
          setSubmittingResume(false)
          return
        }
      } else {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        alert(`Server error: ${text || 'Unknown error occurred'}`)
        setSubmittingResume(false)
        return
      }

      if (response.ok) {
        setSubmitSuccess(true)
        setResumeFile(null)
        setCoverLetter('')
        setShowResumeForm(false)
        // Reset form
        const fileInput = document.getElementById('resume-file-job')
        if (fileInput) fileInput.value = ''
      } else {
        console.error('Server error response:', data)
        alert(data.error || 'Error submitting resume. Please check the server console for details.')
      }
    } catch (error) {
      console.error('Error submitting resume:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
      const errorMessage = error.message || 'Error submitting resume. Please try again.'
      alert(errorMessage)
    } finally {
      setSubmittingResume(false)
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

  if (loading) {
    return <div className="text-center py-12">Loading job details...</div>
  }

  if (!job) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h3>
        <p className="text-gray-600 mb-4">The job opportunity you're looking for doesn't exist.</p>
        <Link
          to="/jobseeker/opportunities"
          className="inline-block bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
        >
          Back to Job Listings
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
          <span className="text-emerald-800">Resume submitted successfully! The employer will review your application.</span>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="ml-auto text-emerald-600 hover:text-emerald-800"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
            {job.companyName && (
              <div className="flex items-center space-x-2 text-teal-600 mb-2">
                <Building2 className="w-5 h-5" />
                <span className="font-medium text-lg">{job.companyName}</span>
                {job.industry && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{job.industry}</span>
                  </>
                )}
              </div>
            )}
            {job.careerFairTitle && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{job.careerFairTitle}</span>
              </div>
            )}
          </div>
          <Briefcase className="w-12 h-12 text-teal-600" />
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span className="text-xl font-semibold text-gray-900">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {job.companyWebsite && (
          <div className="mb-6 pt-6 border-t border-gray-200">
            <a
              href={job.companyWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-emerald-600 font-medium"
            >
              Visit Company Website →
            </a>
          </div>
        )}

        {/* Resume Submission Section - Only for Job Seekers */}
        {user?.userType === 'jobseeker' && (
          <div className="pt-6 border-t border-gray-200">
            {!showResumeForm ? (
              <button
                onClick={() => setShowResumeForm(true)}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3 rounded-lg hover:from-teal-700 hover:to-emerald-700 flex items-center justify-center shadow-md hover:shadow-lg transition-all font-medium"
              >
                <Upload className="w-5 h-5 mr-2" />
                Submit Resume for This Position
              </button>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Submit Your Application
                </h3>
                <form onSubmit={handleResumeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume File (PDF, DOC, or DOCX)
                    </label>
                    <input
                      id="resume-file-job"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Tell the employer why you're interested in this position and what makes you a great fit..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      rows="6"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      A well-written cover letter can help you stand out from other applicants.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={submittingResume || !resumeFile}
                      className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                    >
                      {submittingResume ? (
                        'Submitting...'
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mr-2" />
                          Submit Application
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResumeForm(false)
                        setResumeFile(null)
                        setCoverLetter('')
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

