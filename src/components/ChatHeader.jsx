// Frontend/src/components/ChatHeader.jsx
import { FaArrowLeft, FaSearch, FaEllipsisV } from 'react-icons/fa';

const ChatHeader = ({ chat, onlineUsers, onBack, isTyping }) => {
  if (!chat) return null;
  const isOnline = onlineUsers.includes(chat._id);

  return (
    <div className="flex items-center justify-between p-3 bg-whatsapp-header border-b border-gray-700/50">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <FaArrowLeft size={18} />
        </button>
        <img
          src={chat.profilePic}
          alt={chat.username}
          className="w-10 h-10 rounded-full object-cover cursor-pointer"
        />
        <div className="cursor-pointer">
          <h3 className="text-white font-medium text-sm">{chat.username}</h3>
          {isTyping ? (
            <p className="text-xs text-whatsapp-primary italic animate-pulse">
              typing...
            </p>
          ) : (
            <p className={`text-xs ${isOnline ? 'text-whatsapp-primary' : 'text-gray-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-5 text-gray-400">
        <FaSearch className="cursor-pointer hover:text-white transition-colors" size={16} />
        <FaEllipsisV className="cursor-pointer hover:text-white transition-colors" size={16} />
      </div>
    </div>
  );
};

export default ChatHeader;