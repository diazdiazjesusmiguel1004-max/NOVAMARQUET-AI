import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, FileDown, Eye } from 'lucide-react';
import api from '../services/api';
import { useStore } from '../store/useStore';

const Orders = ({ notificationHandler }) => {
  const { isAuthenticated } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchOrders = async () => {
      try {
        const res = await api.get('orders/');
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching customer orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  const handleDownloadInvoice = (trackingNumber) => {
    notificationHandler(`Generando Boleta PDF para ${trackingNumber}...`, 'success');
    // Simulate PDF generation download trigger
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([
        `NOVAMARQUET-AI - BOLETA DE VENTA\n\nORDEN: ${trackingNumber}\nEMISIÓN: ${new Date().toLocaleDateString()}\n\n¡Gracias por tu compra en la plataforma e-commerce del futuro!`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `boleta-${trackingNumber}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      notificationHandler('Descarga de Boleta Completada.', 'success');
    }, 1500);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-dark-900 rounded-full flex items-center justify-center mx-auto text-slate-450">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Inicia sesión para ver tus compras</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Historial de pedidos, timelines logísticos y descargas de facturas en PDF.
        </p>
        <Link 
          to="/login"
          className="px-6 py-2.5 inline-block text-xs font-bold text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-all"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-450">
        Cargando historial de compras...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-6">
        <Link to="/" className="hover:text-primary-500">Tienda</Link>
        <ChevronRight size={12} />
        <span className="text-slate-650 dark:text-slate-200">Mis Compras</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-8 tracking-tight">
        Tus Pedidos Realizados
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-850 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 dark:bg-dark-955 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Aún no has realizado compras</h3>
          <p className="text-xs text-slate-450 max-w-xs mx-auto">Cuando realices tu primer checkout verás los detalles de tu tracking aquí.</p>
          <Link
            to="/"
            className="px-6 py-2.5 inline-block text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-md transition-all active:scale-95"
          >
            Comenzar a Comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div 
              key={order.id}
              className="bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-dark-850 rounded-3xl p-5 shadow-sm space-y-5 transition-colors"
            >
              {/* Order Header info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-dark-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Código Tracking</span>
                  <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">{order.tracking_number}</span>
                </div>

                <div className="flex flex-wrap gap-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block text-left sm:text-right uppercase">Fecha</span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-slate-200 dark:text-dark-800">|</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block text-left sm:text-right uppercase">Total Neto</span>
                    <span className="font-extrabold text-primary-500">S/ {Number(order.total).toFixed(2)}</span>
                  </div>
                  <span className="text-slate-200 dark:text-dark-800">|</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block text-left sm:text-right uppercase">Estado</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold capitalize ${
                      order.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                      order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                      order.status === 'pending' ? 'bg-slate-100 text-slate-600' : 'bg-blue-500/10 text-blue-500 animate-pulse'
                    }`}>
                      {order.status === 'pending' ? 'Pendiente' :
                       order.status === 'processing' ? 'Procesando' :
                       order.status === 'packed' ? 'Empaquetado' :
                       order.status === 'shipped' ? 'Enviado' :
                       order.status === 'in_transit' ? 'En reparto' :
                       order.status === 'delivered' ? 'Entregado' : 'Cancelado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items list preview */}
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-dark-955 rounded-lg p-1.5 border border-slate-200/50 dark:border-dark-800 overflow-hidden flex-shrink-0">
                      <img src={item.product_image || '/placeholder.png'} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 truncate">
                      <p className="font-bold text-slate-800 dark:text-slate-205 truncate">{item.product_name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Cant: {item.quantity} | S/ {Number(item.price).toFixed(2)} c/u</p>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-350">
                      S/ {Number(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Toolbar */}
              <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-100 dark:border-dark-800/80 text-xs">
                <button
                  onClick={() => handleDownloadInvoice(order.tracking_number)}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-slate-650 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-dark-950/40 font-bold transition-all"
                >
                  <FileDown size={14} /> Descargar Boleta PDF
                </button>
                <Link
                  to={`/order-tracking/${order.tracking_number}`}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 shadow-primary-500/10"
                >
                  <Eye size={14} /> Rastrear Pedido
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Orders;
