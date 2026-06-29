import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { X, ArrowRightLeft, Sparkles } from 'lucide-react';

const CompareShelf = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { compareList, toggleCompare, clearCompare } = useStore();

  // Hide on comparison page itself
  if (compareList.length === 0 || location.pathname === '/comparar') {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[45] w-[90%] max-w-xl animate-in slide-in-from-bottom-10 duration-350">
      <div className="glass-panel bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-dark-800/80 shadow-2xl rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Count & Thumbnails */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <ArrowRightLeft size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Comparador
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-black text-white bg-primary-500 rounded-full leading-none">
                {compareList.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Máx. 4 productos
            </p>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-dark-800 mx-2 hidden sm:block" />

          {/* Product Thumbnails */}
          <div className="flex items-center -space-x-2">
            {compareList.map((product) => (
              <div 
                key={product.id} 
                className="relative group w-10 h-10 rounded-full border border-slate-200 bg-white dark:bg-dark-950 dark:border-dark-800 p-1 flex items-center justify-center shadow-md hover:z-10 hover:-translate-y-1 transition-all cursor-pointer"
                title={product.name}
              >
                <img 
                  src={product.primary_image || '/placeholder.jpg'} 
                  alt={product.name} 
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60';
                  }}
                />
                
                {/* Remove dot */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleCompare(product);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                >
                  <X size={8} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Action buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={clearCompare}
            className="text-[11px] font-bold text-slate-450 hover:text-slate-650 dark:hover:text-slate-350 px-3 py-1.5 transition-colors"
          >
            Limpiar
          </button>
          
          <button
            onClick={() => navigate('/comparar')}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-purple-600 hover:shadow-lg hover:shadow-primary-500/20 transition-all active:scale-95 cursor-pointer"
          >
            Comparar Ahora <ArrowRightLeft size={13} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default CompareShelf;
