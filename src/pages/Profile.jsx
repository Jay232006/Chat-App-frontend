import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import API from '../utils/api'
import { useTheme } from '../context/ThemeContext'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { darkMode } = useTheme()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  })

  useEffect(() => {
    // Get user data from localStorage
    const userInfo = localStorage.getItem('userInfo')
    const profileData = localStorage.getItem('profileData')
    
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo)
      setUser(parsedUser)
      
      // Initialize form data with user info and saved profile data if available
      if (profileData) {
        setFormData(JSON.parse(profileData))
      } else {
        setFormData({
          username: parsedUser.username || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
          location: parsedUser.location || '',
          bio: parsedUser.bio || ''
        })
      }
      
      setLoading(false)
    } else {
      setError('User not logged in')
      setLoading(false)
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('userToken')
      if (!token) {
        setError('You must be logged in to update your profile')
        return
      }

      setLoading(true)
      const response = await API.put('/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Update user state and localStorage with new data
      setUser(response.data.user)
      localStorage.setItem('userInfo', JSON.stringify(response.data.user))
      
      // Save profile data to localStorage to persist between refreshes
      localStorage.setItem('profileData', JSON.stringify(formData))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6 flex justify-center items-center">
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm p-8 mb-6`}>
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
                {getInitials(user?.username)}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full text-gray-200 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user?.username}</h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user?.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 ${darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-700'} rounded-full text-sm font-medium`}>
                Online
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter your location"
                    className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Bio</label>
              <textarea
                rows="4"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself"
                className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div className="flex gap-4">
              <button 
                type="submit"
                className="px-6 py-2 bg-blue-500 text-gray-200 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Save Changes
              </button>
              <button 
                type="button"
                className={`px-6 py-2 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg transition-colors font-medium`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile