import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Sparkles,
  PieChart,
  Award,
  DollarSign,
  Scale,
  Building,
} from 'lucide-react';
import { useRecicladora } from '../context/RecicladoraContext';

export const ReportesView: React.FC = () => {
  const {
    materials,
    suppliers,
    purchaseTickets,
    salesOrders,
    yardProcesses,
    currentCashRegister,
    resetAllDemoData,
  } = useRecicladora();

  const [dateFilter, setDateFilter] = useState<'HOY' | 'SEMANA' | 'MES' | 'TODO'>('TODO');

  // Aggregated calculations
  const totalPurchasesNetKg = purchaseTickets.reduce((sum, t) => sum + t.totalNetKg, 0);
  const totalPurchasesAmount = purchaseTickets.reduce((sum, t) => sum + t.totalAmount, 0);

  const totalSalesNetKg = salesOrders.reduce((sum, s) => sum + s.netWeightKg, 0);
  const totalSalesAmount = salesOrders.reduce((sum, s) => sum + s.totalAmount, 0);

  // Profitability by Material
  const materialProfitability = materials.map((m) => {
    // Purchased kg for this material
    let purchasedKg = 0;
    let spentAmount = 0;
    purchaseTickets.forEach((t) => {
      t.items.forEach((item) => {
        if (item.materialId === m.id) {
          purchasedKg += item.netKg;
          spentAmount += item.subtotal;
        }
      });
    });

    // Sold kg for this material
    const soldOrders = salesOrders.filter((s) => s.materialId === m.id);
    const soldKg = soldOrders.reduce((sum, s) => sum + s.netWeightKg, 0);
    const soldRevenue = soldOrders.reduce((sum, s) => sum + s.totalAmount, 0);

    const marginPerKg = m.sellPriceWholesale - m.buyPriceStandard;
    const projectedProfitOnStock = (m.stockKg + (m.processedStockKg || 0)) * marginPerKg;

    return {
      material: m,
      purchasedKg,
      spentAmount,
      soldKg,
      soldRevenue,
      marginPerKg,
      projectedProfitOnStock,
    };
  });

  // Sort by highest potential margin
  materialProfitability.sort((a, b) => b.projectedProfitOnStock - a.projectedProfitOnStock);

  // Supplier volume leaderboard
  const topSuppliers = [...suppliers].sort(
    (a, b) => b.totalDeliveredKg - a.totalDeliveredKg
  );

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = ['Folio', 'Tipo', 'Fecha', 'Tercero', 'Material / Detalle', 'Peso_Neto_Kg', 'Total_MXN'];
    const rows: string[][] = [];

    // Purchases
    purchaseTickets.forEach((t) => {
      rows.push([
        t.folio,
        'Compra_Entrada',
        t.timestamp,
        `"${t.supplierName.replace(/"/g, '""')}"`,
        `"${t.items.map((i) => i.materialName).join(' + ')}"`,
        t.totalNetKg.toFixed(2),
        t.totalAmount.toFixed(2),
      ]);
    });

    // Sales
    salesOrders.forEach((s) => {
      rows.push([
        s.folio,
        'Venta_Salida',
        s.date,
        `"${s.clientName.replace(/"/g, '""')}"`,
        `"${s.materialName}"`,
        s.netWeightKg.toFixed(2),
        s.totalAmount.toFixed(2),
      ]);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_EcoRecicla_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Reportes de Rendimiento y Flujo de Negocio
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Balance de compras en báscula vs ventas mayoristas, rentabilidad por chatarra y exportación
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar CSV / Excel</span>
          </button>

          <button
            onClick={() => {
              if (confirm('¿Desea restablecer todos los datos a la demostración inicial?')) {
                resetAllDemoData();
              }
            }}
            title="Reiniciar datos demo"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Volumen Comprado (Entradas)</span>
          <div className="font-mono text-2xl font-extrabold text-white mt-1">
            {(totalPurchasesNetKg / 1000).toFixed(2)} <span className="text-sm font-sans font-normal text-emerald-400">TON</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            ${totalPurchasesAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} pagados
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Volumen Vendido (Salidas)</span>
          <div className="font-mono text-2xl font-extrabold text-teal-400 mt-1">
            {(totalSalesNetKg / 1000).toFixed(2)} <span className="text-sm font-sans font-normal text-slate-400">TON</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            ${totalSalesAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} facturados
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Margen Bruto de Operación</span>
          <div className="font-mono text-2xl font-extrabold text-emerald-400 mt-1">
            +${(totalSalesAmount - totalPurchasesAmount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Diferencial de comercialización
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Procesamiento en Prensa</span>
          <div className="font-mono text-2xl font-extrabold text-sky-400 mt-1">
            {yardProcesses.length} <span className="text-sm font-sans font-normal text-slate-400">Lotes</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Pacas compactadas y cizallado
          </span>
        </div>
      </div>

      {/* Grid: Profitability by Scrap Material (8 cols) & Top Suppliers (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Profitable Materials */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Materiales Más Rentables y Margen Proyectado en Patio
              </h2>
              <p className="text-xs text-slate-400">
                Diferencial entre tarifa de compra en báscula y precio de venta mayorista a fundidoras
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Material</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3 text-right">Margen / Kg</th>
                  <th className="py-2.5 px-3 text-right">Existencia Actual</th>
                  <th className="py-2.5 px-3 text-right">Ganancia en Patio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
                {materialProfitability.slice(0, 8).map((row) => (
                  <tr key={row.material.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">
                      {row.material.name}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">
                      {row.material.category}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      +${row.marginPerKg.toFixed(2)}/kg
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">
                      {(row.material.stockKg + (row.material.processedStockKg || 0)).toLocaleString()} kg
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-teal-300">
                      ${row.projectedProfitOnStock.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Suppliers Leaderboard */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Principales Proveedores
            </h2>
          </div>

          <div className="space-y-3">
            {topSuppliers.map((sup, idx) => (
              <div
                key={sup.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      idx === 0
                        ? 'bg-amber-500 text-slate-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-950'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <div className="font-semibold text-slate-200 truncate">{sup.name}</div>
                    <div className="text-[10px] text-slate-400">{sup.type}</div>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <div className="font-bold text-emerald-400">
                    {(sup.totalDeliveredKg / 1000).toFixed(1)} Ton
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ${sup.totalPaid.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
