import React, { useState } from 'react';
import {
  DollarSign,
  Lock,
  Unlock,
  PlusCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Printer,
  TrendingDown,
  TrendingUp,
  Receipt,
  UserCheck,
} from 'lucide-react';
import { useRecicladora } from '../context/RecicladoraContext';

export const CajaArqueoView: React.FC = () => {
  const {
    currentCashRegister,
    adjustCashRegister,
    closeCurrentShift,
    openNewShift,
    purchaseTickets,
    salesOrders,
  } = useRecicladora();

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showReplenishModal, setShowReplenishModal] = useState(false);

  // Close shift state
  const [physicalCountInput, setPhysicalCountInput] = useState<number>(currentCashRegister.countedCash);
  const [closingNotes, setClosingNotes] = useState('');

  // Open shift state
  const [newShiftInitialCash, setNewShiftInitialCash] = useState<number>(30000);
  const [newShiftOperator, setNewShiftOperator] = useState('Carlos Mendoza');
  const [newShiftType, setNewShiftType] = useState<'Matutino' | 'Vespertino' | 'Completo'>('Matutino');

  // Replenish cash state
  const [replenishAmount, setReplenishAmount] = useState<number>(10000);
  const [replenishNotes, setReplenishNotes] = useState('Aporte para compras de fierro');

  // Today purchases in cash
  const cashTickets = purchaseTickets.filter((t) => t.paymentMethod === 'Efectivo');
  const totalCashPurchases = cashTickets.reduce((sum, t) => sum + t.totalAmount, 0);

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    closeCurrentShift(physicalCountInput, closingNotes);
    setShowCloseModal(false);
  };

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    openNewShift(newShiftInitialCash, newShiftOperator, newShiftType);
    setShowOpenModal(false);
  };

  const handleReplenish = (e: React.FormEvent) => {
    e.preventDefault();
    adjustCashRegister({
      cashReplenishments: currentCashRegister.cashReplenishments + replenishAmount,
    });
    setShowReplenishModal(false);
  };

  const isClosed = currentCashRegister.status === 'Cerrada';
  const diff = currentCashRegister.difference;
  const isBalanced = Math.abs(diff) < 0.05;

  return (
    <div className="space-y-6">
      {/* Title & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Control de Caja, Fondo de Compras y Arqueo
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Conciliación diaria del efectivo operado en caseta de báscula para pago a recolectores
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isClosed ? (
            <>
              <button
                onClick={() => setShowReplenishModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Inyectar Efectivo</span>
              </button>
              <button
                onClick={() => {
                  setPhysicalCountInput(currentCashRegister.expectedBalance);
                  setShowCloseModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Cerrar Turno y Arqueo</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowOpenModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Aperturar Nuevo Turno</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Cash Balance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Big Visual Arqueo (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isClosed ? 'bg-red-500' : 'bg-emerald-400 animate-pulse'
                  }`}
                />
                <span className="font-semibold text-slate-200 text-sm">
                  Caseta Báscula #1 — Turno {currentCashRegister.shift} ({currentCashRegister.status})
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Apertura:{' '}
                  {new Date(currentCashRegister.openedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>•</span>
                <span>Operador: <strong>{currentCashRegister.operatorName}</strong></span>
              </div>
            </div>

            {/* Arithmetic Formula of the Cash Drawer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">1. Fondo Inicial</span>
                <div className="font-mono text-base font-bold text-slate-100 mt-0.5">
                  ${currentCashRegister.initialCash.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-slate-500">Asignado al inicio</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-emerald-400 uppercase font-bold">2. Entradas (+)</span>
                <div className="font-mono text-base font-bold text-emerald-400 mt-0.5">
                  +$
                  {(
                    currentCashRegister.totalCashSales + currentCashRegister.cashReplenishments
                  ).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-slate-500">Ventas + Reposiciones</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-red-400 uppercase font-bold">3. Compras Pagadas (-)</span>
                <div className="font-mono text-base font-bold text-red-400 mt-0.5">
                  -$
                  {currentCashRegister.totalCashPurchases.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-slate-500">Efectivo a recolectores</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-teal-400 uppercase font-bold">= Saldo Teórico</span>
                <div className="font-mono text-base font-bold text-teal-300 mt-0.5">
                  ${currentCashRegister.expectedBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-slate-500">Debe haber en cajón</span>
              </div>
            </div>

            {/* Reconciliation Comparison Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700/80 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Efectivo Físico Contado en Cajón (Arqueo)
                  </span>
                  <div className="font-mono text-3xl font-extrabold text-white mt-1">
                    ${currentCashRegister.countedCash.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Diferencia de Conciliación
                  </span>
                  <div
                    className={`font-mono text-xl font-bold mt-1 ${
                      isBalanced
                        ? 'text-emerald-400'
                        : diff > 0
                        ? 'text-sky-400'
                        : 'text-red-400'
                    }`}
                  >
                    {diff > 0 ? `+$${diff.toFixed(2)} (Sobrante)` : diff < 0 ? `-$${Math.abs(diff).toFixed(2)} (Faltante)` : '$0.00 (Cuadrada)'}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {isBalanced ? 'Caja 100% cuadrada' : 'Requiere justificación'}
                  </span>
                </div>
              </div>

              {currentCashRegister.notes && (
                <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <strong>Observaciones del Turno:</strong> {currentCashRegister.notes}
                </div>
              )}
            </div>
          </div>

          {/* Cash Tickets in this shift */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Desglose de Tickets Pagados en Efectivo ({cashTickets.length})
              </h3>
              <span className="text-xs font-mono font-bold text-red-400">
                Total Pagado: -${totalCashPurchases.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Folio</th>
                    <th className="py-2.5 px-3">Hora</th>
                    <th className="py-2.5 px-3">Proveedor</th>
                    <th className="py-2.5 px-3 text-right">Peso Neto</th>
                    <th className="py-2.5 px-3 text-right">Monto Pagado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
                  {cashTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-bold text-emerald-400">{t.folio}</td>
                      <td className="py-2 px-3 text-slate-400 font-sans text-[11px]">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-200 font-medium">
                        {t.supplierName}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        {t.totalNetKg.toFixed(1)} kg
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-red-300">
                        -${t.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Shift Management & Cashier Policy (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2 pb-3 border-b border-slate-800">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Protocolo de Báscula y Arqueo
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-200">1. Apertura de Caseta</span>
                <p className="text-slate-400 text-[11px]">
                  El operador recibe el fondo físico asignado para compras en efectivo e inicia el turno en el sistema.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-200">2. Emisión y Pago</span>
                <p className="text-slate-400 text-[11px]">
                  Cada compra liquidada en efectivo descuenta automáticamente el saldo disponible del cajón.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-200">3. Arqueo y Conciliación</span>
                <p className="text-slate-400 text-[11px]">
                  Al finalizar el turno, el operador cuenta el dinero físico remanente y el sistema verifica contra los tickets emitidos.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Acta de Arqueo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Cerrar Turno y Arqueo */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-base text-white">Cierre de Turno y Conciliación</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCloseShift} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400">Saldo Teórico Calculado:</span>
                <div className="font-mono text-xl font-bold text-teal-300">
                  ${currentCashRegister.expectedBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Efectivo Físico Contado en Cajón ($ MXN) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={physicalCountInput || ''}
                  onChange={(e) => setPhysicalCountInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Difference preview */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Diferencia resultante:</span>
                <span
                  className={`font-mono font-bold ${
                    physicalCountInput - currentCashRegister.expectedBalance === 0
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  ${(physicalCountInput - currentCashRegister.expectedBalance).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Observaciones de Cierre</label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Ej. Cierre de turno sin novedades, dinero entregado a administración..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm transition"
                >
                  Confirmar Cierre de Caja
                </button>
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Aperturar Nuevo Turno */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-base text-white">Apertura de Nuevo Turno</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOpenModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOpenShift} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Operador de Báscula</label>
                <input
                  type="text"
                  required
                  value={newShiftOperator}
                  onChange={(e) => setNewShiftOperator(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Turno</label>
                <select
                  value={newShiftType}
                  onChange={(e) => setNewShiftType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Matutino">Matutino (07:00 - 15:00)</option>
                  <option value="Vespertino">Vespertino (15:00 - 22:00)</option>
                  <option value="Completo">Completo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Fondo Inicial para Compras en Efectivo ($ MXN)
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  required
                  value={newShiftInitialCash || ''}
                  onChange={(e) => setNewShiftInitialCash(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
                >
                  Abrir Turno
                </button>
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inyectar Efectivo */}
      {showReplenishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-base text-white">Inyección / Reposición de Efectivo</h3>
              <button
                type="button"
                onClick={() => setShowReplenishModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReplenish} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Monto a Ingresar a Caseta ($ MXN) *
                </label>
                <input
                  type="number"
                  step="100"
                  min="1"
                  required
                  value={replenishAmount || ''}
                  onChange={(e) => setReplenishAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Concepto / Motivo</label>
                <input
                  type="text"
                  value={replenishNotes}
                  onChange={(e) => setReplenishNotes(e.target.value)}
                  placeholder="Ej. Refuerzo de efectivo para compras..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
                >
                  Registrar Entrada a Caja
                </button>
                <button
                  type="button"
                  onClick={() => setShowReplenishModal(false)}
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
