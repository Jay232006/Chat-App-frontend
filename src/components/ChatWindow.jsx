import React, { useState, useEffect, useRef, useContext } from 'react'
import MessageInput from './MessageInput'
import { io } from 'socket.io-client'
import { ThemeContext } from '../context/ThemeContext'

const ChatWindow = ({ selectedChat }) => {
  const { darkMode } = useContext(ThemeContext)
  // const { user: authUser } = useContext(AuthContext || React.createContext(null)) // safe fallback
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const socket = useRef(null)
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const token = localStorage.getItem('token') || null
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null') || authUser || null

  // New / missing state and refs
  const [currentChatId, setCurrentChatId] = useState(null)
  const [currentChat, setCurrentChat] = useState(null)
  const currentChatIdRef = useRef(null)

  useEffect(() => {
    currentChatIdRef.current = currentChatId
  }, [currentChatId])

  // Socket init
  useEffect(() => {
    socket.current = io(API_BASE, { withCredentials: true })
    if (userInfo && socket.current) {
      socket.current.emit('setup', userInfo)
      socket.current.on('connected', () => console.log('Socket connected'))
    }

    const onMessageReceived = (newMessage) => {
      if (currentChatIdRef.current && newMessage.chat && currentChatIdRef.current === newMessage.chat._id) {
        setMessages(prev => [...prev, {
          id: newMessage._id,
          text: newMessage.content,
          sender: newMessage.sender._id === (userInfo?._id) ? 'me' : 'them',
          time: new Date(newMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }])
      }
    }

    socket.current.on('message received', onMessageReceived)

    return () => {
      if (socket.current) {
        socket.current.off('message received', onMessageReceived)
        socket.current.disconnect()
      }
    }
  }, [API_BASE, userInfo])

  // Resolve or create chat for selected contact (POST)
  useEffect(() => {
    if (!selectedChat?.id) return
    setError(null)
    const ctrl = new AbortController()

    async function resolveChat() {
      try {
        const res = await fetch(`${API_BASE}/api/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ userId: selectedChat.id }),
          signal: ctrl.signal
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const chat = await res.json()
        setCurrentChat(chat)
        setCurrentChatId(chat._id)
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error accessing chat:', err)
          setError(err.message || 'Failed to access chat')
          setCurrentChat(null)
          setCurrentChatId(null)
          setMessages([])
        }
      }
    }

    resolveChat()
    return () => ctrl.abort()
  }, [selectedChat, API_BASE, token])

  // Fetch messages when chatId changes (GET /api/messages/:chatId)
  useEffect(() => {
    if (!currentChatId) return
    setLoading(true)
    setError(null)
    const ctrl = new AbortController()

    if (socket.current) socket.current.emit('join chat', currentChatId)

    fetch(`${API_BASE}/api/messages/${currentChatId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      signal: ctrl.signal
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
            sender: msg.sender._id === (userInfo?._id) ? 'me' : 'them',
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })))
        } else {
          setMessages([])
        }
        setLoading(false)
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Error fetching messages:', err)
          setError(err.message || 'Failed to fetch messages')
          setLoading(false)
          setMessages([])
        }
      })

    return () => ctrl.abort()
  }, [currentChatId, API_BASE, token, userInfo])

  const handleSendMessage = async (text) => {
    if (!text.trim()) return

    let chatId = currentChatId
    if (!chatId && selectedChat?.id) {
      // resolve chat first (same as above)
      try {
        const res = await fetch(`${API_BASE}/api/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ userId: selectedChat.id })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const chat = await res.json()
        setCurrentChat(chat)
        setCurrentChatId(chat._id)
        chatId = chat._id
      } catch (err) {
        console.error('Failed to resolve chat before sending:', err)
        return
      }
    }

    const currentTime = new Date()
    const tempId = `temp-${Date.now()}`
    const newMessage = { id: tempId, text, sender: 'me', time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, newMessage])

    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ content: text, chatId })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMessages(prev => prev.map(msg => msg.id === tempId ? {
        id: data._id || data.id,
        text: data.content,
        sender: 'me',
        time: new Date(data.createdAt || currentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } : msg))
      if (socket.current) socket.current.emit('new message', data)
    } catch (err) {
      console.error('Error sending message:', err)
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, failed: true } : msg))
    }
  }

  if (!selectedChat) {
    return (
      <div className={`flex-1 flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h2 className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Select a conversation</h2>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
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
              {selectedChat.name?.charAt(0)}
            </div>
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
            <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
                <div className={`px-4 py-2 rounded-2xl ${message.sender === 'me' ? 'bg-blue-500 text-gray-200' : (darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800')}`}>
                  <p className="break-words">{message.text}</p>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 ${message.sender === 'me' ? 'text-right' : 'text-left'}`}>{message.time}</p>
              </div>
            </div>
          ))
        )}
        {error && <div className="text-sm text-red-500">{error}</div>}
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}

export default ChatWindow
