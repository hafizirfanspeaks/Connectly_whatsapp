// Frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

const Home = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
    } else {
      toast.success(`Welcome, ${authUser.username}!`, {
        description: 'You are now online',
        duration: 2000,
      });
    }
  }, [authUser, navigate]);

  if (!authUser) return null;

  return (
    <div className="flex h-screen w-full bg-whatsapp-bg overflow-hidden">
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 h-full border-r border-gray-700`}>
        <Sidebar onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      </div>
      <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} w-full md:w-2/3 lg:w-3/4 h-full`}>
        <ChatArea selectedChat={selectedChat} onBack={() => setSelectedChat(null)} />
      </div>
    </div>
  );
};

export default Home;