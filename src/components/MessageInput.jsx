// Frontend/src/components/MessageInput.jsx
import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSmile, FaMicrophone, FaImage, FaTimes, FaStop } from 'react-icons/fa';
import EmojiPicker from './EmojiPicker';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore'; // ✅ NAYA

const MessageInput = ({ onSend, loading, chatId }) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const typingTimeoutRef = useRef(null); // ✅ NAYA

  // ✅ Socket aur authUser nikalain
  const { socket, authUser } = useAuthStore();

  // ✅ Typing event emit karne wala function
  const handleTyping = (value) => {
    setText(value);

    if (!socket || !authUser || !chatId) return;

    // Emit 'typing'
    socket.emit('typing', {
      senderId: authUser._id,
      receiverId: chatId,
    });

    // Purana timeout clear karein
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // 1.5s ke baad 'stopTyping' emit karein
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', {
        senderId: authUser._id,
        receiverId: chatId,
      });
    }, 1500);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Emoji select
  const handleEmojiSelect = (emoji) => {
    const newText = text + emoji;
    setText(newText);
  };

  // File select
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large. Max 50MB allowed.');
      return;
    }
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Voice recording (same as before)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        onSend({ file: audioFile, text: '' });
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    if (selectedFile) {
      onSend({ file: selectedFile, text: text.trim() });
      setText('');
      clearFile();
      return;
    }
    if (!text.trim()) return;
    onSend({ text: text.trim(), file: null });
    setText('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="relative bg-whatsapp-header border-t border-gray-700/50">
      {filePreview && (
        <div className="p-3 border-b border-gray-700/50 flex items-center gap-3">
          <div className="relative">
            {selectedFile?.type.startsWith('image/') ? (
              <img src={filePreview} alt="preview" className="w-20 h-20 object-cover rounded-lg" />
            ) : (
              <video src={filePreview} className="w-20 h-20 object-cover rounded-lg" />
            )}
          </div>
          <p className="text-white text-sm flex-1 truncate">{selectedFile?.name}</p>
          <button type="button" onClick={clearFile} className="text-red-400 hover:text-red-300 cursor-pointer p-2">
            <FaTimes />
          </button>
        </div>
      )}

      {isRecording && (
        <div className="p-3 bg-red-500/10 border-b border-red-500/30 flex items-center gap-3">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          <p className="text-red-400 font-medium text-sm flex-1">
            Recording... {formatTime(recordingTime)}
          </p>
          <button type="button" onClick={cancelRecording} className="text-gray-400 hover:text-white cursor-pointer p-2">
            <FaTimes />
          </button>
          <button type="button" onClick={stopRecording} className="text-red-400 hover:text-red-300 cursor-pointer p-2">
            <FaStop />
          </button>
        </div>
      )}

      {showEmoji && (
        <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
      )}

      <form onSubmit={handleSubmit} className="px-3 py-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEmoji(!showEmoji)}
          className="text-gray-400 hover:text-yellow-400 cursor-pointer p-2 rounded-full transition-colors"
          title="Emoji"
        >
          <FaSmile size={22} />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-whatsapp-primary cursor-pointer p-2 rounded-full transition-colors"
          title="Send Image/Video"
        >
          <FaImage size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* ✅ TEXT INPUT: onChange={handleTyping} use karein */}
        <input
          type="text"
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message"
          disabled={isRecording}
          className="flex-1 px-4 py-2 bg-whatsapp-hover text-white text-sm rounded-full focus:outline-none placeholder-gray-500 disabled:opacity-50"
        />

        {text.trim() || selectedFile ? (
          <button
            type="submit"
            disabled={loading}
            className="w-10 h-10 bg-whatsapp-primary hover:bg-emerald-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 cursor-pointer transition-all"
            title="Send"
          >
            <FaPaperPlane size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white cursor-pointer transition-all ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-whatsapp-primary hover:bg-emerald-600'
            }`}
            title={isRecording ? 'Stop Recording' : 'Record Voice'}
          >
            <FaMicrophone size={16} />
          </button>
        )}
      </form>
    </div>
  );
};

export default MessageInput;