// Frontend/src/components/Message.jsx
import { useState, useRef, useEffect } from 'react';
import { FaCheck, FaCheckDouble, FaEllipsisV, FaTrash } from 'react-icons/fa';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const Message = ({ message, isMine, isReceiverOnline, currentUserId, onDelete, onReact }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const menuRef = useRef(null);

  // ✅ Click outside se menu band karein
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowReactions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!message) return null;

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // ✅ Tick Logic
  const renderTicks = () => {
    if (!isMine) return null;
    if (message.read) {
      return <FaCheckDouble size={12} className="text-sky-400" title="Read" />;
    }
    if (isReceiverOnline) {
      return <FaCheckDouble size={12} className="text-gray-300" title="Delivered" />;
    }
    return <FaCheck size={12} className="text-gray-300" title="Sent" />;
  };

  // ✅ Reactions group karein
  const getGroupedReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return [];
    const grouped = {};
    message.reactions.forEach((r) => {
      if (!grouped[r.emoji]) grouped[r.emoji] = 0;
      grouped[r.emoji]++;
    });
    return Object.entries(grouped).map(([emoji, count]) => ({ emoji, count }));
  };

  const groupedReactions = getGroupedReactions();

  // ✅ Current user ka reaction
  const myReaction = message.reactions?.find(
    (r) => r.user === currentUserId || r.user?._id === currentUserId
  );

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2 group`}>
      <div className="relative max-w-[75%]">
        <div
          className={`px-3 py-2 rounded-lg shadow-sm text-sm relative ${
            isMine
              ? 'bg-whatsapp-outgoing text-white rounded-tr-none'
              : 'bg-whatsapp-incoming text-white rounded-tl-none'
          }`}
        >
          {/* Image */}
          {message.messageType === 'image' && (
            <img
              src={message.fileUrl}
              alt="sent"
              className="max-w-full max-h-80 rounded-lg mb-1 cursor-pointer"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
          )}

          {/* Video */}
          {message.messageType === 'video' && (
            <video
              src={message.fileUrl}
              controls
              className="max-w-full max-h-80 rounded-lg mb-1"
            />
          )}

          {/* Audio */}
          {message.messageType === 'audio' && (
            <div className="flex items-center gap-3 min-w-50 mb-1">
              <audio src={message.fileUrl} controls className="w-full h-10" />
            </div>
          )}

          {/* Text */}
          {message.message && (
            <p className="wrap-break-word pr-14">{message.message}</p>
          )}

          {/* Time + Tick */}
          <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px] text-gray-300">
            <span>{time}</span>
            {renderTicks()}
          </div>
        </div>

        {/* ✅ Reactions Display */}
        {groupedReactions.length > 0 && (
          <div className={`flex gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
            {groupedReactions.map(({ emoji, count }) => (
              <button
                key={emoji}
                onClick={() => onReact(message._id, emoji)}
                className={`text-xs px-1.5 py-0.5 rounded-full border transition cursor-pointer ${
                  myReaction?.emoji === emoji
                    ? 'bg-whatsapp-primary border-whatsapp-primary text-white'
                    : 'bg-whatsapp-header border-gray-600 text-gray-300 hover:border-whatsapp-primary'
                }`}
              >
                {emoji} {count > 1 && <span className="ml-0.5">{count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* ✅ Hover Menu Button (3 dots) */}
        <div
          ref={menuRef}
          className={`absolute top-1 ${
            isMine ? '-left-8' : '-right-8'
          } ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`}
        >
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-whatsapp-header text-gray-400 hover:text-white cursor-pointer"
            title="Options"
          >
            <FaEllipsisV size={12} />
          </button>

          {/* ✅ Dropdown Menu */}
          {showMenu && (
            <div
              className={`absolute top-7 ${
                isMine ? 'left-0' : 'right-0'
              } bg-whatsapp-header border border-gray-700 rounded-lg shadow-xl z-50 w-44 overflow-hidden`}
            >
              {!showReactions ? (
                <button
                  onClick={() => setShowReactions(true)}
                  className="w-full px-3 py-2 text-left text-white text-sm hover:bg-whatsapp-hover transition cursor-pointer"
                >
                  😊 React
                </button>
              ) : (
                <div className="flex gap-1 p-2 border-b border-gray-700">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReact(message._id, emoji);
                        setShowMenu(false);
                        setShowReactions(false);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-whatsapp-hover transition text-lg cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {isMine && (
                <button
                  onClick={() => {
                    onDelete(message._id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-red-400 text-sm hover:bg-red-500/10 transition flex items-center gap-2 cursor-pointer border-t border-gray-700"
                >
                  <FaTrash size={12} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;