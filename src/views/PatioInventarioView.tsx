import React, { useState } from 'react';
import {
  Boxes,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  RotateCw,
  Plus,
  CheckCircle,
  FileText,
  Warehouse,
  History,
} from 'lucide-react';
import { useRecicladora } from '../context/RecicladoraContext';
import { ProcessType } from '../types';

export const PatioInventarioView: React.FC = () => {
  const { materials, yardProcesses, addYardProcess } = useRecicladora();

  // Wizard state for compacting / processing
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(materials[0]?.id || '');
  const [processType, setProcessType] = useState<ProcessType>('Compactación a Pacas');
  const [sourceWeightKg, setSourceWeightKg] = useState<number>(0);
  const [operationalLossKg, setOperationalLossKg] = useState<number>(0);
  const [operatorName, setOperatorName] = useState('Gustavo Hernández (Operador Prensa)');
  const [destinationNotes, setDestinationNotes] = useState('');

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  // Calculation of result
  const calculatedResultWeight = Math.max(0, sourceWeightKg - operationalLossKg);
  const calculatedLossPercent =
    sourceWeightKg > 0 ? ((operationalLossKg / sourceWeightKg) * 100).toFixed(1) : '0';

  // Overall Yard Totals
  const totalRawStockKg = materials.reduce((sum, m) => sum + m.stockKg, 0);
  const totalProcessedStockKg = materials.reduce((sum, m) => sum + (m.processedStockKg || 0), 0);
  const totalYardStockKg = totalRawStockKg + totalProcessedStockKg;
  const totalYardTons = (totalYardStockKg / 1000).toFixed(2);

  // Total Estimated Yard Asset Value (at wholesale price)
  const totalWholesaleValue = materials.reduce((sum, m) => {
    const totalKg = m.stockKg + (m.processedStockKg || 0);
    return sum + totalKg * m.sellPriceWholesale;
  }, 0);

  // Category grouping
  const categoryGroups = materials.reduce((acc, m) => {
    if (!acc[m.category]) {
      acc[m.category] = { totalKg: 0, items: [] as typeof materials };
    }
    acc[m.category].totalKg += m.stockKg + (m.processedStockKg || 0);
    acc[m.category].items.push(m);
    return acc;
  }, {} as Record<string, { totalKg: number; items: typeof materials }>);

  const handleExecuteProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    if (sourceWeightKg <= 0) {
      alert('Por favor ingrese los kilos de material a procesar.');
      return;
    }

    if (sourceWeightKg > selectedMaterial.stockKg) {
      alert(
        `Stock insuficiente a granel: Solo cuenta con ${selectedMaterial.stockKg.toLocaleString()} kg de ${selectedMaterial.name}.`
      );
      return;
    }

    addYardProcess({
      date: new Date().toISOString(),
      type: processType,
      operatorName,
      sourceMaterialId: selectedMaterial.id,
      sourceMaterialName: selectedMaterial.name,
      sourceWeightKg,
      resultWeightKg: calculatedResultWeight,
      operationalLossKg,
      lossPercentage: Number(calculatedLossPercent),
      destinationNotes:
        destinationNotes || `${processType} ejecutada en patio principal.`,
    });

    setShowProcessModal(false);
    setSourceWeightKg(0);
    setOperationalLossKg(0);
    setDestinationNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Warehouse className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Control de Inventario de Patio y Procesamiento
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Existencias físicas en tiempo real, registro de compactación en pacas y control de mermas operativas
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowProcessModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-950 transition active:scale-95 cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
          <span>Registrar Proceso / Compactación</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Tonelaje Total en Planta</span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {totalYardTons} <span className="text-sm font-sans font-normal text-emerald-400">TON</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {totalYardStockKg.toLocaleString()} kg combinados
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Material Compactado / Pacas</span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-teal-400 mt-1">
            {(totalProcessedStockKg / 1000).toFixed(1)} <span className="text-sm font-sans font-normal text-slate-400">TON</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {totalProcessedStockKg.toLocaleString()} kg listos para despacho
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Material a Granel (Pendiente)</span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1">
            {(totalRawStockKg / 1000).toFixed(1)} <span className="text-sm font-sans font-normal text-slate-400">TON</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            En tolvas, patios descubiertos y pilas
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Valor Estimado de Patio</span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
            ${(totalWholesaleValue / 1000).toFixed(1)}k <span className="text-xs font-sans font-normal text-slate-400">MXN</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Valor de liquidación a fundidoras
          </span>
        </div>
      </div>

      {/* Yard Inventory by Categories */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              Existencias por Categoría y Grado de Material
            </h2>
            <p className="text-xs text-slate-400">Monitoreo de niveles mínimos de inventario y porcentaje de procesamiento</p>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(categoryGroups).map(([category, group]) => {
            const categoryPercent = ((group.totalKg / (totalYardStockKg || 1)) * 100).toFixed(1);

            return (
              <div key={category} className="space-y-2.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{category}</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      {(group.totalKg / 1000).toFixed(2)} Ton ({categoryPercent}%)
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {group.items.length} {group.items.length === 1 ? 'material' : 'materiales'}
                  </span>
                </div>

                {/* Progress bar representing share */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, Number(categoryPercent)))}%` }}
                  />
                </div>

                {/* Individual materials breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {group.items.map((mat) => {
                    const isLow = mat.stockKg <= mat.minStockAlertKg;
                    const totalMatStock = mat.stockKg + (mat.processedStockKg || 0);

                    return (
                      <div
                        key={mat.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-slate-700 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                              {mat.code}
                            </span>
                            <div className="font-semibold text-xs text-slate-100 mt-1">
                              {mat.name}
                            </div>
                          </div>
                          {isLow && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1 shrink-0"
                              title="Stock por debajo del mínimo de seguridad"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Bajo
                            </span>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-end justify-between text-xs">
                          <div>
                            <div className="text-[10px] text-slate-400">A Granel:</div>
                            <div className="font-mono font-bold text-slate-200">
                              {mat.stockKg.toLocaleString()} kg
                            </div>
                          </div>
                          {mat.processedStockKg ? (
                            <div className="text-right">
                              <div className="text-[10px] text-teal-400">En Pacas:</div>
                              <div className="font-mono font-bold text-teal-300">
                                {mat.processedStockKg.toLocaleString()} kg
                              </div>
                            </div>
                          ) : (
                            <div className="text-right">
                              <div className="text-[10px] text-slate-500">Total:</div>
                              <div className="font-mono font-bold text-slate-300">
                                {(totalMatStock / 1000).toFixed(2)} T
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bitácora de Procesamiento / Compactación de Patio */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Bitácora de Procesamiento y Ajustes por Mermas Operativas
            </h3>
            <p className="text-xs text-slate-400">
              Transformación física de inventario (Granel → Pacas/Lingotes) y registro de desperdicio
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Folio</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Tipo de Proceso</th>
                <th className="py-2.5 px-3">Material</th>
                <th className="py-2.5 px-3 text-right">Kg Procesados</th>
                <th className="py-2.5 px-3 text-right">Merma / Pérdida</th>
                <th className="py-2.5 px-3 text-right">Producto Final</th>
                <th className="py-2.5 px-3">Operador / Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
              {yardProcesses.map((proc) => (
                <tr key={proc.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{proc.folio}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] font-sans">
                    {new Date(proc.date).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-teal-950 text-teal-300 border border-teal-800">
                      {proc.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-200 font-medium">
                    {proc.sourceMaterialName}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {proc.sourceWeightKg.toLocaleString()} kg
                  </td>
                  <td className="py-2.5 px-3 text-right text-red-400 font-bold">
                    -{proc.operationalLossKg} kg ({proc.lossPercentage}%)
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                    {proc.resultWeightKg.toLocaleString()} kg
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px] max-w-xs truncate">
                    {proc.operatorName} • {proc.destinationNotes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Process / Compact Material Wizard */}
      {showProcessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <RotateCw className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-base text-white">
                  Orden de Procesamiento / Compactación en Patio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProcessModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteProcess} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tipo de Proceso</label>
                  <select
                    value={processType}
                    onChange={(e) => setProcessType(e.target.value as ProcessType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Compactación a Pacas">Compactación a Pacas</option>
                    <option value="Cizallado / Oxicorte">Cizallado / Oxicorte</option>
                    <option value="Triturado / Molienda">Triturado / Molienda</option>
                    <option value="Clasificación y Limpieza">Clasificación y Limpieza</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Material a Procesar</label>
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Disp: {m.stockKg.toLocaleString()} kg)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Kilos a Tomar de Granel (kg) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={sourceWeightKg || ''}
                    onChange={(e) => setSourceWeightKg(parseFloat(e.target.value) || 0)}
                    placeholder="Ej. 2500"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  {selectedMaterial && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Disponible a granel: {selectedMaterial.stockKg.toLocaleString()} kg
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Merma Operativa / Desperdicio (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={operationalLossKg || ''}
                    onChange={(e) => setOperationalLossKg(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-red-400 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pérdida por suciedad o corte: {calculatedLossPercent}%
                  </span>
                </div>
              </div>

              {/* Live result calculation banner */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400">Rendimiento Estimado:</span>
                  <div className="font-semibold text-slate-200">
                    Producto Terminado a Sumar al Stock:
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-bold text-emerald-400">
                    {calculatedResultWeight.toLocaleString()} kg
                  </span>
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Pacas/Procesado
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Operador Responsable</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Notas de Ubicación / Número de Pacas
                </label>
                <textarea
                  value={destinationNotes}
                  onChange={(e) => setDestinationNotes(e.target.value)}
                  placeholder="Ej. 5 pacas de 480 kg estibadas en Nave 2..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
                >
                  Confirmar Proceso en Patio
                </button>
                <button
                  type="button"
                  onClick={() => setShowProcessModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
