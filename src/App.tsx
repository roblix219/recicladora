import React, { useState } from 'react';
import {
  Scale,
  Tag,
  Warehouse,
  Truck,
  DollarSign,
  BarChart3,
  Recycle,
  Menu,
  X,
  ShieldCheck,
  Smartphone,
  CheckCircle,
} from 'lucide-react';
import { RecicladoraProvider, useRecicladora } from './context/RecicladoraContext';
import { ScaleIndicatorBar } from './components/ScaleIndicatorBar';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BasculaCompraView } from './views/BasculaCompraView';
import { CatalogTarifarioView } from './views/CatalogTarifarioView';
import { PatioInventarioView } from './views/PatioInventarioView';
import { VentasMayoristasView } from './views/VentasMayoristasView';
import { CajaArqueoView } from './views/CajaArqueoView';
import { ReportesView } from './views/ReportesView';

type ActiveTab = 'bascula' | 'tarifario' | 'patio' | 'ventas' | 'caja' | 'reportes';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('bascula');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentCashRegister, unsyncedCount, syncOfflineQueue } = useRecicladora();

  const navItems = [
    { id: 'bascula' as ActiveTab, label: 'Báscula y Compra', icon: Scale, badge: 'Entradas' },
    { id: 'tarifario' as ActiveTab, label: 'Tarifario y Catálogo', icon: Tag },
    { id: 'patio' as ActiveTab, label: 'Patio e Inventario', icon: Warehouse, badge: 'Stock' },
    { id: 'ventas' as ActiveTab, label: 'Ventas Mayoristas', icon: Truck, badge: 'Salidas' },
    { id: 'caja' as ActiveTab, label: 'Caja y Arqueo', icon: DollarSign },
    { id: 'reportes' as ActiveTab, label: 'Reportes y Margen', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('bascula')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-950 group-hover:scale-105 transition">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Recycle className="w-5 h-5 text-emerald-400 group-hover:rotate-45 transition duration-500" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    EcoRecicla
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase">
                    PWA Báscula
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:block">
                  Control de Báscula, Patio y Mermas
                </span>
              </div>
            </button>
          </div>

          {/* Center: Shift & Cash quick status */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Turno: <strong>{currentCashRegister.shift}</strong></span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Fondo Báscula:</span>
              <span className="font-mono font-bold text-emerald-400">
                ${currentCashRegister.expectedBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Right Header items: Connectivity, Install button, Mobile menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Offline status and pending sync */}
            <OfflineIndicator
              unsyncedCount={unsyncedCount}
              onSyncNow={syncOfflineQueue}
            />

            {/* PWA In-App Install prompt button */}
            <PWAInstallButton />

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 border-t border-slate-800/80">
          <nav className="flex space-x-1 overflow-x-auto py-1.5 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                        isActive
                          ? 'bg-emerald-800/80 text-emerald-100'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile slide-out nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 text-sm animate-in fade-in slide-in-from-top-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Industrial Scale Indicator Bar (Simulates physical terminal RS-232 on weighing platform) */}
      <ScaleIndicatorBar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20 md:pb-12">
        {activeTab === 'bascula' && <BasculaCompraView />}
        {activeTab === 'tarifario' && <CatalogTarifarioView />}
        {activeTab === 'patio' && <PatioInventarioView />}
        {activeTab === 'ventas' && <VentasMayoristasView />}
        {activeTab === 'caja' && <CajaArqueoView />}
        {activeTab === 'reportes' && <ReportesView />}
      </main>

      {/* Mobile Sticky Bottom Navigation for Patio / Driver quick access */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg flex items-center justify-around py-2 px-1">
        <button
          onClick={() => setActiveTab('bascula')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] ${
            activeTab === 'bascula' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Scale className="w-5 h-5" />
          <span>Báscula</span>
        </button>

        <button
          onClick={() => setActiveTab('tarifario')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] ${
            activeTab === 'tarifario' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Tag className="w-5 h-5" />
          <span>Tarifas</span>
        </button>

        <button
          onClick={() => setActiveTab('patio')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] ${
            activeTab === 'patio' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Warehouse className="w-5 h-5" />
          <span>Patio</span>
        </button>

        <button
          onClick={() => setActiveTab('ventas')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] ${
            activeTab === 'ventas' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span>Ventas</span>
        </button>

        <button
          onClick={() => setActiveTab('caja')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] ${
            activeTab === 'caja' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span>Caja</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">EcoRecicla PWA v1.0 (MVP)</span>
            <span>•</span>
            <span>Sistema Integral de Báscula, Patios y Mermas</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>Soporte Offline Activo</span>
            <span>•</span>
            <span>Impresión Térmica 80mm Compatible</span>
            <span>•</span>
            <span>SEMARNAT / Cumplimiento Ambiental</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <RecicladoraProvider>
      <MainLayout />
    </RecicladoraProvider>
  );
}
