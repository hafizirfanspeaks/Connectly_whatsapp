// // Frontend/src/components/ChatArea.jsx
// import { useState, useEffect, useRef } from 'react';
// import axios from '../utils/axios';
// import { useAuthStore } from '../store/useAuthStore';
// import { toast } from 'sonner';
// import ChatHeader from './ChatHeader';
// import Message from './Message';
// import MessageInput from './MessageInput';

// const ChatArea = ({ selectedChat, onBack }) => {
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const { authUser, onlineUsers, socket } = useAuthStore();
//   const messagesEndRef = useRef(null);

//   const safeMessages = Array.isArray(messages) ? messages : [];
//   const isReceiverOnline = selectedChat ? onlineUsers.includes(selectedChat._id) : false;

//   // ✅ Fetch messages + Mark as read
//   useEffect(() => {
//     if (!selectedChat?._id || !authUser?._id) return;
//     const fetchMessages = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(`/messages/${selectedChat._id}`);
//         setMessages(Array.isArray(res.data) ? res.data : []);
//         await axios.put(`/messages/read/${selectedChat._id}`);
//         if (socket) {
//           socket.emit('messageRead', {
//             senderId: selectedChat._id,
//             receiverId: authUser._id,
//           });
//         }
//       } catch (error) {
//         console.error('Fetch messages error:', error);
//         setMessages([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMessages();
//   }, [selectedChat?._id, authUser?._id, socket]);

//   // ✅ messagesMarkedAsRead
//   useEffect(() => {
//     if (!socket) return;
//     const handleMessagesRead = ({ by }) => {
//       setMessages((prev) =>
//         (Array.isArray(prev) ? prev : []).map((msg) =>
//           msg.receiver === by ? { ...msg, read: true } : msg
//         )
//       );
//     };
//     socket.on('messagesMarkedAsRead', handleMessagesRead);
//     return () => socket.off('messagesMarkedAsRead', handleMessagesRead);
//   }, [socket]);

//   // ✅ newMessage listener
//   useEffect(() => {
//     if (!socket || !selectedChat) return;
//     const handleNewMessage = (newMessage) => {
//       if (
//         newMessage.sender === selectedChat._id ||
//         newMessage.receiver === selectedChat._id
//       ) {
//         setMessages((prev) => [...(Array.isArray(prev) ? prev : []), newMessage]);
//         if (newMessage.sender === selectedChat._id) {
//           setIsTyping(false);
//           axios.put(`/messages/read/${selectedChat._id}`);
//           socket.emit('messageRead', {
//             senderId: selectedChat._id,
//             receiverId: authUser._id,
//           });
//         }
//       }
//     };
//     socket.on('newMessage', handleNewMessage);
//     return () => socket.off('newMessage', handleNewMessage);
//   }, [socket, selectedChat, authUser]);

//   // ✅ messageDeleted listener
//   useEffect(() => {
//     if (!socket) return;
//     const handleMessageDeleted = ({ messageId }) => {
//       setMessages((prev) =>
//         (Array.isArray(prev) ? prev : []).filter((m) => m._id !== messageId)
//       );
//     };
//     socket.on('messageDeleted', handleMessageDeleted);
//     return () => socket.off('messageDeleted', handleMessageDeleted);
//   }, [socket]);

//   // ✅ messageReaction listener
//   useEffect(() => {
//     if (!socket) return;
//     const handleMessageReaction = ({ messageId, reactions }) => {
//       setMessages((prev) =>
//         (Array.isArray(prev) ? prev : []).map((m) =>
//           m._id === messageId ? { ...m, reactions } : m
//         )
//       );
//     };
//     socket.on('messageReaction', handleMessageReaction);
//     return () => socket.off('messageReaction', handleMessageReaction);
//   }, [socket]);

//   // ✅ userTyping listeners
//   useEffect(() => {
//     if (!socket || !selectedChat) return;
//     const handleUserTyping = ({ senderId }) => {
//       if (senderId === selectedChat._id) setIsTyping(true);
//     };
//     const handleUserStopTyping = ({ senderId }) => {
//       if (senderId === selectedChat._id) setIsTyping(false);
//     };
//     socket.on('userTyping', handleUserTyping);
//     socket.on('userStopTyping', handleUserStopTyping);
//     return () => {
//       socket.off('userTyping', handleUserTyping);
//       socket.off('userStopTyping', handleUserStopTyping);
//       setIsTyping(false);
//     };
//   }, [socket, selectedChat]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [safeMessages, isTyping]);

//   // ✅ Delete handler
//   const handleDeleteMessage = async (messageId) => {
//     try {
//       await axios.delete(`/messages/${messageId}`);
//       setMessages((prev) => prev.filter((m) => m._id !== messageId));
//       toast.success('Message deleted');
//     } catch (error) {
//       console.error('Delete error:', error);
//       toast.error('Failed to delete message');
//     }
//   };

//   // ✅ Reaction handler
//   const handleReact = async (messageId, emoji) => {
//     try {
//       const res = await axios.put(`/messages/react/${messageId}`, { emoji });
//       setMessages((prev) =>
//         prev.map((m) =>
//           m._id === messageId ? { ...m, reactions: res.data.reactions } : m
//         )
//       );
//     } catch (error) {
//       console.error('Reaction error:', error);
//       toast.error('Failed to react');
//     }
//   };

//   const handleSendMessage = async ({ text, file }) => {
//     if (!selectedChat?._id) return;
//     try {
//       if (socket) {
//         socket.emit('stopTyping', {
//           senderId: authUser._id,
//           receiverId: selectedChat._id,
//         });
//       }
//       const formData = new FormData();
//       formData.append('receiverId', selectedChat._id);
//       if (text) formData.append('text', text);
//       if (file) formData.append('file', file);
//       const res = await axios.post('/messages', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       setMessages((prev) => [...(Array.isArray(prev) ? prev : []), res.data]);
//     } catch (error) {
//       console.error('Send message error:', error);
//       toast.error('Failed to send message');
//     }
//   };

//   if (!selectedChat) {
//     return (
//       <div className="flex-1 flex flex-col items-center justify-center bg-whatsapp-bg p-8 border-l border-gray-700/50">
//         <div className="text-center">
//           <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-whatsapp-header flex items-center justify-center">
//             <span className="text-4xl">💬</span>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-400 mb-2">WhatsApp Clone</h2>
//           <p className="text-gray-500 text-sm">Select a chat to start messaging</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full bg-whatsapp-bg w-full">
//       <ChatHeader
//         chat={selectedChat}
//         onlineUsers={onlineUsers}
//         onBack={onBack}
//         isTyping={isTyping}
//       />
//       <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
//         {loading ? (
//           <div className="flex justify-center py-10">
//             <div className="w-8 h-8 border-4 border-whatsapp-primary border-t-transparent rounded-full animate-spin"></div>
//           </div>
//         ) : safeMessages.length === 0 ? (
//           <div className="flex justify-center py-10">
//             <p className="text-gray-500 text-sm bg-whatsapp-header px-4 py-2 rounded-lg">
//               No messages yet. Say hi! 👋
//             </p>
//           </div>
//         ) : (
//           safeMessages.map((msg) => (
//             <Message
//               key={msg._id}
//               message={msg}
//               isMine={msg.sender === authUser?._id}
//               isReceiverOnline={isReceiverOnline}
//               currentUserId={authUser?._id}
//               onDelete={handleDeleteMessage}
//               onReact={handleReact}
//             />
//           ))
//         )}
//         <div ref={messagesEndRef} />
//       </div>
//       <MessageInput
//         onSend={handleSendMessage}
//         loading={loading}
//         chatId={selectedChat._id}
//       />
//     </div>
//   );
// };

// export default ChatArea;
// Frontend/src/components/ChatArea.jsx
import { useState, useEffect, useRef } from 'react';
import axios from '../utils/axios';
import { useAuthStore } from '../store/useAuthStore';
import { useSocket } from '../context/SocketContext';   // ✅ YEH LINE ADD KAREIN
import { toast } from 'sonner';
import ChatHeader from './ChatHeader';
import Message from './Message';
import MessageInput from './MessageInput';

const ChatArea = ({ selectedChat, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { authUser } = useAuthStore();                    // ✅ Sirf authUser
  const { socket, onlineUsers } = useSocket();           // ✅ Socket + onlineUsers
  const messagesEndRef = useRef(null);

  // ⬇️ NEECHE KA POORA CODE BILKUL WAHI RAHEGA JO AAPNE BHEJA THA
  const safeMessages = Array.isArray(messages) ? messages : [];
  const isReceiverOnline = selectedChat ? onlineUsers.includes(selectedChat._id) : false;

  useEffect(() => {
    if (!selectedChat?._id || !authUser?._id) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/messages/${selectedChat._id}`);
        setMessages(Array.isArray(res.data) ? res.data : []);
        await axios.put(`/messages/read/${selectedChat._id}`);
        if (socket) {
          socket.emit('messageRead', {
            senderId: selectedChat._id,
            receiverId: authUser._id,
          });
        }
      } catch (error) {
        console.error('Fetch messages error:', error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedChat?._id, authUser?._id, socket]);

  useEffect(() => {
    if (!socket) return;
    const handleMessagesRead = ({ by }) => {
      setMessages((prev) =>
        (Array.isArray(prev) ? prev : []).map((msg) =>
          msg.receiver === by ? { ...msg, read: true } : msg
        )
      );
    };
    socket.on('messagesMarkedAsRead', handleMessagesRead);
    return () => socket.off('messagesMarkedAsRead', handleMessagesRead);
  }, [socket]);

  useEffect(() => {
    if (!socket || !selectedChat) return;
    const handleNewMessage = (newMessage) => {
      if (
        newMessage.sender === selectedChat._id ||
        newMessage.receiver === selectedChat._id
      ) {
        setMessages((prev) => [...(Array.isArray(prev) ? prev : []), newMessage]);
        if (newMessage.sender === selectedChat._id) {
          setIsTyping(false);
          axios.put(`/messages/read/${selectedChat._id}`);
          socket.emit('messageRead', {
            senderId: selectedChat._id,
            receiverId: authUser._id,
          });
        }
      }
    };
    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, selectedChat, authUser]);

  useEffect(() => {
    if (!socket) return;
    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        (Array.isArray(prev) ? prev : []).filter((m) => m._id !== messageId)
      );
    };
    socket.on('messageDeleted', handleMessageDeleted);
    return () => socket.off('messageDeleted', handleMessageDeleted);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handleMessageReaction = ({ messageId, reactions }) => {
      setMessages((prev) =>
        (Array.isArray(prev) ? prev : []).map((m) =>
          m._id === messageId ? { ...m, reactions } : m
        )
      );
    };
    socket.on('messageReaction', handleMessageReaction);
    return () => socket.off('messageReaction', handleMessageReaction);
  }, [socket]);

  useEffect(() => {
    if (!socket || !selectedChat) return;
    const handleUserTyping = ({ senderId }) => {
      if (senderId === selectedChat._id) setIsTyping(true);
    };
    const handleUserStopTyping = ({ senderId }) => {
      if (senderId === selectedChat._id) setIsTyping(false);
    };
    socket.on('userTyping', handleUserTyping);
    socket.on('userStopTyping', handleUserStopTyping);
    return () => {
      socket.off('userTyping', handleUserTyping);
      socket.off('userStopTyping', handleUserStopTyping);
      setIsTyping(false);
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [safeMessages, isTyping]);

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleReact = async (messageId, emoji) => {
    try {
      const res = await axios.put(`/messages/react/${messageId}`, { emoji });
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, reactions: res.data.reactions } : m
        )
      );
    } catch (error) {
      console.error('Reaction error:', error);
      toast.error('Failed to react');
    }
  };

  const handleSendMessage = async ({ text, file }) => {
    if (!selectedChat?._id) return;
    try {
      if (socket) {
        socket.emit('stopTyping', {
          senderId: authUser._id,
          receiverId: selectedChat._id,
        });
      }
      const formData = new FormData();
      formData.append('receiverId', selectedChat._id);
      if (text) formData.append('text', text);
      if (file) formData.append('file', file);
      const res = await axios.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessages((prev) => [...(Array.isArray(prev) ? prev : []), res.data]);
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-whatsapp-bg p-8 border-l border-gray-700/50">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-whatsapp-header flex items-center justify-center">
            <span className="text-4xl">💬</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-400 mb-2">WhatsApp Clone</h2>
          <p className="text-gray-500 text-sm">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-whatsapp-bg w-full">
      <ChatHeader
        chat={selectedChat}
        onlineUsers={onlineUsers}
        onBack={onBack}
        isTyping={isTyping}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-whatsapp-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : safeMessages.length === 0 ? (
          <div className="flex justify-center py-10">
            <p className="text-gray-500 text-sm bg-whatsapp-header px-4 py-2 rounded-lg">
              No messages yet. Say hi! 👋
            </p>
          </div>
        ) : (
          safeMessages.map((msg) => (
            <Message
              key={msg._id}
              message={msg}
              isMine={msg.sender === authUser?._id}
              isReceiverOnline={isReceiverOnline}
              currentUserId={authUser?._id}
              onDelete={handleDeleteMessage}
              onReact={handleReact}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput
        onSend={handleSendMessage}
        loading={loading}
        chatId={selectedChat._id}
      />
    </div>
  );
};

export default ChatArea;