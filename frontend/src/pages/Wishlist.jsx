import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Star } from 'lucide-react';
import { useStore } from '../store/useStore';

const Wishlist = ({ notificationHandler }) => {
  const navigate = useNavigate();
  const { wishlist, fetchWishlist, toggleWishlist, addToCart, isAuthenticated, wishlistLoading } = useStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const handleRemoveFavorite = async (productId, name) => {
    const res = await toggleWishlist(productId);
    if (res.success) {
      notificationHandler?.(`"${name}" removido de favoritos.`, 'info');
    } else {
      notificationHandler?.('No se pudo quitar de favoritos.', 'error');
    }
  };

  const handleAddToCart = async (product) => {
    const res = await addToCart(product.id, 1, product.colors?.[0], product.sizes?.[0]);
    if (res.success) {
      notificationHandler?.('¡Producto añadido al carrito!', 'success');
    } else {
      notificationHandler?.(res.error || 'No se pudo agregar al carrito.', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto shadow-inner">
          <Heart size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Mis Favoritos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Inicia sesión para guardar tus productos favoritos y verlos en cualquier momento.
          </p>
        </div>
        <Link
          to="/login"
          className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-purple-600 hover:shadow-lg text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 inline-block uppercase"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const productsList = wishlist?.products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-200/50 dark:border-dark-850">
        <div>
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-red-500 fill-red-500 animate-pulse" />
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              Lista de Favoritos
            </h1>
          </div>
          <p className="text-xs text-slate-450 mt-1">
            Revisa los productos que guardaste y agrégalos al carrito cuando desees comprar.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-dark-900 px-3 py-1.5 rounded-xl border dark:border-dark-800">
          {productsList.length} {productsList.length === 1 ? 'Guardado' : 'Guardados'}
        </span>
      </div>

      {wishlistLoading ? (
        <div className="py-20 text-center text-slate-400 text-xs font-bold">
          Cargando favoritos...
        </div>
      ) : productsList.length === 0 ? (
        <div className="py-16 px-6 text-center space-y-5 bg-white dark:bg-dark-900 rounded-3xl border border-dashed border-slate-200 dark:border-dark-800 shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto shadow-inner">
            <Heart size={32} className="fill-red-100 dark:fill-red-950/20 text-red-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              Tu lista de favoritos está vacía
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Guarda los productos que más te llamen la atención dando click en el ícono de corazón para revisarlos en esta sección.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 hover:shadow-lg hover:shadow-primary-500/20 text-white text-xs font-extrabold rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 mx-auto"
            >
              <ShoppingBag size={15} /> Explorar Catálogo de Tienda
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsList.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-850 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group relative"
            >
              {/* Product Primary Image */}
              <div className="relative pt-[100%] overflow-hidden bg-slate-100 dark:bg-dark-950">
                <img
                  src={product.primary_image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Trash icon to remove from favorites */}
                <button
                  onClick={() => handleRemoveFavorite(product.id, product.name)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-dark-900/90 text-red-500 hover:bg-red-500 hover:text-white border border-slate-100 dark:border-dark-800 transition-all shadow active:scale-90 cursor-pointer"
                  title="Quitar de favoritos"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Product Info details */}
              <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <span>{product.brand?.name || 'Genérico'}</span>
                    <span>{product.category || 'Varios'}</span>
                  </div>
                  
                  <Link
                    to={`/product/${product.slug}`}
                    className="font-bold text-xs text-slate-800 dark:text-slate-100 hover:text-primary-500 dark:hover:text-primary-400 transition-colors line-clamp-2"
                  >
                    {product.name}
                  </Link>

                  {/* Star Rating preview */}
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Star size={11} className="fill-amber-500" />
                    </div>
                    <span className="text-[10px] text-slate-450 font-bold">
                      {product.average_rating || '5.0'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-dark-850">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-black text-slate-800 dark:text-white">
                      S/ {Number(product.current_price || product.price).toFixed(2)}
                    </span>
                    {product.offer_price && (
                      <span className="text-[10px] text-slate-400 line-through">
                        S/ {Number(product.price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart CTA button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-dark-950 hover:bg-primary-500 hover:text-white text-slate-700 dark:text-slate-300 text-[10px] font-extrabold rounded-xl transition-all border border-slate-200 dark:border-dark-800 active:scale-95 uppercase tracking-wider"
                  >
                    Comprar <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Wishlist;
