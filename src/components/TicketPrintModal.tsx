import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, QrCode, Download } from 'lucide-react';
import { TicketPurchase } from '../types';

interface TicketPrintModalProps {
  ticket: TicketPurchase | null;
  onClose: () => void;
}

// Convert number to Mexican Pesos written text
function numberToText(amount: number): string {
  const integerPart = Math.floor(amount);
  const cents = Math.round((amount - integerPart) * 100);
  const centsStr = String(cents).padStart(2, '0') + '/100 M.N.';

  return `*** TOTAL: $${amount.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} (${centsStr}) ***`;
}

export const TicketPrintModal: React.FC<TicketPrintModalProps> = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(ticket.timestamp).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/80 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Comprobante de Compra en Báscula</h3>
              <p className="text-[11px] text-slate-400">Formato térmico 80mm - Folio: {ticket.folio}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-950/60 flex justify-center">
          {/* Printable 80mm Ticket container */}
          <div
            id="printable-ticket"
            className="w-full max-w-[340px] bg-white text-black p-5 rounded-md shadow-lg font-mono text-[11px] leading-tight select-all border border-gray-200"
          >
            {/* Header / Plant Branding */}
            <div className="text-center pb-2 border-b border-dashed border-gray-400">
              <h2 className="font-bold text-sm tracking-wide">PLANTAS RECICLADORAS ECO-RECICLA</h2>
              <p className="text-[10px] text-gray-700">CENTRO DE ACOPIO Y TRANSFORMACIÓN</p>
              <p className="text-[9px] text-gray-600">RFC: REC-240915-K89 • REG. SEMARNAT: SLP/2026/044</p>
              <p className="text-[9px] text-gray-600">Eje Industrial 130 #420, San Luis Potosí</p>
              <p className="text-[9px] text-gray-600">Tel: (444) 819-2000 • Caseta Báscula #1</p>
            </div>

            {/* Ticket Info */}
            <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
              <div className="flex justify-between font-bold text-xs">
                <span>TICKET DE ENTRADA:</span>
                <span>{ticket.folio}</span>
              </div>
              <div className="flex justify-between">
                <span>FECHA Y HORA:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>OPERADOR BÁSCULA:</span>
                <span>{ticket.operatorName}</span>
              </div>
              <div className="flex justify-between">
                <span>ESTADO:</span>
                <span className="font-bold">{ticket.paymentStatus.toUpperCase()} ({ticket.paymentMethod})</span>
              </div>
            </div>

            {/* Supplier Info */}
            <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
              <div className="font-bold text-[10px]">PROVEEDOR / VENDEDOR:</div>
              <div className="font-semibold text-xs">{ticket.supplierName}</div>
              <div className="flex justify-between text-[9px] text-gray-700">
                <span>TIPO: {ticket.supplierType}</span>
                {ticket.vehiclePlate && <span>PLACAS: {ticket.vehiclePlate}</span>}
              </div>
              {ticket.vehicleType && (
                <div className="text-[9px] text-gray-700">UNIDAD: {ticket.vehicleType}</div>
              )}
            </div>

            {/* Scale Readings (Bruto / Tara / Neto Total) */}
            {(ticket.vehicleGrossKg || ticket.totalGrossKg > 0) && (
              <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-0.5 bg-gray-50 p-1.5 rounded">
                <div className="font-bold text-[10px] text-center mb-1">REGISTRO DE BÁSCULA ELECTRÓNICA</div>
                {ticket.vehicleGrossKg !== undefined && (
                  <div className="flex justify-between">
                    <span>PESO BRUTO VEHÍCULO:</span>
                    <span className="font-bold">{ticket.vehicleGrossKg.toLocaleString()} KG</span>
                  </div>
                )}
                {ticket.vehicleTareKg !== undefined && (
                  <div className="flex justify-between">
                    <span>TARA (VEHÍCULO VACÍO):</span>
                    <span className="font-bold">{ticket.vehicleTareKg.toLocaleString()} KG</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>DEDUCCIÓN MERMA/IMPUREZA:</span>
                  <span className="text-red-700">-{ticket.totalMermaKg.toFixed(1)} KG</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-300 pt-0.5 text-xs">
                  <span>PESO NETO A PAGAR:</span>
                  <span>{ticket.totalNetKg.toFixed(1)} KG</span>
                </div>
              </div>
            )}

            {/* Material Breakdown */}
            <div className="py-2 border-b border-dashed border-gray-400">
              <div className="font-bold text-[10px] mb-1">DESGLOSE DE MATERIALES:</div>
              <table className="w-full text-left text-[9px]">
                <thead>
                  <tr className="border-b border-gray-300 font-bold">
                    <th className="py-1">MATERIAL</th>
                    <th className="text-right py-1">KG</th>
                    <th className="text-right py-1">PRECIO</th>
                    <th className="text-right py-1">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ticket.items.map((item, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-1 pr-1">
                        <div className="font-semibold">{item.materialName}</div>
                        {item.deductionKg > 0 && (
                          <div className="text-[8px] text-red-600">
                            Merma: -{item.deductionKg.toFixed(1)}kg ({item.deductionPercent}%)
                          </div>
                        )}
                      </td>
                      <td className="text-right py-1 whitespace-nowrap font-medium">
                        {item.netKg.toFixed(1)}
                      </td>
                      <td className="text-right py-1 whitespace-nowrap">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="text-right py-1 whitespace-nowrap font-bold">
                        ${item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total liquidation summary */}
            <div className="py-3 border-b-2 border-black space-y-1 text-right">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL A LIQUIDAR:</span>
                <span className="text-base">${ticket.totalAmount.toFixed(2)} MXN</span>
              </div>
              <div className="text-[8px] text-gray-600 text-center uppercase tracking-tight mt-1">
                {numberToText(ticket.totalAmount)}
              </div>
              <div className="text-[9px] text-gray-700 text-center font-medium">
                FORMA DE PAGO: {ticket.paymentMethod.toUpperCase()} — {ticket.paymentStatus.toUpperCase()}
              </div>
            </div>

            {ticket.notes && (
              <div className="py-1 text-[9px] text-gray-600 italic">
                Nota: {ticket.notes}
              </div>
            )}

            {/* QR Code and verification visual */}
            <div className="py-3 flex flex-col items-center justify-center text-center border-b border-dashed border-gray-300">
              <div className="p-2 bg-white border border-gray-300 rounded">
                <svg width="72" height="72" viewBox="0 0 100 100" fill="currentColor">
                  {/* Stylized QR pattern */}
                  <rect x="10" y="10" width="25" height="25" />
                  <rect x="15" y="15" width="15" height="15" fill="white" />
                  <rect x="18" y="18" width="9" height="9" />

                  <rect x="65" y="10" width="25" height="25" />
                  <rect x="70" y="15" width="15" height="15" fill="white" />
                  <rect x="73" y="18" width="9" height="9" />

                  <rect x="10" y="65" width="25" height="25" />
                  <rect x="15" y="70" width="15" height="15" fill="white" />
                  <rect x="18" y="73" width="9" height="9" />

                  <rect x="42" y="12" width="6" height="18" />
                  <rect x="52" y="24" width="6" height="18" />
                  <rect x="42" y="42" width="16" height="16" />
                  <rect x="65" y="45" width="8" height="18" />
                  <rect x="78" y="65" width="12" height="15" />
                  <rect x="45" y="72" width="16" height="12" />
                </svg>
              </div>
              <span className="text-[8px] text-gray-500 mt-1">
                VERIFICACIÓN DIGITAL • ID: {ticket.id}
              </span>
            </div>

            {/* Signatures */}
            <div className="pt-4 pb-2 grid grid-cols-2 gap-4 text-center text-[9px]">
              <div>
                <div className="border-b border-gray-400 h-8 mb-1"></div>
                <span>FIRMA OPERADOR</span>
              </div>
              <div>
                <div className="border-b border-gray-400 h-8 mb-1"></div>
                <span>FIRMA PROVEEDOR</span>
              </div>
            </div>

            {/* Footer notice */}
            <div className="text-center text-[8px] text-gray-500 pt-2 border-t border-dashed border-gray-300">
              <p>Comprobante válido de compra y pesaje certificado.</p>
              <p>¡Gracias por contribuir a la economía circular y al reciclaje!</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pesaje y folio registrado en patio</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950 transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ticket (80mm)</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-700/80 hover:bg-slate-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
