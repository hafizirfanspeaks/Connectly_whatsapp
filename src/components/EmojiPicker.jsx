import EmojiPickerReact from 'emoji-picker-react';
import { useEffect, useRef } from 'react';

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={pickerRef} className="absolute bottom-16 left-4 z-50">
      <EmojiPickerReact
        theme="dark"
        onEmojiClick={(emojiData) => onEmojiSelect(emojiData.emoji)}
        height={400}
        width={320}
        searchDisabled={false}
        skinTonesDisabled={false}
      />
    </div>
  );
};

export default EmojiPicker;