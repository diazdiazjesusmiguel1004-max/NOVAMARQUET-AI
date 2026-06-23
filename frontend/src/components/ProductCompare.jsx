import React, { useState } from 'react';
import { Sparkles, X, GitCompare } from 'lucide-react';

const ProductCompare = ({ currentProduct, allProducts }) => {
  const [compareProduct, setCompareProduct] = useState(null);

  // Filter out the current product from available products to compare
  const compareOptions = allProducts?.filter(p => p.id !== currentProduct.id) || [];

  const handleSelectCompare = (productId) => {
    const found = allProducts.find(p => p.id === Number(productId));
    setCompareProduct(found || null);
  };

  const handleClearCompare = () => {
    setCompareProduct(null);
  };

  return (
    <div className="bg-slate-50 dark:bg-dark-950/40 border border-slate-200 dark:border-dark-850 rounded-2xl p-6 shadow-sm mt-8 transition-colors duration-300">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
          <GitCompare size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Comparar Productos Inteligente</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Analiza especificaciones técnicas lado a lado antes de tu compra.</p>
        </div>
      </div>

      {/* Selector input for comparison product */}
      {!compareProduct ? (
        <div className="w-full max-w-sm mb-4">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Selecciona un producto para comparar:
          </label>
          <select
            onChange={(e) => handleSelectCompare(e.target.value)}
            defaultValue=""
            className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 transition-colors shadow-sm"
          >
            <option value="" disabled>-- Elegir producto --</option>
            {compareOptions.map(p => (
              <option key={p.id} value={p.id}>{p.name} (S/ {Number(p.offer_price || p.price).toFixed(2)})</option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Comparison Grid Table */}
      {compareProduct && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-dark-800">
                <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-450 w-1/3">Características</th>
                <th className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 bg-primary-500/5 dark:bg-primary-500/10 w-1/3">
                  {currentProduct.name}
                </th>
                <th className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 relative w-1/3">
                  <div className="flex justify-between items-center pr-6">
                    <span>{compareProduct.name}</span>
                    <button
                      onClick={handleClearCompare}
                      className="absolute top-3.5 right-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Quitar comparación"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-dark-800/40">
              
              {/* Product Image row */}
              <tr>
                <td className="py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">Visualización</td>
                <td className="py-4 px-4 bg-primary-500/5 dark:bg-primary-500/10">
                  {currentProduct.images?.[0] ? (
                    <img src={currentProduct.images[0].image} alt="" className="h-28 object-contain mx-auto" />
                  ) : currentProduct.primary_image ? (
                    <img src={currentProduct.primary_image} alt="" className="h-28 object-contain mx-auto" />
                  ) : (
                    <div className="h-28 flex items-center justify-center text-slate-350">Sin Imagen</div>
                  )}
                </td>
                <td className="py-4 px-4">
                  {compareProduct.primary_image ? (
                    <img src={compareProduct.primary_image} alt="" className="h-28 object-contain mx-auto" />
                  ) : (
                    <div className="h-28 flex items-center justify-center text-slate-350">Sin Imagen</div>
                  )}
                </td>
              </tr>

              {/* Price row */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-400">Precio Actual</td>
                <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-slate-100 bg-primary-500/5 dark:bg-primary-500/10">
                  S/ {Number(currentProduct.offer_price || currentProduct.price).toFixed(2)}
                  {currentProduct.offer_price && (
                    <span className="ml-1 text-[10px] text-red-500 block font-normal">S/ {Number(currentProduct.price).toFixed(2)} original</span>
                  )}
                </td>
                <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-slate-100">
                  S/ {Number(compareProduct.offer_price || compareProduct.price).toFixed(2)}
                  {compareProduct.offer_price && (
                    <span className="ml-1 text-[10px] text-red-500 block font-normal">S/ {Number(compareProduct.price).toFixed(2)} original</span>
                  )}
                </td>
              </tr>

              {/* Brand row */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-400">Marca</td>
                <td className="py-3.5 px-4 bg-primary-500/5 dark:bg-primary-500/10 text-slate-700 dark:text-slate-300">
                  {currentProduct.brand?.name || 'Genérica'}
                </td>
                <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                  {compareProduct.brand?.name || 'Genérica'}
                </td>
              </tr>

              {/* Category row */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-400">Categoría</td>
                <td className="py-3.5 px-4 bg-primary-500/5 dark:bg-primary-500/10 text-slate-700 dark:text-slate-300">
                  {currentProduct.category?.name || currentProduct.category}
                </td>
                <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                  {compareProduct.category}
                </td>
              </tr>

              {/* SKU row */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-400">SKU Código</td>
                <td className="py-3.5 px-4 bg-primary-500/5 dark:bg-primary-500/10 font-mono text-xs text-slate-600 dark:text-slate-400">
                  {currentProduct.sku}
                </td>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                  {compareProduct.sku}
                </td>
              </tr>

              {/* Colors row */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-400">Colores</td>
                <td className="py-3.5 px-4 bg-primary-500/5 dark:bg-primary-500/10">
                  <div className="flex flex-wrap gap-1">
                    {currentProduct.colors?.map(c => (
                      <span key={c} className="text-[10px] bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        {c}
                      </span>
                    )) || 'No especificado'}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {compareProduct.colors?.map(c => (
                      <span key={c} className="text-[10px] bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        {c}
                      </span>
                    )) || 'No especificado'}
                  </div>
                </td>
              </tr>

              {/* Sizes / Capacidades row */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-400">Tamaños/Modelos</td>
                <td className="py-3.5 px-4 bg-primary-500/5 dark:bg-primary-500/10">
                  <div className="flex flex-wrap gap-1">
                    {currentProduct.sizes?.map(s => (
                      <span key={s} className="text-[10px] bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    )) || 'No especificado'}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {compareProduct.sizes?.map(s => (
                      <span key={s} className="text-[10px] bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    )) || 'No especificado'}
                  </div>
                </td>
              </tr>

              {/* Stock availability row */}
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-400">Stock Disponible</td>
                <td className="py-3.5 px-4 bg-primary-500/5 dark:bg-primary-500/10">
                  {currentProduct.stock === 0 ? (
                    <span className="text-xs font-bold text-red-500">Agotado</span>
                  ) : (
                    <span className="text-xs font-semibold text-green-500">{currentProduct.stock} unidades</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {compareProduct.stock === 0 ? (
                    <span className="text-xs font-bold text-red-500">Agotado</span>
                  ) : (
                    <span className="text-xs font-semibold text-green-500">{compareProduct.stock} unidades</span>
                  )}
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductCompare;
