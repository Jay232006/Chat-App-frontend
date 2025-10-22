import { useEffect, useState, useContext } from 'react';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const ChatList = ({ selectedChat, onSelectChat }) => {
  const { darkMode } = useTheme();
  const { user: authUser } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    async function loadUsers() {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${base}/api/users`, { signal: ctrl.signal });
        if (!res.ok) throw new Error('Failed to load users');
        const users = await res.json();
        // Remove the currently logged-in user from the chat list
        const visibleUsers = authUser ? users.filter(u => u._id !== authUser._id) : users;
        // map server users to UI shape
        const items = visibleUsers.map(u => ({
          id: u._id,
          name: u.username,
          lastMessage: '',
          time: '',
          unread: 0,
          online: false
        }));
        setChats(items);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
    return () => ctrl.abort();
  }, [authUser]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="w-80 p-4">Loading...</div>;
  if (error) return <div className="w-80 p-4 text-red-500">Error: {error}</div>;

  return (
    <div className={`w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h1 className={`text-2xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Messages</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.map(chat => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} cursor-pointer transition-colors ${
              selectedChat?.id === chat.id 
                ? darkMode ? 'bg-gray-700' : 'bg-blue-50' 
                : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-gray-200 font-semibold">
                  {chat.name?.charAt(0) ?? '?'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>{chat.name}</h3>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-500 text-gray-200 text-xs rounded-full">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
