import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Printer,
  FileCheck,
  CheckCircle2,
  DollarSign,
  Search,
  Building,
  Scale,
  Calendar,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useRecicladora } from '../context/RecicladoraContext';
import { SalesOrder } from '../types';

export const VentasMayoristasView: React.FC = () => {
  const { materials, salesOrders, createSalesOrder, scaleReading } = useRecicladora();

  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<SalesOrder | null>(null);

  // New sales order form state
  const [clientName, setClientName] = useState('Siderúrgica del Norte / Fundidora');
  const [carrierCompany, setCarrierCompany] = useState('Transportes Especializados');
  const [driverName, setDriverName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(materials[0]?.id || '');
  const [grossWeightKg, setGrossWeightKg] = useState<number>(0);
  const [tareWeightKg, setTareWeightKg] = useState<number>(0);
  const [customUnitPrice, setCustomUnitPrice] = useState<number>(0);
  const [invoiceRef, setInvoiceRef] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Cobrado' | 'A Crédito 15d' | 'Pendiente'>('Cobrado');
  const [notes, setNotes] = useState('');

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  // Auto set unit price when material changes
  const handleMaterialChange = (matId: string) => {
    setSelectedMaterialId(matId);
    const m = materials.find((item) => item.id === matId);
    if (m) {
      setCustomUnitPrice(m.sellPriceWholesale);
    }
  };

  const netWeightKg = Math.max(0, grossWeightKg - tareWeightKg);
  const totalAmount = netWeightKg * customUnitPrice;

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    if (netWeightKg <= 0) {
      alert('El peso neto despachado debe ser mayor a 0 kg.');
      return;
    }

    const availableStock = selectedMaterial.stockKg + (selectedMaterial.processedStockKg || 0);
    if (netWeightKg > availableStock) {
      alert(
        `Existencias insuficientes en patio: Solo hay ${availableStock.toLocaleString()} kg disponibles de ${selectedMaterial.name}.`
      );
      return;
    }

    const newOrder = createSalesOrder({
      date: new Date().toISOString(),
      clientName: clientName.trim(),
      driverName: driverName.trim() || 'Chofer Asignado',
      vehiclePlate: vehiclePlate.trim().toUpperCase() || 'S/P',
      carrierCompany: carrierCompany.trim(),
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      category: selectedMaterial.category,
      grossWeightKg,
      tareWeightKg,
      netWeightKg,
      unitPrice: customUnitPrice,
      totalAmount,
      invoiceRef: invoiceRef.trim() || undefined,
      paymentStatus,
      notes,
    });

    setShowNewOrderModal(false);
    setSelectedOrderForPrint(newOrder);

    // Reset inputs
    setGrossWeightKg(0);
    setTareWeightKg(0);
    setDriverName('');
    setVehiclePlate('');
    setNotes('');
  };

  // Grand summary stats
  const totalSalesRevenue = salesOrders.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalDispatchedTons = (
    salesOrders.reduce((sum, s) => sum + s.netWeightKg, 0) / 1000
  ).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Truck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Venta de Material Procesado y Salidas Mayoristas
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Control de despachos, pesaje de tráileres de salida y emisión de Notas de Remisión a fundidoras
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (selectedMaterial) setCustomUnitPrice(selectedMaterial.sellPriceWholesale);
            setShowNewOrderModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-950 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Salida / Remisión</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Despachado Mayorista</span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-teal-400 mt-1">
            {totalDispatchedTons} <span className="text-sm font-sans font-normal text-slate-400">TON</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Salidas confirmadas en báscula
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Ingresos Totales Facturados</span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
            ${totalSalesRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Ventas a clientes industriales
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400">Remisiones Emitidas</span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {salesOrders.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Tráileres y tolvas embarcadas
          </span>
        </div>
      </div>

      {/* Sales Orders Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Historial de Órdenes de Salida y Embarque
            </h2>
            <p className="text-xs text-slate-400">Registro de pesaje y estado de pago de fundidoras</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Remisión</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Cliente / Fundidora</th>
                <th className="py-2.5 px-3">Material Despachado</th>
                <th className="py-2.5 px-3">Placas / Chofer</th>
                <th className="py-2.5 px-3 text-right">Peso Neto</th>
                <th className="py-2.5 px-3 text-right">Precio/kg</th>
                <th className="py-2.5 px-3 text-right">Importe Total</th>
                <th className="py-2.5 px-3 text-center">Estado Pago</th>
                <th className="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
              {salesOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-teal-400">{order.folio}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-100 font-medium">
                    {order.clientName}
                    {order.invoiceRef && (
                      <span className="block text-[10px] text-slate-400 font-mono">
                        Ref: {order.invoiceRef}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-200">
                    {order.materialName}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">
                    {order.vehiclePlate} ({order.driverName})
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-100 font-bold">
                    {order.netWeightKg.toLocaleString()} kg
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    ${order.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                    ${order.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        order.paymentStatus === 'Cobrado'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <button
                      onClick={() => setSelectedOrderForPrint(order)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-medium inline-flex items-center gap-1 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Remisión</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nueva Orden de Venta / Despacho Mayorista */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                  <Truck className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-base text-white">
                  Nueva Remisión de Salida Mayorista
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cliente / Fundidora *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. DeAcero / BioPappel..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Línea de Transporte</label>
                  <input
                    type="text"
                    value={carrierCompany}
                    onChange={(e) => setCarrierCompany(e.target.value)}
                    placeholder="Ej. Transportes del Norte"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nombre Chofer</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Ej. Roberto Morales"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Placas Tráiler / Tolva</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    placeholder="NL-12-880"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono uppercase text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Material selection */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Material a Despachar</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — Disp: {(m.stockKg + (m.processedStockKg || 0)).toLocaleString()} kg
                    </option>
                  ))}
                </select>
              </div>

              {/* Weighing Inputs: Gross & Tare of the outbound truck */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">Pesaje de Salida en Báscula</span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Lectura Báscula: {scaleReading.weightKg} kg
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300">Peso Bruto Camión Lleno (kg)</label>
                      <button
                        type="button"
                        onClick={() => setGrossWeightKg(scaleReading.weightKg)}
                        className="text-[10px] text-teal-400 hover:underline"
                      >
                        Báscula
                      </button>
                    </div>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={grossWeightKg || ''}
                      onChange={(e) => setGrossWeightKg(parseFloat(e.target.value) || 0)}
                      placeholder="Ej. 32000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300">Tara Camión Vacío (kg)</label>
                      <button
                        type="button"
                        onClick={() => setTareWeightKg(scaleReading.weightKg)}
                        className="text-[10px] text-teal-400 hover:underline"
                      >
                        Báscula
                      </button>
                    </div>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={tareWeightKg || ''}
                      onChange={(e) => setTareWeightKg(parseFloat(e.target.value) || 0)}
                      placeholder="Ej. 14000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 mb-1">Precio Acordado ($/kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={customUnitPrice}
                      onChange={(e) => setCustomUnitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-teal-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Condición de Pago</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Cobrado">Cobrado (Contado)</option>
                      <option value="A Crédito 15d">A Crédito (15 días)</option>
                      <option value="Pendiente">Pendiente</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                  <div>
                    Peso Neto Despachado:{' '}
                    <span className="font-mono font-bold text-slate-100">
                      {netWeightKg.toLocaleString()} kg
                    </span>
                  </div>
                  <div>
                    Total Venta:{' '}
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Referencia Factura / Pedido</label>
                <input
                  type="text"
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  placeholder="Ej. FAC-E-9021"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
                >
                  Confirmar Salida y Generar Remisión
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Vista de Remisión Formal */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-400" />
                <h3 className="font-semibold text-base text-white">
                  Nota de Remisión de Embarque Mayorista
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForPrint(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 p-4 bg-white text-black rounded-lg font-mono text-xs space-y-3">
              <div className="text-center pb-2 border-b border-gray-400">
                <div className="font-bold text-sm">ECO-RECICLA • PLANTA MATRIZ</div>
                <div className="text-[10px]">REMISIÓN DE SALIDA DE MATERIAL RECICLABLE</div>
                <div className="font-bold text-xs mt-1">FOLIO: {selectedOrderForPrint.folio}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <strong>CLIENTE:</strong> {selectedOrderForPrint.clientName}
                </div>
                <div>
                  <strong>FECHA:</strong> {new Date(selectedOrderForPrint.date).toLocaleString()}
                </div>
                <div>
                  <strong>TRANSPORTE:</strong> {selectedOrderForPrint.carrierCompany}
                </div>
                <div>
                  <strong>PLACAS:</strong> {selectedOrderForPrint.vehiclePlate}
                </div>
                <div>
                  <strong>CHOFER:</strong> {selectedOrderForPrint.driverName}
                </div>
                <div>
                  <strong>ESTADO:</strong> {selectedOrderForPrint.paymentStatus}
                </div>
              </div>

              <div className="border-t border-b border-gray-300 py-2 space-y-1">
                <div className="flex justify-between">
                  <span>PESO BRUTO EN BÁSCULA:</span>
                  <strong>{selectedOrderForPrint.grossWeightKg.toLocaleString()} KG</strong>
                </div>
                <div className="flex justify-between">
                  <span>TARA (UNIDAD VACÍA):</span>
                  <strong>{selectedOrderForPrint.tareWeightKg.toLocaleString()} KG</strong>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold border-t border-gray-200 pt-1">
                  <span>PESO NETO DESPACHADO:</span>
                  <span>{selectedOrderForPrint.netWeightKg.toLocaleString()} KG</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <div>
                  <strong>MATERIAL:</strong> {selectedOrderForPrint.materialName}
                  <div className="text-[10px]">Precio: ${selectedOrderForPrint.unitPrice.toFixed(2)}/kg</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px]">TOTAL FACTURADO:</div>
                  <div className="font-bold text-sm">
                    ${selectedOrderForPrint.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </div>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4 text-center text-[9px] border-t border-dashed border-gray-300">
                <div>
                  <div className="border-b border-black h-8 mb-1"></div>
                  FIRMA DESPACHO BÁSCULA
                </div>
                <div>
                  <div className="border-b border-black h-8 mb-1"></div>
                  FIRMA CHOFER TRANSPORTISTA
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
              >
                Imprimir Copia de Remisión
              </button>
              <button
                onClick={() => setSelectedOrderForPrint(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
