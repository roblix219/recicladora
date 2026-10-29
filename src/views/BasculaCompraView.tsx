import React, { useState } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  User,
  Truck,
  DollarSign,
  Search,
  ArrowRight,
  Sparkles,
  Receipt,
  RotateCcw,
  Clock,
  Layers,
} from 'lucide-react';
import { useRecicladora } from '../context/RecicladoraContext';
import { Material, Supplier, TicketItem, TicketPurchase, PaymentMethod } from '../types';
import { TicketPrintModal } from '../components/TicketPrintModal';

export const BasculaCompraView: React.FC = () => {
  const {
    materials,
    suppliers,
    scaleReading,
    addPurchaseTicket,
    addSupplier,
    currentCashRegister,
    purchaseTickets,
  } = useRecicladora();

  // Mode: 'vehiculo' (camión/camioneta con peso bruto inicial y tara posterior) or 'plataforma' (pesaje directo por partidas)
  const [weighingMode, setWeighingMode] = useState<'vehiculo' | 'plataforma'>('vehiculo');

  // Vehicle weighing state
  const [vehicleGrossKg, setVehicleGrossKg] = useState<number>(0);
  const [vehicleTareKg, setVehicleTareKg] = useState<number>(0);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Camioneta Pick-up');

  // Supplier selection
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierTaxId, setNewSupplierTaxId] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierType, setNewSupplierType] = useState<'Recolector Independiente' | 'Empresa / Taller'>('Recolector Independiente');
  const [newSupplierPref, setNewSupplierPref] = useState(false);

  // Current ticket items being weighed
  const [items, setItems] = useState<TicketItem[]>([]);

  // Item builder inputs
  const [currentItemMaterialId, setCurrentItemMaterialId] = useState<string>(materials[0]?.id || '');
  const [currentItemGrossKg, setCurrentItemGrossKg] = useState<number>(0);
  const [currentItemTareKg, setCurrentItemTareKg] = useState<number>(0);
  const [currentItemDeductionPercent, setCurrentItemDeductionPercent] = useState<number>(0);
  const [currentItemDeductionKg, setCurrentItemDeductionKg] = useState<number>(0);

  // Payment settings
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [ticketNotes, setTicketNotes] = useState('');
  const [activePrintedTicket, setActivePrintedTicket] = useState<TicketPurchase | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
  const currentMaterial = materials.find((m) => m.id === currentItemMaterialId);

  // Sync supplier default plate
  const handleSupplierSelect = (supId: string) => {
    setSelectedSupplierId(supId);
    const sup = suppliers.find((s) => s.id === supId);
    if (sup?.defaultVehiclePlate) {
      setVehiclePlate(sup.defaultVehiclePlate);
    }
  };

  // Determine unit price based on supplier status (standard vs preferential)
  const getUnitPrice = (material: Material) => {
    if (selectedSupplier?.preferentialTariff) {
      return material.buyPricePreferential;
    }
    return material.buyPriceStandard;
  };

  // Calculate net for the currently configured item
  const calculateItemNet = () => {
    const rawNet = Math.max(0, currentItemGrossKg - currentItemTareKg);
    const percentDeduction = (rawNet * currentItemDeductionPercent) / 100;
    const totalDeduction = percentDeduction + currentItemDeductionKg;
    const finalNet = Math.max(0, rawNet - totalDeduction);
    const unitPrice = currentMaterial ? getUnitPrice(currentMaterial) : 0;
    const subtotal = finalNet * unitPrice;
    return {
      rawNet,
      totalDeduction,
      finalNet,
      unitPrice,
      subtotal,
    };
  };

  const itemCalcs = calculateItemNet();

  // Capture weight from scale directly
  const captureToGross = () => {
    if (weighingMode === 'vehiculo' && items.length === 0) {
      setVehicleGrossKg(scaleReading.weightKg);
      setCurrentItemGrossKg(scaleReading.weightKg);
    } else {
      setCurrentItemGrossKg(scaleReading.weightKg);
    }
  };

  const captureToTare = () => {
    if (weighingMode === 'vehiculo') {
      setVehicleTareKg(scaleReading.weightKg);
      // Auto adjust item tare if single item
      if (items.length === 0) {
        setCurrentItemTareKg(scaleReading.weightKg);
      }
    } else {
      setCurrentItemTareKg(scaleReading.weightKg);
    }
  };

  // Add configured item to ticket
  const handleAddItem = () => {
    if (!currentMaterial) return;
    if (itemCalcs.finalNet <= 0 && currentItemGrossKg <= 0) {
      alert('Por favor ingrese un peso válido mayor a 0 kg.');
      return;
    }

    const newItem: TicketItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      materialId: currentMaterial.id,
      materialName: currentMaterial.name,
      category: currentMaterial.category,
      grossKg: currentItemGrossKg,
      tareKg: currentItemTareKg,
      deductionPercent: currentItemDeductionPercent,
      deductionKg: itemCalcs.totalDeduction,
      netKg: Number(itemCalcs.finalNet.toFixed(2)),
      unitPrice: itemCalcs.unitPrice,
      subtotal: Number(itemCalcs.subtotal.toFixed(2)),
    };

    setItems([...items, newItem]);

    // Reset item inputs for next material
    setCurrentItemGrossKg(0);
    setCurrentItemTareKg(0);
    setCurrentItemDeductionPercent(currentMaterial.moistureDeductionTolerance || 0);
    setCurrentItemDeductionKg(0);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  // Grand totals
  const totalGrossKg = items.reduce((sum, i) => sum + i.grossKg, 0) || vehicleGrossKg;
  const totalTareKg = items.reduce((sum, i) => sum + i.tareKg, 0) || vehicleTareKg;
  const totalMermaKg = items.reduce((sum, i) => sum + i.deductionKg, 0);
  const totalNetKg = items.reduce((sum, i) => sum + i.netKg, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  // Submit and finalize ticket
  const handleFinalizeTicket = () => {
    if (!selectedSupplier) {
      alert('Seleccione un proveedor.');
      return;
    }
    if (items.length === 0) {
      alert('Debe agregar al menos un material al ticket de compra.');
      return;
    }

    // Check cash availability if paying cash
    if (
      paymentMethod === 'Efectivo' &&
      currentCashRegister.status === 'Abierta' &&
      totalAmount > currentCashRegister.expectedBalance
    ) {
      const proceed = confirm(
        `ADVERTENCIA DE CAJA: El efectivo disponible en caseta ($${currentCashRegister.expectedBalance.toLocaleString()}) es menor al total a liquidar ($${totalAmount.toLocaleString()}). ¿Desea registrar la compra de todas formas?`
      );
      if (!proceed) return;
    }

    const createdTicket = addPurchaseTicket({
      timestamp: new Date().toISOString(),
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      supplierType: selectedSupplier.type,
      operatorName: currentCashRegister.operatorName || 'Operador Caseta 1',
      vehiclePlate: vehiclePlate || selectedSupplier.defaultVehiclePlate || 'N/A',
      vehicleType,
      vehicleGrossKg: vehicleGrossKg > 0 ? vehicleGrossKg : undefined,
      vehicleTareKg: vehicleTareKg > 0 ? vehicleTareKg : undefined,
      totalGrossKg,
      totalTareKg,
      totalMermaKg,
      totalNetKg,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: 'Pagado',
      notes: ticketNotes,
    });

    // Reset form
    setItems([]);
    setVehicleGrossKg(0);
    setVehicleTareKg(0);
    setTicketNotes('');
    setSuccessMessage(`¡Ticket ${createdTicket.folio} generado y liquidado exitosamente!`);
    setActivePrintedTicket(createdTicket);

    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Quick Supplier registration
  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;

    const created = addSupplier({
      name: newSupplierName.trim(),
      taxId: newSupplierTaxId.trim() || 'XAXX010101000',
      phone: newSupplierPhone.trim(),
      type: newSupplierType,
      preferentialTariff: newSupplierPref,
      defaultVehiclePlate: vehiclePlate || undefined,
      totalDeliveredKg: 0,
      totalPaid: 0,
    });

    setSelectedSupplierId(created.id);
    setShowNewSupplierModal(false);
    setNewSupplierName('');
    setNewSupplierTaxId('');
    setNewSupplierPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Top Alerts */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Punto de Compra en Báscula (Entradas)
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Pesaje vehicular Bruto/Tara/Neto, deducción de impurezas y emisión de tickets térmicos 80mm
              </p>
            </div>
          </div>
        </div>

        {/* Cash Balance Quick Pill */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Fondo Efectivo en Caseta</div>
            <div className="font-mono text-sm font-bold text-emerald-400">
              ${currentCashRegister.expectedBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-xl text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          {activePrintedTicket && (
            <button
              onClick={() => setActivePrintedTicket(activePrintedTicket)}
              className="text-xs bg-emerald-700 hover:bg-emerald-600 px-3 py-1 rounded-lg text-white font-medium"
            >
              Reimprimir Ticket
            </button>
          )}
        </div>
      )}

      {/* Main Grid: Left Column (Weighing & Items) | Right Column (Summary & Liquidation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Proveedor y Modalidad */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-semibold text-slate-200 text-sm">Proveedor y Tipo de Entrada</h2>
              </div>

              {/* Mode Toggle */}
              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setWeighingMode('vehiculo')}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    weighingMode === 'vehiculo'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Báscula Camionera / Vehículo
                </button>
                <button
                  type="button"
                  onClick={() => setWeighingMode('plataforma')}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    weighingMode === 'plataforma'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Plataforma / Bultos Directos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Supplier Dropdown & Add */}
              <div className="sm:col-span-7">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">Proveedor / Recolector</label>
                  <button
                    type="button"
                    onClick={() => setShowNewSupplierModal(true)}
                    className="text-[11px] text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Nuevo Proveedor
                  </button>
                </div>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => handleSupplierSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.type}) {s.preferentialTariff ? '★ Tarifa Especial' : ''}
                    </option>
                  ))}
                </select>
                {selectedSupplier && (
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                    <span>RFC: {selectedSupplier.taxId}</span>
                    <span>•</span>
                    <span className={selectedSupplier.preferentialTariff ? 'text-amber-400 font-semibold' : ''}>
                      {selectedSupplier.preferentialTariff ? 'Tarifa Preferencial Activa' : 'Tarifa Estándar'}
                    </span>
                  </div>
                )}
              </div>

              {/* Vehicle Plates & Type */}
              <div className="sm:col-span-5 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Placas / Unidad</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    placeholder="SLP-44-12"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 uppercase focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipo Unidad</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Camioneta Pick-up">Pick-up</option>
                    <option value="Camión 3.5 Ton">Camión 3.5 Ton</option>
                    <option value="Camión Torton">Torton</option>
                    <option value="Triciclo / Carretilla">Triciclo/Carretilla</option>
                    <option value="A pie / Bultos">A pie / Costales</option>
                  </select>
                </div>
              </div>
            </div>

            {/* If vehicle mode: Gross vs Tare capture buttons */}
            {weighingMode === 'vehiculo' && (
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-teal-400" />
                    Ciclo de Báscula Vehicular (Paso a Paso)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Báscula en vivo: <span className="text-emerald-400 font-mono font-bold">{scaleReading.weightKg} kg</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Step A: Gross */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">1. PESO BRUTO (Lleno)</div>
                      <div className="text-base font-bold font-mono text-slate-100">
                        {vehicleGrossKg > 0 ? `${vehicleGrossKg.toLocaleString()} kg` : 'Sin registrar'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={captureToGross}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
                    >
                      Capturar Báscula
                    </button>
                  </div>

                  {/* Step B: Tare */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">2. TARA (Vacío de regreso)</div>
                      <div className="text-base font-bold font-mono text-slate-100">
                        {vehicleTareKg > 0 ? `${vehicleTareKg.toLocaleString()} kg` : 'Sin registrar'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={captureToTare}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
                    >
                      Capturar Tara
                    </button>
                  </div>
                </div>

                {vehicleGrossKg > 0 && vehicleTareKg > 0 && (
                  <div className="text-xs text-emerald-400 font-mono font-semibold flex items-center justify-between pt-1 border-t border-slate-800">
                    <span>Peso Neto Calculado del Vehículo:</span>
                    <span>{(vehicleGrossKg - vehicleTareKg).toLocaleString()} KG</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Clasificación de Materiales & Deducción por Mermas */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-semibold text-slate-200 text-sm">
                  Clasificación de Material y Deducción de Mermas
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Tarifa actual:{' '}
                <span className="text-emerald-400 font-bold font-mono">
                  ${currentMaterial ? getUnitPrice(currentMaterial).toFixed(2) : '0.00'}/kg
                </span>
              </span>
            </div>

            {/* Material Selector & Price Pill */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Material Reciclable
                </label>
                <select
                  value={currentItemMaterialId}
                  onChange={(e) => {
                    const mId = e.target.value;
                    setCurrentItemMaterialId(mId);
                    const mat = materials.find((m) => m.id === mId);
                    if (mat) {
                      setCurrentItemDeductionPercent(mat.moistureDeductionTolerance || 0);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.category}] {m.name} — ${getUnitPrice(m).toFixed(2)}/kg
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5 flex items-end">
                <div className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    <div>Categoría: <span className="text-slate-200 font-medium">{currentMaterial?.category}</span></div>
                    <div>Stock en patio: <span className="text-emerald-400 font-mono font-bold">{currentMaterial?.stockKg.toLocaleString()} kg</span></div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">P. Compra</span>
                    <div className="text-base font-bold font-mono text-emerald-400">
                      ${currentMaterial ? getUnitPrice(currentMaterial).toFixed(2) : '0.00'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weights Input for this Item */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">Peso Bruto (kg)</label>
                  <button
                    type="button"
                    onClick={() => setCurrentItemGrossKg(scaleReading.weightKg)}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    Báscula ({scaleReading.weightKg})
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={currentItemGrossKg || ''}
                  onChange={(e) => setCurrentItemGrossKg(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tara / Tarima (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={currentItemTareKg || ''}
                  onChange={(e) => setCurrentItemTareKg(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Merma & Impurities Slider/Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">Merma/Impureza (%)</label>
                  <span className="text-[10px] text-amber-400 font-mono">
                    Tol: {currentMaterial?.moistureDeductionTolerance}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={currentItemDeductionPercent}
                    onChange={(e) => setCurrentItemDeductionPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-amber-400 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Merma Fija (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={currentItemDeductionKg || ''}
                  onChange={(e) => setCurrentItemDeductionKg(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-amber-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Calculated Item Subtotal preview */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-4 text-slate-300">
                <div>
                  Peso Neto a Liquidar:{' '}
                  <span className="font-mono font-bold text-slate-100 text-sm">
                    {itemCalcs.finalNet.toFixed(1)} kg
                  </span>
                </div>
                {itemCalcs.totalDeduction > 0 && (
                  <div className="text-amber-400">
                    Descuento Merma: -{itemCalcs.totalDeduction.toFixed(1)} kg
                  </div>
                )}
                <div>
                  Subtotal:{' '}
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ${itemCalcs.subtotal.toFixed(2)} MXN
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-950 transition active:scale-95 cursor-pointer ml-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar al Ticket</span>
              </button>
            </div>

            {/* Items Table in Current Ticket */}
            {items.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Material</th>
                      <th className="py-2.5 px-3 text-right">P. Bruto</th>
                      <th className="py-2.5 px-3 text-right">Tara</th>
                      <th className="py-2.5 px-3 text-right">Merma</th>
                      <th className="py-2.5 px-3 text-right">P. Neto</th>
                      <th className="py-2.5 px-3 text-right">P. Unitario</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                      <th className="py-2.5 px-2 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                          {item.materialName}
                          <span className="block text-[10px] text-slate-400 font-sans">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {item.grossKg.toLocaleString()} kg
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {item.tareKg.toLocaleString()} kg
                        </td>
                        <td className="py-2.5 px-3 text-right text-red-400">
                          -{item.deductionKg.toFixed(1)} kg
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-100">
                          {item.netKg.toLocaleString()} kg
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          ${item.subtotal.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-center font-sans">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-500 hover:text-red-400 rounded transition"
                            title="Quitar partida"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
                No hay materiales agregados a este comprobante aún. Capture peso y pulse "Agregar al Ticket".
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Resumen de Liquidación & Cierre de Ticket (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 sticky top-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Resumen de Liquidación
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {items.length} {items.length === 1 ? 'partida' : 'partidas'}
              </span>
            </div>

            {/* Big Totals Block */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Peso Bruto Acumulado:</span>
                <span className="font-mono text-slate-200 font-semibold">{totalGrossKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Taras:</span>
                <span className="font-mono text-slate-200 font-semibold">{totalTareKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Deducción Total por Merma:</span>
                <span className="font-mono font-semibold">-{totalMermaKg.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-100 pt-2 border-t border-slate-800">
                <span>Peso Neto Total a Pagar:</span>
                <span className="font-mono text-emerald-400">{totalNetKg.toFixed(1)} kg</span>
              </div>
            </div>

            {/* Grand Total Amount */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-950 border border-emerald-600/40 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Total a Pagar al Proveedor
              </span>
              <div className="font-mono text-3xl font-extrabold text-white tracking-tight">
                ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400 block">Moneda Nacional (MXN)</span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Método de Liquidación</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Efectivo', 'Transferencia', 'Cheque'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-1 text-xs font-medium rounded-xl border text-center transition ${
                      paymentMethod === method
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Observaciones / Notas</label>
              <textarea
                value={ticketNotes}
                onChange={(e) => setTicketNotes(e.target.value)}
                placeholder="Ej. Material limpio, pago entregado en efectivo..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={handleFinalizeTicket}
              disabled={items.length === 0}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 shadow-lg shadow-emerald-950/60 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Liquidar y Emitir Ticket</span>
            </button>

            <div className="text-[10px] text-slate-500 text-center">
              El stock en patio se incrementará de inmediato y se deducirá de la caja si es en efectivo.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Purchases of the Shift */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Tickets Emitidos en el Turno ({purchaseTickets.length})
            </h3>
            <p className="text-xs text-slate-400">Historial reciente de compras y opciones de reimpresión</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Folio</th>
                <th className="py-2.5 px-3">Fecha y Hora</th>
                <th className="py-2.5 px-3">Proveedor</th>
                <th className="py-2.5 px-3">Placas / Unidad</th>
                <th className="py-2.5 px-3 text-right">Peso Neto</th>
                <th className="py-2.5 px-3 text-right">Total Liquidado</th>
                <th className="py-2.5 px-3 text-center">Método</th>
                <th className="py-2.5 px-3 text-center">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
              {purchaseTickets.slice(0, 8).map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{ticket.folio}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] font-sans">
                    {new Date(ticket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hrs
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-200 font-medium">
                    {ticket.supplierName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                    {ticket.vehiclePlate || 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-200 font-bold">
                    {ticket.totalNetKg.toFixed(1)} kg
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                    ${ticket.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {ticket.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <button
                      type="button"
                      onClick={() => setActivePrintedTicket(ticket)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-medium inline-flex items-center gap-1 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Ver</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Quick New Supplier Registration */}
      {showNewSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-base text-white">Alta Rápida de Proveedor</h3>
              <button
                type="button"
                onClick={() => setShowNewSupplierModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nombre Completo o Razón Social *</label>
                <input
                  type="text"
                  required
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  placeholder="Ej. Juan Pérez / Taller Mecánico..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tipo de Proveedor</label>
                  <select
                    value={newSupplierType}
                    onChange={(e) => setNewSupplierType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Recolector Independiente">Recolector</option>
                    <option value="Empresa / Taller">Empresa / Taller</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">RFC / Identificación</label>
                  <input
                    type="text"
                    value={newSupplierTaxId}
                    onChange={(e) => setNewSupplierTaxId(e.target.value.toUpperCase())}
                    placeholder="RFC o Cédula"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Teléfono Móvil</label>
                <input
                  type="tel"
                  value={newSupplierPhone}
                  onChange={(e) => setNewSupplierPhone(e.target.value)}
                  placeholder="444-..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prefCheck"
                  checked={newSupplierPref}
                  onChange={(e) => setNewSupplierPref(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                <label htmlFor="prefCheck" className="text-slate-300 text-xs cursor-pointer">
                  Asignar tarifa preferencial / empresa (precios especiales)
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
                >
                  Registrar y Seleccionar
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewSupplierModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 80mm Thermal Receipt Modal */}
      <TicketPrintModal
        ticket={activePrintedTicket}
        onClose={() => setActivePrintedTicket(null)}
      />
    </div>
  );
};
