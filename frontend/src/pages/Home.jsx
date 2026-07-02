import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductCompare from '../components/ProductCompare';
import { 
  Filter, RotateCcw, Smartphone, Laptop, Tablet, Shirt, Gamepad, Home as HomeIcon, 
  CheckCircle, ChevronLeft, ChevronRight, Sparkles, Percent, Flame, Trophy, HelpCircle
} from 'lucide-react';

const Home = ({ notificationHandler }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  
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

  // Home Page slider state
  const [currentSlide, setCurrentSlide] = useState(0);

  const offersScrollRef = React.useRef(null);
  const scrollOffers = (direction) => {
    if (offersScrollRef.current) {
      const scrollAmount = 300;
      offersScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Sync category parameter from URL
  useEffect(() => {
    if (categorySlug) {
      setSelectedCategory(categorySlug);
    }
  }, [categorySlug]);

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
    
    fetchProducts();
  }, [selectedCategory, selectedBrand, priceMin, priceMax, searchQuery, isFeatured]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceMin('');
    setPriceMax('');
    setSearchQuery('');
    setIsFeatured(false);
    navigate('/');
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

  // Check if user is searching or browsing catalog
  const isBrowsingCatalog = selectedCategory || selectedBrand || priceMin || priceMax || searchQuery || isFeatured;

  // Split products for homepage widgets
  const discountProducts = products.filter(p => p.offer_price).slice(0, 10);
  const bestSellers = products.filter(p => p.is_featured).slice(0, 8);
  const recommendedProducts = products.slice(10, 22);

  // Hero slides data
  const slides = [
    {
      badge: "Lanzamiento Exclusivo",
      title: "Samsung Galaxy S25 Ultra",
      desc: "Revolución móvil con procesador Snapdragon 8 Gen 5 y cámara de 200MP con IA. Vendido y respaldado por Tienda Juan.",
      bg: "from-slate-900 via-indigo-950 to-slate-900",
      image: "samsung_s25.jpg",
      action: "Ver Celular",
      link: "/product/samsung-galaxy-s25-ultra"
    },
    {
      badge: "Edición Profesional",
      title: "MacBook Pro 16\" M4 Max",
      desc: "Rendimiento bestial con chip M4 Max, 48GB de RAM unificada y pantalla Liquid Retina XDR. Vendido por Tienda Pedro.",
      bg: "from-slate-900 via-purple-950 to-slate-900",
      image: "macbook_pro.jpg",
      action: "Ver Laptop",
      link: "/product/macbook-pro-16-m4-max"
    },
    {
      badge: "Nueva Consola",
      title: "PlayStation 5 Pro Slim",
      desc: "Gráficos en 4K nativos a 120 FPS y retrocompatibilidad completa. Vendido por Tienda Pedro.",
      bg: "from-slate-900 via-emerald-950 to-slate-900",
      image: "ps5_console.jpg",
      action: "Ver Consola",
      link: "/product/sony-playstation-5-pro-slim"
    }
  ];

  // Auto scroll slides
  useEffect(() => {
    if (!isBrowsingCatalog) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [isBrowsingCatalog]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-colors duration-300">
      
      {/* ─── CASE A: DEFAULT HOMEPAGE (AMAZON STYLE) ─── */}
      {!isBrowsingCatalog && (
        <div className="space-y-12">
          
          {/* 1. Hero Slider Banner */}
          <div className="relative h-[340px] sm:h-[420px] rounded-3xl overflow-hidden shadow-xl border border-slate-200/20 dark:border-dark-800">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 bg-gradient-to-r ${slide.bg} text-white flex flex-col justify-center px-8 sm:px-16 transition-opacity duration-700 ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Visual Glow rings */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="max-w-lg z-10">
                  <span className="bg-white/10 text-white font-extrabold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
                    {slide.badge}
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="mt-4 text-xs sm:text-sm text-slate-350 leading-relaxed font-medium">
                    {slide.desc}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to={slide.link}
                      className="px-6 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-50 active:scale-95 transition-all rounded-xl shadow-md"
                    >
                      {slide.action}
                    </Link>
                    <span className="flex items-center gap-1.5 text-xs text-slate-200 font-semibold bg-white/5 px-3.5 py-2 rounded-xl border border-white/5">
                      <CheckCircle size={13} className="text-green-400" /> Multi-vendedor Oficial
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider arrows */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/55 text-white transition-all active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/55 text-white transition-all active:scale-90"
            >
              <ChevronRight size={20} />
            </button>

            {/* Indicator dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentSlide ? 'bg-white w-6' : 'bg-white/45'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 2. Visual Categories Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-primary-500 pl-3">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                Categorías Populares
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Laptops Pro", slug: "laptops", desc: "Equipos de alto rendimiento", color: "from-blue-500/10 to-indigo-500/10 border-blue-500/10", text: "text-blue-500", icon: Laptop },
                { name: "Celulares Smart", slug: "celulares", desc: "Últimas generaciones", color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/10", text: "text-emerald-500", icon: Smartphone },
                { name: "Consolas & Gaming", slug: "consolas", desc: "El mejor entretenimiento", color: "from-purple-500/10 to-pink-500/10 border-purple-500/10", text: "text-purple-500", icon: Gamepad },
                { name: "Hogar Nova", slug: "hogar", desc: "Espacios más modernos", color: "from-amber-500/10 to-orange-500/10 border-amber-500/10", text: "text-amber-500", icon: HomeIcon }
              ].map((c, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`cursor-pointer group p-5 rounded-2xl bg-gradient-to-br ${c.color} border hover:border-primary-500/30 shadow-sm hover:shadow-lg transition-all duration-300`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 flex items-center justify-center ${c.text} group-hover:scale-108 transition-all`}>
                    <c.icon size={20} />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-4 group-hover:text-primary-500 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-[11px] text-slate-450 dark:text-slate-550 mt-1">
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Ofertas del Día Horizontal Scroll */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-l-4 border-red-500 pl-3">
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-red-500 animate-pulse" />
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  Super Ofertas del Día
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                  Descuentos del 10% al 30%
                </span>
              </div>
            </div>
            {discountProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No hay ofertas disponibles.</div>
            ) : (
              <div className="relative group">
                {/* Botón Izquierdo Flotante en el Centro */}
                <button
                  onClick={() => scrollOffers('left')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/95 dark:bg-dark-900/95 border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-350 hover:bg-primary-500 hover:text-white hover:border-primary-500 shadow-xl transition-all duration-300 active:scale-90 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Deslizar izquierda"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Botón Derecho Flotante en el Centro */}
                <button
                  onClick={() => scrollOffers('right')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/95 dark:bg-dark-900/95 border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-350 hover:bg-primary-500 hover:text-white hover:border-primary-500 shadow-xl transition-all duration-300 active:scale-90 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Deslizar derecha"
                >
                  <ChevronRight size={18} />
                </button>

                <div 
                  ref={offersScrollRef} 
                  className="flex overflow-x-auto gap-6 pb-4 pt-1 snap-x no-scrollbar select-none scroll-smooth px-1"
                >
                  {discountProducts.map((product) => (
                    <div key={product.id} className="w-[280px] flex-shrink-0 snap-start">
                      <ProductCard product={product} onNotify={notificationHandler} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Banner Secundario */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row justify-between items-center gap-6 border border-slate-800">
            <div className="max-w-md">
              <span className="text-[9px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest">
                Marketplace Multi-vendedor
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-3 leading-tight">
                ¿Tienes productos que vender?
              </h3>
              <p className="text-xs text-slate-350 mt-1.5">
                Únete a Tienda Juan, Pedro y Carlos. Crea tu tienda virtual hoy y empieza a vender a miles de usuarios.
              </p>
            </div>
            <Link
              to="/register?role=seller"
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/15 transition-all active:scale-95 whitespace-nowrap"
            >
              Registrarse como Vendedor
            </Link>
          </div>

          {/* 5. Más Vendidos (Trophy) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-indigo-500 pl-3">
              <Trophy size={20} className="text-indigo-500" />
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                Los Más Vendidos
              </h2>
            </div>
            {bestSellers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No hay productos destacados.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} onNotify={notificationHandler} />
                ))}
              </div>
            )}
          </div>

          {/* 6. Catálogo de Recomendados */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-purple-500 pl-3">
              <Sparkles size={20} className="text-purple-500" />
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                Recomendados Para Ti
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {recommendedProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} onNotify={notificationHandler} />
              ))}
            </div>
          </div>

          {/* 7. Marcas Aliadas */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-dark-850">
            <div className="text-center">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Marcas Oficiales e Independientes
              </h3>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-65 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 py-4">
              {brands.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBrand(b.slug)}
                  className="cursor-pointer text-center font-black text-xl sm:text-2xl text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors uppercase tracking-tight"
                >
                  {b.name}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}


      {/* ─── CASE B: CATALOG SEARCH / BROWSE VIEW ─── */}
      {isBrowsingCatalog && (
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
                <RotateCcw size={10} /> Limpiar todo
              </button>
            </div>

            {/* Selected Active Filters Badges */}
            <div className="flex flex-wrap gap-1.5">
              {selectedCategory && (
                <span className="px-2 py-0.5 text-[9px] font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20 rounded-full flex items-center gap-1">
                  Cat: {selectedCategory}
                  <button onClick={() => setSelectedCategory('')} className="hover:text-red-500 font-black">×</button>
                </span>
              )}
              {selectedBrand && (
                <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-full flex items-center gap-1">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('')} className="hover:text-red-500 font-black">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-full flex items-center gap-1">
                  Buscar: "{searchQuery}"
                  <button onClick={() => { setSearchQuery(''); navigate('/'); }} className="hover:text-red-500 font-black">×</button>
                </span>
              )}
            </div>

            {/* Categories list */}
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
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-dark-950'
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
                                : 'text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
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

            {/* Brands list */}
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

          {/* PRODUCTS LISTING GRID */}
          <div className="lg:col-span-3 space-y-6">
            
            <div className="flex justify-between items-center bg-white dark:bg-dark-900 border border-slate-200/70 dark:border-dark-850 p-4 rounded-2xl shadow-sm">
              <div>
                <button 
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-primary-500 hover:underline mr-4"
                >
                  ← Ir a la Portada
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  Resultados: <span className="text-slate-800 dark:text-slate-250 font-extrabold">{products.length}</span> items
                </span>
              </div>
              
              {/* Featured toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
                <input 
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-primary-500 rounded border-slate-350 dark:bg-dark-900 focus:ring-0"
                />
                Destacados
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
      )}

    </div>
  );
};

export default Home;
