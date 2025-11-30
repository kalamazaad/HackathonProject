import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Users, Loader2, User } from 'lucide-react'
import { useAuth } from './context/AuthContext'

function AuthPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [activeTab, setActiveTab] = useState('login')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'jobseeker'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear messages when user types
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    // Validation
    if (activeTab === 'signup') {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields')
        setIsLoading(false)
        return
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long')
        setIsLoading(false)
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setIsLoading(false)
        return
      }
    } else {
      if (!formData.email || !formData.password) {
        setError('Please fill in all required fields')
        setIsLoading(false)
        return
      }
    }

    try {
      const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const body = activeTab === 'login' 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password, userType: formData.userType }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'An error occurred')
        setIsLoading(false)
        return
      }

      // Success
      setSuccess(data.message || (activeTab === 'login' ? 'Login successful!' : 'Account created successfully!'))
      
      // On login, save user and navigate
      if (activeTab === 'login' && data.user) {
        console.log('Login user data received:', data.user)
        login(data.user)
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      } else if (activeTab === 'signup') {
        // On signup, clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          userType: 'jobseeker'
        })
        // Switch to login tab after successful signup
        setTimeout(() => {
          setActiveTab('login')
          setSuccess('')
        }, 2000)
      } else {
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          userType: formData.userType
        })
      }
    } catch (error) {
      console.error('API Error:', error)
      setError('Network error. Please make sure the server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Branding Section - Full Page Theme */}
        <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 px-6 py-12 lg:py-0">
          <div className="text-center lg:text-left max-w-lg">
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Virtual Career Connect
            </h1>
            <p className="text-slate-700 italic text-lg mb-3">
              Access and manage your career opportunities seamlessly
            </p>
            <p className="text-slate-600 text-base italic">
              Connecting The Possibilities
            </p>
          </div>
        </div>

        {/* Login/Signup Card - Separate */}
        <div className="flex-1 flex justify-center items-center px-4 py-8 lg:py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out p-8">

          {/* Tab Switcher */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login')
                setError('')
                setSuccess('')
              }}
              className={`flex-1 py-3 text-center font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'login'
                  ? 'text-teal-600 border-b-4 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup')
                setError('')
                setSuccess('')
              }}
              className={`flex-1 py-3 text-center font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'signup'
                  ? 'text-teal-600 border-b-4 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input (Sign Up only) */}
            {activeTab === 'signup' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ease-in-out"
                  required
                />
              </div>
            )}

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ease-in-out"
                required
              />
            </div>

            {/* User Type Select (Sign Up only) */}
            {activeTab === 'signup' && (
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ease-in-out appearance-none bg-white cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="jobseeker">Job Seeker</option>
                  <option value="employer">Employer</option>
                </select>
              </div>
            )}

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={activeTab === 'signup' ? 'Password (min. 8 characters)' : 'Password'}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ease-in-out"
                required
                minLength={activeTab === 'signup' ? 8 : undefined}
              />
              {activeTab === 'signup' && formData.password && formData.password.length > 0 && (
                <p className={`text-xs mt-1 ${formData.password.length < 8 ? 'text-red-500' : 'text-green-600'}`}>
                  {formData.password.length < 8 ? `${8 - formData.password.length} more characters needed` : '✓ Password length valid'}
                </p>
              )}
            </div>

            {/* Confirm Password Input (Sign Up only) */}
            {activeTab === 'signup' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ease-in-out"
                  required
                  minLength={8}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm transition-all duration-300 ease-in-out">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm transition-all duration-300 ease-in-out">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-teal-700 hover:to-emerald-700 hover:scale-[1.01] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {activeTab === 'login' ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                activeTab === 'login' ? 'Login' : 'Sign Up'
              )}
            </button>
          </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage

