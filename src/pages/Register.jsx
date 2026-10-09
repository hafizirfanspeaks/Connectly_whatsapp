import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'sonner';
import { FaWhatsapp, FaUser, FaEnvelope, FaLock, FaCamera } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setProgress(0);

    const loadingToast = toast.loading('Creating your Connectly account...');

    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    if (image) data.append('profilePic', image);

    // ✅ Simulated Progress Logic
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 5) + 2;
      if (currentProgress >= 95) {
        currentProgress = 95;
        clearInterval(interval);
      }
      setProgress(currentProgress);
    }, 200);

    try {
      await axios.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (percentCompleted > currentProgress) {
            currentProgress = percentCompleted;
            setProgress(percentCompleted);
          }
        },
      });

      clearInterval(interval);
      setProgress(100);
      toast.success('Account created! Please login.', { id: loadingToast });

      setTimeout(() => navigate('/login'), 1500);

    } catch (error) {
      clearInterval(interval);
      toast.error(error.response?.data?.message || 'Registration failed', {
        id: loadingToast,
      });
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ FIX: 'h-screen overflow-y-auto' ensures scroll works independently
    // 'flex-col' pushes the footer down naturally
    <div className="h-screen w-full overflow-y-auto flex flex-col bg-linear-to-br from-gray-900 via-gray-800 to-black">
      
      {/* ✅ FIX: 'flex-1' replaces 'flex-grow'. It centers the card vertically 
          and allows scrolling if content overflows */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 py-10">
        
        <div className="max-w-md w-full bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
          
          <div className="flex flex-col items-center mb-6">
            <FaWhatsapp className="text-6xl text-whatsapp-primary mb-2" />
            <h2 className="text-2xl font-bold text-white text-center">Join Connectly</h2>
            <p className="text-gray-400 text-sm mt-1 text-center">Create an account to start chatting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile Picture Upload */}
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-whatsapp-primary bg-gray-900/50 flex items-center justify-center cursor-pointer group">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaCamera className="text-gray-500 text-2xl group-hover:text-white transition-colors" />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
            </div>

            {/* Inputs */}
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Username" 
                value={formData.username} 
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary transition-all" 
                onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                required 
              />
            </div>
            
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                placeholder="Email address" 
                value={formData.email} 
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary transition-all" 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                required 
              />
            </div>
            
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                placeholder="Password" 
                value={formData.password} 
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary transition-all" 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 bg-whatsapp-primary hover:bg-emerald-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? `Creating account... ${progress}%` : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm sm:text-base">
            Already have an account?{' '}
            <Link to="/login" className="text-whatsapp-primary hover:underline font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Footer / Reserved Message */}
      {/* ✅ FIX: Simple padding instead of mt-8 to ensure it stays at bottom without breaking scroll */}
      <div className="text-center text-gray-500 text-xs sm:text-sm p-4">
        © {new Date().getFullYear()} Irfanz Solution. All rights reserved.
      </div>

      {/* Percentage-wise Center Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="relative w-28 h-28 mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-gray-700 stroke-current"
                strokeWidth="6"
                cx="50"
                cy="50"
                r="44"
                fill="transparent"
              ></circle>
              <circle
                className="text-whatsapp-primary stroke-current transition-all duration-300 ease-out"
                strokeWidth="6"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="44"
                fill="transparent"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * progress) / 100}
              ></circle>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-2xl">
              {progress}%
            </div>
          </div>
          <p className="text-white font-medium text-lg animate-pulse">
            Creating your account...
          </p>
        </div>
      )}
    </div>
  );
};

export default Register;