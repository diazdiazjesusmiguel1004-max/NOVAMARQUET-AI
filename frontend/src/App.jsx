import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Register from './pages/Register';
import Compare from './pages/Compare';
import CompareShelf from './components/CompareShelf';
import { useStore } from './store/useStore';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const { initializeTheme, fetchCart, fetchWishlist, fetchNotifications, isAuthenticated } = useStore();
  
  // Custom Toast System
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Auto Dismiss Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(closeToast, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Bootstrapping
  useEffect(() => {
    initializeTheme();
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
      fetchNotifications();
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-slate-100 transition-colors duration-300">
        
        {/* Global sticky navigation */}
        <Navbar />

        {/* Floating comparison shelf */}
        <CompareShelf />

        {/* Core Pages Content view */}
        <main className="flex-grow pb-16">
          <Routes>
            <Route path="/" element={<Home notificationHandler={showToast} />} />
            <Route path="/categoria/:categorySlug" element={<Home notificationHandler={showToast} />} />
            <Route path="/product/:slug" element={<ProductDetail notificationHandler={showToast} />} />
            <Route path="/cart" element={<Cart notificationHandler={showToast} />} />
            <Route path="/checkout" element={<Checkout notificationHandler={showToast} />} />
            <Route path="/orders" element={<Orders notificationHandler={showToast} />} />
            <Route path="/order-tracking" element={<OrderTracking notificationHandler={showToast} />} />
            <Route path="/order-tracking/:tracking_number" element={<OrderTracking notificationHandler={showToast} />} />
            <Route path="/comparar" element={<Compare notificationHandler={showToast} />} />
            
            {/* Admin/Seller Dashboard */}
            <Route path="/dashboard" element={<Dashboard notificationHandler={showToast} />} />
            <Route path="/mi-cuenta" element={<Dashboard notificationHandler={showToast} />} />
            
            {/* Auth */}
            <Route path="/login" element={<Login notificationHandler={showToast} />} />
            <Route path="/register" element={<Register notificationHandler={showToast} />} />
            
            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/50 dark:border-dark-900 bg-white dark:bg-dark-950 py-6 text-center text-[10px] text-slate-400 font-semibold tracking-wider transition-colors">
          © {new Date().getFullYear()} NOVAMARQUET-AI. Todos los derechos reservados. Desarrollado con Inteligencia Artificial Avanzada.
        </footer>

        {/* PREMIUM ANIMATED TOAST NOTIFICATION HUD BANNER */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300 select-none max-w-sm bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800">
            {/* Type Icon */}
            <div className="flex-shrink-0">
              {toast.type === 'success' && <CheckCircle className="text-green-500 animate-bounce" size={20} />}
              {toast.type === 'error' && <AlertCircle className="text-red-500 animate-wiggle" size={20} />}
              {toast.type === 'warning' && <AlertCircle className="text-orange-500 animate-pulse" size={20} />}
              {toast.type === 'info' && <Info className="text-primary-500" size={20} />}
            </div>

            {/* Message Text */}
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex-1 leading-relaxed">
              {toast.message}
            </p>

            {/* Close trigger */}
            <button 
              onClick={closeToast}
              className="text-slate-400 hover:text-slate-650 dark:hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        )}

      </div>
    </Router>
  );
}

export default App;
