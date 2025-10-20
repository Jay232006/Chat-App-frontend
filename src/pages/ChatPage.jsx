import { useState } from 'react'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow'
import Navbar from '../components/Navbar'

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null)

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <ChatList 
          selectedChat={selectedChat} 
          onSelectChat={setSelectedChat} 
        />
        <ChatWindow selectedChat={selectedChat} />
      </div>
    </div>
  )
}

export default ChatPage
