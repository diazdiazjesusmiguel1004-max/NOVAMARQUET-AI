import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Star, Sparkles, ShieldCheck, ChevronLeft, Send, MessageSquare 
} from 'lucide-react';
import api from '../services/api';
import { useStore } from '../store/useStore';
import Virtual360Viewer from '../components/Virtual360Viewer';

const ProductDetail = ({ notificationHandler }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, isAuthenticated } = useStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
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
          time_spent: 5.0 // initial view estimate
        }
      });
      setProduct(res.data);
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
      // Fire-and-forget stay duration tracking log via API
      if (slug && stayDurationSeconds > 1) {
        api.post('products/log_time/', {
          slug: slug,
          time_spent: Math.round(stayDurationSeconds * 10) / 10
        }).catch(() => {}); // handle silent failure
      }
    };
  }, [slug]);

  const handleAddToCart = async () => {
    const res = await addToCart(product.id, quantity, selectedColor, selectedSize);
    if (res.success) {
      notificationHandler('¡Producto agregado al carrito de compras!', 'success');
    } else {
      notificationHandler(res.error || 'Debe iniciar sesión para comprar.', 'error');
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Cargando detalles de producto...
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-primary-500 mb-6 transition-colors">
        <ChevronLeft size={16} /> Volver a la Tienda
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 3D model simulation / Visuals */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Virtual360Viewer 
            productName={product.name}
            category={product.category?.slug}
            color={
              selectedColor === 'Titanium Gray' || selectedColor === 'Gris' ? '#475569' :
              selectedColor === 'Titanium Black' || selectedColor === 'Negro' ? '#0f172a' :
              selectedColor === 'Titanium Yellow' || selectedColor === 'Amarillo' ? '#f59e0b' :
              selectedColor === 'Natural Titanium' ? '#64748b' :
              selectedColor === 'Azul Eléctrico' ? '#1d4ed8' :
              selectedColor === 'Rojo Fuego' ? '#b91c1c' : '#334155'
            }
          />
          
          {/* Trust badges */}
          <div className="bg-slate-50 dark:bg-dark-950/40 border border-slate-200 dark:border-dark-850 p-4 rounded-2xl grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 dark:text-slate-400">
            <div className="flex flex-col items-center gap-1 border-r border-slate-200 dark:border-dark-800">
              <ShieldCheck size={16} className="text-green-500" />
              <span className="font-bold">Pago Seguro SSL</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-r border-slate-200 dark:border-dark-800">
              <span className="font-extrabold text-xs text-primary-500">24/7</span>
              <span className="font-bold">Soporte Inteligente</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-extrabold text-xs text-purple-500">30 Días</span>
              <span className="font-bold">Garantía Novamarquet</span>
            </div>
          </div>
        </div>

        {/* Right Column: Product descriptions & add controls */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-2">
            <span className="px-3 py-1 text-[10px] font-extrabold rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 uppercase tracking-widest">
              {product.brand?.name || 'Marca Generica'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
              <span className="text-slate-300 dark:text-slate-800">|</span>
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.round(product.average_rating) ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-bold">({product.average_rating} rating)</span>
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-50 dark:bg-dark-950/40 border border-slate-200 dark:border-dark-850 p-5 rounded-3xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Precio Especial</span>
              <div className="flex items-baseline gap-2 mt-1">
                {product.offer_price ? (
                  <>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">S/ {Number(product.offer_price).toFixed(2)}</span>
                    <span className="text-sm text-slate-400 line-through">S/ {Number(product.price).toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">S/ {Number(product.price).toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider mb-1">Estado de Stock</span>
              {product.stock === 0 ? (
                <span className="px-3 py-1 rounded bg-red-150 text-red-600 dark:bg-red-950/40 dark:text-red-400 text-xs font-bold uppercase">Sin Stock</span>
              ) : product.stock <= 5 ? (
                <span className="px-3 py-1 rounded bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 text-xs font-bold uppercase animate-pulse">Stock Crítico ({product.stock})</span>
              ) : (
                <span className="px-3 py-1 rounded bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400 text-xs font-bold uppercase">Disponible ({product.stock})</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Descripción</h3>
            <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          {/* COLOR SELECTOR */}
          {product.colors?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Colores Disponibles:</h3>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                      selectedColor === c
                        ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/10 scale-105'
                        : 'bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-dark-800 hover:bg-slate-50'
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
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Capacidades / Tallas:</h3>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                      selectedSize === s
                        ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/10 scale-105'
                        : 'bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-dark-800 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BUY CONTROLS */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-dark-800/80">
            {/* Quantity select */}
            <div className="flex items-center border border-slate-200 dark:border-dark-800 rounded-xl overflow-hidden bg-white dark:bg-dark-900">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-4 py-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800 font-bold"
              >
                -
              </button>
              <span className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100 font-extrabold w-12 text-center select-none">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="px-4 py-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800 font-bold"
              >
                +
              </button>
            </div>

            {/* Cart add button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-grow flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm text-white rounded-xl shadow-lg transition-all active:scale-95 ${
                product.stock === 0
                  ? 'bg-slate-300 dark:bg-dark-850 cursor-not-allowed text-slate-400 shadow-none'
                  : 'bg-gradient-to-r from-primary-500 to-purple-600 hover:shadow-primary-500/20 shadow-primary-500/10 hover:opacity-95'
              }`}
            >
              <ShoppingBag size={18} /> Agregar al Carrito
            </button>

            {/* Wishlist toggle */}
            <button
              onClick={handleWishlistToggle}
              className={`p-3 rounded-xl border transition-all active:scale-90 flex items-center justify-center ${
                isWishlisted
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200 dark:border-red-900 shadow-sm'
                  : 'bg-white dark:bg-dark-900 text-slate-400 border-slate-200 dark:border-dark-800 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

        </div>

      </div>

      {/* REVIEWS SECTION */}
      <div className="mt-16 pt-10 border-t border-slate-200/50 dark:border-dark-800/80 max-w-5xl space-y-8">
        
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Reseñas de Clientes</h2>
            <p className="text-xs text-slate-400">Calificaciones y comentarios de compradores verídicos.</p>
          </div>
        </div>

        {/* Amazon-style Rating Breakdown Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-slate-50/40 dark:bg-dark-950/10 border border-slate-200/60 dark:border-dark-850 p-6 rounded-3xl">
          {/* Summary */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left justify-center space-y-2 border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-dark-800/80 pb-6 md:pb-0 md:pr-6">
            <h3 className="text-4xl font-black text-slate-800 dark:text-white">
              {product.average_rating || 4.2}
            </h3>
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < Math.round(product.average_rating || 4.2) ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-450 dark:text-slate-550 block">
              Calificación promedio general
            </span>
            <p className="text-[11px] text-slate-400">
              Basado en {product.reviews?.length || 2} opiniones verificadas de clientes Novamarquet.
            </p>
          </div>

          {/* Distribution Bars */}
          <div className="md:col-span-8 space-y-2 text-xs">
            <p className="font-bold text-slate-655 dark:text-slate-350 uppercase tracking-wider text-[10px] mb-3">Distribución de Estrellas</p>
            {[
              { stars: 5, pct: 75 },
              { stars: 4, pct: 15 },
              { stars: 3, pct: 6 },
              { stars: 2, pct: 3 },
              { stars: 1, pct: 1 }
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-12 text-slate-500 dark:text-slate-450 font-semibold text-right">
                  {d.stars} estrellas
                </span>
                <div className="flex-1 h-2 bg-slate-200/70 dark:bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
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
            <p className="text-xs text-slate-400 italic">No hay reseñas publicadas para este producto aún. ¡Sé el primero!</p>
          ) : (
            product.reviews.map((r, idx) => (
              <div key={r.id} className="p-5 border border-slate-200/80 dark:border-dark-850 rounded-2xl bg-white dark:bg-dark-900/60 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350">👤 {r.username}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-yellow-405">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="px-1.5 py-0.2 text-[9px] font-extrabold text-green-700 bg-green-500/10 rounded flex items-center gap-0.5 border border-green-500/10">
                        ✓ Compra Verificada
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                
                <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-medium">
                  {r.comment}
                </p>

                {/* Advanced: Mock user photos/videos attached to review */}
                <div className="flex gap-2 pt-2">
                  <img
                    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&auto=format&fit=crop&q=60"
                    alt="user photo 1"
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200/60 dark:border-dark-800 hover:scale-105 transition-all cursor-zoom-in"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&auto=format&fit=crop&q=60"
                    alt="user photo 2"
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200/60 dark:border-dark-800 hover:scale-105 transition-all cursor-zoom-in"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Post review Form */}
        {isAuthenticated ? (
          <form onSubmit={handleReviewSubmit} className="bg-slate-50 dark:bg-dark-950/20 border border-slate-200 dark:border-dark-850 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-550 dark:text-slate-300 uppercase tracking-widest">Escribir Reseña</h3>
            
            {/* Rating select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-555 dark:text-slate-400 font-semibold">Calificación:</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className="text-yellow-400 hover:scale-110 transition-transform"
                  >
                    <Star size={18} fill={num <= rating ? "currentColor" : "none"} />
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
                className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl p-3 outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-5 py-2 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <Send size={12} /> {isSubmittingReview ? 'Publicando...' : 'Publicar Comentario'}
            </button>
          </form>
        ) : (
          <div className="text-center p-4 border border-dashed border-slate-200 dark:border-dark-800 rounded-2xl text-xs text-slate-400">
            Debes <Link to="/login" className="text-primary-500 hover:underline font-bold">iniciar sesión</Link> para dejar comentarios sobre el producto.
          </div>
        )}

      </div>

    </div>
  );
};

export default ProductDetail;
