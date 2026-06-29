import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Sparkles, ArrowRightLeft } from 'lucide-react';
import { useStore } from '../store/useStore';

const ProductCard = ({ product, onNotify }) => {
  const navigate = useNavigate();
  const { toggleWishlist, wishlist, addToCart, toggleCompare, compareList } = useStore();
  const isWishlisted = wishlist?.products?.some(p => p.id === product.id);
  const isCompared = compareList.some(p => p.id === product.id);

  // Calculate discount percentage if offer_price is set
  const discountPercent = product.offer_price 
    ? Math.round(((product.price - product.offer_price) / product.price) * 100)
    : 0;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleWishlist(product.id);
    if (!result.success) {
      if (onNotify) onNotify(result.error || 'Ocurrió un error', 'error');
    } else {
      if (onNotify) onNotify(result.added ? 'Añadido a favoritos' : 'Eliminado de favoritos', 'success');
    }
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleCompare(product);
    if (result && !result.success) {
      if (onNotify) onNotify(result.error, 'error');
    } else {
      if (onNotify) onNotify(!isCompared ? 'Añadido al comparador' : 'Quitado del comparador', 'success');
    }
  };

  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await addToCart(product.id, 1, product.colors?.[0], product.sizes?.[0]);
    if (result.success) {
      if (onNotify) onNotify('¡Producto añadido al carrito!', 'success');
      navigate('/cart');
    } else {
      if (onNotify) onNotify(result.error || 'Inicia sesión para comprar', 'error');
    }
  };

  // Render rating stars dynamically
  const renderRatingStars = (rating) => {
    const stars = [];
    const val = rating || 4.2; // Fallback default rating
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={12}
          className={`${
            i <= Math.round(val)
              ? 'text-amber-500 fill-amber-500'
              : 'text-slate-300 dark:text-dark-700'
          }`}
        />
      );
    }
    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-0.5">{stars}</div>
        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">
          ({val})
        </span>
      </div>
    );
  };

  return (
    <div className="group bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full relative">
      
      {/* Discount / Featured Badge */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.offer_price && (
          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
            -{discountPercent}%
          </span>
        )}
        {product.is_featured && (
          <span className="bg-gradient-to-r from-primary-500 to-purple-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={8} className="animate-spin" /> Destacado
          </span>
        )}
      </div>

      {/* Action buttons (Wishlist & Compare) on top-right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {/* Wishlist toggle */}
        <button
          onClick={handleWishlistClick}
          className={`p-2 rounded-full shadow-md border backdrop-blur-md transition-all active:scale-90 ${
            isWishlisted
              ? 'bg-red-50 dark:bg-red-950/40 text-red-500 border-red-200 dark:border-red-900'
              : 'bg-white/80 dark:bg-dark-950/80 text-slate-400 border-slate-200/50 dark:border-dark-850 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
          }`}
          title={isWishlisted ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Compare toggle */}
        <button
          onClick={handleCompareClick}
          className={`p-2 rounded-full shadow-md border backdrop-blur-md transition-all active:scale-90 ${
            isCompared
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 border-indigo-200 dark:border-indigo-900'
              : 'bg-white/80 dark:bg-dark-950/80 text-slate-400 border-slate-200/50 dark:border-dark-850 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20'
          }`}
          title={isCompared ? "Quitar del comparador" : "Añadir al comparador"}
        >
          <ArrowRightLeft size={14} />
        </button>
      </div>

      {/* Large Product Image */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-slate-50 dark:bg-dark-950/30">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=60';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-350 dark:text-dark-700">
            Sin Imagen
          </div>
        )}
      </Link>

      {/* Information details */}
      <div className="p-4 flex flex-col flex-grow">
        
        {/* Category & Brand row */}
        <div className="flex justify-between items-center gap-1.5 mb-1">
          <span className="text-[9px] font-black text-primary-500 dark:text-primary-400 uppercase tracking-wider">
            {product.brand?.name || 'Genérico'}
          </span>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
            {product.category}
          </span>
        </div>

        {/* Title */}
        <Link to={`/product/${product.slug}`} className="block mb-1.5 flex-grow">
          <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-2 hover:text-primary-500 dark:hover:text-primary-400 transition-colors leading-snug">
            {product.name}
          </h4>
        </Link>

        {/* Seller Info */}
        <div className="mb-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Vendido por:{' '}
            <span className="font-bold text-indigo-500 hover:underline">
              {product.seller_name || 'Novamarquet'}
            </span>
          </span>
        </div>

        {/* Dynamic Ratings */}
        <div className="mb-3">
          {renderRatingStars(product.average_rating)}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-dark-850/60 my-2" />

        {/* Pricing, Cart & Stock */}
        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            {product.offer_price ? (
              <>
                <span className="text-[10px] text-slate-400 line-through">
                  S/ {Number(product.price).toFixed(2)}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-none mt-0.5">
                  S/ {Number(product.offer_price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-none">
                S/ {Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* Quick buy */}
            <button
              onClick={handleAddToCartClick}
              disabled={product.stock === 0}
              className={`p-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
                product.stock === 0
                  ? 'bg-slate-100 dark:bg-dark-850 text-slate-400 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/10 active:scale-95'
              }`}
            >
              <ShoppingCart size={13} />
              <span>Añadir</span>
            </button>
          </div>
        </div>

        {/* Stock Status Badge */}
        <div className="mt-2.5 flex items-center justify-between text-[10px]">
          <div>
            {product.stock === 0 ? (
              <span className="font-bold text-red-500">Agotado</span>
            ) : product.stock <= 5 ? (
              <span className="font-extrabold text-orange-500 animate-pulse">
                ¡Solo quedan {product.stock}!
              </span>
            ) : (
              <span className="text-slate-450 dark:text-slate-500">
                Disponibles: {product.stock}
              </span>
            )}
          </div>

          {/* Quick link to compare */}
          <button 
            onClick={handleCompareClick}
            className={`text-[9px] font-bold transition-colors ${
              isCompared ? 'text-indigo-500' : 'text-slate-400 hover:text-indigo-500'
            }`}
          >
            {isCompared ? '✓ Comparando' : '+ Comparar'}
          </button>
        </div>

      </div>

    </div>
  );
};

export default ProductCard;
