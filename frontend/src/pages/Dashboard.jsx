import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, ShieldAlert, ShoppingBag, Eye, CheckCircle, RefreshCw, 
  Smartphone, Plus, Trash2, Save, X, Search, Layers, Box, Tag
} from 'lucide-react';
import api from '../services/api';
import { useStore } from '../store/useStore';
import StatsDashboard from '../components/StatsDashboard';

const Dashboard = ({ notificationHandler }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useStore();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'inventory', 'logistics'
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Inline edit state
  const [editingProduct, setEditingProduct] = useState({});

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    offer_price: '',
    stock: '',
    sku: '',
    slug: '',
    description: '',
    brand_id: '',
    category_id: '',
    colors: 'Space Gray, Silver',
    sizes: '16GB RAM, 32GB RAM',
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80&fit=crop'
  });
  
  const fetchDashboardData = async () => {
    try {
      const res = await api.get('dashboard/summary/');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard summary stats:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('orders/');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching dashboard orders:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('products/');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching inventory products:', err);
    }
  };

  const fetchBrandsAndCategories = async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        api.get('brands/'),
        api.get('categories/')
      ]);
      setBrands(brandsRes.data);
      
      // Flatten subcategories for selection
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
      console.error('Error fetching brands or categories:', err);
    }
  };

  useEffect(() => {
    // Role Gate: Redirect clients or unauthenticated users
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'admin' && user.role !== 'seller') {
      notificationHandler('Acceso Denegado: Permisos Insuficientes.', 'error');
      navigate('/');
      return;
    }

    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(), 
        fetchOrders(), 
        fetchProducts(), 
        fetchBrandsAndCategories()
      ]);
      setLoading(false);
    };
    
    loadAll();
  }, [isAuthenticated, user]);

  const handleUpdateLogistics = async (orderId, newStatus) => {
    try {
      const res = await api.post(`orders/${orderId}/update_logistics/`, {
        status: newStatus
      });
      notificationHandler('Estado logístico de pedido actualizado.', 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      fetchDashboardData();
    } catch (err) {
      notificationHandler('Error al actualizar estado logístico.', 'error');
    }
  };

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
      notificationHandler(`¡Producto "${product.name}" actualizado con éxito!`, 'success');
      
      // Update local products list
      setProducts(prev => prev.map(p => p.id === product.id ? res.data : p));
      
      // Clear editing state for this product
      setEditingProduct(prev => {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      });
      fetchDashboardData();
    } catch (err) {
      notificationHandler('Error al actualizar el producto.', 'error');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el producto "${product.name}"?`)) return;
    try {
      await api.delete(`products/${product.slug}/`);
      notificationHandler('Producto eliminado con éxito.', 'success');
      setProducts(prev => prev.filter(p => p.id !== product.id));
      fetchDashboardData();
    } catch (err) {
      notificationHandler('Error al eliminar el producto.', 'error');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      if (!newProduct.category_id) {
        notificationHandler('La categoría es obligatoria.', 'error');
        return;
      }
      
      // Auto-generate slug and SKU if not provided
      const generatedSlug = newProduct.slug || newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const generatedSku = newProduct.sku || `PROD-NEW-${Math.floor(1000 + Math.random() * 9000)}`;
      
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
        image_url: newProduct.image_url
      };
      
      const res = await api.post('products/', payload);
      notificationHandler('¡Nuevo producto agregado con éxito!', 'success');
      
      // Add newly created product to the front of list
      setProducts(prev => [res.data, ...prev]);
      setShowAddModal(false);
      
      // Reset form
      setNewProduct({
        name: '',
        price: '',
        offer_price: '',
        stock: '',
        sku: '',
        slug: '',
        description: '',
        brand_id: '',
        category_id: '',
        colors: 'Space Gray, Silver',
        sizes: '16GB RAM, 32GB RAM',
        is_featured: false,
        image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80&fit=crop'
      });
      fetchDashboardData();
    } catch (err) {
      notificationHandler('Error al crear el producto. Verifica los campos.', 'error');
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Cargando Panel de Control de Analíticas...
      </div>
    );
  }

  if (user?.role !== 'admin' && user?.role !== 'seller') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert size={48} className="text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Acceso Restringido</h2>
        <p className="text-xs text-slate-400">Tu usuario no cuenta con privilegios administrativos para acceder a este dashboard.</p>
      </div>
    );
  }

  // Filter products by search query
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <BarChart3 className="text-purple-500" /> NOVAMARQUET-AI Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">Gestión administrativa de logística, inventario y análisis de clics en tiempo real.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 dark:bg-dark-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-dark-800/80">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-150 shadow-sm'
                : 'text-slate-450 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Métricas y Clics
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'inventory'
                ? 'bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-150 shadow-sm'
                : 'text-slate-450 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Inventario y Stock
          </button>
          <button
            onClick={() => setActiveTab('logistics')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'logistics'
                ? 'bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-150 shadow-sm'
                : 'text-slate-450 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Gestión Logística ({orders.length})
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'analytics' && (
        <StatsDashboard data={dashboardData} />
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          
          {/* Inventory Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-5 shadow-sm">
            <div className="relative flex-grow max-w-md">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-2xl outline-none focus:border-purple-500 dark:text-slate-200"
              />
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-2xl shadow-md shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Agregar Producto
            </button>
          </div>

          {/* Products List Table */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-3xl p-5 shadow-sm overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 pb-3 border-b border-slate-100 dark:border-dark-800">
              Control de Stock y Precios
            </h3>
            
            <table className="w-full text-left text-xs min-w-[800px]">
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
              <tbody className="divide-y divide-slate-100 dark:divide-dark-800/40 text-slate-750 dark:text-slate-350">
                {filteredProducts.map((product) => {
                  const edited = editingProduct[product.id] || {};
                  
                  // Live values from input box or fallback to product model value
                  const priceVal = edited.price !== undefined ? edited.price : product.price;
                  const offerVal = edited.offer_price !== undefined ? edited.offer_price : (product.offer_price || '');
                  const stockVal = edited.stock !== undefined ? edited.stock : product.stock;
                  
                  const isAgotado = Number(stockVal) <= 0;
                  const hasUnsavedChanges = edited.price !== undefined || edited.offer_price !== undefined || edited.stock !== undefined;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-dark-955/20 transition-all">
                      {/* Image Thumbnail */}
                      <td className="py-3">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-dark-950 rounded-xl overflow-hidden flex items-center justify-center p-1 border">
                          <img 
                            src={product.primary_image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=100'} 
                            alt={product.name} 
                            className="object-contain w-full h-full"
                          />
                        </div>
                      </td>
                      
                      {/* Name / SKU */}
                      <td className="py-3 pr-2">
                        <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[250px]">{product.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</span>
                      </td>

                      {/* Regular Price Input */}
                      <td className="py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={priceVal}
                          onChange={(e) => handleInlineChange(product.id, 'price', e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg outline-none focus:border-purple-500 font-semibold"
                        />
                      </td>

                      {/* Promo Offer Price Input */}
                      <td className="py-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Sin promo"
                          value={offerVal}
                          onChange={(e) => handleInlineChange(product.id, 'offer_price', e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg outline-none focus:border-purple-500 font-semibold text-purple-600 dark:text-purple-400"
                        />
                      </td>

                      {/* Stock Quantity Input */}
                      <td className="py-3">
                        <input
                          type="number"
                          value={stockVal}
                          onChange={(e) => handleInlineChange(product.id, 'stock', e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-lg outline-none focus:border-purple-500 font-semibold"
                        />
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          isAgotado ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {isAgotado ? 'AGOTADO' : 'EN STOCK'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateProduct(product)}
                            disabled={!hasUnsavedChanges}
                            className={`p-2 rounded-xl transition-all ${
                              hasUnsavedChanges 
                                ? 'bg-purple-500 text-white hover:bg-purple-600 active:scale-95 shadow-md shadow-purple-500/10' 
                                : 'bg-slate-100 text-slate-400 dark:bg-dark-850 dark:text-slate-600 cursor-not-allowed'
                            }`}
                            title="Guardar cambios"
                          >
                            <Save size={14} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 transition-all active:scale-90"
                            title="Eliminar producto"
                          >
                            <Trash2 size={14} />
                          </button>
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

      {activeTab === 'logistics' && (
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-3xl p-5 shadow-sm overflow-x-auto">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100 dark:border-dark-800">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Timeline de Órdenes y Logística</h3>
              <p className="text-[11px] text-slate-455">Cambia el estado de envío para activar notificaciones de tracking automáticas al cliente.</p>
            </div>
            <button 
              onClick={() => { fetchOrders(); fetchDashboardData(); }}
              className="p-2 bg-slate-50 dark:bg-dark-955 rounded-xl border hover:bg-slate-100 transition-colors"
              title="Recargar órdenes"
            >
              <RefreshCw size={14} className="text-slate-450" />
            </button>
          </div>

          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-dark-800 text-slate-400 font-semibold">
                <th className="py-2.5">Código Orden</th>
                <th className="py-2.5">Comprador</th>
                <th className="py-2.5">Fecha</th>
                <th className="py-2.5">Total</th>
                <th className="py-2.5">Pago status</th>
                <th className="py-2.5">Estado Logístico</th>
                <th className="py-2.5 text-right">Acciones de Despacho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-800/40 text-slate-750 dark:text-slate-350">
              {orders.map((order) => {
                const isPaid = order.payment_status === 'paid';
                
                return (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-dark-955/20">
                    <td className="py-4 font-bold font-mono text-[11px] text-slate-800 dark:text-slate-200">
                      {order.tracking_number}
                    </td>
                    <td className="py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-250">{order.address_details?.street_address || 'Sin Direccion'}</p>
                      <span className="text-[10px] text-slate-400">Distrito: {order.address_details?.district}</span>
                    </td>
                    <td className="py-4 text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 font-bold">
                      S/ {Number(order.total).toFixed(2)}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold ${
                        isPaid ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-orange-500/10 text-orange-600'
                      }`}>
                        {order.payment_status === 'paid' ? 'APROBADO' : 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold capitalize ${
                        order.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                        order.status === 'pending' ? 'bg-slate-100 text-slate-600' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {order.status === 'pending' ? 'Pendiente' :
                         order.status === 'processing' ? 'Procesando' :
                         order.status === 'packed' ? 'Empaquetado' :
                         order.status === 'shipped' ? 'Enviado' :
                         order.status === 'in_transit' ? 'En reparto' :
                         order.status === 'delivered' ? 'Entregado' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateLogistics(order.id, e.target.value)}
                        className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-[11px] rounded-xl px-2 py-1 outline-none font-semibold text-slate-700 dark:text-slate-300 focus:border-purple-500"
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b dark:border-dark-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                <Box className="text-primary-500" size={16} /> Crear Nuevo Producto (3D)
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-650 dark:text-slate-350">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. MacBook Pro M4 Gold, iPhone 17 Red"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200"
                />
              </div>

              {/* Price & Offer Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-350">Precio Regular (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ej. 1200.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-350">Precio Oferta / Promoción (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Opcional"
                    value={newProduct.offer_price}
                    onChange={(e) => setNewProduct({ ...newProduct, offer_price: e.target.value })}
                    className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200 text-purple-500"
                  />
                </div>
              </div>

              {/* Stock & SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-350">Stock Inicial</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej. 15"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-350">SKU (Código único)</label>
                  <input
                    type="text"
                    placeholder="Autogenerado si está vacío"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Category & Brand selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-350">Categoría</label>
                  <select
                    required
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                    className="px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200"
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-350">Marca</label>
                  <select
                    value={newProduct.brand_id}
                    onChange={(e) => setNewProduct({ ...newProduct, brand_id: e.target.value })}
                    className="px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200"
                  >
                    <option value="">Seleccionar...</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Colors & Sizes comma separated */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-350">Colores (Separados por coma)</label>
                  <input
                    type="text"
                    value={newProduct.colors}
                    onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                    placeholder="Ej. Negro, Blanco, Azul"
                    className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-650 dark:text-slate-350">Tamaños/Capacidades</label>
                  <input
                    type="text"
                    value={newProduct.sizes}
                    onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                    placeholder="Ej. 128GB, 256GB"
                    className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-650 dark:text-slate-350">Enlace de Imagen 3D (Unsplash URL / Ruta)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200 text-[10px] font-mono"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-650 dark:text-slate-350">Descripción del Producto</label>
                <textarea
                  placeholder="Escribe detalles del producto aquí..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="px-3.5 py-2 h-16 bg-slate-50 dark:bg-dark-955 border border-slate-200 dark:border-dark-850 rounded-xl outline-none focus:border-primary-500 dark:text-slate-200 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t dark:border-dark-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border dark:border-dark-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-dark-950 active:scale-95 transition-all text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold shadow-md shadow-primary-500/10 active:scale-95 transition-all"
                >
                  Crear Producto
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
