import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
  const location = useLocation()
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <nav className={`${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'} border-b px-6 py-4 transition-colors`}>
      <div className="flex items-center justify-between">
        <Link to="/chat" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Chat App</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-200 transition-colors"
            aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          <Link
            to="/chat"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname === '/chat'
                ? darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-600'
                : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Messages
          </Link>
          <Link
            to="/profile"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname === '/profile'
                ? darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-600'
                : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Profile
          </Link>
          <Link
            to="/settings"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              location.pathname === '/settings'
                ? darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-600'
                : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Settings
          </Link>
          <Link
            to="/"
            className={`px-4 py-2 font-medium transition-colors ${
              darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Logout
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
