import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Bell, Sun, Moon, LogOut, User as UserIcon, 
  Search, ShieldAlert, BarChart3, Menu, X, CheckSquare
} from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../services/api';
import BrandLogo from './BrandLogo';

const Navbar = ({ onSearchChange }) => {
  const navigate = useNavigate();
  const { 
    user, isAuthenticated, logout, theme, toggleTheme,
    cart, notifications, notificationsCount, fetchNotifications, markAllNotificationsRead
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Debounced Search Suggestions Trigger
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchVal.trim().length >= 3) {
        setLoadingSuggestions(true);
        try {
          const res = await api.get(`products/?search=${encodeURIComponent(searchVal)}`);
          setSuggestions(res.data.slice(0, 6)); // limit to top 6
          setShowSuggestions(true);
        } catch (err) {
          console.error("Error fetching search suggestions:", err);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchVal]);

  // Click Away handler
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const searchContainer = document.getElementById('search-container');
      const mobileSearchContainer = document.getElementById('mobile-search-container');
      if (searchContainer && !searchContainer.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Fetch notifications on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll notifications every 45s
      const interval = setInterval(fetchNotifications, 45000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchVal);
    }
    navigate(`/?search=${searchVal}`);
  };

  const handleLogoutClick = () => {
    logout();
    setShowProfile(false);
    navigate('/login');
  };

  const markAllReadClick = () => {
    markAllNotificationsRead();
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/50 dark:border-dark-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <BrandLogo />
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8 relative" id="search-container">
            <input
              type="text"
              placeholder="Buscar marcas, celulares, laptops..."
              value={searchVal}
              onFocus={() => { if (searchVal.trim().length >= 3) setShowSuggestions(true); }}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-slate-100/80 dark:bg-dark-950/60 border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 rounded-full px-5 py-2 pl-12 text-sm outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-dark-900 transition-all focus:ring-2 focus:ring-primary-500/15"
            />
            <Search className="absolute left-4 top-2.5 text-slate-400" size={18} />

            {/* Autocomplete Overlay */}
            {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in duration-150">
                {loadingSuggestions ? (
                  <div className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">
                    Cargando sugerencias...
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-1.5 text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                      Sugerencias de Productos
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-850">
                      {suggestions.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            navigate(`/product/${product.slug}`);
                            setShowSuggestions(false);
                            setSearchVal('');
                          }}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-dark-950 transition-colors cursor-pointer text-left"
                        >
                          <img
                            src={product.primary_image || '/placeholder.jpg'}
                            alt={product.name}
                            className="w-10 h-10 object-contain rounded bg-slate-50 dark:bg-dark-950/20 p-1 border border-slate-100 dark:border-dark-800"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60';
                            }}
                          />
                          <div className="flex-grow min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {product.name}
                            </p>
                            <span className="text-[10px] font-semibold text-slate-450 uppercase">
                              {product.brand?.name || 'Producto'} · {product.category || 'Categoría'}
                            </span>
                          </div>
                          <span className="text-xs font-black text-slate-850 dark:text-white flex-shrink-0">
                            S/ {product.current_price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </form>

          {/* Navigation Controls */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
              title="Cambiar tema"
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>

            {/* Dashboard Link (Seller/Admin only) */}
            {isAuthenticated && (user?.role === 'admin' || user?.role === 'seller') && (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-all border border-purple-500/10"
              >
                <BarChart3 size={15} /> Dashboard
              </Link>
            )}

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-300 relative transition-all active:scale-95"
              title="Favoritos"
            >
              <Heart size={20} />
            </Link>

            {/* Shopping Cart Link */}
            <Link
              to="/cart"
              onClick={() => {
                setShowNotifications(false);
                setShowProfile(false);
                navigate('/cart');
              }}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-300 relative transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center"
              title="Carrito de compras"
            >
              <ShoppingBag size={20} className="pointer-events-none" />
              {cart?.items?.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 text-[10px] font-bold text-white bg-primary-500 rounded-full flex items-center justify-center border border-white dark:border-dark-900 animate-pulse pointer-events-none">
                  {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>

            {/* Notifications panel toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-300 relative transition-all active:scale-95"
                title="Notificaciones"
              >
                <Bell size={20} />
                {notificationsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl shadow-xl z-50 py-3 overflow-hidden animate-in fade-in-50 slide-in-from-top-3 duration-200">
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Notificaciones</span>
                    {notificationsCount > 0 && (
                      <button 
                        onClick={markAllReadClick}
                        className="text-[10px] text-primary-500 hover:text-primary-600 font-semibold flex items-center gap-1"
                      >
                        <CheckSquare size={12} /> Limpiar todo
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No tienes notificaciones
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-3 border-b border-slate-100 dark:border-dark-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-dark-950 transition-colors ${
                            !n.is_read ? 'bg-primary-500/5 dark:bg-primary-500/10' : ''
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setShowProfile(!showProfile);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-full border border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800 transition-all select-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user?.username ? user.username[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden lg:block text-xs font-semibold text-slate-700 dark:text-slate-300 pr-2">
                    {user?.username}
                  </span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-purple-600 rounded-full hover:shadow-lg hover:shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <UserIcon size={14} /> Iniciar Sesión
                </Link>
              )}

              {/* Profile Popover Menu */}
              {isAuthenticated && showProfile && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl shadow-xl z-50 py-2 overflow-hidden animate-in fade-in-50 slide-in-from-top-3 duration-200">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-dark-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.first_name} {user?.last_name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{user?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                      {user?.role === 'admin' ? 'Administrador' : user?.role === 'seller' ? 'Vendedor' : 'Cliente'}
                    </span>
                  </div>

                  {user?.role === 'client' ? (
                    <Link 
                      to="/mi-cuenta" 
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                    >
                      <UserIcon size={14} /> Mi Cuenta
                    </Link>
                  ) : (
                    <Link 
                      to="/dashboard" 
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                    >
                      <BarChart3 size={14} /> Panel de Control
                    </Link>
                  )}

                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 border-t border-slate-100 dark:border-dark-800 transition-colors text-left"
                  >
                    <LogOut size={14} /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300"
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 transition-all"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-slate-200/50 dark:border-dark-800/50 py-4 px-4 space-y-3 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-full px-4 py-2 pl-10 text-xs text-slate-800 dark:text-slate-100"
            />
            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={14} />
          </form>

          <div className="flex flex-col gap-2.5 pt-2">
            {isAuthenticated && (user?.role === 'admin' || user?.role === 'seller') && (
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg text-sm text-purple-600 dark:text-purple-400 hover:bg-slate-50 dark:hover:bg-dark-900 font-semibold"
              >
                <BarChart3 size={16} /> Panel Dashboard
              </Link>
            )}

            <Link
              to="/cart"
              onClick={() => {
                setIsOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 p-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-900 w-full text-left font-medium cursor-pointer"
            >
              <ShoppingBag size={16} /> Carrito ({cart?.items?.length || 0})
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-900"
            >
              <Heart size={16} /> Favoritos
            </Link>

            <Link
              to="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-900"
            >
              <ShoppingBag size={16} /> Mis Compras
            </Link>

            {isAuthenticated ? (
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-red-500 hover:bg-red-500/5 text-left"
              >
                <LogOut size={16} /> Cerrar Sesión ({user?.username})
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 text-center text-sm font-bold text-white bg-primary-500 rounded-xl hover:bg-primary-600 block"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
