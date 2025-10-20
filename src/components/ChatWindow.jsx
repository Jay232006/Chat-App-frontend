import { useState } from 'react'
import MessageInput from './MessageInput'

const ChatWindow = ({ selectedChat }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hey! How are you doing?', sender: 'them', time: '2:28 PM' },
    { id: 2, text: 'I\'m doing great, thanks! How about you?', sender: 'me', time: '2:29 PM' },
    { id: 3, text: 'Pretty good! Just working on some projects.', sender: 'them', time: '2:30 PM' },
    { id: 4, text: 'That sounds interesting! What kind of projects?', sender: 'me', time: '2:30 PM' },
  ])

  const handleSendMessage = (text) => {
    const newMessage = {
      id: messages.length + 1,
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
    setMessages([...messages, newMessage])
  }

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h2 className="text-xl text-gray-600 font-medium">Select a conversation</h2>
          <p className="text-gray-500 mt-2">Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
              {selectedChat.name.charAt(0)}
            </div>
            {selectedChat.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{selectedChat.name}</h2>
            <p className="text-sm text-gray-500">{selectedChat.online ? 'Online' : 'Offline'}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.sender === 'me'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                }`}
              >
                <p className="break-words">{message.text}</p>
              </div>
              <p className={`text-xs text-gray-500 mt-1 ${message.sender === 'me' ? 'text-right' : 'text-left'}`}>
                {message.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}

export default ChatWindow
