import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, MapPin, Truck, CheckCircle2, Search, ArrowLeft, Clock, ShoppingBag 
} from 'lucide-react';
import api from '../services/api';

const OrderTracking = ({ notificationHandler }) => {
  const { tracking_number } = useParams();
  const [searchVal, setSearchVal] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrackingDetails = async (code) => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('orders/track/', {
        params: { tracking_number: code }
      });
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo encontrar el pedido.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tracking_number) {
      setSearchVal(tracking_number);
      fetchTrackingDetails(tracking_number);
    }
  }, [tracking_number]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    fetchTrackingDetails(searchVal.trim().toUpperCase());
  };

  // Timeline node state mapper
  const getStepStatus = (stepName) => {
    if (!order) return 'upcoming';
    const status = order.status;
    const paymentStatus = order.payment_status;

    // Ordered sequence
    const sequence = ['pending', 'processing', 'packed', 'shipped', 'in_transit', 'delivered'];
    const currentIndex = sequence.indexOf(status);

    const stepIndexes = {
      'confirmed': 0, // pending is index 0
      'preparing': 1, // processing is index 1
      'packed': 2,    // packed is index 2
      'shipped': 3,   // shipped is index 3
      'in_transit': 4,// in_transit is index 4
      'delivered': 5  // delivered is index 5
    };

    const targetIndex = stepIndexes[stepName];

    if (status === 'cancelled') return 'cancelled';
    if (currentIndex >= targetIndex) {
      return 'completed';
    }
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-primary-500 mb-6 transition-colors">
        <ArrowLeft size={16} /> Ir a la Tienda
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-8 tracking-tight">
        Rastreador de Envío Logístico
      </h1>

      {/* Lookup search bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-850 p-4 rounded-3xl shadow-sm flex gap-3 items-center mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Introduce tu código de pedido (E.g., ORD-2026-X1)"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-2xl px-4 py-2.5 pl-10 text-xs text-slate-850 dark:text-slate-200 outline-none focus:border-primary-500 transition-colors uppercase font-bold"
          />
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1"
        >
          {loading ? 'Buscando...' : 'Buscar Pedido'}
        </button>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-slate-400">Consultando bases logísticas...</div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-500/5 border border-red-200 text-red-500 rounded-3xl p-6 text-center text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* Tracker Timeline results */}
      {order && !loading && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          
          {/* Timeline checkmarks block */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-850 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-slate-100 dark:border-dark-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Código Rastro</span>
                <span className="font-mono text-base font-extrabold text-slate-800 dark:text-white">{order.tracking_number}</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Entrega Destino</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">{order.address_details?.district}, {order.address_details?.province}</span>
              </div>
            </div>

            {/* TIMELINE DESIGN ROW */}
            {order.status === 'cancelled' ? (
              <div className="bg-red-500/5 border border-red-200 rounded-2xl p-5 text-center text-red-500">
                <p className="text-xs font-bold">❌ Este pedido ha sido CANCELADO.</p>
                <p className="text-[10px] text-slate-400 mt-1">Si tienes dudas sobre el cobro o reembolso de fondos, ponte en contacto con soporte.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Connector line background */}
                <div className="absolute top-4 left-4 sm:left-1/2 sm:-translate-x-1/2 bottom-4 w-0.5 bg-slate-100 dark:bg-dark-800 pointer-events-none" />

                <div className="space-y-6 sm:space-y-12">
                  
                  {/* Step 1: Confirmed */}
                  {[
                    { id: 'confirmed', title: 'Pedido Recibido', desc: 'Tu pedido ha sido recibido y registrado en nuestro sistema.', icon: CheckCircle2 },
                    { id: 'preparing', title: 'Pago Aprobado', desc: 'Tu pago ha sido validado y aprobado exitosamente.', icon: CheckCircle2 },
                    { id: 'packed', title: 'Preparando Pedido', desc: 'Estamos empaquetando tus productos en el almacén del vendedor.', icon: Package },
                    { id: 'shipped', title: 'Despachado / Enviado', desc: 'El paquete ha sido entregado a la empresa de transporte.', icon: Truck },
                    { id: 'in_transit', title: 'En Tránsito', desc: 'El paquete se encuentra en camino a tu domicilio.', icon: Truck },
                    { id: 'delivered', title: 'Entregado', desc: 'El producto ha sido entregado con éxito.', icon: CheckCircle2 }
                  ].map((step, idx) => {
                    const status = getStepStatus(step.id);
                    const isCompleted = status === 'completed';
                    const IconComp = step.icon;

                    return (
                      <div key={step.id} className="relative flex gap-4 sm:gap-0 sm:grid sm:grid-cols-2 items-center">
                        
                        {/* Bullet tracker */}
                        <div className={`absolute top-0.5 left-0.5 sm:left-1/2 sm:-translate-x-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                          isCompleted
                            ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20'
                            : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 text-slate-400'
                        }`}>
                          <IconComp size={14} />
                        </div>

                        {/* Text layout (alternates left and right on desktop) */}
                        <div className={`pl-12 sm:pl-0 ${idx % 2 === 0 ? 'sm:text-right sm:pr-8' : 'sm:col-start-2 sm:pl-8'}`}>
                          <h4 className={`text-xs font-extrabold ${isCompleted ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
                            {step.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1 max-w-sm sm:inline-block leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>
            )}
          </div>

          {/* Detailed summary lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Delivery address details */}
            <div className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-850 rounded-3xl p-5 shadow-sm space-y-3.5">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <MapPin size={14} /> Dirección de Envío
              </h3>
              <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-350">
                <p className="font-bold text-slate-800 dark:text-white">{order.address_details?.street_address}</p>
                <p>Distrito: {order.address_details?.district}</p>
                <p>Provincia: {order.address_details?.province}</p>
                <p>Departamento: {order.address_details?.department}</p>
                <p className="font-mono mt-2 pt-2 border-t border-slate-100 dark:border-dark-800 text-slate-500">Contacto: {order.address_details?.phone}</p>
              </div>
            </div>

            {/* Order Items count */}
            <div className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-850 rounded-3xl p-5 shadow-sm space-y-3.5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-3">
                  <ShoppingBag size={14} /> Resumen de Compra
                </h3>
                <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-[11px] text-slate-650 dark:text-slate-400">
                      <span className="truncate max-w-[180px] font-semibold">{item.product_name}</span>
                      <span>{item.quantity} u.</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-dark-800 pt-3 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-850 dark:text-slate-300">Total Facturado</span>
                <span className="font-extrabold text-base text-primary-500">S/ {Number(order.total).toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Default placeholder state */}
      {!order && !loading && !error && (
        <div className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-850 rounded-3xl p-12 text-center text-slate-400">
          Introduce un código de orden arriba para rastrear su despacho físico.
        </div>
      )}

    </div>
  );
};

export default OrderTracking;
