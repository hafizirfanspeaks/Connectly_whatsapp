// Frontend/src/components/ChatHeader.jsx
import { FaArrowLeft, FaSearch, FaEllipsisV } from 'react-icons/fa';

const ChatHeader = ({ chat, onlineUsers, onBack, isTyping }) => {
  if (!chat) return null;
  const isOnline = onlineUsers.includes(chat._id);

  return (
    <div className="flex items-center justify-between p-3 bg-whatsapp-header border-b border-gray-700/50 shrink-0">
      <div className="flex items-center gap-3">
        {/* Back button ka touch area bada kiya (w-10 h-10) */}
        <button
          onClick={onBack}
          className="md:hidden w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-whatsapp-hover shrink-0"
        >
          <FaArrowLeft size={20} />
        </button>
        <img
          src={chat.profilePic}
          alt={chat.username}
          className="w-10 h-10 rounded-full object-cover cursor-pointer shrink-0"
        />
        <div className="cursor-pointer truncate">
          <h3 className="text-white font-medium text-[15px] truncate">{chat.username}</h3>
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
      <div className="flex items-center gap-4 text-gray-400 shrink-0">
        <FaSearch className="cursor-pointer hover:text-white transition-colors" size={18} />
        <FaEllipsisV className="cursor-pointer hover:text-white transition-colors" size={18} />
      </div>
    </div>
  );
};

export default ChatHeader;