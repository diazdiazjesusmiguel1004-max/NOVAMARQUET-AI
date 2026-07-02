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
              ? 'text-[#ffa41c] fill-[#ffa41c]'
              : 'text-slate-350 fill-transparent'
          }`}
        />
      );
    }
    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-0.5">{stars}</div>
        <span className="text-[10px] font-bold text-slate-500">
          ({val})
        </span>
      </div>
    );
  };

  return (
    <div className="group bg-white border border-slate-200/80 rounded-none overflow-hidden shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-300 flex flex-col h-full relative">
      
      {/* Discount / Featured Badge */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.offer_price && (
          <span className="bg-[#cc0c39] text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
            -{discountPercent}%
          </span>
        )}
        {product.is_featured && (
          <span className="bg-[#e77600] text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider flex items-center gap-1">
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
              ? 'bg-red-50 text-red-500 border-red-200'
              : 'bg-white/85 text-slate-400 border-slate-200/50 hover:text-red-500 hover:bg-red-50'
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
              ? 'bg-indigo-50 text-[#007185] border-indigo-200'
              : 'bg-white/85 text-slate-400 border-slate-200/50 hover:text-[#007185] hover:bg-indigo-50'
          }`}
          title={isCompared ? "Quitar del comparador" : "Añadir al comparador"}
        >
          <ArrowRightLeft size={14} />
        </button>
      </div>

      {/* Large Product Image */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-slate-50/50">
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
          <div className="w-full h-full flex items-center justify-center text-slate-350">
            Sin Imagen
          </div>
        )}
      </Link>

      {/* Information details */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        
        {/* Category & Brand row */}
        <div className="flex justify-between items-center gap-1.5 mb-1">
          <span className="text-[9px] font-black text-[#007185] uppercase tracking-wider">
            {product.brand?.name || 'Genérico'}
          </span>
          <span className="text-[9px] font-bold text-slate-500 uppercase">
            {product.category}
          </span>
        </div>

        {/* Title */}
        <Link to={`/product/${product.slug}`} className="block mb-1.5 flex-grow">
          <h4 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 hover:text-[#007185] transition-colors leading-snug">
            {product.name}
          </h4>
        </Link>

        {/* Seller Info */}
        <div className="mb-2">
          <span className="text-[10px] text-slate-500">
            Vendido por:{' '}
            <span className="font-bold text-[#007185] hover:underline">
              {product.seller_name || 'Novamarquet'}
            </span>
          </span>
        </div>

        {/* Dynamic Ratings */}
        <div className="mb-3">
          {renderRatingStars(product.average_rating)}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 my-2" />

        {/* Pricing, Cart & Stock */}
        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            {product.offer_price ? (
              <>
                <span className="text-[10px] text-slate-500 line-through">
                  S/ {Number(product.price).toFixed(2)}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-[#b12704] leading-none mt-0.5">
                  S/ {Number(product.offer_price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-extrabold text-slate-900 leading-none">
                S/ {Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* Quick buy - Amazon styled yellow button */}
            <button
              onClick={handleAddToCartClick}
              disabled={product.stock === 0}
              className={`p-2 px-3 rounded text-xs font-bold transition-all ${
                product.stock === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:bg-[#ddb347] hover:from-[#f5c75a] hover:to-[#ebbc3d] text-slate-900 active:scale-95 shadow-sm cursor-pointer'
              }`}
            >
              <ShoppingCart size={13} className="inline mr-1" />
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
              <span className="text-slate-500">
                Disponibles: {product.stock}
              </span>
            )}
          </div>

          {/* Quick link to compare */}
          <button 
            onClick={handleCompareClick}
            className={`text-[9px] font-bold transition-colors ${
              isCompared ? 'text-[#007185]' : 'text-slate-500 hover:text-[#007185]'
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
