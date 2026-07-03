import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Star, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';

const Wishlist = ({ notificationHandler }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlist, fetchWishlist, toggleWishlist, addToCart, isAuthenticated, wishlistLoading } = useStore();

  const fromDashboard = location.state?.fromDashboard;

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
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-sm border border-red-100">
          <Heart size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-800">Mis Favoritos</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Inicia sesión para guardar tus productos favoritos y verlos en cualquier momento.
          </p>
        </div>
        <Link
          to="/login"
          className="px-6 py-2.5 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:bg-[#ddb347] hover:from-[#f5c75a] hover:to-[#ebbc3d] text-slate-900 font-bold text-xs rounded shadow transition-all active:scale-95 inline-block uppercase"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const productsList = wishlist?.products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-6">
        <Link to="/" className="hover:text-[#007185] transition-colors">Tienda</Link>
        <ChevronRight size={12} />
        {fromDashboard && (
          <>
            <Link to="/mi-cuenta" className="hover:text-[#007185] transition-colors">Mi Perfil</Link>
            <ChevronRight size={12} />
          </>
        )}
        <span className="text-slate-700">Lista de favoritos</span>
      </div>

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-200/50">
        <div>
          <div className="flex items-center gap-2 mt-4">
            <Heart size={20} className="text-red-500 fill-red-500 animate-pulse" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Lista de Favoritos
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Revisa los productos que guardaste y agrégalos al carrito cuando desees comprar.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-650 font-mono bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
          {productsList.length} {productsList.length === 1 ? 'Guardado' : 'Guardados'}
        </span>
      </div>

      {wishlistLoading ? (
        <div className="py-20 text-center text-slate-400 text-xs font-bold">
          Cargando favoritos...
        </div>
      ) : productsList.length === 0 ? (
        <div className="py-16 px-6 text-center space-y-5 bg-white rounded border border-dashed border-slate-200 shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-100">
            <Heart size={32} className="fill-red-100 text-red-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-base font-extrabold text-slate-800">
              Tu lista de favoritos está vacía
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Guarda los productos que más te llamen la atención dando click en el ícono de corazón para revisarlos en esta sección.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:bg-[#ddb347] hover:from-[#f5c75a] hover:to-[#ebbc3d] text-slate-900 text-xs font-bold rounded shadow transition-all active:scale-95 flex items-center gap-2 mx-auto cursor-pointer"
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
              className="bg-white border border-slate-200 rounded-none overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group relative"
            >
              {/* Product Primary Image */}
              <div className="relative pt-[100%] overflow-hidden bg-slate-50">
                <img
                  src={product.primary_image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Trash icon to remove from favorites */}
                <button
                  onClick={() => handleRemoveFavorite(product.id, product.name)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-500 hover:bg-red-500 hover:text-white border border-slate-100 transition-all shadow active:scale-90 cursor-pointer"
                  title="Quitar de favoritos"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Product Info details */}
              <div className="p-4 flex-grow flex flex-col justify-between space-y-4 bg-white">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#007185] uppercase tracking-widest">
                    <span>{product.brand?.name || 'Genérico'}</span>
                    <span className="text-slate-500 font-semibold">{product.category || 'Varios'}</span>
                  </div>
                  
                  <Link
                    to={`/product/${product.slug}`}
                    className="font-bold text-xs sm:text-sm text-slate-800 hover:text-[#007185] transition-colors line-clamp-2 leading-snug"
                  >
                    {product.name}
                  </Link>

                  {/* Star Rating preview */}
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5 text-[#ffa41c]">
                      <Star size={11} className="fill-[#ffa41c]" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {product.average_rating || '4.2'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-extrabold text-[#b12704]">
                      S/ {Number(product.current_price || product.price).toFixed(2)}
                    </span>
                    {product.offer_price && (
                      <span className="text-[10px] text-slate-500 line-through">
                        S/ {Number(product.price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart CTA button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:bg-[#ddb347] hover:from-[#f5c75a] hover:to-[#ebbc3d] text-slate-900 text-[10px] font-bold rounded shadow transition-all active:scale-95 uppercase tracking-wider cursor-pointer"
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
