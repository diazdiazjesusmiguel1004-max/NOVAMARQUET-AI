import { create } from 'zustand';
import api from '../services/api';

export const useStore = create((set, get) => ({
  // --- AUTHENTICATION STATE ---
  user: JSON.parse(localStorage.getItem('user_profile')) || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  authLoading: false,
  authError: null,

  login: async (username, password) => {
    set({ authLoading: true, authError: null });
    try {
      const res = await api.post('auth/login/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      
      // Fetch profile details
      const profileRes = await api.get('auth/profile/');
      localStorage.setItem('user_profile', JSON.stringify(profileRes.data));
      
      set({ 
        user: profileRes.data, 
        isAuthenticated: true, 
        authLoading: false 
      });

      // Fetch dependencies upon login
      get().fetchCart();
      get().fetchWishlist();
      get().fetchNotifications();

      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error de credenciales, intente nuevamente.';
      set({ authLoading: false, authError: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  register: async (userData) => {
    set({ authLoading: true, authError: null });
    try {
      await api.post('auth/register/', userData);
      set({ authLoading: false });
      return { success: true };
    } catch (err) {
      let errorMsg = 'Error en el registro. Verifique sus datos.';
      if (err.response?.data) {
        // Collect field errors if any
        errorMsg = Object.values(err.response.data).flat().join(' ') || errorMsg;
      }
      set({ authLoading: false, authError: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
    set({ 
      user: null, 
      isAuthenticated: false, 
      cart: { items: [], cart_total: 0 },
      wishlist: { products: [] },
      notifications: [] 
    });
  },

  fetchProfile: async () => {
    if (!get().isAuthenticated) return;
    try {
      const res = await api.get('auth/profile/');
      localStorage.setItem('user_profile', JSON.stringify(res.data));
      set({ user: res.data });
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  },

  // --- CART STATE ---
  cart: { items: [], cart_total: 0 },
  cartLoading: false,
  coupon: null,
  couponError: null,

  fetchCart: async () => {
    if (!get().isAuthenticated) return;
    set({ cartLoading: true });
    try {
      const res = await api.get('cart/current/');
      set({ cart: res.data, cartLoading: false });
    } catch (err) {
      set({ cartLoading: false });
      console.error('Error fetching cart:', err);
    }
  },

  addToCart: async (productId, quantity = 1, color = null, size = null) => {
    if (!get().isAuthenticated) return { success: false, error: 'Debe iniciar sesión para agregar al carrito.' };
    set({ cartLoading: true });
    try {
      const res = await api.post('cart/add/', { product_id: productId, quantity, color, size });
      set({ cart: res.data, cartLoading: false });
      return { success: true };
    } catch (err) {
      set({ cartLoading: false });
      const errorMsg = err.response?.data?.error || 'No se pudo agregar el producto.';
      return { success: false, error: errorMsg };
    }
  },

  updateCartItem: async (itemId, quantity) => {
    if (!get().isAuthenticated) return;
    set({ cartLoading: true });
    try {
      const res = await api.post('cart/update/', { item_id: itemId, quantity });
      set({ cart: res.data, cartLoading: false });
    } catch (err) {
      set({ cartLoading: false });
      console.error('Error updating cart item:', err);
    }
  },

  removeCartItem: async (itemId) => {
    if (!get().isAuthenticated) return;
    set({ cartLoading: true });
    try {
      const res = await api.post('cart/remove/', { item_id: itemId });
      set({ cart: res.data, cartLoading: false });
    } catch (err) {
      set({ cartLoading: false });
      console.error('Error removing cart item:', err);
    }
  },

  applyCoupon: async (code) => {
    if (!code || !code.trim()) return { success: false, error: 'Ingrese un código de cupón.' };
    const cleanCode = code.trim().toUpperCase();
    set({ couponError: null });

    const fallbackCoupons = {
      'TEC2026': { code: 'TEC2026', discount_type: 'percent', value: 10.00 },
      'NOVAMARKET50': { code: 'NOVAMARKET50', discount_type: 'fixed', value: 50.00 },
      'NOVAMARQUET10': { code: 'NOVAMARQUET10', discount_type: 'percent', value: 10.00 },
      'DESCUENTO15': { code: 'DESCUENTO15', discount_type: 'percent', value: 15.00 },
      'DESCUENTO10': { code: 'DESCUENTO10', discount_type: 'percent', value: 10.00 }
    };

    try {
      const res = await api.post('coupons/validate/', { code: cleanCode });
      set({ coupon: res.data, couponError: null });
      return { success: true, coupon: res.data };
    } catch (err) {
      if (fallbackCoupons[cleanCode]) {
        const couponData = fallbackCoupons[cleanCode];
        set({ coupon: couponData, couponError: null });
        return { success: true, coupon: couponData };
      }
      const errorMsg = err.response?.data?.error || 'Cupón no disponible.';
      set({ couponError: errorMsg, coupon: null });
      return { success: false, error: errorMsg };
    }
  },

  removeCoupon: () => {
    set({ coupon: null, couponError: null });
  },

  // --- WISHLIST STATE ---
  wishlist: { products: [] },
  wishlistLoading: false,

  fetchWishlist: async () => {
    if (!get().isAuthenticated) return;
    set({ wishlistLoading: true });
    try {
      const res = await api.get('wishlist/current/');
      set({ wishlist: res.data, wishlistLoading: false });
    } catch (err) {
      set({ wishlistLoading: false });
      console.error('Error fetching wishlist:', err);
    }
  },

  toggleWishlist: async (productId) => {
    if (!get().isAuthenticated) return { success: false, error: 'Debe iniciar sesión.' };
    try {
      const res = await api.post('wishlist/toggle/', { product_id: productId });
      get().fetchWishlist();
      return { success: true, added: res.data.added };
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      return { success: false };
    }
  },

  // --- NOTIFICATIONS STATE ---
  notifications: [],
  notificationsCount: 0,

  fetchNotifications: async () => {
    if (!get().isAuthenticated) return;
    try {
      const res = await api.get('notifications/');
      const unreadCount = res.data.filter(n => !n.is_read).length;
      set({ notifications: res.data, notificationsCount: unreadCount });
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  },

  markAllNotificationsRead: async () => {
    if (!get().isAuthenticated) return;
    try {
      await api.post('notifications/mark_all_read/');
      const updated = get().notifications.map(n => ({ ...n, is_read: true }));
      set({ notifications: updated, notificationsCount: 0 });
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  },

  // --- THEME STATE ---
  theme: localStorage.getItem('app_theme') || 'light', // Default to clean light mode
  
  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('app_theme', newTheme);
    
    // Manage class on body element
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    set({ theme: newTheme });
  },

  initializeTheme: () => {
    const theme = get().theme;
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  },

  // --- COMPARE STATE ---
  compareList: [],
  toggleCompare: (product) => {
    const list = get().compareList;
    const exists = list.some(p => p.id === product.id);
    if (exists) {
      set({ compareList: list.filter(p => p.id !== product.id) });
    } else {
      if (list.length >= 4) {
        return { success: false, error: 'Puedes comparar un máximo de 4 productos.' };
      }
      set({ compareList: [...list, product] });
    }
    return { success: true };
  },
  clearCompare: () => set({ compareList: [] })
}));

// Listen to logout event dispatched from axios config (in case refresh token expires)
if (typeof window !== 'undefined') {
  window.addEventListener('auth-logout', () => {
    useStore.getState().logout();
  });
}
