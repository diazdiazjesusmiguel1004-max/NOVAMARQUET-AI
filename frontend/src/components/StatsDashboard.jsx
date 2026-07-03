import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, BarElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
import { 
  TrendingUp, ShoppingCart, ShieldAlert, Award, Package, Clock, Eye
} from 'lucide-react';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatsDashboard = ({ data }) => {
  if (!data) return <div className="text-center p-12 text-slate-400">Cargando datos analíticos...</div>;

  const { kpis, sales_timeline, top_products, stock_alerts, product_analytics, recent_activity } = data;

  // --- CHART 1: Daily Revenue Trend ---
  // Reverse timeline to show chronologically left-to-right
  const timelineSorted = [...(sales_timeline || [])].reverse();
  const revenueChartData = {
    labels: timelineSorted.map(item => new Date(item.day).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        fill: true,
        label: 'Ingresos diarios (S/)',
        data: timelineSorted.map(item => Number(item.total)),
        borderColor: '#007185',
        backgroundColor: 'rgba(0, 113, 133, 0.05)',
        tension: 0.35,
        borderWidth: 3,
        pointBackgroundColor: '#007185',
        pointHoverRadius: 7,
      }
    ]
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context) => ` Ingresos: S/ ${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(156, 163, 175, 0.05)' },
        ticks: { color: '#9ca3af', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 10 } }
      }
    }
  };

  // --- CHART 2: Conversions bar chart ---
  const conversionChartData = {
    labels: (product_analytics || []).map(p => p.sku),
    datasets: [
      {
        label: 'Tasa de Conversión (%)',
        data: (product_analytics || []).map(p => p.conversion_rate),
        backgroundColor: 'rgba(231, 118, 0, 0.75)', // Novamarquet orange/amber CVR bars
        borderRadius: 8,
        hoverBackgroundColor: '#e77600',
      }
    ]
  };

  const conversionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` CVR: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(156, 163, 175, 0.05)' },
        ticks: { color: '#9ca3af', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 9 } }
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. KPIs HUD grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total revenue */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02] hover:shadow-md transition-shadow duration-350">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Ventas</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
              S/ {Number(kpis?.total_sales || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02] hover:shadow-md transition-shadow duration-350">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pedidos Totales</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
              {kpis?.total_orders || 0}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-primary-500/10 text-primary-500">
            <ShoppingCart size={24} />
          </div>
        </div>

        {/* Pending shipping */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02] hover:shadow-md transition-shadow duration-350">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pedidos Pendientes</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
              {kpis?.pending_orders || 0}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
            <Clock size={24} />
          </div>
        </div>

        {/* Inventory alerts */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02] hover:shadow-md transition-shadow duration-350">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Stock Crítico</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
              {kpis?.low_stock || 0} <span className="text-xs font-normal text-slate-400">({kpis?.out_of_stock} agotados)</span>
            </span>
          </div>
          <div className={`p-3 rounded-xl ${kpis?.low_stock > 0 ? 'bg-red-500/15 text-red-500 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
            <ShieldAlert size={24} />
          </div>
        </div>

      </div>

      {/* 2. Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily sales line chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-350 lg:col-span-2">
          <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Tendencia de Ingresos Diarios (S/)</h4>
          <div className="h-64 relative">
            <Line data={revenueChartData} options={revenueChartOptions} />
          </div>
        </div>

        {/* Product Conversion Rates chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-350">
          <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Tasa de Conversión por SKU (%)</h4>
          <div className="h-64 relative">
            <Bar data={conversionChartData} options={conversionChartOptions} />
          </div>
        </div>

      </div>

      {/* 3. Real-Time Conversion Table & Live Logs Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Product detailed analytics conversion funnel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-350 lg:col-span-2 overflow-x-auto">
          <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-1.5">
            <Award size={16} className="text-yellow-500" /> Rendimiento y Conversión de Embudo
          </h4>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                <th className="py-2.5">Producto</th>
                <th className="py-2.5 text-center">Visitas</th>
                <th className="py-2.5 text-center">Agregados</th>
                <th className="py-2.5 text-center">Compras</th>
                <th className="py-2.5 text-right">Tasa CVR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {product_analytics?.map((item) => (
                <tr key={item.product_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 font-semibold">
                    <p className="text-[13px] text-slate-800">{item.product_name}</p>
                    <span className="text-[10px] text-slate-400 font-mono font-normal">SKU: {item.sku}</span>
                  </td>
                  <td className="py-3 text-center font-medium flex items-center justify-center gap-1">
                    <Eye size={12} className="text-slate-400" /> {item.views}
                  </td>
                  <td className="py-3 text-center font-medium text-primary-500">{item.cart_adds}</td>
                  <td className="py-3 text-center font-medium text-green-500">{item.purchases}</td>
                  <td className="py-3 text-right">
                    <span className="inline-block px-2 py-0.5 rounded font-extrabold bg-amber-500/10 text-[#e77600] dark:text-amber-400">
                      {item.conversion_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live interaction Activity logger feed */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-350 flex flex-col h-[350px]">
          <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Package size={16} className="text-primary-500 animate-pulse" /> Actividad Logs en Tiempo Real
          </h4>
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2.5 scrollbar-thin">
            {recent_activity?.map((log) => {
              // Color styles depending on log actions
              const styleMap = {
                "Click Producto": "bg-slate-100 text-slate-600 dark:bg-dark-800 dark:text-slate-400",
                "Agregar al Carrito": "bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400",
                "Compra Realizada": "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
                "Ver Categoría": "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
              };
              
              const relativeTime = new Date(log.timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <div key={log.id} className="text-[11px] p-2.5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white transition-all flex flex-col gap-1 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">
                      👤 {log.user}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {relativeTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 mt-0.5">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${styleMap[log.event_type] || 'bg-slate-100'}`}>
                      {log.event_type}
                    </span>
                    {log.product_name && (
                      <span className="text-slate-500 truncate max-w-[120px] font-semibold text-right" title={log.product_name}>
                        {log.product_name}
                      </span>
                    )}
                    {log.category_name && (
                      <span className="text-slate-500 truncate max-w-[120px]" title={log.category_name}>
                        Cat: {log.category_name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. Inventory Warnings Stock list */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-350">
        <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-1.5">
          ⚠️ Alertas de Reposición de Inventario
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stock_alerts?.length === 0 ? (
            <div className="p-4 text-xs text-green-500 font-bold col-span-2">
              ✓ Todo el inventario se encuentra óptimo. Sin alertas de reabastecimiento.
            </div>
          ) : (
            stock_alerts.map((item) => (
              <div 
                key={item.id} 
                className={`p-3.5 border rounded-xl flex items-center justify-between shadow-sm transition-colors ${
                  item.stock === 0
                    ? 'border-red-200 bg-red-500/5'
                    : 'border-orange-200 bg-orange-500/5'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {item.sku} | Cat: {item.category}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                    item.stock === 0
                      ? 'bg-red-500 text-white'
                      : 'bg-orange-500 text-white animate-pulse'
                  }`}>
                    {item.stock === 0 ? 'AGOTADO' : `CRÍTICO: ${item.stock} u.`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default StatsDashboard;
