import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, ShieldAlert, ShoppingBag, Eye, CheckCircle, RefreshCw, 
  Plus, Trash2, Save, X, Search, Box, Tag, Users, CreditCard, 
  MapPin, User, Lock, Clock, ArrowRightLeft, Sparkles, Percent, Truck, Wallet, Heart
} from 'lucide-react';
import api from '../services/api';
import { useStore } from '../store/useStore';
import StatsDashboard from '../components/StatsDashboard';

const Dashboard = ({ notificationHandler }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, wishlist, addToCart, toggleWishlist } = useStore();
  
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Forms states
  const [editingProduct, setEditingProduct] = useState({});
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', offer_price: '', stock: '', sku: '', slug: '',
    description: '', brand_id: '', category_id: '', colors: 'Titanium, Silver',
    sizes: '128GB, 256GB', is_featured: false, image_url: ''
  });

  const [newCoupon, setNewCoupon] = useState({
    code: '', discount_type: 'percent', value: '', expiration_days: 30, max_uses: 100
  });

  const [newAddress, setNewAddress] = useState({
    title: '', street_address: '', district: '', province: '', department: '', phone: '', is_default: false
  });

  const [profileForm, setProfileForm] = useState({
    first_name: '', last_name: '', email: '', phone: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '', new: '', confirm: ''
  });

  // 1. Data Fetchers
  const fetchDashboardData = async () => {
    try {
      const res = await api.get('dashboard/summary/');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('orders/');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      // If seller, only fetch their products
      const params = user?.role === 'seller' ? { seller: user?.id } : {};
      const res = await api.get('products/', { params });
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchUsers = async () => {
    if (user?.role !== 'admin') return;
    try {
      const res = await api.get('dashboard/users/');
      setUsersList(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchCoupons = async () => {
    if (user?.role !== 'admin') return;
    try {
      const res = await api.get('coupons/');
      setCoupons(res.data);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
  };

  const fetchAddresses = async () => {
    if (user?.role !== 'client') return;
    try {
      const res = await api.get('addresses/');
      setAddresses(res.data);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  const fetchBrandsAndCategories = async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        api.get('brands/'),
        api.get('categories/')
      ]);
      setBrands(brandsRes.data);
      
      const allCats = [];
      categoriesRes.data.forEach(c => {
        allCats.push({ id: c.id, name: c.name });
        if (c.subcategories && c.subcategories.length > 0) {
          c.subcategories.forEach(sub => {
            allCats.push({ id: sub.id, name: `${c.name} > ${sub.name}` });
          });
        }
      });
      setCategories(allCats);
    } catch (err) {
      console.error('Error metadata:', err);
    }
  };

  // Sync state
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Assign default tabs depending on role
    if (user?.role === 'admin') {
      setActiveTab('analytics');
    } else if (user?.role === 'seller') {
      setActiveTab('seller_analytics');
    } else {
      setActiveTab('customer_orders');
    }

    if (user) {
      setProfileForm({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || ''
      });
    }

    const loadData = async () => {
      setLoading(true);
      const promises = [];
      if (user?.role === 'admin') {
        promises.push(fetchDashboardData(), fetchOrders(), fetchProducts(), fetchUsers(), fetchCoupons(), fetchBrandsAndCategories());
      } else if (user?.role === 'seller') {
        promises.push(fetchOrders(), fetchProducts(), fetchBrandsAndCategories());
      } else {
        promises.push(fetchOrders(), fetchAddresses());
      }
      await Promise.all(promises);
      setLoading(false);
    };

    loadData();
  }, [isAuthenticated, user]);

  // 2. Admin operations
  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await api.post('dashboard/users/', { user_id: userId, role: newRole });
      notificationHandler?.('Rol de usuario actualizado con éxito.', 'success');
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      notificationHandler?.('Error al cambiar el rol.', 'error');
    }
  };

  const handleUpdateLogistics = async (orderId, newStatus) => {
    try {
      const res = await api.post(`orders/${orderId}/update_logistics/`, { status: newStatus });
      notificationHandler?.('Estado de envío actualizado.', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      if (user?.role === 'admin') fetchDashboardData();
    } catch (err) {
      notificationHandler?.('Error al actualizar envío.', 'error');
    }
  };

  // 3. Products Operations (Admin & Seller)
  const handleUpdateProduct = async (product) => {
    const edited = editingProduct[product.id] || {};
    const payload = {
      price: edited.price !== undefined ? parseFloat(edited.price) : parseFloat(product.price),
      offer_price: edited.offer_price !== undefined 
        ? (edited.offer_price === '' ? null : parseFloat(edited.offer_price)) 
        : product.offer_price,
      stock: edited.stock !== undefined ? parseInt(edited.stock) : product.stock
    };

    try {
      const res = await api.patch(`products/${product.slug}/`, payload);
      notificationHandler?.(`¡Producto "${product.name}" actualizado!`, 'success');
      setProducts(prev => prev.map(p => p.id === product.id ? res.data : p));
      setEditingProduct(prev => {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      });
      if (user?.role === 'admin') fetchDashboardData();
    } catch (err) {
      notificationHandler?.('Error al actualizar el producto.', 'error');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${product.name}"?`)) return;
    try {
      await api.delete(`products/${product.slug}/`);
      notificationHandler?.('Producto eliminado.', 'success');
      setProducts(prev => prev.filter(p => p.id !== product.id));
      if (user?.role === 'admin') fetchDashboardData();
    } catch (err) {
      notificationHandler?.('Error al eliminar.', 'error');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      if (!newProduct.category_id) {
        notificationHandler?.('Selecciona una categoría.', 'error');
        return;
      }
      
      const generatedSlug = newProduct.slug || newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const generatedSku = newProduct.sku || `PROD-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const payload = {
        name: newProduct.name,
        slug: generatedSlug,
        sku: generatedSku,
        description: newProduct.description || 'Sin descripción.',
        price: parseFloat(newProduct.price),
        offer_price: newProduct.offer_price ? parseFloat(newProduct.offer_price) : null,
        stock: parseInt(newProduct.stock) || 0,
        colors: newProduct.colors.split(',').map(c => c.trim()),
        sizes: newProduct.sizes.split(',').map(s => s.trim()),
        brand_id: newProduct.brand_id ? parseInt(newProduct.brand_id) : null,
        category_id: parseInt(newProduct.category_id),
        image_url: newProduct.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'
      };
      
      const res = await api.post('products/', payload);
      notificationHandler?.('¡Producto creado con éxito!', 'success');
      setProducts(prev => [res.data, ...prev]);
      setShowAddModal(false);
      setNewProduct({
        name: '', price: '', offer_price: '', stock: '', sku: '', slug: '',
        description: '', brand_id: '', category_id: '', colors: 'Titanium, Silver',
        sizes: '128GB, 256GB', is_featured: false, image_url: ''
      });
      if (user?.role === 'admin') fetchDashboardData();
    } catch (err) {
      notificationHandler?.('Error al crear producto.', 'error');
    }
  };

  const handleInlineChange = (productId, field, value) => {
    setEditingProduct(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  // 4. Coupons Operations (Admin)
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + Number(newCoupon.expiration_days));

      const payload = {
        code: newCoupon.code.trim().toUpperCase(),
        discount_type: newCoupon.discount_type,
        value: parseFloat(newCoupon.value),
        expiration_date: expirationDate.toISOString(),
        active: true,
        max_uses: parseInt(newCoupon.max_uses)
      };

      const res = await api.post('coupons/', payload);
      notificationHandler?.('¡Cupón creado!', 'success');
      setCoupons(prev => [res.data, ...prev]);
      setShowCouponModal(false);
      setNewCoupon({ code: '', discount_type: 'percent', value: '', expiration_days: 30, max_uses: 100 });
    } catch (err) {
      notificationHandler?.('Error al crear el cupón.', 'error');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cupón?')) return;
    try {
      await api.delete(`coupons/${couponId}/`);
      notificationHandler?.('Cupón eliminado.', 'success');
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch (err) {
      notificationHandler?.('Error al eliminar cupón.', 'error');
    }
  };

  // 5. Customer Addresses Operations
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('addresses/', newAddress);
      notificationHandler?.('Dirección agregada.', 'success');
      setAddresses(prev => [res.data, ...prev]);
      setShowAddressModal(false);
      setNewAddress({ title: '', street_address: '', district: '', province: '', department: '', phone: '', is_default: false });
    } catch (err) {
      notificationHandler?.('Error al agregar dirección.', 'error');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('¿Seguro que deseas borrar esta dirección?')) return;
    try {
      await api.delete(`addresses/${addressId}/`);
      notificationHandler?.('Dirección borrada.', 'success');
      setAddresses(prev => prev.filter(a => a.id !== addressId));
    } catch (err) {
      notificationHandler?.('Error al borrar dirección.', 'error');
    }
  };

  // 6. Customer Profile & Security
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch('auth/profile/', profileForm);
      notificationHandler?.('Perfil actualizado correctamente.', 'success');
      localStorage.setItem('user_profile', JSON.stringify(res.data));
    } catch (err) {
      notificationHandler?.('Error al actualizar datos.', 'error');
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      notificationHandler?.('Las contraseñas nuevas no coinciden.', 'error');
      return;
    }
    notificationHandler?.('Simulación: Contraseña cambiada correctamente.', 'success');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  // 7. Seller specific calculations (frontend simulated from overall orders data)
  const getSellerMetrics = () => {
    let salesCount = 0;
    let unitsSold = 0;
    let totalRevenue = 0;
    const sellerOrders = [];

    orders.forEach(order => {
      const sellerItems = order.items?.filter(item => item.seller_id === user?.id) || [];
      if (sellerItems.length > 0) {
        sellerOrders.push({
          ...order,
          seller_items: sellerItems,
          seller_subtotal: sellerItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
        });
        sellerItems.forEach(item => {
          unitsSold += item.quantity;
          totalRevenue += Number(item.price) * item.quantity;
        });
        salesCount++;
      }
    });

    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    return {
      salesCount,
      unitsSold,
      totalRevenue,
      commission: totalRevenue * 0.1, // 10% fee
      netEarnings: totalRevenue * 0.9, // 90% payout
      sellerOrders,
      lowStockCount,
      outOfStockCount
    };
  };

  // Filter products by search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Cargando Consola y Paneles de Control...
      </div>
    );
  }

  const sellerMetrics = user?.role === 'seller' ? getSellerMetrics() : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* ──────────────────────────────────────────────────────── */}
      {/* ─── CASE 1: ADMIN CONSOLE ─── */}
      {/* ──────────────────────────────────────────────────────── */}
      {user?.role === 'admin' && (
        <div className="space-y-8">
          
          {/* Header Info */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase text-red-500 bg-red-500/10 border border-red-500/20 rounded">
                  Admin Console
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mt-1.5">
                NOVAMARQUET-AI Control Hub
              </h1>
              <p className="text-xs text-slate-450 mt-1">
                Visualización e-commerce total: métricas, usuarios, catálogo centralizado y pasarelas de pago.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex flex-wrap bg-slate-100 dark:bg-dark-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-dark-800">
              {[
                { id: 'analytics', label: 'Dashboard Stats', icon: BarChart3 },
                { id: 'users', label: 'Usuarios', icon: Users },
                { id: 'products', label: 'Inventario', icon: Box },
                { id: 'orders', label: 'Logística & Pagos', icon: Truck },
                { id: 'coupons', label: 'Descuentos', icon: Tag }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 shadow-md'
                      : 'text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <tab.icon size={13} /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content 1: Analytics */}
          {activeTab === 'analytics' && (
            <StatsDashboard data={dashboardData} />
          )}

          {/* Tab Content 2: Users */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-3xl p-5 shadow-sm overflow-x-auto">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider mb-6 pb-3 border-b border-slate-100 dark:border-dark-800">
                Gestión de Roles de Usuario
              </h3>
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-400 font-semibold">
                    <th className="py-2.5">ID</th>
                    <th className="py-2.5">Usuario</th>
                    <th className="py-2.5">Email</th>
                    <th className="py-2.5">Teléfono</th>
                    <th className="py-2.5">Fecha Registro</th>
                    <th className="py-2.5 text-right">Rol en la Plataforma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-850/60 text-slate-750 dark:text-slate-350">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-dark-955/20 transition-all">
                      <td className="py-3 font-mono font-bold text-slate-400">{u.id}</td>
                      <td className="py-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{u.username}</span>
                        <p className="text-[10px] text-slate-400">{u.first_name} {u.last_name}</p>
                      </td>
                      <td className="py-3">{u.email}</td>
                      <td className="py-3 font-mono">{u.phone || 'Sin registrar'}</td>
                      <td className="py-3 text-slate-400">
                        {new Date(u.date_joined).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                          className="bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-[11px] rounded-xl px-2 py-1 outline-none font-semibold text-slate-700 dark:text-slate-300 focus:border-primary-500"
                        >
                          <option value="client">Cliente</option>
                          <option value="seller">Vendedor (Socio)</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab Content 3: Products */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-5 shadow-sm">
                <div className="relative flex-grow max-w-md">
                  <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-2xl outline-none focus:border-primary-500 dark:text-slate-200"
                  />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Crear Producto
                </button>
              </div>

              <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-3xl p-5 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-400 font-semibold">
                      <th className="py-2.5">Miniatura</th>
                      <th className="py-2.5">Nombre & SKU</th>
                      <th className="py-2.5 w-24">Vendedor</th>
                      <th className="py-2.5 w-24">Precio (S/)</th>
                      <th className="py-2.5 w-24">Oferta (S/)</th>
                      <th className="py-2.5 w-24">Stock</th>
                      <th className="py-2.5 text-center">Estado</th>
                      <th className="py-2.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-800/40 text-slate-700 dark:text-slate-355">
                    {filteredProducts.map((p) => {
                      const edited = editingProduct[p.id] || {};
                      const priceVal = edited.price !== undefined ? edited.price : p.price;
                      const offerVal = edited.offer_price !== undefined ? edited.offer_price : (p.offer_price || '');
                      const stockVal = edited.stock !== undefined ? edited.stock : p.stock;
                      const hasUnsaved = edited.price !== undefined || edited.offer_price !== undefined || edited.stock !== undefined;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-dark-955/20 transition-all">
                          <td className="py-3">
                            <img src={p.primary_image || '/placeholder.jpg'} alt={p.name} className="w-10 h-10 object-contain rounded bg-slate-50 dark:bg-dark-950 p-1 border" />
                          </td>
                          <td className="py-3 pr-2">
                            <p className="font-bold text-slate-800 dark:text-slate-150 line-clamp-1 max-w-[200px]">{p.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                          </td>
                          <td className="py-3 text-indigo-500 font-semibold">{p.seller_name}</td>
                          <td className="py-3">
                            <input type="number" step="0.01" value={priceVal} onChange={(e) => handleInlineChange(p.id, 'price', e.target.value)} className="w-20 px-2 py-1 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg outline-none focus:border-primary-500" />
                          </td>
                          <td className="py-3">
                            <input type="number" step="0.01" value={offerVal} onChange={(e) => handleInlineChange(p.id, 'offer_price', e.target.value)} className="w-20 px-2 py-1 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg outline-none focus:border-primary-500 text-purple-500" />
                          </td>
                          <td className="py-3">
                            <input type="number" value={stockVal} onChange={(e) => handleInlineChange(p.id, 'stock', e.target.value)} className="w-16 px-2 py-1 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg outline-none focus:border-primary-500" />
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${Number(stockVal) > 0 ? 'bg-green-150 text-green-700' : 'bg-red-150 text-red-700'}`}>
                              {Number(stockVal) > 0 ? 'STOCK' : 'AGOTADO'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleUpdateProduct(p)} disabled={!hasUnsaved} className={`p-2 rounded-xl transition-all ${hasUnsaved ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-slate-105 text-slate-400 dark:bg-dark-850 dark:text-slate-650 cursor-not-allowed'}`}><Save size={13} /></button>
                              <button onClick={() => handleDeleteProduct(p)} className="p-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Content 4: Orders & Logistics */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-3xl p-5 shadow-sm overflow-x-auto">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider mb-6 pb-3 border-b border-slate-100 dark:border-dark-800">
                Logística Global de Envíos
              </h3>
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-400 font-semibold">
                    <th className="py-2.5">Código Tracking</th>
                    <th className="py-2.5">Dirección Destinatario</th>
                    <th className="py-2.5">Fecha Pedido</th>
                    <th className="py-2.5">Total Facturado</th>
                    <th className="py-2.5">Pasarela / Estado Pago</th>
                    <th className="py-2.5">Estado Envío</th>
                    <th className="py-2.5 text-right">Actualizar Logística</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-850/60 text-slate-750 dark:text-slate-350">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-dark-955/20">
                      <td className="py-3 font-mono font-bold text-slate-800 dark:text-white">{o.tracking_number}</td>
                      <td className="py-3">
                        <p className="font-bold text-slate-750 dark:text-slate-200">{o.address_details?.street_address}</p>
                        <p className="text-[10px] text-slate-400">{o.address_details?.district}, {o.address_details?.province}</p>
                      </td>
                      <td className="py-3 text-slate-450">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="py-3 font-extrabold">S/ {Number(o.total).toFixed(2)}</td>
                      <td className="py-3">
                        <span className="capitalize font-bold text-slate-600 dark:text-slate-400 block">{o.payment_method}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black mt-0.5 inline-block ${o.payment_status === 'paid' ? 'bg-green-105 text-green-700' : 'bg-orange-105 text-orange-700'}`}>
                          {o.payment_status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          o.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                          o.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                          o.status === 'pending' ? 'bg-slate-100 text-slate-600' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateLogistics(o.id, e.target.value)}
                          className="bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-[11px] rounded-xl px-2 py-1 outline-none font-semibold text-slate-700 dark:text-slate-300 focus:border-primary-500"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="processing">Procesando</option>
                          <option value="packed">Empaquetado</option>
                          <option value="shipped">Enviado</option>
                          <option value="in_transit">En reparto</option>
                          <option value="delivered">Entregado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab Content 5: Coupons */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-5 shadow-sm">
                <span className="text-xs text-slate-450 font-bold">Cupones de Descuento Activos</span>
                <button
                  onClick={() => setShowCouponModal(true)}
                  className="px-5 py-2.5 text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Crear Cupón
                </button>
              </div>

              <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-3xl p-5 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-400 font-semibold">
                      <th className="py-2.5">Código</th>
                      <th className="py-2.5">Tipo Descuento</th>
                      <th className="py-2.5">Valor</th>
                      <th className="py-2.5">Expiración</th>
                      <th className="py-2.5 text-center">Estado</th>
                      <th className="py-2.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-850/60 text-slate-750 dark:text-slate-350">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-dark-955/20 transition-all">
                        <td className="py-3 font-mono font-bold text-slate-800 dark:text-white uppercase tracking-wider">{c.code}</td>
                        <td className="py-3 capitalize">{c.discount_type === 'percent' ? 'Porcentaje (%)' : 'Monto Fijo (S/)'}</td>
                        <td className="py-3 font-extrabold">{c.discount_type === 'percent' ? `${c.value}%` : `S/ ${c.value}`}</td>
                        <td className="py-3 text-slate-400">{new Date(c.expiration_date).toLocaleDateString()}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${c.active ? 'bg-green-105 text-green-700' : 'bg-red-105 text-red-700'}`}>
                            {c.active ? 'ACTIVO' : 'EXPIRADO'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button onClick={() => handleDeleteCoupon(c.id)} className="p-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 transition-colors"><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}


      {/* ──────────────────────────────────────────────────────── */}
      {/* ─── CASE 2: SELLER CONSOLE ─── */}
      {/* ──────────────────────────────────────────────────────── */}
      {user?.role === 'seller' && sellerMetrics && (
        <div className="space-y-8">
          
          {/* Header Info */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 rounded">
                  Seller Panel
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {user?.first_name || 'Mi Tienda Virtual'}
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mt-1.5">
                Consola del Vendedor
              </h1>
              <p className="text-xs text-slate-450 mt-1">
                Monitorea tus productos propios, ventas generadas, comisiones de plataforma y balances de ganancias netas.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex flex-wrap bg-slate-100 dark:bg-dark-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-dark-800">
              {[
                { id: 'seller_analytics', label: 'Resumen Financiero', icon: Wallet },
                { id: 'seller_products', label: 'Mis Productos & Stock', icon: Box },
                { id: 'seller_orders', label: 'Mis Ventas Logística', icon: Truck }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 shadow-md'
                      : 'text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <tab.icon size={13} /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: Financial & Sales Summary */}
          {activeTab === 'seller_analytics' && (
            <div className="space-y-8">
              
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Total Sales */}
                <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Ingresos Brutos</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">
                      S/ {sellerMetrics.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                    <Percent size={22} />
                  </div>
                </div>

                {/* Net Earnings */}
                <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Ganancias Netas (90%)</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block text-indigo-500">
                      S/ {sellerMetrics.netEarnings.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <Wallet size={22} />
                  </div>
                </div>

                {/* Platform Fee */}
                <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Tarifa Plataforma (10%)</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block text-slate-400">
                      S/ {sellerMetrics.commission.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-500">
                    <CreditCard size={22} />
                  </div>
                </div>

                {/* Units Sold */}
                <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Unidades Vendidas</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">
                      {sellerMetrics.unitsSold} u.
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                    <ShoppingBag size={22} />
                  </div>
                </div>

              </div>

              {/* Stock Warning Warnings */}
              <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 p-5 rounded-2xl shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  ⚠️ Estado de Alerta de mi Stock
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.filter(p => p.stock <= 5).length === 0 ? (
                    <div className="p-4 text-xs text-green-500 font-bold col-span-2">
                      ✓ Todo tu inventario se encuentra optimizado. ¡Buen trabajo!
                    </div>
                  ) : (
                    products.filter(p => p.stock <= 5).map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-3.5 border rounded-xl flex items-center justify-between shadow-sm transition-colors ${
                          item.stock === 0
                            ? 'border-red-200 bg-red-500/5 dark:border-red-950 dark:bg-red-950/10'
                            : 'border-orange-200 bg-orange-500/5 dark:border-orange-950 dark:bg-orange-950/10'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {item.sku} | Cat: {item.category}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                            item.stock === 0 ? 'bg-red-500 text-white' : 'bg-orange-500 text-white animate-pulse'
                          }`}>
                            {item.stock === 0 ? 'AGOTADO' : `BAJO STOCK: ${item.stock} u.`}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: Seller Products */}
          {activeTab === 'seller_products' && (
            <div className="space-y-6">
              
              {/* Product Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-5 shadow-sm">
                <div className="relative flex-grow max-w-md">
                  <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar en mis productos por nombre o SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-2xl outline-none focus:border-primary-500 dark:text-slate-200"
                  />
                </div>
                
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Subir Producto
                </button>
              </div>

              {/* Product list */}
              <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-3xl p-5 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[750px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-400 font-semibold">
                      <th className="py-2.5">Miniatura</th>
                      <th className="py-2.5">Nombre & SKU</th>
                      <th className="py-2.5 w-24">Precio (S/)</th>
                      <th className="py-2.5 w-24">En Oferta (S/)</th>
                      <th className="py-2.5 w-24">Stock</th>
                      <th className="py-2.5 text-center">Estado</th>
                      <th className="py-2.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-800/40 text-slate-700 dark:text-slate-350">
                    {filteredProducts.map((product) => {
                      const edited = editingProduct[product.id] || {};
                      const priceVal = edited.price !== undefined ? edited.price : product.price;
                      const offerVal = edited.offer_price !== undefined ? edited.offer_price : (product.offer_price || '');
                      const stockVal = edited.stock !== undefined ? edited.stock : product.stock;
                      const hasChanges = edited.price !== undefined || edited.offer_price !== undefined || edited.stock !== undefined;

                      return (
                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-dark-955/20 transition-all">
                          <td className="py-3">
                            <img src={product.primary_image || '/placeholder.jpg'} alt={product.name} className="w-10 h-10 object-contain rounded bg-slate-50 dark:bg-dark-950 p-1 border" />
                          </td>
                          <td className="py-3 pr-2">
                            <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[250px]">{product.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</span>
                          </td>
                          <td className="py-3">
                            <input type="number" step="0.01" value={priceVal} onChange={(e) => handleInlineChange(product.id, 'price', e.target.value)} className="w-20 px-2 py-1 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg outline-none focus:border-primary-500 font-semibold" />
                          </td>
                          <td className="py-3">
                            <input type="number" step="0.01" value={offerVal} onChange={(e) => handleInlineChange(product.id, 'offer_price', e.target.value)} className="w-20 px-2 py-1 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg outline-none focus:border-primary-500 font-semibold text-purple-650" />
                          </td>
                          <td className="py-3">
                            <input type="number" value={stockVal} onChange={(e) => handleInlineChange(product.id, 'stock', e.target.value)} className="w-16 px-2 py-1 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg outline-none focus:border-primary-500 font-semibold" />
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${Number(stockVal) > 0 ? 'bg-green-105 text-green-700' : 'bg-red-105 text-red-700'}`}>
                              {Number(stockVal) > 0 ? 'STOCK' : 'AGOTADO'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleUpdateProduct(product)} disabled={!hasChanges} className={`p-2 rounded-xl transition-all ${hasChanges ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-slate-100 text-slate-400 dark:bg-dark-850 dark:text-slate-650 cursor-not-allowed'}`}><Save size={13} /></button>
                              <button onClick={() => handleDeleteProduct(product)} className="p-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Seller Orders */}
          {activeTab === 'seller_orders' && (
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-3xl p-5 shadow-sm overflow-x-auto">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider mb-6 pb-3 border-b border-slate-100 dark:border-dark-800">
                Logística de mis Ventas
              </h3>
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-400 font-semibold">
                    <th className="py-2.5">Código Rastro</th>
                    <th className="py-2.5">Productos Vendidos</th>
                    <th className="py-2.5">Destino Envío</th>
                    <th className="py-2.5">Mi Subtotal</th>
                    <th className="py-2.5">Estado Pago</th>
                    <th className="py-2.5">Estado Envío</th>
                    <th className="py-2.5 text-right">Gestionar Despacho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-850/60 text-slate-750 dark:text-slate-350">
                  {sellerMetrics.sellerOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-dark-955/20">
                      <td className="py-4 font-mono font-bold text-slate-800 dark:text-white">{o.tracking_number}</td>
                      <td className="py-4 pr-3">
                        <div className="space-y-1">
                          {o.seller_items.map((item, idx) => (
                            <p key={idx} className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.quantity} x {item.product_name} ({item.color || 'Único'}, {item.size || 'Único'})
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 text-slate-500">
                        <p className="font-semibold text-slate-750 dark:text-slate-200">{o.address_details?.street_address}</p>
                        <p className="text-[10px] text-slate-400">{o.address_details?.district}, {o.address_details?.province}</p>
                      </td>
                      <td className="py-4 font-bold text-indigo-500">S/ {o.seller_subtotal.toFixed(2)}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-black ${o.payment_status === 'paid' ? 'bg-green-105 text-green-700' : 'bg-orange-105 text-orange-700'}`}>
                          {o.payment_status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          o.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                          o.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                          o.status === 'pending' ? 'bg-slate-100 text-slate-655' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateLogistics(o.id, e.target.value)}
                          className="bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-[11px] rounded-xl px-2 py-1 outline-none font-semibold text-slate-700 dark:text-slate-300 focus:border-primary-500"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="processing">Procesando</option>
                          <option value="packed">Empaquetado</option>
                          <option value="shipped">Enviado</option>
                          <option value="in_transit">En reparto</option>
                          <option value="delivered">Entregado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}


      {/* ──────────────────────────────────────────────────────── */}
      {/* ─── CASE 3: CUSTOMER PROFILE CONSOLE ("/mi-cuenta") ─── */}
      {/* ──────────────────────────────────────────────────────── */}
      {user?.role === 'client' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column Profile Sidebar */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-850 p-6 rounded-3xl shadow-sm text-center space-y-6 h-fit">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-primary-500/20 mb-3 ring-4 ring-primary-500/10">
                {user?.username ? user?.username[0].toUpperCase() : 'C'}
              </div>
              <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">
                {user?.first_name || user?.username} {user?.last_name || ''}
              </h2>
              <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-3 py-1 border border-indigo-500/20 rounded-full mt-1.5 tracking-wider flex items-center gap-1">
                <Sparkles size={12} /> Cliente VIP Novamarquet
              </span>
            </div>

            {/* Account Quick Stats Chips */}
            <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-slate-100 dark:border-dark-800">
              <div className="bg-slate-50 dark:bg-dark-950 p-3 rounded-2xl border border-slate-100 dark:border-dark-850">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compras</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{orders.length}</span>
              </div>
              <div className="bg-slate-50 dark:bg-dark-950 p-3 rounded-2xl border border-slate-100 dark:border-dark-850">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Favoritos</span>
                <span className="text-sm font-extrabold text-primary-500">{wishlist?.products?.length || 0}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-dark-800 pt-4 flex flex-col gap-1.5">
              {[
                { id: 'customer_orders', label: 'Mis Compras y Rastros', icon: ShoppingBag },
                { id: 'customer_addresses', label: 'Mis Direcciones', icon: MapPin },
                { id: 'customer_wishlist', label: 'Lista de Favoritos', icon: Heart },
                { id: 'customer_profile', label: 'Mi Perfil & Datos', icon: User },
                { id: 'customer_transactions', label: 'Recibos & Pagos', icon: Wallet }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/15'
                      : 'text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-950'
                  }`}
                >
                  <tab.icon size={15} /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column Tab Pages */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Tab: Customer Orders (Mis Pedidos) */}
            {activeTab === 'customer_orders' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider mb-6 pb-3 border-b border-slate-100 dark:border-dark-800 flex items-center justify-between">
                    <span>Historial de Compras y Seguimiento</span>
                    <span className="text-xs font-semibold text-slate-400 font-mono">Total: {orders.length} pedidos</span>
                  </h3>

                  {orders.length === 0 ? (
                    <div className="py-12 px-6 text-center space-y-5 bg-gradient-to-b from-slate-50/50 to-white dark:from-dark-950/30 dark:to-dark-900 rounded-3xl border border-dashed border-slate-200 dark:border-dark-800">
                      <div className="w-16 h-16 rounded-3xl bg-primary-500/10 text-primary-500 flex items-center justify-center mx-auto shadow-inner">
                        <ShoppingBag size={32} className="animate-bounce" />
                      </div>
                      <div className="max-w-md mx-auto space-y-2">
                        <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                          ¡Bienvenido a tu panel personal, {user?.first_name || user?.username}!
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Aún no has realizado ninguna compra en Novamarquet. Explora nuestro catálogo con envíos garantizados a todo el Perú y aprovecha los cupones activos.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-wrap justify-center gap-3">
                        <button
                          onClick={() => navigate('/')}
                          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 hover:shadow-lg hover:shadow-primary-500/25 text-white text-xs font-extrabold rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2"
                        >
                          <ShoppingBag size={15} /> Explorar Productos de la Tienda
                        </button>
                      </div>

                      {/* Feature highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 max-w-lg mx-auto text-left border-t border-slate-100 dark:border-dark-800/80">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          <Truck size={14} className="text-primary-500 flex-shrink-0" />
                          <span>Envío Rápido 24-48h</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                          <span>Compra Protegida</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          <Tag size={14} className="text-purple-500 flex-shrink-0" />
                          <span>Cupones de Descuento</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((o) => (
                        <div key={o.id} className="border border-slate-200/80 dark:border-dark-800 rounded-2xl p-5 space-y-4 bg-slate-50/20 dark:bg-dark-950/10">
                          
                          {/* Order metadata header */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-dark-800 text-xs">
                            <div>
                              <p className="font-bold text-slate-500">Número de Seguimiento:</p>
                              <span className="font-mono font-black text-slate-800 dark:text-white text-sm">{o.tracking_number}</span>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-slate-400 font-bold">Total Facturado:</p>
                              <span className="font-extrabold text-primary-500 text-sm">S/ {Number(o.total).toFixed(2)}</span>
                            </div>
                            <div>
                              <Link 
                                to={`/order-tracking/${o.tracking_number}`}
                                className="px-3.5 py-1.5 text-[11px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors inline-block"
                              >
                                Ver Ruta en Mapa
                              </Link>
                            </div>
                          </div>

                          {/* Order items lists */}
                          <div className="space-y-2">
                            {o.items?.map(item => (
                              <div key={item.id} className="flex justify-between items-center text-xs text-slate-700 dark:text-slate-350">
                                <span className="font-bold truncate max-w-sm">{item.product_name}</span>
                                <span>{item.quantity} u. · S/ {Number(item.price).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Small Visual timeline track preview */}
                          <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-850 p-4 rounded-xl flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-450 uppercase">Estado Actual:</span>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                              o.status === 'delivered' ? 'bg-green-105 text-green-700' :
                              o.status === 'cancelled' ? 'bg-red-105 text-red-700' : 'bg-blue-105 text-blue-700'
                            }`}>
                              {o.status === 'pending' ? 'Pedido Recibido' :
                               o.status === 'processing' ? 'Pago Aprobado' :
                               o.status === 'packed' ? 'Preparando' :
                               o.status === 'shipped' ? 'Despachado' :
                               o.status === 'in_transit' ? 'En reparto' :
                               o.status === 'delivered' ? 'Entregado' : 'Cancelado'}
                            </span>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Customer Addresses (Mis Direcciones) */}
            {activeTab === 'customer_addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 p-5 rounded-3xl shadow-sm">
                  <span className="text-xs text-slate-450 font-bold">Direcciones Registradas de Despacho</span>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-5 py-2.5 text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-2xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={15} /> Agregar Dirección
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.length === 0 ? (
                    <div className="py-10 px-6 text-center space-y-4 bg-white dark:bg-dark-900 rounded-3xl border border-dashed border-slate-200 dark:border-dark-800 col-span-2">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                        <MapPin size={24} />
                      </div>
                      <div className="space-y-1 max-w-sm mx-auto">
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Sin direcciones registradas</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Guarda tus lugares frecuentes (Casa, Trabajo) para agilizar tus compras en Novamarquet.</p>
                      </div>
                      <button
                        onClick={() => setShowAddressModal(true)}
                        className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all inline-flex items-center gap-1.5"
                      >
                        <Plus size={14} /> Registrar mi Primera Dirección
                      </button>
                    </div>
                  ) : (
                    addresses.map((a) => (
                      <div key={a.id} className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-5 rounded-2xl shadow-sm space-y-3.5 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider block">
                              {a.title} {a.is_default && <span className="text-[9px] font-black text-green-500 bg-green-550/10 px-1.5 rounded ml-1.5">Por defecto</span>}
                            </span>
                            <p className="text-xs text-slate-700 dark:text-slate-350 font-semibold mt-2">{a.street_address}</p>
                            <p className="text-[11px] text-slate-450 mt-0.5">{a.district}, {a.province} - {a.department}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-mono">Contacto: {a.phone}</p>
                          </div>
                        </div>
                        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-dark-800">
                          <button
                            onClick={() => handleDeleteAddress(a.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                            title="Eliminar dirección"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab: Customer Wishlist (Favoritos) */}
            {activeTab === 'customer_wishlist' && (
              <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-3xl p-5 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-dark-800">
                  Mi Lista de Favoritos ({wishlist?.products?.length || 0})
                </h3>

                {wishlist?.products?.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No tienes ningún producto en tu lista de favoritos.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-dark-850/60">
                    {wishlist.products.map((p) => (
                      <div key={p.id} className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <img src={p.primary_image || '/placeholder.jpg'} alt={p.name} className="w-14 h-14 object-contain rounded bg-slate-50 dark:bg-dark-950 p-1 border" />
                          <div className="min-w-0">
                            <Link to={`/product/${p.slug}`} className="font-bold text-slate-800 dark:text-white hover:underline text-xs sm:text-sm line-clamp-1">
                              {p.name}
                            </Link>
                            <p className="text-[10px] text-slate-400 mt-0.5">{p.brand?.name} · {p.category}</p>
                            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-1 block">S/ {p.current_price}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={async () => {
                              const res = await addToCart(p.id, 1);
                              if (res.success) notificationHandler?.('¡Agregado al carrito!', 'success');
                              else notificationHandler?.(res.error, 'error');
                            }}
                            className="px-4 py-2 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer"
                          >
                            Añadir al Carrito
                          </button>
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-dark-900 border rounded-xl transition-all"
                            title="Eliminar de favoritos"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Customer Profile (Mi Perfil) */}
            {activeTab === 'customer_profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Profile Form */}
                <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 p-5 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest pb-2 border-b">Datos Personales</h3>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-slate-650 dark:text-slate-355">Nombre</label>
                        <input type="text" value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} className="px-3.5 py-2.5 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl outline-none focus:border-primary-500 text-slate-800 dark:text-slate-250 font-bold" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-slate-650 dark:text-slate-355">Apellido</label>
                        <input type="text" value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} className="px-3.5 py-2.5 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl outline-none focus:border-primary-500 text-slate-800 dark:text-slate-250 font-bold" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-slate-650 dark:text-slate-355">Correo Electrónico</label>
                      <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="px-3.5 py-2.5 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl outline-none focus:border-primary-500 text-slate-800 dark:text-slate-250 font-bold" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-slate-650 dark:text-slate-355">Teléfono Movil</label>
                      <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="px-3.5 py-2.5 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl outline-none focus:border-primary-500 text-slate-800 dark:text-slate-250 font-bold" />
                    </div>

                    <button type="submit" className="w-full py-2.5 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-md transition-all active:scale-95">
                      Guardar Datos
                    </button>
                  </form>
                </div>

                {/* Password Form */}
                <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 p-5 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest pb-2 border-b">Seguridad de Acceso</h3>
                  
                  <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-slate-650 dark:text-slate-355">Contraseña Actual</label>
                      <input type="password" required value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className="px-3.5 py-2.5 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl outline-none focus:border-primary-500 text-slate-800 dark:text-slate-250" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-slate-650 dark:text-slate-355">Nueva Contraseña</label>
                      <input type="password" required value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} className="px-3.5 py-2.5 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl outline-none focus:border-primary-500 text-slate-800 dark:text-slate-250" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-slate-650 dark:text-slate-355">Confirmar Nueva Contraseña</label>
                      <input type="password" required value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="px-3.5 py-2.5 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl outline-none focus:border-primary-500 text-slate-800 dark:text-slate-250" />
                    </div>

                    <button type="submit" className="w-full py-2.5 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-650 rounded-xl shadow-md transition-all active:scale-95">
                      Actualizar Contraseña
                    </button>
                  </form>
                </div>

              </div>
            )}

            {/* Tab: Customer Payments (Mis Pagos) */}
            {activeTab === 'customer_transactions' && (
              <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-3xl p-5 shadow-sm overflow-x-auto">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider mb-6 pb-3 border-b border-slate-100 dark:border-dark-800">
                  Historial de Pagos y Transacciones
                </h3>
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-400 font-semibold">
                      <th className="py-2.5">Nº Seguimiento Pedido</th>
                      <th className="py-2.5">Medio de Pago</th>
                      <th className="py-2.5">Fecha</th>
                      <th className="py-2.5">Monto Cobrado</th>
                      <th className="py-2.5 text-right">Filtro Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-850/60 text-slate-750 dark:text-slate-350">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-dark-955/20 transition-all">
                        <td className="py-3 font-mono font-bold text-slate-800 dark:text-white">{o.tracking_number}</td>
                        <td className="py-3 capitalize">{o.payment_method}</td>
                        <td className="py-3 text-slate-450">{new Date(o.created_at).toLocaleDateString()}</td>
                        <td className="py-3 font-extrabold text-slate-800 dark:text-white">S/ {Number(o.total).toFixed(2)}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${o.payment_status === 'paid' ? 'bg-green-105 text-green-700' : 'bg-orange-105 text-orange-700'}`}>
                            {o.payment_status === 'paid' ? 'COMPLETADO' : 'PENDIENTE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}


      {/* ──────────────────────────────────────────────────────── */}
      {/* ─── MODAL ADD/EDIT PRODUCT (ADMIN & SELLER) ─── */}
      {/* ──────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="flex justify-between items-center px-6 py-4 border-b dark:border-dark-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Box className="text-primary-500" size={16} /> Subir Nuevo Producto
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-450 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-650 dark:text-slate-355">Nombre del Producto</label>
                <input type="text" required placeholder="Ej. Celular Samsung S25 Ultra" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-355">Precio Regular (S/)</label>
                  <input type="number" step="0.01" required placeholder="Ej. 4999.00" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-355">Precio Promoción (S/)</label>
                  <input type="number" step="0.01" placeholder="Opcional" value={newProduct.offer_price} onChange={(e) => setNewProduct({ ...newProduct, offer_price: e.target.value })} className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200 text-purple-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-355">Stock Disponible</label>
                  <input type="number" required placeholder="Ej. 10" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-355">SKU</label>
                  <input type="text" placeholder="Vacío para autogenerar" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-355">Categoría</label>
                  <select required value={newProduct.category_id} onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })} className="px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200">
                    <option value="">Seleccionar...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-355">Marca</label>
                  <select value={newProduct.brand_id} onChange={(e) => setNewProduct({ ...newProduct, brand_id: e.target.value })} className="px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200">
                    <option value="">Seleccionar...</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-650 dark:text-slate-355">Imagen del Producto (URL)</label>
                <input type="text" placeholder="https://images.unsplash.com/..." value={newProduct.image_url} onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200 font-mono text-[10px]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-650 dark:text-slate-355">Descripción</label>
                <textarea placeholder="Detalles técnicos..." value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="px-3.5 py-2 h-16 bg-slate-50 dark:bg-dark-955 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200 resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t dark:border-dark-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border dark:border-dark-800 rounded-xl font-bold hover:bg-slate-50 text-slate-500">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-primary-500 text-white rounded-xl font-bold active:scale-95">Crear Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ──────────────────────────────────────────────────────── */}
      {/* ─── MODAL ADD COUPON (ADMIN) ─── */}
      {/* ──────────────────────────────────────────────────────── */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="flex justify-between items-center px-6 py-4 border-b dark:border-dark-800">
              <h3 className="font-bold text-slate-850 dark:text-slate-100 uppercase tracking-wider">Crear Cupón de Descuento</h3>
              <button onClick={() => setShowCouponModal(false)} className="text-slate-450 hover:text-slate-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddCoupon} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-650 dark:text-slate-355">Código del Cupón</label>
                <input type="text" required placeholder="E.g. PROMO2026" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 font-bold uppercase" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-355">Tipo</label>
                  <select value={newCoupon.discount_type} onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })} className="px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-855 rounded-xl outline-none focus:border-primary-500">
                    <option value="percent">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo (S/)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-355">Valor Descuento</label>
                  <input type="number" required placeholder="Ej. 15" value={newCoupon.value} onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })} className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 font-bold text-primary-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-655 dark:text-slate-355">Duración (Días)</label>
                  <input type="number" required placeholder="E.g. 30" value={newCoupon.expiration_days} onChange={(e) => setNewCoupon({ ...newCoupon, expiration_days: e.target.value })} className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-655 dark:text-slate-355">Usos Máximos</label>
                  <input type="number" required placeholder="E.g. 100" value={newCoupon.max_uses} onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value })} className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t dark:border-dark-800">
                <button type="button" onClick={() => setShowCouponModal(false)} className="px-4 py-2 border dark:border-dark-800 rounded-xl font-bold hover:bg-slate-50 text-slate-500">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-primary-500 text-white rounded-xl font-bold active:scale-95">Crear Cupón</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ──────────────────────────────────────────────────────── */}
      {/* ─── MODAL ADD ADDRESS (CUSTOMER) ─── */}
      {/* ──────────────────────────────────────────────────────── */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="flex justify-between items-center px-6 py-4 border-b dark:border-dark-800">
              <h3 className="font-bold text-slate-855 dark:text-slate-100 uppercase tracking-wider">Agregar Nueva Dirección</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-slate-455 hover:text-slate-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddAddress} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-355">Título Dirección</label>
                  <input type="text" required placeholder="E.g. Mi Casa, Oficina" value={newAddress.title} onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })} className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 font-bold" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-655 dark:text-slate-355">Contacto Telefónico</label>
                  <input type="text" required placeholder="Ej. +51 987654321" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 font-mono" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-655 dark:text-slate-355">Dirección y Número</label>
                <input type="text" required placeholder="Ej. Av. Larco 740, Dpto. 402" value={newAddress.street_address} onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })} className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-655 dark:text-slate-355">Distrito</label>
                  <input type="text" required placeholder="Miraflores" value={newAddress.district} onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })} className="px-2.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-655 dark:text-slate-355">Provincia</label>
                  <input type="text" required placeholder="Lima" value={newAddress.province} onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })} className="px-2.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-655 dark:text-slate-355">Departamento</label>
                  <input type="text" required placeholder="Lima" value={newAddress.department} onChange={(e) => setNewAddress({ ...newAddress, department: e.target.value })} className="px-2.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500" />
                </div>
              </div>

              <div className="flex items-center gap-2 select-none py-1">
                <input type="checkbox" id="addr_default" checked={newAddress.is_default} onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })} className="w-4 h-4 accent-primary-500" />
                <label htmlFor="addr_default" className="font-semibold text-slate-600 dark:text-slate-350 cursor-pointer">Definir como dirección de despacho por defecto</label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t dark:border-dark-800">
                <button type="button" onClick={() => setShowAddressModal(false)} className="px-4 py-2 border dark:border-dark-800 rounded-xl font-bold hover:bg-slate-50 text-slate-500">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-primary-500 text-white rounded-xl font-bold active:scale-95">Guardar Dirección</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
