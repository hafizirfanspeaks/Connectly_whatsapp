import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const NotificationSound = () => {
  const { socket, authUser } = useAuthStore();
  const audioRef = useRef(null);

  useEffect(() => {
    // ✅ Audio instance create karein
    // Make sure 'notification.mp3' aapke public folder mein mojood hai
    audioRef.current = new Audio('/notification.mp3');

    if (!socket) return;

    // ✅ Naya message aane par sound play karein
    const handleNewMessage = (newMessage) => {
      // Agar message khud ka bheja hua hai, toh sound na bajayein
      if (newMessage.sender === authUser?._id) return;

      // Sound play karein (browser autoplay policy ke liye catch lagayein)
      audioRef.current.play().catch((error) => {
        console.log('Notification sound play nahi ho saki:', error);
      });
    };

    // ✅ Socket event listener lagayein
    // Note: Agar aapke backend mein event ka naam 'newMessage' ke bajaye kuch aur hai (jaise 'message received'), toh yahan change kar lein.
    socket.on('newMessage', handleNewMessage);

    // ✅ Cleanup: Component unmount hone par listener hata dein
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, authUser]);

  return null; // Yeh component kuch render nahi karta
};

export default NotificationSound;