import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Trash2, ShoppingCart, ArrowLeft, Star, Check, X } from 'lucide-react';

const Compare = ({ notificationHandler }) => {
  const navigate = useNavigate();
  const { compareList, toggleCompare, clearCompare, addToCart } = useStore();

  const handleAddToCart = async (product) => {
    const res = await addToCart(product.id, 1);
    if (res.success) {
      notificationHandler?.(`¡${product.name} agregado al carrito!`, 'success');
    } else {
      notificationHandler?.(res.error, 'error');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const val = rating || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          className={`${
            i <= val
              ? 'text-amber-500 fill-amber-500'
              : 'text-slate-350 dark:text-dark-600'
          }`}
        />
      );
    }
    return <div className="flex gap-0.5 justify-center">{stars}</div>;
  };

  if (compareList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 size={24} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
          No hay productos para comparar
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Agrega hasta 4 productos a tu lista de comparación desde la tienda o los detalles de producto para verlos frente a frente.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-purple-600 rounded-full hover:shadow-lg hover:shadow-primary-500/20 transition-all"
        >
          <ArrowLeft size={14} /> Volver a la Tienda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Regresar
          </button>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Comparador Profesional
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analiza las especificaciones técnicas lado a lado y toma la mejor decisión de compra.
          </p>
        </div>
        <button
          onClick={clearCompare}
          className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-full transition-all border border-red-500/20 align-self-start sm:align-self-auto"
        >
          Limpiar Comparador
        </button>
      </div>

      {/* Grid Table */}
      <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/60 dark:border-dark-800/80 shadow-xl overflow-x-auto transition-all">
        <table className="w-full border-collapse text-center min-w-[700px] table-fixed">
          <thead>
            {/* Header row: Product details */}
            <tr className="border-b border-slate-100 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/20">
              <th className="w-1/5 p-6 text-left font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Características
              </th>
              {compareList.map((product) => (
                <th
                  key={product.id}
                  className="p-6 relative group transition-colors hover:bg-slate-50/30 dark:hover:bg-dark-950/10"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => toggleCompare(product)}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white dark:bg-dark-800 dark:hover:bg-red-600 text-slate-450 transition-all scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                    title="Eliminar de la comparación"
                  >
                    <X size={12} />
                  </button>

                  <div className="flex flex-col items-center">
                    <img
                      src={product.primary_image || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-28 h-28 object-contain rounded-2xl mb-4 bg-slate-50 dark:bg-dark-950/40 p-2 border border-slate-100 dark:border-dark-800"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=60';
                      }}
                    />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary-500 mb-1">
                      {product.brand?.name || 'Marca'}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 px-2 h-8 leading-tight">
                      {product.name}
                    </h3>
                  </div>
                </th>
              ))}
              {/* Fill empty columns if less than 4 */}
              {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
                <th key={`empty-${idx}`} className="p-6 text-slate-300 dark:text-dark-700 bg-slate-50/20 dark:bg-dark-950/5">
                  <div className="border-2 border-dashed border-slate-200 dark:border-dark-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[160px]">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-dark-600 uppercase tracking-wide mb-1">Vacío</span>
                    <Link to="/" className="text-[11px] font-bold text-primary-500 hover:underline">
                      + Agregar Producto
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-850">
            {/* Price Row */}
            <tr className="hover:bg-slate-50/40 dark:hover:bg-dark-950/10 transition-colors">
              <td className="p-4 text-left font-bold text-xs text-slate-700 dark:text-slate-350 bg-slate-50/20 dark:bg-dark-950/5">
                Precio
              </td>
              {compareList.map((product) => {
                const discount = product.offer_price
                  ? Math.round(((product.price - product.offer_price) / product.price) * 100)
                  : 0;
                return (
                  <td key={product.id} className="p-4">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-black text-slate-800 dark:text-white">
                        S/ {(product.offer_price || product.price)}
                      </span>
                      {product.offer_price && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-slate-450 line-through">
                            S/ {product.price}
                          </span>
                          <span className="text-[9px] font-extrabold text-green-500 bg-green-500/10 px-1 rounded">
                            -{discount}%
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
              {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
                <td key={`empty-price-${idx}`} className="p-4 text-slate-300 dark:text-dark-750">-</td>
              ))}
            </tr>

            {/* Ratings Row */}
            <tr className="hover:bg-slate-50/40 dark:hover:bg-dark-950/10 transition-colors">
              <td className="p-4 text-left font-bold text-xs text-slate-700 dark:text-slate-350 bg-slate-50/20 dark:bg-dark-950/5">
                Calificación
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="p-4">
                  <div className="flex flex-col items-center">
                    {renderStars(product.average_rating || 4.2)}
                    <span className="text-[10px] text-slate-450 mt-1">
                      ({product.average_rating || 4.2} / 5)
                    </span>
                  </div>
                </td>
              ))}
              {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
                <td key={`empty-rating-${idx}`} className="p-4 text-slate-300 dark:text-dark-750">-</td>
              ))}
            </tr>

            {/* Stock Row */}
            <tr className="hover:bg-slate-50/40 dark:hover:bg-dark-950/10 transition-colors">
              <td className="p-4 text-left font-bold text-xs text-slate-700 dark:text-slate-350 bg-slate-50/20 dark:bg-dark-950/5">
                Disponibilidad
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="p-4">
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold text-green-700 bg-green-100 dark:bg-green-950/40 dark:text-green-400 rounded-full">
                      <Check size={10} /> En Stock ({product.stock})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold text-red-700 bg-red-100 dark:bg-red-950/40 dark:text-red-400 rounded-full">
                      <X size={10} /> Agotado
                    </span>
                  )}
                </td>
              ))}
              {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
                <td key={`empty-stock-${idx}`} className="p-4 text-slate-300 dark:text-dark-750">-</td>
              ))}
            </tr>

            {/* Seller Row */}
            <tr className="hover:bg-slate-50/40 dark:hover:bg-dark-950/10 transition-colors">
              <td className="p-4 text-left font-bold text-xs text-slate-700 dark:text-slate-350 bg-slate-50/20 dark:bg-dark-950/5">
                Vendedor (Tienda)
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="p-4">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {product.seller_name || 'Novamarquet'}
                  </span>
                </td>
              ))}
              {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
                <td key={`empty-seller-${idx}`} className="p-4 text-slate-300 dark:text-dark-750">-</td>
              ))}
            </tr>

            {/* Brand Row */}
            <tr className="hover:bg-slate-50/40 dark:hover:bg-dark-950/10 transition-colors">
              <td className="p-4 text-left font-bold text-xs text-slate-700 dark:text-slate-350 bg-slate-50/20 dark:bg-dark-950/5">
                Marca
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="p-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {product.brand?.name || 'Apple'}
                </td>
              ))}
              {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
                <td key={`empty-brand-${idx}`} className="p-4 text-slate-300 dark:text-dark-750">-</td>
              ))}
            </tr>

            {/* Category Row */}
            <tr className="hover:bg-slate-50/40 dark:hover:bg-dark-950/10 transition-colors">
              <td className="p-4 text-left font-bold text-xs text-slate-700 dark:text-slate-350 bg-slate-50/20 dark:bg-dark-950/5">
                Categoría
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="p-4 text-xs text-slate-650 dark:text-slate-350">
                  {product.category || 'Dispositivos'}
                </td>
              ))}
              {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
                <td key={`empty-category-${idx}`} className="p-4 text-slate-300 dark:text-dark-750">-</td>
              ))}
            </tr>

            {/* Colors Row */}
            <tr className="hover:bg-slate-50/40 dark:hover:bg-dark-950/10 transition-colors">
              <td className="p-4 text-left font-bold text-xs text-slate-700 dark:text-slate-350 bg-slate-50/20 dark:bg-dark-950/5">
                Colores
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="p-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {product.colors && product.colors.length > 0 ? (
                      product.colors.map((color, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 text-slate-600 dark:text-slate-400 rounded-full"
                        >
                          {color}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400">Único</span>
                    )}
                  </div>
                </td>
              ))}
              {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
                <td key={`empty-colors-${idx}`} className="p-4 text-slate-300 dark:text-dark-750">-</td>
              ))}
            </tr>

            {/* Sizes Row */}
            <tr className="hover:bg-slate-50/40 dark:hover:bg-dark-950/10 transition-colors">
              <td className="p-4 text-left font-bold text-xs text-slate-700 dark:text-slate-350 bg-slate-50/20 dark:bg-dark-950/5">
                Variantes / Tamaños
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="p-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {product.sizes && product.sizes.length > 0 ? (
                      product.sizes.map((size, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 text-[9px] font-bold bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full"
                        >
                          {size}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400">Único</span>
                    )}
                  </div>
                </td>
              ))}
              {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
                <td key={`empty-sizes-${idx}`} className="p-4 text-slate-300 dark:text-dark-750">-</td>
              ))}
            </tr>

            {/* Actions Row */}
            <tr className="hover:bg-slate-50/40 dark:hover:bg-dark-950/10 transition-colors">
              <td className="p-6 text-left font-bold text-xs text-slate-700 dark:text-slate-350 bg-slate-50/20 dark:bg-dark-950/5">
                Acción
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="p-6">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-purple-600 hover:shadow-md hover:shadow-primary-500/15 disabled:bg-slate-200 dark:disabled:bg-dark-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:shadow-none transition-all active:scale-95 cursor-pointer"
                  >
                    <ShoppingCart size={13} /> Añadir
                  </button>
                  <button
                    onClick={() => toggleCompare(product)}
                    className="w-full text-center text-[10px] font-bold text-red-500 mt-2 hover:underline flex items-center justify-center gap-1"
                  >
                    <Trash2 size={10} /> Quitar
                  </button>
                </td>
              ))}
              {Array.from({ length: 4 - compareList.length }).map((_, idx) => (
                <td key={`empty-actions-${idx}`} className="p-6 text-slate-300 dark:text-dark-750">-</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Compare;
