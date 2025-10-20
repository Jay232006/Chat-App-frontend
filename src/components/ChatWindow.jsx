import { useState, useEffect, useRef } from 'react'
import MessageInput from './MessageInput'
import { io } from 'socket.io-client'
import { useTheme } from '../context/ThemeContext'

const ChatWindow = ({ selectedChat }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const { darkMode } = useTheme()
  const socket = useRef()
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const [currentChatId, setCurrentChatId] = useState(null)
  const [currentChat, setCurrentChat] = useState(null)
  const currentChatIdRef = useRef(null)
  
  // Initialize socket connection
  useEffect(() => {
    socket.current = io('http://localhost:5000')
    
    // Setup user connection
    if (userInfo && userInfo._id) {
      socket.current.emit('setup', userInfo)
      
      // Listen for connection confirmation
      socket.current.on('connected', () => {
        console.log('Socket connected')
      })
    }
    
    // Listen for new messages
    socket.current.on('message received', (newMessageReceived) => {
      if (currentChatIdRef.current && currentChatIdRef.current === newMessageReceived.chat._id) {
        setMessages(prev => [...prev, {
          id: newMessageReceived._id,
          text: newMessageReceived.content,
          sender: newMessageReceived.sender._id === userInfo._id ? 'me' : 'them',
          time: new Date(newMessageReceived.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        }])
      }
    })
    return () => {
      socket.current.disconnect()
    }
  }, [])
  
  // Resolve or create chat for selected contact
  useEffect(() => {
    if (!selectedChat?.id) return
    const base = 'http://localhost:5000'
    fetch(`${base}/api/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userId: selectedChat.id })
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then(chat => {
      setCurrentChat(chat)
      setCurrentChatId(chat._id)
    })
    .catch(err => {
      console.error('Error accessing chat:', err)
      setCurrentChat(null)
      setCurrentChatId(null)
      setMessages([])
    })
  }, [selectedChat])

  // Fetch messages when chatId changes
  useEffect(() => {
    if (!currentChatId) return
    setLoading(true)
    // Join this chat room
    socket.current.emit('join chat', currentChatId)
    // Fetch messages for this chat
    fetch(`http://localhost:5000/api/messages/${currentChatId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then(data => {
      if (Array.isArray(data)) {
        setMessages(data.map(msg => ({
          id: msg._id,
          text: msg.content,
          sender: msg.sender._id === userInfo._id ? 'me' : 'them',
          time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        })))
      } else {
        setMessages([])
      }
      setLoading(false)
    })
    .catch(err => {
      console.error('Error fetching messages:', err)
      setLoading(false)
      setMessages([])
    })
  }, [currentChatId])

  useEffect(() => {
    currentChatIdRef.current = currentChatId
  }, [currentChatId])

  const handleSendMessage = (text) => {
    if (!text.trim() || !currentChatId) return
    
    const currentTime = new Date()
    const timeString = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const tempId = `temp-${Date.now()}`
    const newMessage = { id: tempId, text, sender: 'me', time: timeString }
    setMessages(prev => [...prev, newMessage])
    // Send message to server
    fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ content: text, chatId: currentChatId })
    })
    .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() })
    .then(data => {
      setMessages(prev => prev.map(msg => msg.id === tempId ? {
        id: data._id || data.id,
        text: data.content,
        sender: 'me',
        time: new Date(data.createdAt || currentTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      } : msg))
      socket.current.emit('new message', data)
    })
    .catch(err => {
      console.error('Error sending message:', err)
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, failed: true } : msg))
    })
  }

  if (!selectedChat) {
    return (
      <div className={`flex-1 flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="text-center">
          <svg className={`w-24 h-24 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h2 className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Select a conversation</h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex-1 flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-gray-200 font-semibold">
              {selectedChat.name.charAt(0)}
            </div>
            {selectedChat.online && (
              <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 ${darkMode ? 'border-gray-800' : 'border-white'}`}></div>
            )}
          </div>
          <div>
            <h2 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedChat.name}</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedChat.online ? 'Online' : 'Offline'}</p>
          </div>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${darkMode ? 'border-gray-400' : 'border-gray-600'}`}></div>
          </div>
        ) : messages.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.sender === 'me'
                      ? 'bg-blue-500 text-gray-200 rounded-br-sm'
                      : darkMode 
                        ? 'bg-gray-700 text-gray-200 rounded-bl-sm border border-gray-600' 
                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                  }`}
                >
                  <p className="break-words">{message.text}</p>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 ${message.sender === 'me' ? 'text-right' : 'text-left'}`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}

export default ChatWindow
