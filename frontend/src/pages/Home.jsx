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

  // Fetch initial lookups: categories and brands
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('categories/'),
          api.get('brands/')
        ]);
        setCategories(catRes.data);
        setBrands(brandRes.data);
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products list on filters change
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
        if (isFeatured) params.is_featured = true;

        const res = await api.get('products/', { params });
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
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

  // Hero slides data using real pre-seeded products
  const slides = [
    {
      badge: "Lanzamiento Exclusivo",
      title: "Samsung Galaxy S25 Ultra",
      desc: "Revolución móvil con procesador Snapdragon 8 Gen 5 y cámara de 200MP con IA. El smartphone del año ya está disponible.",
      bg: "from-slate-900 via-indigo-950 to-slate-900",
      image: products.find(p => p.slug === 'samsung-galaxy-s25-ultra')?.primary_image || 'samsung_s25.jpg',
      action: "Ver Celular",
      link: "/product/samsung-galaxy-s25-ultra"
    },
    {
      badge: "Edición Profesional",
      title: "MacBook Pro 16\" M4 Max",
      desc: "Rendimiento bestial con chip M4 Max, 48GB de RAM unificada y pantalla Liquid Retina XDR para creadores.",
      bg: "from-slate-900 via-purple-950 to-slate-900",
      image: products.find(p => p.slug === 'macbook-pro-16-m4-max')?.primary_image || 'macbook_pro.jpg',
      action: "Ver Laptop",
      link: "/product/macbook-pro-16-m4-max"
    },
    {
      badge: "Nueva Consola Slim",
      title: "PlayStation 5 Pro Slim",
      desc: "Gráficos en 4K nativos a 120 FPS y retrocompatibilidad completa. Disfruta del mejor gaming oficial.",
      bg: "from-[#1d2731] via-[#2d3b48] to-[#1d2731]",
      image: products.find(p => p.slug === 'sony-playstation-5-pro-slim')?.primary_image || 'ps5_console.jpg',
      action: "Ver Consola",
      link: "/product/sony-playstation-5-pro-slim"
    }
  ];

  // Auto scroll slides
  useEffect(() => {
    if (!isBrowsingCatalog) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 7000);
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
    <div className="min-h-screen bg-white dark:bg-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-0 transition-colors duration-300">
      
      {/* ─── CASE A: DEFAULT HOMEPAGE (AMAZON STYLE) ─── */}
      {!isBrowsingCatalog && (
        <div className="space-y-6 pb-12">
          
          {/* 1. Full-bleed Hero Slider Banner */}
          <div className="relative h-[280px] sm:h-[480px] overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 bg-gradient-to-r ${slide.bg} text-white flex flex-col justify-start pt-12 sm:pt-20 px-8 sm:px-16 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background image fade */}
                {slide.image && (
                  <div className="absolute inset-0 w-full h-full mix-blend-overlay opacity-30">
                    <img src={slide.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                
                {/* Bottom gradient overlay to transition to light gray bg */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white dark:from-white to-transparent z-10 pointer-events-none" />

                <div className="max-w-xl z-20 space-y-3">
                  <span className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded">
                    {slide.badge}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-semibold max-w-lg">
                    {slide.desc}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => navigate('/')}
                      className="px-5 py-2 text-xs font-bold text-slate-900 bg-[#febd69] hover:bg-[#f3a847] transition-all rounded shadow"
                    >
                      {slide.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider arrows */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-4 top-[35%] sm:top-[40%] -translate-y-1/2 z-20 p-3 rounded text-slate-800 dark:text-white hover:border hover:border-slate-400/50 cursor-pointer"
            >
              <ChevronLeft size={36} className="stroke-[1.5]" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-4 top-[35%] sm:top-[40%] -translate-y-1/2 z-20 p-3 rounded text-slate-800 dark:text-white hover:border hover:border-slate-400/50 cursor-pointer"
            >
              <ChevronRight size={36} className="stroke-[1.5]" />
            </button>
          </div>

          {/* 2. Overlapping Card Grid (Classic Amazon) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-30 -mt-16 sm:-mt-44 max-w-7xl mx-auto px-1 sm:px-4">
            
            {/* Card 1: Laptops */}
            <div className="bg-white p-5 shadow-sm rounded-none border border-slate-200/50 flex flex-col justify-between h-[360px]">
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                Laptops de Alto Rendimiento
              </h3>
              <div className="my-3 h-52 w-full bg-slate-50 overflow-hidden flex items-center justify-center">
                <img 
                  src={products.find(p => p.category_slug === 'laptops' || p.category?.toLowerCase() === 'laptops')?.primary_image || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500'} 
                  alt="Laptops" 
                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                />
              </div>
              <button 
                onClick={() => setSelectedCategory('laptops')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 text-left hover:underline cursor-pointer"
              >
                Ver todas las laptops
              </button>
            </div>

            {/* Card 2: Celulares */}
            <div className="bg-white p-5 shadow-sm rounded-none border border-slate-200/50 flex flex-col justify-between h-[360px]">
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                Celulares Inteligentes
              </h3>
              <div className="my-3 h-52 w-full bg-slate-50 overflow-hidden flex items-center justify-center">
                <img 
                  src={products.find(p => p.category_slug === 'celulares' || p.category?.toLowerCase() === 'celulares')?.primary_image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'} 
                  alt="Celulares" 
                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                />
              </div>
              <button 
                onClick={() => setSelectedCategory('celulares')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 text-left hover:underline cursor-pointer"
              >
                Explorar celulares
              </button>
            </div>

            {/* Card 3: Consolas */}
            <div className="bg-white p-5 shadow-sm rounded-none border border-slate-200/50 flex flex-col justify-between h-[360px]">
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                Consolas y Gaming
              </h3>
              <div className="my-3 h-52 w-full bg-slate-50 overflow-hidden flex items-center justify-center">
                <img 
                  src={products.find(p => p.category_slug === 'consolas' || p.category?.toLowerCase() === 'consolas')?.primary_image || 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500'} 
                  alt="Consolas" 
                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                />
              </div>
              <button 
                onClick={() => setSelectedCategory('consolas')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 text-left hover:underline cursor-pointer"
              >
                Ver videojuegos y consolas
              </button>
            </div>

            {/* Card 4: Ropa */}
            <div className="bg-white p-5 shadow-sm rounded-none border border-slate-200/50 flex flex-col justify-between h-[360px]">
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                Moda y Ropa Nova
              </h3>
              <div className="my-3 h-52 w-full bg-slate-50 overflow-hidden flex items-center justify-center">
                <img 
                  src={products.find(p => p.category_slug === 'ropa' || p.category?.toLowerCase() === 'ropa' || p.category_slug === 'moda' || p.category?.toLowerCase() === 'moda')?.primary_image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500'} 
                  alt="Moda y Ropa" 
                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                />
              </div>
              <button 
                onClick={() => setSelectedCategory('ropa')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 text-left hover:underline cursor-pointer"
              >
                Explorar moda y ropa
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto space-y-6 px-1 sm:px-4">
            
            {/* 3. Ofertas del Día Horizontal Scroll (White Card Amazon style) */}
            <div className="bg-white border border-slate-200/50 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Flame size={20} className="text-red-500 animate-pulse" />
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">
                    Super Ofertas del Día
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded uppercase tracking-wider">
                    Descuentos del 10% al 30%
                  </span>
                </div>
              </div>

              {discountProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No hay ofertas disponibles.</div>
              ) : (
                <div className="relative group">
                  {/* Botón Izquierdo Flotante */}
                  <button
                    onClick={() => scrollOffers('left')}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/95 border border-slate-200 text-slate-700 hover:bg-primary-500 hover:text-white hover:border-primary-500 shadow-xl transition-all duration-300 active:scale-90 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Deslizar izquierda"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {/* Botón Derecho Flotante */}
                  <button
                    onClick={() => scrollOffers('right')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/95 border border-slate-200 text-slate-700 hover:bg-primary-500 hover:text-white hover:border-primary-500 shadow-xl transition-all duration-300 active:scale-90 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Deslizar derecha"
                  >
                    <ChevronRight size={18} />
                  </button>

                  <div 
                    ref={offersScrollRef} 
                    className="flex overflow-x-auto gap-6 pb-2 pt-1 snap-x no-scrollbar select-none scroll-smooth"
                  >
                    {discountProducts.map((product) => (
                      <div key={product.id} className="w-[260px] flex-shrink-0 snap-start">
                        <ProductCard product={product} onNotify={notificationHandler} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Banner Multi-vendedor */}
            <div className="bg-slate-900 text-white rounded-none p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-slate-800">
              <div className="max-w-md">
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">
                  Marketplace Oficial
                </span>
                <h3 className="text-xl font-extrabold mt-2 leading-tight">
                  ¿Tienes productos que vender en el Perú?
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Únete a Tienda Juan, Pedro y Carlos. Crea tu tienda virtual hoy y empieza a vender a miles de usuarios.
                </p>
              </div>
              <Link
                to="/register?role=seller"
                className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-[#febd69] hover:bg-[#f3a847] rounded shadow active:scale-95 whitespace-nowrap"
              >
                Registrarse como Vendedor
              </Link>
            </div>

            {/* 5. Los Más Vendidos (White Card Grid) */}
            <div className="bg-white border border-slate-200/50 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                <Trophy size={18} className="text-amber-500" />
                <h2 className="text-lg font-black text-slate-800 tracking-tight">
                  Los Más Vendidos en Novamarquet
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

            {/* 6. Recomendados para Ti */}
            <div className="bg-white border border-slate-200/50 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                <Sparkles size={18} className="text-purple-500" />
                <h2 className="text-lg font-black text-slate-800 tracking-tight">
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
            <div className="bg-white border border-slate-200/50 p-6 shadow-sm space-y-4">
              <div className="text-center pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Marcas Oficiales e Independientes
                </h3>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-65 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 py-2">
                {brands.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBrand(b.slug)}
                    className="cursor-pointer text-center font-black text-xl text-slate-500 dark:text-slate-400 hover:text-[#f3a847] transition-colors uppercase tracking-tight"
                  >
                    {b.name}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ─── CASE B: CATALOG SEARCH / BROWSE VIEW (White card details) ─── */}
      {isBrowsingCatalog && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto py-8">
          
          {/* FILTERS SIDEBAR */}
          <div className="bg-white border border-slate-200/80 p-5 shadow-sm h-fit space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
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
                <span className="px-2 py-0.5 text-[9px] font-bold bg-[#007185]/10 text-[#007185] border border-[#007185]/20 rounded-full flex items-center gap-1">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('')} className="hover:text-red-500 font-black">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/10 text-[#b12704] border border-amber-500/20 rounded-full flex items-center gap-1">
                  Búsqueda: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="hover:text-red-500 font-black">×</button>
                </span>
              )}
            </div>

            {/* Categories filter list */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Categorías</h4>
              <div className="flex flex-col gap-1.5 text-xs">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`flex items-center justify-between text-left py-1 px-2 rounded-lg transition-colors ${
                      selectedCategory === c.slug 
                        ? 'bg-primary-500/10 text-primary-500 font-bold' 
                        : 'text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {getCategoryIcon(c.icon)} {c.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brands filter list */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Marcas</h4>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.slug)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      selectedBrand === b.slug
                        ? 'bg-slate-800 text-white border-transparent shadow'
                        : 'border-slate-200 text-slate-600 hover:border-slate-350'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Ranges filter */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Rangos de Precio</h4>
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="number"
                  placeholder="Min S/"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:border-[#007185]"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max S/"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:border-[#007185]"
                />
              </div>
            </div>

            {/* Toggle Special Features */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-650">Solo destacados</span>
              <button
                onClick={() => setIsFeatured(!isFeatured)}
                className={`w-10 h-6 rounded-full transition-colors relative flex items-center ${
                  isFeatured ? 'bg-primary-500' : 'bg-slate-250'
                }`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute transition-transform shadow ${
                  isFeatured ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>

          </div>

          {/* PRODUCTS CATALOG LIST */}
          <div className="lg:col-span-3 space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200/80 px-5 py-4 rounded shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Catálogo de Productos</span>
                <h2 className="text-base font-extrabold text-slate-800 leading-none">
                  {searchQuery ? `Resultados para "${searchQuery}"` : selectedCategory ? `Categoría: ${selectedCategory}` : 'Todos los Productos'}
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-600 font-mono bg-slate-50 border px-3 py-1.5 rounded">
                {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              </span>
            </div>

            {loading ? (
              <div className="py-24 text-center text-slate-450 font-bold text-sm">
                Buscando productos en catálogo...
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded p-16 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-450">
                  <HelpCircle size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No encontramos coincidencias</h3>
                <p className="text-xs text-slate-450 max-w-xs mx-auto leading-relaxed">
                  Prueba cambiando los términos de búsqueda o eliminando los filtros seleccionados para ampliar la búsqueda.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-primary-500 hover:bg-primary-655 rounded shadow transition-all active:scale-95 cursor-pointer"
                >
                  Limpiar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onNotify={notificationHandler} />
                ))}
              </div>
            )}
            
          </div>

        </div>
      )}

      {/* Comparison Drawer */}
      <ProductCompare />

    </div>
  );
};

export default Home;
