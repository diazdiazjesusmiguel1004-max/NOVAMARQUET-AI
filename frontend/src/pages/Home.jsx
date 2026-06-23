import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductCompare from '../components/ProductCompare';
import { 
  Filter, RotateCcw, Smartphone, Laptop, Tablet, Shirt, Gamepad, Home as HomeIcon, CheckCircle
} from 'lucide-react';

const Home = ({ notificationHandler }) => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync search query with URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  // Fetch Categories & Brands
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await api.get('categories/');
        setCategories(catRes.data);
        const brandRes = await api.get('brands/');
        setBrands(brandRes.data);
      } catch (err) {
        console.error('Error fetching categories/brands metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Products based on filter triggers
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (selectedBrand) params.brand = selectedBrand;
        if (priceMin) params.price_min = priceMin;
        if (priceMax) params.price_max = priceMax;
        if (searchQuery) params.search = searchQuery;
        if (isFeatured) params.featured = 'true';

        const res = await api.get('products/', { params });
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products list:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce/delay trigger or immediate fetch
    fetchProducts();
  }, [selectedCategory, selectedBrand, priceMin, priceMax, searchQuery, isFeatured]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceMin('');
    setPriceMax('');
    setSearchQuery('');
    setIsFeatured(false);
  };

  // Map category icons helper
  const getCategoryIcon = (iconName) => {
    const map = {
      'Tv': Smartphone,
      'Laptop': Laptop,
      'Smartphone': Smartphone,
      'Tablet': Tablet,
      'Shirt': Shirt,
      'Gamepad': Gamepad,
      'Home': HomeIcon
    };
    const Component = map[iconName] || Smartphone;
    return <Component size={16} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-colors duration-300">
      
      {/* Promo Hero Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden mb-8 shadow-lg shadow-primary-500/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-black/10 rounded-full blur-2xl" />
        
        <div className="max-w-lg z-10 relative">
          <span className="bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
            TECNOLOGÍA DEL FUTURO
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 leading-tight">
            NOVAMARQUET <br/>INTELIGENCIA ARTIFICIAL
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-100/90 leading-relaxed font-medium">
            Bienvenido al e-commerce del mañana. Explora nuestra gama inteligente y experimenta con simuladores virtuales 3D interactivos antes de comprar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button 
              onClick={() => setIsFeatured(true)}
              className="px-6 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-50 active:scale-95 transition-all rounded-xl shadow-md"
            >
              Ver Destacados
            </button>
            <span className="flex items-center gap-1.5 text-xs text-slate-200 font-semibold bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm border border-white/10">
              <CheckCircle size={14} className="text-green-400" /> Entregas en 24h a Perú
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTERS SIDEBAR */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-850 rounded-2xl p-5 shadow-sm h-fit space-y-6">
          
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-800 pb-3">
            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
              <Filter size={16} /> Filtros de Búsqueda
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[10px] text-slate-400 hover:text-primary-500 font-bold flex items-center gap-0.5 transition-colors"
              title="Limpiar filtros"
            >
              <RotateCcw size={10} /> Reiniciar
            </button>
          </div>

          {/* Search bar inside sidebar (for mobile accessibility) */}
          <div className="flex flex-col gap-1.5 md:hidden">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Buscar</label>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-primary-500"
            />
          </div>

          {/* Categories select sidebar */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Categorías</label>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-all ${
                  selectedCategory === ''
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10'
                    : 'text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-dark-950'
                }`}
              >
                Todas las categorías
              </button>
              {categories.map((cat) => (
                <div key={cat.id} className="space-y-0.5">
                  <button
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-left transition-all ${
                      selectedCategory === cat.slug
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10'
                        : 'text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-dark-950'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {cat.icon && getCategoryIcon(cat.icon)}
                      {cat.name}
                    </span>
                  </button>
                  
                  {/* Nested Subcategories */}
                  {cat.subcategories?.length > 0 && (
                    <div className="pl-4 flex flex-col gap-0.5 mt-0.5">
                      {cat.subcategories.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedCategory(sub.slug)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg text-left transition-all ${
                            selectedCategory === sub.slug
                              ? 'text-primary-500 dark:text-primary-400 font-bold bg-primary-500/5 dark:bg-primary-500/10'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          • {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Brands list checklist */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Marcas</label>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSelectedBrand('')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-all ${
                  selectedBrand === ''
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-dark-950'
                }`}
              >
                Todas las marcas
              </button>
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.slug)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-all ${
                    selectedBrand === brand.slug
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-dark-950'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Filters */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Rango de Precio</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min S/"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-1/2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max S/"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-1/2 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

        </div>

        {/* PRODUCTS LISTING */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="flex justify-between items-center bg-white dark:bg-dark-900 border border-slate-200/70 dark:border-dark-850 p-4 rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Mostrando <span className="text-slate-800 dark:text-slate-200 font-extrabold">{products.length}</span> productos
            </div>
            
            {/* Featured toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-650 dark:text-slate-400">
              <input 
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-primary-500 rounded border-slate-350 dark:bg-dark-900 focus:ring-0"
              />
              Destacados primero
            </label>
          </div>

          {/* Product grid container */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-2xl p-4 h-80 animate-pulse space-y-3">
                  <div className="bg-slate-100 dark:bg-dark-955 w-full h-1/2 rounded-xl" />
                  <div className="bg-slate-100 dark:bg-dark-955 w-3/4 h-4 rounded" />
                  <div className="bg-slate-100 dark:bg-dark-955 w-1/2 h-4 rounded" />
                  <div className="bg-slate-100 dark:bg-dark-955 w-full h-10 rounded-xl mt-6" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-2xl p-12 text-center text-slate-400">
              No se encontraron productos con los filtros seleccionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNotify={notificationHandler}
                />
              ))}
            </div>
          )}

          {/* Product Technical Comparisons module */}
          {products.length > 0 && (
            <ProductCompare currentProduct={products[0]} allProducts={products} />
          )}

        </div>

      </div>

    </div>
  );
};

export default Home;
