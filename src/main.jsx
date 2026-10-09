// Frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
// ❌ import { SocketProvider } from './context/SocketContext.jsx'; // Hata dein
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* ❌ <SocketProvider> wrapper hata dein */}
      <App />
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        theme="dark"
      />
      {/* ❌ </SocketProvider> */}
    </BrowserRouter>
  </React.StrictMode>,
);