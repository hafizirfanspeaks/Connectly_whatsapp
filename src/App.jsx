// App.jsx
import { useEffect } from 'react'; // ✅ 1. useEffect import karein
import { Routes, Route, Navigate } from 'react-router-dom'; 
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { useAuthStore } from './store/useAuthStore';
import NotificationSound from './components/NotificationSound';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuthStore();
  return authUser ? children : <Navigate to="/login" />;
};

function App() {
  // ✅ 2. Store se authUser aur socket functions nikalain
  const { authUser, connectSocket, disconnectSocket } = useAuthStore();

  // ✅ 3. Socket Connection Management (Login par connect, Logout par disconnect)
  useEffect(() => {
    if (authUser) {
      connectSocket();
    }
    return () => disconnectSocket();
  }, [authUser, connectSocket, disconnectSocket]);

  return (
    <> 
      <NotificationSound />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
      </Routes>
      
    </>
  );
}

export default App;