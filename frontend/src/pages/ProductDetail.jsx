import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Star, ShieldCheck, ChevronLeft, Send, MessageSquare 
} from 'lucide-react';
import api from '../services/api';
import { useStore } from '../store/useStore';

const ProductDetail = ({ notificationHandler }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, isAuthenticated } = useStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // Review inputs
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Stay duration tracker (Analytics)
  const entryTime = useRef(Date.now());
  const isWishlisted = wishlist?.products?.some(p => p.id === product?.id);

  // Fetch product detail and trigger view logs
  const fetchProduct = async () => {
    try {
      const sessionId = localStorage.getItem('session_id') || `sess_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_id', sessionId);
      
      const res = await api.get(`products/${slug}/`, {
        params: {
          session_id: sessionId,
          time_spent: 5.0
        }
      });
      setProduct(res.data);
      if (res.data.primary_image) {
        setActiveImage(res.data.primary_image);
      } else if (res.data.images?.length > 0) {
        setActiveImage(res.data.images[0].image);
      }
      
      if (res.data.colors?.length > 0) setSelectedColor(res.data.colors[0]);
      if (res.data.sizes?.length > 0) setSelectedSize(res.data.sizes[0]);
    } catch (err) {
      console.error('Error fetching product details:', err);
      notificationHandler('No se pudo encontrar el producto.', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProduct();
    entryTime.current = Date.now();

    // Log total time spent when unmounting (Analytics stay time tracking)
    return () => {
      const stayDurationSeconds = (Date.now() - entryTime.current) / 1000;
      if (slug && stayDurationSeconds > 1) {
        api.post('products/log_time/', {
          slug: slug,
          time_spent: Math.round(stayDurationSeconds * 10) / 10
        }).catch(() => {}); // handle silent failure
      }
    };
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      notificationHandler('Debe iniciar sesión para agregar productos al carrito.', 'warning');
      window.location.href = '/login';
      return;
    }
    const res = await addToCart(product.id, quantity, selectedColor, selectedSize);
    if (res.success) {
      notificationHandler('¡Producto agregado al carrito de compras!', 'success');
    } else {
      notificationHandler(res.error || 'No se pudo agregar el producto.', 'error');
    }
  };

  const handleWishlistToggle = async () => {
    const res = await toggleWishlist(product.id);
    if (res.success) {
      notificationHandler(res.added ? 'Añadido a favoritos' : 'Eliminado de favoritos', 'success');
    } else {
      notificationHandler(res.error || 'Debe iniciar sesión.', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      notificationHandler('Debe iniciar sesión para dejar una reseña.', 'error');
      return;
    }
    if (!comment.trim()) {
      notificationHandler('Por favor escribe un comentario.', 'warning');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await api.post('reviews/', {
        product_id: product.id,
        rating: rating,
        comment: comment
      });
      notificationHandler('¡Reseña publicada exitosamente!', 'success');
      setComment('');
      setRating(5);
      fetchProduct(); // reload product to fetch reviews
    } catch (err) {
      const errorMsg = err.response?.data?.non_field_errors?.[0] || 'Ya has calificado este producto.';
      notificationHandler(errorMsg, 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-405 font-bold">
        Cargando detalles de producto...
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Back button */}
      <a 
        href="/"
        onClick={(e) => {
          e.preventDefault();
          window.location.href = '/';
        }}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#007185] mb-6 transition-colors bg-white border border-slate-200 px-4 py-2 rounded shadow-sm hover:shadow cursor-pointer select-none"
      >
        <ChevronLeft size={16} /> Volver a la Tienda
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="w-full bg-slate-50 border border-slate-200 rounded p-4 flex items-center justify-center h-96 overflow-hidden relative shadow-sm">
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-all duration-300"
            />
          </div>
          
          {/* Thumbnails list */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image)}
                  className={`w-16 h-16 border rounded p-1 flex-shrink-0 bg-white transition-all cursor-pointer ${
                    activeImage === img.image
                      ? 'border-[#007185] ring-1 ring-[#007185]'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={img.image}
                    alt={`${product.name} vista`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Trust badges */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500">
            <div className="flex flex-col items-center gap-1 border-r border-slate-200">
              <ShieldCheck size={16} className="text-green-600" />
              <span className="font-bold text-slate-700">Pago Seguro SSL</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-r border-slate-200">
              <span className="font-extrabold text-xs text-[#007185]">24/7</span>
              <span className="font-bold text-slate-700">Soporte Inteligente</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-extrabold text-xs text-[#b12704]">Garantía</span>
              <span className="font-bold text-slate-700">100% Asegurada</span>
            </div>
          </div>
        </div>

        {/* Right Column: Product descriptions & add controls */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-2">
            <span className="px-3 py-1 text-[10px] font-extrabold rounded bg-slate-100 text-slate-600 uppercase tracking-widest">
              {product.brand?.name || 'Marca Generica'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">SKU: {product.sku}</span>
              <span className="text-slate-200">|</span>
              <div className="flex items-center gap-1">
                <div className="flex text-[#ffa41c]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-current" fill={i < Math.round(product.average_rating || 4.2) ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-bold">({product.average_rating || '4.2'} estrellas)</span>
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Precio Especial</span>
              <div className="flex items-baseline gap-2 mt-1">
                {product.offer_price ? (
                  <>
                    <span className="text-3xl font-extrabold text-[#b12704]">S/ {Number(product.offer_price).toFixed(2)}</span>
                    <span className="text-sm text-slate-400 line-through">S/ {Number(product.price).toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-3xl font-extrabold text-[#b12704]">S/ {Number(product.price).toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider mb-1">Estado de Stock</span>
              {product.stock === 0 ? (
                <span className="px-3 py-1 rounded bg-red-50 text-red-650 text-xs font-bold border border-red-100 uppercase">Sin Stock</span>
              ) : product.stock <= 5 ? (
                <span className="px-3 py-1 rounded bg-orange-50 text-orange-655 text-xs font-bold border border-orange-100 uppercase animate-pulse">Stock Crítico ({product.stock})</span>
              ) : (
                <span className="px-3 py-1 rounded bg-green-50 text-green-655 text-xs font-bold border border-green-100 uppercase">Disponible ({product.stock})</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Descripción</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-semibold">
              {product.description}
            </p>
          </div>

          {/* COLOR SELECTOR */}
          {product.colors?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-455 uppercase tracking-widest">Colores Disponibles:</h3>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 text-xs font-bold rounded border transition-all cursor-pointer ${
                      selectedColor === c
                        ? 'bg-[#007185]/10 text-[#007185] border-[#007185] ring-1 ring-[#007185]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CAPACITY/SIZE SELECTOR */}
          {product.sizes?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-455 uppercase tracking-widest">Capacidades / Tallas:</h3>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 text-xs font-bold rounded border transition-all cursor-pointer ${
                      selectedSize === s
                        ? 'bg-[#007185]/10 text-[#007185] border-[#007185] ring-1 ring-[#007185]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BUY CONTROLS */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
            {/* Quantity select */}
            <div className="flex items-center border border-slate-250 rounded overflow-hidden bg-white">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-4 py-3 text-slate-500 hover:bg-slate-50 font-bold cursor-pointer"
              >
                -
              </button>
              <span className="px-4 py-3 text-sm text-slate-800 font-extrabold w-12 text-center select-none">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="px-4 py-3 text-slate-500 hover:bg-slate-50 font-bold cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Cart add button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-grow flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm text-slate-900 rounded shadow transition-all active:scale-95 cursor-pointer ${
                product.stock === 0
                  ? 'bg-slate-200 border border-slate-300 cursor-not-allowed text-slate-400 shadow-none'
                  : 'bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:bg-[#ddb347] hover:from-[#f5c75a] hover:to-[#ebbc3d]'
              }`}
            >
              <ShoppingBag size={18} /> Agregar al Carrito
            </button>

            {/* Wishlist toggle */}
            <button
              onClick={handleWishlistToggle}
              className={`p-3 rounded border transition-all active:scale-90 flex items-center justify-center cursor-pointer ${
                isWishlisted
                  ? 'bg-red-50 text-red-500 border-red-200 shadow-sm'
                  : 'bg-white text-slate-400 border-slate-200 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

        </div>

      </div>

      {/* REVIEWS SECTION */}
      <div className="mt-16 pt-10 border-t border-slate-200/50 max-w-5xl space-y-8">
        
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-slate-100 text-[#007185]">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Reseñas de Clientes</h2>
            <p className="text-xs text-slate-500">Calificaciones y comentarios de compradores verídicos.</p>
          </div>
        </div>

        {/* Amazon-style Rating Breakdown Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-slate-50 border border-slate-200 p-6 rounded">
          {/* Summary */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left justify-center space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
            <h3 className="text-4xl font-black text-slate-800">
              {product.average_rating || 4.2}
            </h3>
            <div className="flex text-[#ffa41c]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-current" fill={i < Math.round(product.average_rating || 4.2) ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-500 block">
              Calificación promedio general
            </span>
            <p className="text-[11px] text-slate-450">
              Basado en {product.reviews?.length || 2} opiniones verificadas de clientes Novamarquet.
            </p>
          </div>

          {/* Distribution Bars */}
          <div className="md:col-span-8 space-y-2 text-xs">
            <p className="font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-3">Distribución de Estrellas</p>
            {[
              { stars: 5, pct: 75 },
              { stars: 4, pct: 15 },
              { stars: 3, pct: 6 },
              { stars: 2, pct: 3 },
              { stars: 1, pct: 1 }
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-12 text-slate-500 font-semibold text-right">
                  {d.stars} estrellas
                </span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ffa41c] rounded-full transition-all duration-500"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="w-8 text-slate-400 font-bold text-right">
                  {d.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Review list */}
        <div className="space-y-5">
          {product.reviews?.length === 0 ? (
            <p className="text-xs text-slate-450 italic">No hay reseñas publicadas para este producto aún. ¡Sé el primero!</p>
          ) : (
            product.reviews.map((r, idx) => (
              <div key={r.id} className="p-5 border border-slate-200 rounded bg-white shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-700">👤 {r.username}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-[#ffa41c]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className="fill-current" fill={i < r.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="px-1.5 py-0.2 text-[9px] font-extrabold text-green-700 bg-green-50 border border-green-200 rounded flex items-center gap-0.5">
                        ✓ Compra Verificada
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {r.comment}
                </p>

                {/* Attached review photos mock */}
                <div className="flex gap-2 pt-2">
                  <img
                    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&auto=format&fit=crop&q=60"
                    alt="vista de usuario 1"
                    className="w-16 h-16 object-cover rounded border border-slate-200 hover:scale-105 transition-all cursor-zoom-in"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&auto=format&fit=crop&q=60"
                    alt="vista de usuario 2"
                    className="w-16 h-16 object-cover rounded border border-slate-200 hover:scale-105 transition-all cursor-zoom-in"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Post review Form */}
        {isAuthenticated ? (
          <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Escribir Reseña</h3>
            
            {/* Rating select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Calificación:</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className="text-[#ffa41c] hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star size={18} className="fill-current" fill={num <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Area */}
            <div className="relative">
              <textarea
                placeholder="Comparte tu experiencia con el producto, materiales, calidad..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded p-3 outline-none focus:border-[#007185] transition-colors font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-5 py-2.5 bg-gradient-to-b from-[#f5f7f9] to-[#e7e9ec] border border-slate-350 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Send size={12} /> {isSubmittingReview ? 'Publicando...' : 'Publicar Comentario'}
            </button>
          </form>
        ) : (
          <div className="text-center p-4 border border-dashed border-slate-200 rounded text-xs text-slate-500">
            Debes <Link to="/login" className="text-[#007185] hover:underline font-bold">iniciar sesión</Link> para dejar comentarios sobre el producto.
          </div>
        )}

      </div>

    </div>
  );
};

export default ProductDetail;
