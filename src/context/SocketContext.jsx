// import { createContext, useEffect, useContext } from 'react';
// import { io } from 'socket.io-client';
// import { useAuthStore } from '../store/useAuthStore';

// const SocketContext = createContext();

// export const useSocket = () => useContext(SocketContext);

// export const SocketProvider = ({ children }) => {
//   const { authUser, setOnlineUsers, setSocket } = useAuthStore();

//   useEffect(() => {
//     if (!authUser) return;

//     // ✅ Backend URL (apna .env se lein)
//     const socket = io('http://localhost:5000', {
//       query: { userId: authUser._id },
//       withCredentials: true,
//     });

//     setSocket(socket);
//     socket.emit('addUser', authUser._id);

//     // ✅ Real-time online users update
//     socket.on('getOnlineUsers', (users) => {
//       setOnlineUsers(users);
//     });

//     return () => {
//       socket.disconnect();
//       setSocket(null);
//     };
//   }, [authUser, setOnlineUsers, setSocket]);

//   return (
//     <SocketContext.Provider value={{}}>
//       {children}
//     </SocketContext.Provider>
//   );
// };