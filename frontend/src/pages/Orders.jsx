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
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([
        `NOVAMARQUET-AI - BOLETA DE VENTA\n\nORDEN: ${trackingNumber}\nEMISIÓN: ${new Date().toLocaleDateString()}\n\n¡Gracias por tu compra en la plataforma e-commerce de Novamarquet!`
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
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-450">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Inicia sesión para ver tus compras</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Historial de pedidos, timelines logísticos y descargas de facturas en PDF.
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Cargando historial de compras...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-6">
        <Link to="/" className="hover:text-[#007185] transition-colors">Tienda</Link>
        <ChevronRight size={12} />
        <Link to="/mi-cuenta" className="hover:text-[#007185] transition-colors">Mi Perfil</Link>
        <ChevronRight size={12} />
        <span className="text-slate-700">Mis Compras</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-8 tracking-tight">
        Tus Pedidos Realizados
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Aún no has realizado compras</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">Cuando realices tu primer checkout verás los detalles de tu tracking aquí.</p>
          <Link
            to="/"
            className="px-6 py-2.5 inline-block text-xs font-bold text-slate-900 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:bg-[#ddb347] hover:from-[#f5c75a] hover:to-[#ebbc3d] rounded shadow active:scale-95"
          >
            Comenzar a Comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div 
              key={order.id}
              className="bg-white border border-slate-200/80 rounded p-5 shadow-sm space-y-5 transition-colors"
            >
              {/* Order Header info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Código Tracking</span>
                  <span className="font-mono text-sm font-bold text-slate-850">{order.tracking_number}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block text-left sm:text-right uppercase">Fecha</span>
                    <span className="font-bold text-slate-700">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-slate-200 hidden sm:inline">|</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block text-left sm:text-right uppercase">Total Neto</span>
                    <span className="font-extrabold text-[#b12704]">S/ {Number(order.total).toFixed(2)}</span>
                  </div>
                  <span className="text-slate-200 hidden sm:inline">|</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block text-left sm:text-right uppercase">Estado</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold capitalize ${
                      order.status === 'delivered' ? 'bg-green-500/10 text-green-600' :
                      order.status === 'cancelled' ? 'bg-red-500/10 text-red-600' :
                      order.status === 'pending' ? 'bg-slate-100 text-slate-650' : 'bg-blue-500/10 text-[#007185] animate-pulse'
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
                    <div className="w-12 h-12 bg-slate-50 rounded p-1.5 border border-slate-200/50 overflow-hidden flex-shrink-0">
                      <img src={item.product_image || '/placeholder.png'} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 truncate">
                      <p className="font-bold text-slate-800 truncate">{item.product_name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Cant: {item.quantity} | S/ {Number(item.price).toFixed(2)} c/u</p>
                    </div>
                    <span className="font-bold text-slate-700">
                      S/ {Number(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Toolbar */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 text-xs">
                {/* Secondary Button - grey/silver gradient */}
                <button
                  onClick={() => handleDownloadInvoice(order.tracking_number)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-350 rounded bg-gradient-to-b from-[#f5f7f9] to-[#e7e9ec] hover:from-[#e7e9ec] hover:to-[#d9dce1] text-slate-800 font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <FileDown size={14} /> Descargar Boleta PDF
                </button>
                
                {/* Primary Button - yellow/orange gradient */}
                <Link
                  to={`/order-tracking/${order.tracking_number}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:bg-[#ddb347] hover:from-[#f5c75a] hover:to-[#ebbc3d] text-slate-900 font-bold rounded shadow transition-all active:scale-95 cursor-pointer"
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
