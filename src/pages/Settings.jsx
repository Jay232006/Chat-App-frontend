import { useState } from 'react'
import Navbar from '../components/Navbar'

const Settings = () => {
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Receive notifications about new messages</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-blue-500' : 'bg-gray-300'
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
                  <h3 className="font-medium text-gray-800">Sound</h3>
                  <p className="text-sm text-gray-600">Play sound for incoming messages</p>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Dark Mode</h3>
                <p className="text-sm text-gray-600">Switch to dark theme</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-500' : 'bg-gray-300'
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

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Privacy & Security</h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <h3 className="font-medium text-gray-800">Blocked Users</h3>
                <p className="text-sm text-gray-600">Manage blocked contacts</p>
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <h3 className="font-medium text-gray-800">Privacy Settings</h3>
                <p className="text-sm text-gray-600">Control who can see your information</p>
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <h3 className="font-medium text-gray-800">Change Password</h3>
                <p className="text-sm text-gray-600">Update your account password</p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account</h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <h3 className="font-medium text-gray-800">Download My Data</h3>
                <p className="text-sm text-gray-600">Request a copy of your data</p>
              </button>
              <button className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <h3 className="font-medium text-red-600">Delete Account</h3>
                <p className="text-sm text-red-500">Permanently delete your account</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings