import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

const ProductCard = ({ product, onNotify }) => {
  const { toggleWishlist, wishlist, addToCart } = useStore();
  const isWishlisted = wishlist?.products?.some(p => p.id === product.id);

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

  return (
    <div className="group bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full relative">
      
      {/* Discount / Featured Badge */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.offer_price && (
          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider">
            -{discountPercent}% OFF
          </span>
        )}
        {product.is_featured && (
          <span className="bg-gradient-to-r from-primary-500 to-purple-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={8} className="animate-spin" /> Top Ventas
          </span>
        )}
      </div>

      {/* Wishlist toggle icon button */}
      <button
        onClick={handleWishlistClick}
        className={`absolute top-3 right-3 z-10 p-2.5 rounded-full shadow-md border backdrop-blur-md transition-all active:scale-90 ${
          isWishlisted
            ? 'bg-red-50 dark:bg-red-950/40 text-red-500 border-red-200 dark:border-red-900'
            : 'bg-white/80 dark:bg-dark-950/80 text-slate-400 border-slate-200/50 dark:border-dark-850 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
        }`}
      >
        <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      {/* Product Image section links to details */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-slate-50 dark:bg-dark-950/30">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-108 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
            No Image
          </div>
        )}
      </Link>

      {/* Information details */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-1">
          <span className="text-[10px] font-bold text-primary-500 dark:text-primary-400 uppercase tracking-widest">
            {product.brand?.name || 'Genérico'}
          </span>
          <span className="text-[10px] font-medium text-slate-450 dark:text-slate-500">
            {product.category}
          </span>
        </div>

        <Link to={`/product/${product.slug}`} className="mt-1 flex-grow">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
            {product.name}
          </h4>
        </Link>

        {/* Reviews mockup rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex text-yellow-400">
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">(5.0)</span>
        </div>

        {/* Pricing & Cart button footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            {product.offer_price ? (
              <>
                <span className="text-xs text-slate-400 line-through">S/ {Number(product.price).toFixed(2)}</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">S/ {Number(product.offer_price).toFixed(2)}</span>
              </>
            ) : (
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">S/ {Number(product.price).toFixed(2)}</span>
            )}
          </div>

          {/* Quick Buy Add to Cart */}
          <button
            onClick={handleAddToCartClick}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              product.stock === 0
                ? 'bg-slate-100 dark:bg-dark-850 text-slate-400 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/10 hover:shadow-lg active:scale-95'
            }`}
            title={product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
          >
            <ShoppingCart size={16} />
          </button>
        </div>

        {/* Stock warning status */}
        <div className="mt-2 text-left">
          {product.stock === 0 ? (
            <span className="text-[9px] font-bold text-red-500">Agotado</span>
          ) : product.stock <= 5 ? (
            <span className="text-[9px] font-bold text-orange-500">Stock crítico: ¡Quedan {product.stock}!</span>
          ) : (
            <span className="text-[9px] text-slate-400">Disponibles: {product.stock} u.</span>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
