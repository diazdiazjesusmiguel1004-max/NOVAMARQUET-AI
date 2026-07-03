import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Trash2, ArrowRight, Tag, X, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { useStore } from '../store/useStore';

const Cart = ({ notificationHandler }) => {
  const navigate = useNavigate();
  const { 
    cart, updateCartItem, removeCartItem, cartLoading, 
    coupon, applyCoupon, removeCoupon, couponError, fetchCart, isAuthenticated
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeCartItem(itemId);
      notificationHandler('Producto removido del carrito.', 'info');
    } else {
      updateCartItem(itemId, newQuantity);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await applyCoupon(couponCode);
    if (res.success) {
      notificationHandler('¡Cupón de descuento aplicado!', 'success');
      setCouponCode('');
    } else {
      notificationHandler(res.error || 'Cupón inválido.', 'error');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    notificationHandler('Cupón removido.', 'info');
  };

  // Calculations
  const subtotal = cart?.cart_total || 0;
  
  let discount = 0;
  if (coupon) {
    if (coupon.discount_type === 'percent') {
      discount = (Number(coupon.value) / 100) * subtotal;
    } else {
      discount = Number(coupon.value);
    }
  }

  // Estimated shipping based on standard Lima rate
  const shipping = subtotal > 0 ? 8.00 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const handleCheckoutRedirect = () => {
    if (cart.items.length === 0) {
      notificationHandler('Su carrito está vacío.', 'warning');
      return;
    }
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-450">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Inicia sesión para ver tu carrito</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Guarda tus productos favoritos, realiza compras seguras y sigue tus pedidos en tiempo real.
        </p>
        <Link 
          to="/login"
          className="px-6 py-2.5 inline-block text-xs font-bold text-slate-900 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:bg-[#ddb347] hover:from-[#f5c75a] hover:to-[#ebbc3d] rounded shadow active:scale-95"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Page header navigation path */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-6">
        <Link to="/" className="hover:text-[#007185]">Tienda</Link>
        <ChevronRight size={12} />
        <span className="text-slate-700">Carrito de compras</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-8 tracking-tight">
        Tu Carrito de Compras
      </h1>

      {cart.items?.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tu carrito se encuentra vacío</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">Explora nuestro catálogo para agregar productos.</p>
          <Link
            to="/"
            className="px-6 py-2.5 inline-block text-xs font-bold text-slate-900 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:bg-[#ddb347] hover:from-[#f5c75a] hover:to-[#ebbc3d] rounded shadow active:scale-95"
          >
            Explorar Productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* List of Cart Items */}
          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded p-4 sm:p-6 shadow-sm space-y-6">
            <div className="flow-root">
              <ul className="-my-6 divide-y divide-slate-100">
                {cart.items.map((item) => (
                  <li key={item.id} className="py-6 flex items-center gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 flex-shrink-0 border border-slate-200 rounded p-2 bg-slate-50 overflow-hidden">
                      <img
                        src={item.product?.primary_image || '/placeholder.png'}
                        alt={item.product?.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between text-sm">
                          <Link to={`/product/${item.product?.slug}`} className="font-bold text-slate-800 hover:text-[#007185] transition-colors leading-snug">
                            {item.product?.name}
                          </Link>
                          <span className="ml-4 font-extrabold text-slate-900 whitespace-nowrap">
                            S/ {Number(item.item_total).toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <span className="text-[#007185]">{item.product?.brand_name || 'Generica'}</span>
                          {item.color && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span>Color: {item.color}</span>
                            </>
                          )}
                          {item.size && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span>Talla: {item.size}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quantity edit controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-slate-200 rounded overflow-hidden bg-slate-50">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-slate-500 hover:bg-slate-100 font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs text-slate-800 font-extrabold w-8 text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-slate-500 hover:bg-slate-100 font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => handleQuantityChange(item.id, 0)}
                          className="text-slate-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Checkout pricing breakdowns summary */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded p-5 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-450 uppercase tracking-widest border-b border-slate-100 pb-3">
              Resumen del Pedido
            </h3>

            {/* Price values list */}
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">S/ {subtotal.toFixed(2)}</span>
              </div>
              
              {coupon && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Tag size={12} /> Descuento ({coupon.code})
                  </span>
                  <span>- S/ {discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Costo de Envío (Est.)</span>
                <span className="font-bold text-slate-800">S/ {shipping.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-100 pt-3.5 flex justify-between text-sm font-extrabold">
                <span className="text-slate-850">Total Neto</span>
                <span className="text-base text-[#b12704]">S/ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Code Input Box */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              {coupon ? (
                <div className="bg-green-50 border border-green-200 rounded p-3 flex justify-between items-center text-green-700">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <CheckCircle2 size={16} /> Cupón {coupon.code} Activo
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-red-400 hover:text-red-600 p-1 cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código de cupón (TEC2026)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-250 text-slate-800 text-xs rounded px-3 py-2 outline-none focus:border-[#007185] transition-colors uppercase font-bold"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-b from-[#f5f7f9] to-[#e7e9ec] border border-slate-350 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded shadow transition-all active:scale-95 cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </form>

                  {/* Available Coupons Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Cupones Disponibles (Click para aplicar):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { code: 'TEC2026', label: '10% OFF' },
                        { code: 'NOVAMARKET50', label: 'S/ 50 OFF' },
                        { code: 'NOVAMARQUET10', label: '10% OFF' },
                        { code: 'DESCUENTO15', label: '15% OFF' }
                      ].map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setCouponCode(c.code);
                            applyCoupon(c.code).then(res => {
                              if (res.success) notificationHandler(`¡Cupón ${c.code} aplicado!`, 'success');
                            });
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-[#007185] hover:text-[#007185] transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                        >
                          <Tag size={10} /> {c.code} <span className="opacity-70">({c.label})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {couponError && (
                <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{couponError}</p>
              )}
            </div>

            {/* Checkout proceed button */}
            <button
              onClick={handleCheckoutRedirect}
              disabled={cartLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:bg-[#ddb347] hover:from-[#f5c75a] hover:to-[#ebbc3d] text-slate-900 font-bold text-xs rounded shadow transition-all active:scale-95 uppercase tracking-wider mt-4 cursor-pointer"
            >
              Proceder al Pago <ArrowRight size={14} />
            </button>

          </div>

        </div>
      )}

    </div>
  );
};

export default Cart;
