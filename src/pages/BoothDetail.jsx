import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Building2, Upload, Send, MessageSquare, FileText } from 'lucide-react'

export default function BoothDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [booth, setBooth] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [submittingResume, setSubmittingResume] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchBoothDetails()
    fetchMessages()
    const interval = setInterval(fetchMessages, 2000) // Poll for new messages
    return () => clearInterval(interval)
  }, [id])

  const fetchBoothDetails = async () => {
    try {
      const response = await fetch(`/api/booths/${id}`)
      const data = await response.json()
      setBooth(data)
    } catch (error) {
      console.error('Error fetching booth:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/booth/${id}`)
      const data = await response.json()
      setMessages(data)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boothId: parseInt(id),
          senderId: user.id,
          message: newMessage
        })
      })
      if (response.ok) {
        setNewMessage('')
        fetchMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleResumeSubmit = async (e) => {
    e.preventDefault()
    if (!resumeFile) {
      alert('Please select a resume file')
      return
    }

    setSubmittingResume(true)
    const formData = new FormData()
    formData.append('resume', resumeFile)
    formData.append('userId', user.id)
    formData.append('companyBoothId', id)

    try {
      const response = await fetch('/api/resumes/submit', {
        method: 'POST',
        body: formData
      })
      if (response.ok) {
        alert('Resume submitted successfully!')
        setResumeFile(null)
        const fileInput = document.getElementById('resume-file')
        if (fileInput) fileInput.value = ''
      } else {
        const data = await response.json()
        alert(data.error || 'Error submitting resume')
      }
    } catch (error) {
      console.error('Error submitting resume:', error)
      alert('Error submitting resume')
    } finally {
      setSubmittingResume(false)
    }
  }

  if (!booth) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Company Info & Resume Submission */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{booth.companyName}</h2>
          {booth.boothNumber && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded mb-4">
              Booth {booth.boothNumber}
            </span>
          )}
          {booth.companyDescription && (
            <p className="text-gray-700 mb-4">{booth.companyDescription}</p>
          )}
          {booth.website && (
            <a
              href={booth.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-emerald-600 hover:underline transition-colors"
            >
              Visit Website
            </a>
          )}
          {booth.industry && (
            <div className="mt-4">
              <span className="text-sm text-gray-600">Industry: </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                {booth.industry}
              </span>
            </div>
          )}
        </div>

        {/* Resume Submission */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Submit Resume
          </h3>
          <form onSubmit={handleResumeSubmit}>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="mb-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
            <button
              type="submit"
              disabled={submittingResume || !resumeFile}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg transition-all"
            >
              {submittingResume ? (
                'Submitting...'
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Submit Resume
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Live Chat */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col" style={{ height: '600px' }}>
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Live Chat
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.senderId === user.id
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-xs opacity-75 mb-1">{msg.senderName || msg.email}</div>
                <div>{msg.message}</div>
                <div className="text-xs opacity-75 mt-1">
                  {new Date(msg.sentAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 flex items-center shadow-md hover:shadow-lg transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

