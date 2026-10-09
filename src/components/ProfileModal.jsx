// Frontend/src/components/ProfileModal.jsx
import { useState, useRef } from 'react';
import axios from '../utils/axios';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';
import { FaTimes, FaCamera, FaSave } from 'react-icons/fa';

const ProfileModal = ({ onClose }) => {
  const { authUser, updateUser } = useAuthStore();
  const [username, setUsername] = useState(authUser?.username || '');
  const [preview, setPreview] = useState(authUser?.profilePic || '');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ File select
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB allowed.');
      return;
    }

    if (!selected.type.startsWith('image/')) {
      toast.error('Only images are allowed');
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  // ✅ Save handler
  const handleSave = async () => {
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('username', username.trim());
      if (file) formData.append('profilePic', file);

      const res = await axios.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // ✅ Store update karein
      updateUser(res.data);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-100 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-whatsapp-header rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-white font-semibold text-lg">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white cursor-pointer p-1 rounded-full hover:bg-whatsapp-hover transition"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center gap-5">
          {/* Avatar with camera overlay */}
          <div className="relative">
            <img
              src={preview}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-whatsapp-primary"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-10 h-10 bg-whatsapp-primary hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer transition"
              title="Change Photo"
            >
              <FaCamera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Username input */}
          <div className="w-full">
            <label className="block text-gray-400 text-xs mb-2 font-medium">
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-whatsapp-panel text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary placeholder-gray-500"
              placeholder="Enter your username"
            />
          </div>

          {/* Email (read-only) */}
          <div className="w-full">
            <label className="block text-gray-400 text-xs mb-2 font-medium">
              EMAIL
            </label>
            <input
              type="text"
              value={authUser?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-whatsapp-panel text-gray-500 rounded-lg cursor-not-allowed"
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-whatsapp-primary hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <FaSave size={14} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;