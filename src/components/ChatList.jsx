import { useState } from 'react'

const ChatList = ({ selectedChat, onSelectChat }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const mockChats = [
    { id: 1, name: 'John Doe', lastMessage: 'Hey, how are you?', time: '2:30 PM', unread: 2, online: true },
    { id: 2, name: 'Jane Smith', lastMessage: 'See you tomorrow!', time: '1:15 PM', unread: 0, online: true },
    { id: 3, name: 'Mike Johnson', lastMessage: 'Thanks for the help', time: '12:45 PM', unread: 1, online: false },
    { id: 4, name: 'Sarah Williams', lastMessage: 'That sounds great', time: 'Yesterday', unread: 0, online: false },
    { id: 5, name: 'Team Chat', lastMessage: 'Meeting at 3 PM', time: 'Yesterday', unread: 5, online: false },
  ]

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Messages</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.map(chat => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
              selectedChat?.id === chat.id ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {chat.name.charAt(0)}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-800 truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-500">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
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
  )
}

export default ChatList
