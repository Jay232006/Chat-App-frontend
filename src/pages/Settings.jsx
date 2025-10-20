import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'
import api from '../utils/api'

const Settings = () => {
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const { darkMode, toggleDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // Save notification settings to localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('chatAppSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setNotifications(settings.notifications);
      setSoundEnabled(settings.soundEnabled);
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      notifications,
      soundEnabled
    };
    localStorage.setItem('chatAppSettings', JSON.stringify(settings));
    setMessage({ type: 'success', text: 'Settings saved successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDownloadData = async () => {
    try {
      setLoading(true);
      setMessage({ type: 'info', text: 'Preparing your data...' });
      
      // Get user info from localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo) {
        setMessage({ type: 'error', text: 'You must be logged in to download your data' });
        setLoading(false);
        return;
      }
      
      // Create a simple data object with user information
      const userData = {
        user: userInfo,
        settings: {
          notifications,
          soundEnabled,
          darkMode
        },
        exportDate: new Date().toISOString()
      };
      
      // Create a downloadable file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create download link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-app-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setMessage({ type: 'success', text: 'Your data has been downloaded!' });
      setLoading(false);
    } catch (error) {
      console.error('Error downloading data:', error);
      setMessage({ type: 'error', text: 'Failed to download your data. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6`}>Settings</h1>

        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' ? darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800' : 
            message.type === 'error' ? darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800' : 
            darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          <div className={`rounded-2xl shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Push Notifications</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Receive notifications about new messages</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-blue-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Sound</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Play sound for incoming messages</p>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled ? 'bg-blue-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <button 
                onClick={saveSettings}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Notification Settings
              </button>
            </div>
          </div>

          <div className={`rounded-2xl shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dark Mode</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Switch to dark theme</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className={`rounded-2xl shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Account</h2>
            <div className="space-y-3">
              <button 
                onClick={handleDownloadData}
                disabled={loading}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {loading ? 'Preparing Download...' : 'Download My Data'}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Get a copy of your personal data
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings