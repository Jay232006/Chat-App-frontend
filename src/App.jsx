import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ChatPage from './pages/ChatPage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;