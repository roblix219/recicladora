import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running in standalone mode as installed PWA, hide install trigger
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-lg">
        <CheckCircle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">PWA Instalada</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        title="Instalar aplicación en tu dispositivo para uso sin conexión"
        className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-sm shadow-emerald-900/40 border border-emerald-500/40 transition active:scale-95 cursor-pointer ${className}`}
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>Instalar PWA</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-teal-300 bg-teal-950/60 hover:bg-teal-900/60 border border-teal-700/60 rounded-lg transition ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Instalar en iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 text-slate-100 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base">Instalar EcoRecicla</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p className="text-xs text-slate-400">
                  Para utilizar EcoRecicla como app nativa a pantalla completa y con soporte sin conexión:
                </p>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <Share2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-200">1. Pulsa el botón Compartir</span>
                    <p className="text-xs text-slate-400 mt-0.5">En la barra inferior de Safari (ícono con flecha hacia arriba).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <PlusSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-200">2. "Agregar al inicio"</span>
                    <p className="text-xs text-slate-400 mt-0.5">Desliza hacia abajo en las opciones y selecciona Agregar a pantalla de inicio.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 px-4 rounded-xl font-medium text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-[0.98]"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers that don't trigger beforeinstallprompt yet or desktop
  return (
    <button
      onClick={() => {
        alert('Para instalar EcoRecicla en tu navegador, haz clic en el ícono de instalación (+) en la barra de direcciones superior de tu navegador o en el menú de opciones (Instalar EcoRecicla).');
      }}
      className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800/70 hover:bg-slate-800 border border-slate-700 rounded-lg transition ${className}`}
      title="Instalar aplicación"
    >
      <Download className="w-3.5 h-3.5 text-teal-400" />
      <span>Instalar App</span>
    </button>
  );
};
