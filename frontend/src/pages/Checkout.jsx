import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, CreditCard, ChevronRight, CheckCircle2, ShieldAlert, Award, Plus, Trash2, Smartphone 
} from 'lucide-react';
import api from '../services/api';
import { useStore } from '../store/useStore';

const Checkout = ({ notificationHandler }) => {
  const navigate = useNavigate();
  const { cart, coupon, fetchCart, removeCoupon } = useStore();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('yape');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  
  // New Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: 'Casa',
    street_address: '',
    district: '',
    province: '',
    department: 'Lima',
    phone: '',
  });

  const fetchAddresses = async () => {
    try {
      const res = await api.get('addresses/');
      setAddresses(res.data);
      if (res.data.length > 0) {
        const def = res.data.find(a => a.is_default) || res.data[0];
        setSelectedAddress(def.id);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street_address || !newAddress.district || !newAddress.province || !newAddress.phone) {
      notificationHandler('Por favor completa los datos de dirección.', 'warning');
      return;
    }

    try {
      const res = await api.post('addresses/', {
        ...newAddress,
        is_default: addresses.length === 0,
      });
      notificationHandler('Dirección guardada exitosamente.', 'success');
      setNewAddress({
        title: 'Casa',
        street_address: '',
        district: '',
        province: '',
        department: 'Lima',
        phone: '',
      });
      setShowAddressForm(false);
      fetchAddresses();
    } catch (err) {
      console.error('Error creating address:', err);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`addresses/${id}/`);
      notificationHandler('Dirección eliminada.', 'info');
      fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      notificationHandler('Debe seleccionar una dirección de entrega.', 'warning');
      return;
    }

    setPlacingOrder(true);
    try {
      const payload = {
        address_id: selectedAddress,
        payment_method: paymentMethod,
      };
      if (coupon) {
        payload.coupon_code = coupon.code;
      }

      const res = await api.post('orders/', payload);
      notificationHandler('¡Orden creada con éxito!', 'success');
      const orderData = res.data;
      
      // Clear global state
      removeCoupon();
      fetchCart();
      
      // Auto-Redirect if live payment payload links exist
      const pPayload = orderData.payment_payload;
      if (pPayload && Object.keys(pPayload).length > 0) {
        if (paymentMethod === 'mercadopago') {
          const mpUrl = pPayload.sandbox_init_point || pPayload.init_point;
          if (mpUrl) {
            notificationHandler('Redirigiendo a pasarela MercadoPago...', 'info');
            setTimeout(() => {
              window.location.href = mpUrl;
            }, 1500);
            return;
          }
        } else if (paymentMethod === 'paypal') {
          const ppUrl = pPayload.approval_url;
          if (ppUrl) {
            notificationHandler('Redirigiendo a pasarela PayPal...', 'info');
            setTimeout(() => {
              window.location.href = ppUrl;
            }, 1500);
            return;
          }
        }
      }
      
      setCreatedOrder(orderData);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Error al procesar la orden.';
      notificationHandler(errMsg, 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Simulated payment approval trigger
  const handleSimulatePayment = async () => {
    if (!createdOrder) return;
    setSimulatingPayment(true);
    try {
      const res = await api.post(`orders/${createdOrder.id}/simulate_pay/`, {
        transaction_id: `SIM-MP-${Math.floor(Math.random() * 1000000000)}`
      });
      notificationHandler('Simulación de pago aprobada. Pedido procesando.', 'success');
      setCreatedOrder(res.data.order);
      // Navigate to order tracker page after short delay
      setTimeout(() => {
        navigate(`/order-tracking/${res.data.order.tracking_number}`);
      }, 3000);
    } catch (err) {
      notificationHandler('Error al simular pago.', 'error');
    } finally {
      setSimulatingPayment(false);
    }
  };

  // Pricing calculations
  const subtotal = cart?.cart_total || 0;
  let discount = 0;
  if (coupon) {
    if (coupon.discount_type === 'percent') {
      discount = (Number(coupon.value) / 100) * subtotal;
    } else {
      discount = Number(coupon.value);
    }
  }
  const shipping = subtotal > 0 ? 8.00 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Navigation trail */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-6">
        <span>Tienda</span>
        <ChevronRight size={12} />
        <span>Carrito</span>
        <ChevronRight size={12} />
        <span className="text-slate-650 dark:text-slate-200">Checkout Final</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-8 tracking-tight">
        Checkout de Pago
      </h1>

      {/* SUCCESS ORDER AND PAYMENT GATEWAY HUD PANEL */}
      {createdOrder ? (
        <div className="max-w-2xl mx-auto bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-850 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl animate-in zoom-in-95 duration-300">
          
          <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-850 dark:text-slate-150">¡Orden Registrada Correctamente!</h2>
            <p className="text-xs text-slate-400">Código de Seguimiento: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{createdOrder.tracking_number}</span></p>
          </div>

          {/* Logistics Summary Details */}
          <div className="bg-slate-50 dark:bg-dark-950/40 rounded-2xl p-4 text-xs space-y-2 text-left border border-slate-100 dark:border-dark-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Total a Pagar:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">S/ {Number(createdOrder.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Método Elegido:</span>
              <span className="font-bold text-slate-850 dark:text-slate-250 uppercase">{createdOrder.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estado del Pago:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                createdOrder.payment_status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500 animate-pulse'
              }`}>
                {createdOrder.payment_status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
              </span>
            </div>
          </div>

          {/* Payment simulation buttons */}
          {createdOrder.payment_status !== 'paid' ? (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 justify-center">
                <Smartphone size={14} className="text-primary-500 animate-bounce" /> Escanea el código QR o simula el pago
              </div>

              {/* Yape plin simulated QR image */}
              {(createdOrder.payment_method === 'yape' || createdOrder.payment_method === 'plin') && (
                <div className="w-48 h-48 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 p-3 mx-auto rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-inner">
                  <div className="w-40 h-40 bg-slate-200 dark:bg-dark-800 rounded flex items-center justify-center font-bold text-xs text-slate-400">
                    MOCK QR CODE
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-primary-500">{createdOrder.payment_method}</span>
                </div>
              )}

              <button
                onClick={handleSimulatePayment}
                disabled={simulatingPayment}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/20 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 uppercase tracking-wider"
              >
                {simulatingPayment ? 'Procesando simulación...' : 'Pagar / Simular Pago Exitoso'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-green-500/5 text-green-600 rounded-xl text-xs font-bold flex items-center gap-1.5 justify-center border border-green-200">
                ✓ Transacción Aprobada. Redireccionando a tu tracking logístico...
              </div>
              <button
                onClick={() => navigate(`/order-tracking/${createdOrder.tracking_number}`)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
              >
                Ir a Seguimiento Manual
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Checkout Steps Form Fields */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Address selection block */}
            <div className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-850 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-800 pb-3">
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin size={16} /> 1. Dirección de Entrega
                </span>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-350 text-[10px] font-bold rounded-xl flex items-center gap-1 transition-all"
                >
                  <Plus size={12} /> Nueva Dirección
                </button>
              </div>

              {/* Dynamic Add Address Form */}
              {showAddressForm && (
                <form onSubmit={handleCreateAddress} className="bg-slate-50 dark:bg-dark-955/50 border border-slate-200 dark:border-dark-850 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-550 dark:text-slate-300 uppercase tracking-widest mb-1">Registrar Dirección</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Etiqueta (Casa, Oficina)</label>
                      <input 
                        type="text" 
                        value={newAddress.title} 
                        onChange={(e) => setNewAddress({...newAddress, title: e.target.value})}
                        className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-250 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Teléfono de contacto</label>
                      <input 
                        type="text" 
                        placeholder="+51..."
                        value={newAddress.phone} 
                        onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                        className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-250 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Dirección Completa (Calle, Av., Dpto.)</label>
                    <input 
                      type="text" 
                      value={newAddress.street_address} 
                      onChange={(e) => setNewAddress({...newAddress, street_address: e.target.value})}
                      className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-250 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Distrito</label>
                      <input 
                        type="text" 
                        value={newAddress.district} 
                        onChange={(e) => setNewAddress({...newAddress, district: e.target.value})}
                        className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-250 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Provincia</label>
                      <input 
                        type="text" 
                        value={newAddress.province} 
                        onChange={(e) => setNewAddress({...newAddress, province: e.target.value})}
                        className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-250 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Departamento</label>
                      <select 
                        value={newAddress.department} 
                        onChange={(e) => setNewAddress({...newAddress, department: e.target.value})}
                        className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-250 outline-none"
                      >
                        <option value="Lima">Lima</option>
                        <option value="Arequipa">Arequipa</option>
                        <option value="Cusco">Cusco</option>
                        <option value="La Libertad">La Libertad</option>
                        <option value="Piura">Piura</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-xl"
                    >
                      Guardar Dirección
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses checklist grid */}
              {addresses.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 dark:border-dark-800 rounded-2xl">
                  No hay direcciones registradas. Registra una dirección para continuar.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((a) => (
                    <div 
                      key={a.id}
                      onClick={() => setSelectedAddress(a.id)}
                      className={`p-4 border rounded-2xl cursor-pointer relative flex flex-col justify-between transition-all ${
                        selectedAddress === a.id
                          ? 'border-primary-500 bg-primary-500/5 shadow-md shadow-primary-500/5 ring-1 ring-primary-500'
                          : 'border-slate-200 dark:border-dark-800 hover:bg-slate-50/50 dark:hover:bg-dark-955'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-350 rounded uppercase">
                            {a.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(a.id);
                            }}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{a.street_address}</p>
                        <p className="text-[10px] text-slate-405 dark:text-slate-400 mt-0.5">{a.district}, {a.province} - {a.department}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-3">📞 {a.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Payment selector box */}
            <div className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-850 rounded-3xl p-5 shadow-sm space-y-4">
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 dark:border-dark-800 pb-3">
                <CreditCard size={16} /> 2. Método de Pago
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                {[
                  { id: 'yape', name: 'Yape (QR)', icon: '💸' },
                  { id: 'plin', name: 'Plin (QR)', icon: '💵' },
                  { id: 'mercadopago', name: 'MercadoPago', icon: '💳' },
                  { id: 'paypal', name: 'PayPal', icon: '🔵' },
                  { id: 'stripe', name: 'Stripe', icon: '🟣' }
                ].map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-3.5 border rounded-2xl flex flex-col items-center gap-1.5 text-center transition-all ${
                      paymentMethod === pm.id
                        ? 'border-primary-500 bg-primary-500/5 shadow-md shadow-primary-500/5 ring-1 ring-primary-500'
                        : 'border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-955'
                    }`}
                  >
                    <span className="text-xl">{pm.icon}</span>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{pm.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Checkout Order Summary sidebar */}
          <div className="lg:col-span-4 bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-850 rounded-3xl p-5 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-dark-800 pb-3">
              Resumen Final
            </h3>

            {/* Cart products list */}
            <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between items-center gap-2 text-xs">
                  <div className="truncate flex-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.product?.name}</span>
                    <p className="text-[10px] text-slate-400">{item.quantity} x S/ {Number(item.product?.current_price).toFixed(2)}</p>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">S/ {Number(item.item_total).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Calculations pricing breakdown */}
            <div className="border-t border-slate-100 dark:border-dark-800 pt-4 space-y-3 text-xs text-slate-600 dark:text-slate-350">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">S/ {subtotal.toFixed(2)}</span>
              </div>
              
              {coupon && (
                <div className="flex justify-between text-green-500 font-semibold">
                  <span>Descuento ({coupon.code})</span>
                  <span>- S/ {discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Costo de Envío (Est.)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">S/ {shipping.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-100 dark:border-dark-800 pt-3 flex justify-between text-sm font-extrabold">
                <span className="text-slate-800 dark:text-slate-100">Total Neto</span>
                <span className="text-base text-primary-500">S/ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || cart.items.length === 0}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-purple-600 hover:shadow-lg hover:shadow-primary-500/20 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 uppercase tracking-wider"
            >
              {placingOrder ? 'Creando orden...' : 'Realizar Pedido'}
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default Checkout;
