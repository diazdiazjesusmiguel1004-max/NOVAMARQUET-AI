import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Bell, Sun, Moon, LogOut, User as UserIcon, 
  Search, ShieldAlert, BarChart3, Menu, X, CheckSquare, ChevronDown, MapPin, Globe
} from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../services/api';
import BrandLogo from './BrandLogo';

const Navbar = ({ onSearchChange }) => {
  const navigate = useNavigate();
  const { 
    user, isAuthenticated, logout, theme, toggleTheme,
    cart, notifications, notificationsCount, fetchNotifications, markAllNotificationsRead,
    wishlist
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
    <nav className="sticky top-0 z-50 w-full flex flex-col transition-all duration-300">
      
      {/* ROW 1: Main Amazon Navbar Header */}
      <div className="bg-[#131921] text-white px-4 py-2 flex items-center justify-between gap-4">
        
        {/* Left Section: Logo & Address */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 flex items-center border border-transparent hover:border-white/50 p-1.5 rounded transition-all">
            <BrandLogo />
          </div>
          
          {/* Enviar a Perú Location */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 rounded border border-transparent hover:border-white transition-all cursor-pointer">
            <MapPin size={15} className="text-white mt-3" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-300 block leading-tight font-medium">Enviar a</span>
              <span className="text-[12px] font-black text-white block leading-tight">Perú</span>
            </div>
          </div>
        </div>

        {/* Center Section: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-grow max-w-3xl flex items-center bg-white rounded-md overflow-hidden border border-transparent focus-within:ring-2 focus-within:ring-amber-500 relative" id="search-container">
          <div className="bg-[#f3f3f3] text-slate-700 px-3.5 py-2.5 text-xs font-bold border-r cursor-pointer hover:bg-slate-200 hidden sm:block select-none">
            Todos
          </div>
          <input
            type="text"
            placeholder="Buscar en Novamarquet..."
            value={searchVal}
            onFocus={() => { if (searchVal.trim().length >= 3) setShowSuggestions(true); }}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full px-3 py-2 text-[13px] text-slate-800 outline-none placeholder-slate-400 font-bold"
          />
          <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] text-[#111] px-5 py-2.5 flex items-center justify-center transition-colors cursor-pointer">
            <Search size={18} className="stroke-[2.5]" />
          </button>

          {/* Autocomplete Overlay */}
          {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-b-lg shadow-2xl z-50 overflow-hidden py-2 text-slate-800">
              {loadingSuggestions ? (
                <div className="px-4 py-3 text-xs text-slate-400">
                  Cargando sugerencias...
                </div>
              ) : (
                <>
                  <div className="px-4 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Sugerencias de Productos
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {suggestions.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          navigate(`/product/${product.slug}`);
                          setShowSuggestions(false);
                          setSearchVal('');
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                      >
                        <img
                          src={product.primary_image || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-10 h-10 object-contain rounded bg-slate-50 p-1 border border-slate-100"
                        />
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {product.name}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            {product.brand?.name || 'Producto'} · {product.category || 'Categoría'}
                          </span>
                        </div>
                        <span className="text-xs font-black text-slate-850 flex-shrink-0">
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

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Language ES */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded border border-transparent hover:border-white transition-all cursor-pointer">
            <Globe size={14} className="text-slate-300" />
            <span className="text-[12px] font-bold text-white uppercase">ES</span>
            <ChevronDown size={10} className="text-slate-350" />
          </div>

          {/* Account & Lists popover trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex flex-col text-left px-2 py-1 rounded border border-transparent hover:border-white transition-all cursor-pointer focus:outline-none"
            >
              <span className="text-[10px] text-slate-300 block leading-tight font-medium">
                Hola, {user ? (user.first_name || user.username) : 'Identifícate'}
              </span>
              <span className="text-[12px] font-black text-white block leading-tight flex items-center gap-1">
                Cuenta y Listas <ChevronDown size={11} className="text-slate-300" />
              </span>
            </button>

            {/* Profile popover list */}
            {showProfile && (
              <div className="absolute right-0 mt-2.5 w-60 bg-white border border-slate-200 rounded-lg shadow-2xl z-50 py-3 overflow-hidden text-slate-800 animate-in fade-in duration-150">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user?.first_name} {user?.last_name}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-primary-100 text-primary-700">
                        {user?.role === 'admin' ? 'Administrador' : user?.role === 'seller' ? 'Vendedor' : 'Cliente'}
                      </span>
                    </div>

                    <div className="py-1">
                      {user?.role === 'client' ? (
                        <Link 
                          to="/mi-cuenta" 
                          onClick={() => setShowProfile(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <UserIcon size={14} /> Mi Perfil y Panel
                        </Link>
                      ) : (
                        <Link 
                          to="/dashboard" 
                          onClick={() => setShowProfile(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <BarChart3 size={14} /> Panel de Control
                        </Link>
                      )}
                      
                      <Link 
                        to="/wishlist" 
                        onClick={() => setShowProfile(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Heart size={14} /> Mis Favoritos
                      </Link>
                      
                      <Link 
                        to="/orders" 
                        onClick={() => setShowProfile(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <ShoppingBag size={14} /> Mis Compras
                      </Link>
                    </div>

                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/5 border-t border-slate-100 transition-colors text-left"
                    >
                      <LogOut size={14} /> Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <div className="p-4 text-center space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setShowProfile(false)}
                      className="w-full py-2 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:bg-[#ddb347] active:scale-95 transition-all text-xs font-bold text-slate-900 rounded-md block shadow"
                    >
                      Identifícate
                    </Link>
                    <div className="text-[10px] text-slate-550">
                      ¿Eres un cliente nuevo?{' '}
                      <Link to="/register" onClick={() => setShowProfile(false)} className="text-blue-600 hover:underline">
                        Empieza aquí.
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Devoluciones y Pedidos link */}
          <Link to="/orders" className="hidden sm:flex flex-col text-left px-2 py-1.5 rounded border border-transparent hover:border-white transition-all">
            <span className="text-[10px] text-slate-300 block leading-tight font-medium">Devoluciones</span>
            <span className="text-[12px] font-black text-white block leading-tight">y Pedidos</span>
          </Link>

          {/* Wishlist Link Icon with Badge */}
          <Link
            to="/wishlist"
            className="p-2 rounded hover:bg-white/10 text-white relative transition-all active:scale-95 flex items-center justify-center"
            title="Favoritos"
          >
            <Heart size={20} className="fill-transparent" />
            {wishlist?.products?.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 text-[9px] font-black text-slate-950 bg-[#febd69] rounded-full flex items-center justify-center border border-[#131921] pointer-events-none">
                {wishlist.products.length}
              </span>
            )}
          </Link>

          {/* Cart Icon with count */}
          <a
            href="/cart"
            onClick={(e) => {
              e.preventDefault();
              setShowNotifications(false);
              setShowProfile(false);
              window.location.href = '/cart';
            }}
            className="flex items-center gap-1 px-2 py-1.5 rounded border border-transparent hover:border-white transition-all relative cursor-pointer"
            title="Carrito de compras"
          >
            <div className="relative">
              <ShoppingBag size={22} className="text-white" />
              {cart?.items?.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#f3a847] text-slate-950 font-black rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center border border-[#131921] pointer-events-none animate-pulse">
                  {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>
            <span className="text-[12px] font-black text-white hidden md:inline mt-2">Carrito</span>
          </a>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-all active:scale-95"
            title="Cambiar tema"
          >
            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
          </button>
          
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded hover:bg-white/10 text-white md:hidden transition-all"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </div>



      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#232f3e] border-t border-slate-700/50 py-4 px-4 space-y-3 shadow-2xl text-white">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Buscar en Novamarquet..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-white text-slate-800 border border-slate-200 rounded-md px-4 py-2.5 pl-10 text-xs font-bold"
            />
            <Search className="absolute left-3.5 top-3 text-slate-400" size={14} />
          </form>

          <div className="flex flex-col gap-2 pt-2">
            {isAuthenticated && (user?.role === 'admin' || user?.role === 'seller') && (
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 p-2 rounded hover:bg-white/10 text-sm font-semibold"
              >
                <BarChart3 size={16} /> Panel Dashboard
              </Link>
            )}

            <a
              href="/cart"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                window.location.href = '/cart';
              }}
              className="flex items-center gap-2 p-2 rounded hover:bg-white/10 text-sm font-semibold w-full text-left"
            >
              <ShoppingBag size={16} /> Carrito ({cart?.items?.length || 0})
            </a>

            <Link
              to="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 p-2 rounded hover:bg-white/10 text-sm font-semibold"
            >
              <Heart size={16} /> Favoritos
            </Link>

            <Link
              to="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 p-2 rounded hover:bg-white/10 text-sm font-semibold"
            >
              <ShoppingBag size={16} /> Mis Compras y Pedidos
            </Link>

            {isAuthenticated ? (
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-red-500/10 text-sm font-semibold text-red-400 text-left"
              >
                <LogOut size={16} /> Cerrar Sesión ({user?.username})
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 text-center text-sm font-black text-slate-900 bg-[#febd69] hover:bg-[#f3a847] rounded-md block"
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
