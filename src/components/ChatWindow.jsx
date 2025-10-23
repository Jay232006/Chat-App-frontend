import React, { useState, useEffect, useRef, useContext } from 'react'
import MessageInput from './MessageInput'
import { io } from 'socket.io-client'
import { ThemeContext } from '../context/ThemeContext'
import { AuthContext } from '../context/AuthContext'
import { API_BASE_URL } from '../utils/api'

const ChatWindow = ({ selectedChat }) => {
  const { darkMode } = useContext(ThemeContext)
  const { user: authUser, token: authToken } = useContext(AuthContext)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const socket = useRef(null)
  const API_BASE = API_BASE_URL
  const token = authToken
  const userInfo = authUser

  // New / missing state and refs
  const [currentChatId, setCurrentChatId] = useState(() => {
    // Try to load saved chat ID from localStorage on initial render
    return localStorage.getItem('currentChatId') || null
  })
  const [currentChat, setCurrentChat] = useState(null)
  const currentChatIdRef = useRef(null)

  useEffect(() => {
    currentChatIdRef.current = currentChatId
  }, [currentChatId])

  // Socket init
  useEffect(() => {
    if (!token) {
      console.error('No authentication token available for socket connection');
      setError('Authentication required. Please log in again.');
      return;
    }

    let isMounted = true;
    let onMessageReceivedHandler;
    const openSocketWithFallback = async () => {
      const candidates = [
        '/websocket-connection',
        '/socket/socket.io',
        '/socket.io'
      ];

      let lastError = null;

      onMessageReceivedHandler = null;

      for (const path of candidates) {
        try {
          const s = io(API_BASE, {
            withCredentials: true,
            path,
            transports: ['polling', 'websocket'], 
            upgrade: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            auth: { token }
          });

          await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Connection timeout')), 7000);
            s.once('connect', () => { clearTimeout(timer); resolve(); });
            s.once('connect_error', (err) => { clearTimeout(timer); reject(err); });
          });

          if (!isMounted) {
            s.disconnect();
            return;
          }

          socket.current = s;
          console.log(`Socket connected successfully via path: ${path}`);

          // Set up socket event listeners for the active connection
          socket.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            setError('Failed to connect to chat server: ' + error.message);
          });

          socket.current.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
          });

          if (userInfo && socket.current) {
            socket.current.emit('setup', userInfo);
          }

          // Attach message listener after successful connection
          onMessageReceivedHandler = (newMessage) => {
            if (currentChatIdRef.current && newMessage.chat && currentChatIdRef.current === newMessage.chat._id) {
              setMessages(prev => [...prev, {
                id: newMessage._id,
                text: newMessage.content,
                sender: newMessage.sender._id === (userInfo?._id) ? 'me' : 'them',
                time: new Date(newMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }])
            }
          };
          socket.current.on('message received', onMessageReceivedHandler);

          // Connected successfully, stop trying others
          return;
        } catch (err) {
          lastError = err;
          console.warn(`Socket connect failed on path ${path}:`, err?.message || err);
          // Try next candidate path
        }
      }

      if (isMounted) {
        console.error('All socket connection attempts failed:', lastError?.message || lastError);
        setError('Failed to connect to chat server. Please try again later.');
      }
    };

    openSocketWithFallback();
    
    return () => {
      isMounted = false;
      if (socket.current) {
        if (onMessageReceivedHandler) {
          socket.current.off('message received', onMessageReceivedHandler)
        }
        socket.current.disconnect();
      }
    }
  }, [API_BASE, userInfo, token]);

  // Resolve or create chat for selected contact (POST)
  useEffect(() => {
    if (!selectedChat?.id) return
    setError(null)
    // Clear messages when switching contacts
    setMessages([])
    setCurrentChat(null)
    setCurrentChatId(null)
    localStorage.removeItem('currentChatId')
    const ctrl = new AbortController()

    async function resolveChat() {
      try {
        // First try to get existing chat
        let chat;
        // Find chat for the selected contact
        const getRes = await fetch(`${API_BASE}/api/chats`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          signal: ctrl.signal
        });
        
        if (getRes.ok) {
          const allChats = await getRes.json();
          // Find the chat with the selected contact
          chat = allChats.find(c => 
            c.users.some(u => u._id === selectedChat.id)
          );
        } else {
          console.error(`Failed to get chats: ${getRes.status}`);
        }
        
        // If no existing chat found, create a new one
        if (!chat) {
          console.log("Creating new chat with user:", selectedChat.id);
          
          if (!token) {
            throw new Error('Authentication token is missing. Please log in again.');
          }
          
          const res = await fetch(`${API_BASE}/api/chats`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: selectedChat.id }),
            signal: ctrl.signal
          });
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error(`HTTP ${res.status}:`, errorData.message || 'Unknown error');
            throw new Error(errorData.message || `Failed to create chat (${res.status})`);
          }
          chat = await res.json();
        }
        
        setCurrentChat(chat);
        setCurrentChatId(chat._id);
        
        // Store chat ID in localStorage for persistence across refreshes
        localStorage.setItem('currentChatId', chat._id);
        
        // Join the chat room via socket
        if (socket.current && chat._id) {
          socket.current.emit("join chat", chat._id);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error accessing chat:', err);
          setError(err.message || 'Failed to access chat');
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
    
    // Clear previous messages when changing chats
    setMessages([])
    
    fetch(`${API_BASE}/api/messages/${currentChatId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: ctrl.signal
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        const formattedMessages = data.map(msg => ({
          id: msg._id,
          text: msg.content,
          sender: msg.sender._id === (userInfo?._id) ? 'me' : 'them',
          senderName: msg.sender.username,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
        setMessages(formattedMessages)
        // Cache messages for this chat
        localStorage.setItem(`messages_${currentChatId}`, JSON.stringify(formattedMessages))
        setLoading(false)
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Error fetching messages:', err)
          setError('Failed to load messages: ' + err.message)
          setLoading(false)
        }
      })

    return () => ctrl.abort()
  }, [currentChatId, API_BASE, token, userInfo])

  const handleSendMessage = async (text) => {
    if (!text.trim()) return

    // Guard: ensure we have token
    if (!token) {
      setError('Authentication required. Please log in again.')
      return
    }

    let chatId = currentChatId
    if (!chatId && selectedChat?.id) {
      // resolve chat first (same as above)
      try {
        const res = await fetch(`${API_BASE}/api/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId: selectedChat.id })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const chat = await res.json()
        setCurrentChat(chat)
        setCurrentChatId(chat._id)
        chatId = chat._id
        
        // Join the chat room via socket
        if (socket.current && chat._id) {
          socket.current.emit("join chat", chat._id);
        }
      } catch (err) {
        console.error('Failed to resolve chat before sending:', err)
        setError('Could not resolve chat with the selected contact.')
        return
      }
    }

    // Guard: ensure chatId was resolved
    if (!chatId) {
      setError('No chat available to send message.')
      return
    }

    const currentTime = new Date()
    const tempId = `temp-${Date.now()}`
    const newMessage = { id: tempId, text, sender: 'me', time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, newMessage])

    try {
      // Send message to the server to store in database
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: text, chatId })
      })
      
      if (!res.ok) {
        // Try to extract error body and status for better feedback
        const status = res.status
        const errorText = await res.text().catch(() => '')
        let errorData = {}
        try { errorData = JSON.parse(errorText) } catch {}
        console.error(`Failed to send message: ${status}`, errorData || errorText)
        throw new Error(errorData.message || `Failed to send message (${status})`)
      }
      
      const data = await res.json();
      console.log("Message successfully saved to database:", data);
      
      // Update the message in the UI with the server-generated ID and timestamp
      setMessages(prev => prev.map(msg => msg.id === tempId ? {
        id: data._id || data.id,
        text: data.content,
        sender: 'me',
        time: new Date(data.createdAt || currentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } : msg));
      
      // Update localStorage with the latest messages
      const updatedMessages = (messages || []).map(msg => 
        msg.id === tempId ? {
          id: data._id || data.id,
          text: data.content,
          sender: 'me',
          time: new Date(data.createdAt || currentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } : msg
      );
      localStorage.setItem(`messages_${chatId}`, JSON.stringify(updatedMessages));
      
      // Emit the new message to other users via socket
      if (socket.current) socket.current.emit('new message', data);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, failed: true } : msg));
      // Show error to user
      setError(`Failed to send message: ${err.message}`);
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

// Message bubble component
const MessageBubble = ({ message }) => {
  const isMe = message.sender === 'me'
  
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isMe
            ? `${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`
            : darkMode
            ? 'bg-gray-700 text-gray-200'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        {/* Only show sender name for messages from others, not from current user */}
        {!isMe && message.senderName && (
          <div className="text-xs font-semibold mb-1">
            {message.senderName}
          </div>
        )}
        <p>{message.text}</p>
        <div
          className={`text-xs mt-1 text-right ${
            isMe
              ? 'text-blue-100'
              : darkMode
              ? 'text-gray-400'
              : 'text-gray-500'
          }`}
        >
          {message.time}
        </div>
      </div>
    </div>
  )
}
