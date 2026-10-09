// // Frontend/src/store/useAuthStore.js
// import { create } from 'zustand';
// import { io } from 'socket.io-client';

// const BASE_URL = 'http://localhost:5000';

// export const useAuthStore = create((set, get) => ({
//   authUser: JSON.parse(localStorage.getItem('authUser')) || null,
//   token: localStorage.getItem('token') || null,
//   onlineUsers: [],
//   socket: null,

//   setAuthUser: (user) => {
//     localStorage.setItem('authUser', JSON.stringify(user));
//     set({ authUser: user });
//   },

//   setToken: (token) => {
//     localStorage.setItem('token', token);
//     set({ token });
//   },

//   setOnlineUsers: (users) => set({ onlineUsers: users }),

//   // ✅ NAYA: User ko update karein (localStorage + store)
//   updateUser: (updatedUser) => {
//     localStorage.setItem('authUser', JSON.stringify(updatedUser));
//     set({ authUser: updatedUser });
//   },

//   connectSocket: () => {
//     const { authUser } = get();
//     if (!authUser || get().socket?.connected) return;

//     const socket = io(BASE_URL, {
//       query: { userId: authUser._id },
//     });

//     socket.connect();
//     set({ socket });

//     socket.on('getOnlineUsers', (userIds) => {
//       set({ onlineUsers: userIds });
//     });
//   },

//   disconnectSocket: () => {
//     if (get().socket?.connected) get().socket.disconnect();
//     set({ socket: null });
//   },

//   logout: () => {
//     get().disconnectSocket();
//     localStorage.removeItem('authUser');
//     localStorage.removeItem('token');
//     set({ authUser: null, token: null, onlineUsers: [], socket: null });
//   },
// }));

// Frontend/src/store/useAuthStore.js
import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  authUser: JSON.parse(localStorage.getItem('authUser')) || null,
  token: localStorage.getItem('token') || null,
  onlineUsers: [], // Ise SocketContext update karega

  setAuthUser: (user) => {
    localStorage.setItem('authUser', JSON.stringify(user));
    set({ authUser: user });
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  // ✅ User ko update karein (localStorage + store)
  updateUser: (updatedUser) => {
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
    set({ authUser: updatedUser });
  },

  logout: () => {
    localStorage.removeItem('authUser');
    localStorage.removeItem('token');
    set({ authUser: null, token: null, onlineUsers: [] });
  },
}));