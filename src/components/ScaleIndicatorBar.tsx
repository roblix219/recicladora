import React, { useState } from 'react';
import { Scale, Truck, RotateCcw, Check, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useRecicladora } from '../context/RecicladoraContext';

interface ScaleIndicatorBarProps {
  onCaptureWeight?: (weight: number) => void;
  captureLabel?: string;
}

export const ScaleIndicatorBar: React.FC<ScaleIndicatorBarProps> = ({
  onCaptureWeight,
  captureLabel = 'Capturar a Formulario',
}) => {
  const {
    scaleReading,
    setScaleWeight,
    zeroScale,
    simulateVehicleWeight,
  } = useRecicladora();

  const [isExpanded, setIsExpanded] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualInput);
    if (!isNaN(val) && val >= 0) {
      setScaleWeight(val);
      setShowManual(false);
      setManualInput('');
    }
  };

  return (
    <div className="bg-slate-900/95 border-b border-slate-800 shadow-lg backdrop-blur-md px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Scale Terminal Info & Readout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Báscula Plataforma 1
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  RS-232 COM1
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ESTABLE
                </span>
                <span>•</span>
                <span>Capacidad: 60,000 kg (Div. 5 kg)</span>
              </div>
            </div>
          </div>

          {/* Digital 7-segment style LCD Readout */}
          <div className="bg-black/90 border-2 border-emerald-500/60 rounded-xl px-4 py-1.5 flex items-baseline gap-2 shadow-inner shadow-emerald-950">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-wider text-emerald-400 tabular-nums">
              {scaleReading.weightKg.toLocaleString('es-MX')}
            </span>
            <span className="text-xs font-bold font-mono text-emerald-600 uppercase">KG</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {onCaptureWeight && (
            <button
              onClick={() => onCaptureWeight(scaleReading.weightKg)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-500/30 transition active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{captureLabel}</span>
            </button>
          )}

          <button
            onClick={zeroScale}
            title="Poner a Cero báscula"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cero (Zero)</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
          >
            <Truck className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Simular Peso</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded quick load simulator */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium">Carga Rápida Simulador:</span>
            <button
              onClick={() => simulateVehicleWeight('Triciclo')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Triciclo/Carretilla (~120 kg)
            </button>
            <button
              onClick={() => simulateVehicleWeight('Piso')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Bulto/Costal (~40 kg)
            </button>
            <button
              onClick={() => simulateVehicleWeight('Camioneta')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Camioneta Pick-up (~2,800 kg)
            </button>
            <button
              onClick={() => simulateVehicleWeight('Camión 3.5')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Camión 3.5 Ton (~6,000 kg)
            </button>
            <button
              onClick={() => simulateVehicleWeight('Torton')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Torton (~17,000 kg)
            </button>
            <button
              onClick={() => simulateVehicleWeight('Tráiler')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Tráiler Tolva (~34,000 kg)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!showManual ? (
              <button
                onClick={() => setShowManual(true)}
                className="text-teal-400 hover:underline text-xs"
              >
                Ingresar Kg exactos manualmente
              </button>
            ) : (
              <form onSubmit={handleManualSubmit} className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Kg"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-24 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  Fijar
                </button>
                <button
                  type="button"
                  onClick={() => setShowManual(false)}
                  className="text-slate-400 hover:text-slate-200 px-1"
                >
                  ✕
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
