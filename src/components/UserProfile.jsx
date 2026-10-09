// Frontend/src/components/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { FaSignOutAlt } from 'react-icons/fa';
import ProfileModal from './ProfileModal';

const UserProfile = () => {
  const { authUser, logout, socket } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  // ✅ Real-time: Doosre users ke profile updates sun kar sidebar refresh
  useEffect(() => {
    if (!socket) return;
    // Yeh listener Sidebar mein already hai, yahan extra kuch nahi
  }, [socket]);

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-whatsapp-header border-b border-gray-700/50">
        {/* ✅ Profile pic + name clickable */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-whatsapp-hover rounded-lg p-1 transition"
          onClick={() => setShowModal(true)}
          title="Edit Profile"
        >
          <img
            src={authUser?.profilePic}
            alt={authUser?.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-whatsapp-primary"
          />
          <div>
            <h2 className="text-white font-semibold text-sm">
              {authUser?.username}
            </h2>
            <p className="text-[10px] text-whatsapp-primary">
              Tap to edit profile
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="text-red-400 hover:text-red-300 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-red-500/10 flex items-center gap-2 text-sm font-medium"
          title="Logout"
        >
          <FaSignOutAlt size={14} />
          <span>Logout</span>
        </button>
      </div>

      {/* ✅ Profile Modal */}
      {showModal && <ProfileModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default UserProfile;