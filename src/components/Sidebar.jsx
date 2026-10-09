// Frontend/src/components/Sidebar.jsx
import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useAuthStore } from '../store/useAuthStore';
import SearchBar from './SearchBar';
import UserProfile from './UserProfile';

const Sidebar = ({ onSelectChat, selectedChat }) => {
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { authUser, onlineUsers, socket } = useAuthStore();

  // ✅ Fetch users + conversations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, convsRes] = await Promise.all([
          axios.get('/users'),
          axios.get('/messages/conversations'),
        ]);

        const filtered = usersRes.data.filter((u) => u._id !== authUser?._id);
        setUsers(filtered);

        const convMap = {};
        convsRes.data.forEach((c) => {
          convMap[c.userId] = {
            lastMessage: c.lastMessage,
            unreadCount: c.unreadCount,
          };
        });
        setConversations(convMap);
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (authUser) fetchData();
  }, [authUser]);

  // ✅ Real-time: Naya message aaye toh conversations update karein
  useEffect(() => {
    if (!socket || !authUser) return;

    const handleNewMessage = (newMessage) => {
      if (
        newMessage.sender !== authUser._id &&
        newMessage.receiver !== authUser._id
      )
        return;

      const otherUserId =
        newMessage.sender === authUser._id
          ? newMessage.receiver
          : newMessage.sender;

      setConversations((prev) => {
        const existing = prev[otherUserId] || { unreadCount: 0 };
        const isIncoming = newMessage.sender !== authUser._id;
        const isCurrentChatOpen = selectedChat?._id === otherUserId;

        return {
          ...prev,
          [otherUserId]: {
            lastMessage: newMessage,
            unreadCount:
              isIncoming && !isCurrentChatOpen
                ? (existing.unreadCount || 0) + 1
                : 0,
          },
        };
      });
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, authUser, selectedChat]);

  // ✅ NEW: Real-time profile update (doosre users ka)
  useEffect(() => {
    if (!socket) return;

    const handleUserUpdated = (updatedUser) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === updatedUser._id ? { ...u, ...updatedUser } : u
        )
      );
      console.log(`🔄 User updated: ${updatedUser.username}`);
    };

    socket.on('userUpdated', handleUserUpdated);
    return () => socket.off('userUpdated', handleUserUpdated);
  }, [socket]);

  // ✅ Jab chat select ho, unread count reset karein
  useEffect(() => {
    if (!selectedChat?._id) return;
    setConversations((prev) => {
      if (!prev[selectedChat._id]) return prev;
      return {
        ...prev,
        [selectedChat._id]: { ...prev[selectedChat._id], unreadCount: 0 },
      };
    });
  }, [selectedChat]);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const getPreviewText = (msg) => {
    if (!msg) return 'Tap to start chatting';
    if (msg.messageType === 'image') return '📷 Photo';
    if (msg.messageType === 'video') return '🎥 Video';
    if (msg.messageType === 'audio') return '🎤 Voice message';
    return msg.message || 'Message';
  };

  const getTime = (msg) => {
    if (!msg?.createdAt) return '';
    const date = new Date(msg.createdAt);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex flex-col h-full bg-whatsapp-panel w-full">
      <UserProfile />
      <div className="p-2 border-b border-gray-700/50">
        <SearchBar search={search} setSearch={setSearch} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-4 border-whatsapp-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-sm">No users found</p>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const isSelected = selectedChat?._id === user._id;
            const conv = conversations[user._id];
            const lastMsg = conv?.lastMessage;
            const unreadCount = conv?.unreadCount || 0;

            return (
              <div
                key={user._id}
                onClick={() => onSelectChat(user)}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors duration-200 ${
                  isSelected ? 'bg-whatsapp-hover' : 'hover:bg-whatsapp-header'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={user.profilePic}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-whatsapp-primary border-2 border-whatsapp-panel rounded-full"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0 border-b border-gray-700/30 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-white font-medium text-sm truncate">
                      {user.username}
                    </h3>
                    {lastMsg && (
                      <span className="text-[10px] text-gray-500 shrink-0">
                        {getTime(lastMsg)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-gray-400 truncate">
                      {getPreviewText(lastMsg)}
                    </p>

                    {unreadCount > 0 && (
                      <span className="shrink-0 bg-whatsapp-primary text-white text-[10px] font-bold rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1.5">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;