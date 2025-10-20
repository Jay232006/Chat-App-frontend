import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/chat" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-800">Chat App</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/chat"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname === '/chat'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Messages
          </Link>
          <Link
            to="/profile"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname === '/profile'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Profile
          </Link>
          <Link
            to="/settings"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname === '/settings'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Settings
          </Link>
          <Link
            to="/"
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Logout
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
