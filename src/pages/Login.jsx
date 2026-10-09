import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { FaWhatsapp, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); 
  const { setAuthUser, setToken } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setProgress(0);

    const loadingToast = toast.loading('Logging into Connectly...');

    // ✅ Fake Progress Logic
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 5) + 2; 
      if (currentProgress >= 95) {
        currentProgress = 95;
        clearInterval(interval);
      }
      setProgress(currentProgress);
    }, 200);

    // ✅ TRY BLOCK: Jab sab kuch sahi chale
    try {
      const res = await axios.post('/auth/login', formData);
      const { _id, username, email, profilePic, token } = res.data;

      setAuthUser({ _id, username, email, profilePic });
      setToken(token);

      // Success: Progress ko 100% karein aur interval band karein
      clearInterval(interval);
      setProgress(100);
      
      toast.success(`Welcome back to Connectly, ${username}!`, { id: loadingToast });

      // 1.5 seconds wait karein taake user 100% dekh sake, phir navigate karein
      setTimeout(() => navigate('/'), 1500);

    } 
    // ✅ CATCH BLOCK: Agar login fail ho jaye
    catch (error) {
      clearInterval(interval); 
      
      toast.error(error.response?.data?.message || 'Invalid email or password', {
        id: loadingToast,
      });
      
      setProgress(0);
    } 
    // ✅ FINALLY BLOCK: Yeh hamesha chalega
    finally {
      setLoading(false); 
    }
  };

  return (
    // ✅ 'bg-linear-to-br' (Tailwind v4)
    <div className="min-h-screen flex flex-col justify-between bg-linear-to-br from-gray-900 via-gray-800 to-black p-4">
      
      {/* Center Content Area */}
      {/* ✅ 'grow' (Tailwind v4 replacement for flex-grow) */}
      <div className="grow flex items-center justify-center mt-8">
        <div className="max-w-md w-full bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
          
          <div className="flex flex-col items-center mb-8">
            <FaWhatsapp className="text-6xl text-whatsapp-primary mb-2" />
            <h2 className="text-2xl font-bold text-white text-center">Welcome to Connectly</h2>
            <p className="text-gray-400 text-sm mt-1 text-center">Connect with your friends securely</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              {loading ? `Logging in... ${progress}%` : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm sm:text-base">
            Don't have an account?{' '}
            <Link to="/register" className="text-whatsapp-primary hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Footer / Reserved Message */}
      <div className="text-center text-gray-500 text-xs sm:text-sm mt-8 mb-2">
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
            Verifying your credentials...
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;