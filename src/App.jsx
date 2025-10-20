import { useState } from 'react'
import ChatList from './components/ChatList'
import ChatWindow from './components/ChatWindow'

function App() {
  const [selectedChat, setSelectedChat] = useState(null)

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatList 
        selectedChat={selectedChat} 
        onSelectChat={setSelectedChat} 
      />
      <ChatWindow selectedChat={selectedChat} />
    </div>
  )
}

export default App
