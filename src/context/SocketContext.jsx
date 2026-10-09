import { createContext, useEffect, useContext, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthStore();

  useEffect(() => {
    // Agar user login nahi hai, toh socket connect karne ki zaroorat nahi
    if (!authUser) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // ✅ Backend URL (Vercel)
    const newSocket = io('https://whats-app-irfan.vercel.app', {
      query: { userId: authUser._id },
      withCredentials: true,
      transports: ['websocket', 'polling'], // Vercel ke liye yeh zaroori hai
    });

    setSocket(newSocket);
    newSocket.emit('addUser', authUser._id);

    // ✅ Real-time online users update
    newSocket.on('getOnlineUsers', (users) => {
      setOnlineUsers(users);
    });

    // Cleanup function
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [authUser]); // Sirf authUser par depend karega

  return (
    // ✅ FIX: value={{}} ki jagah socket aur onlineUsers pass karein
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};