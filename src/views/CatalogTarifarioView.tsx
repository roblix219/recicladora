import React, { useState } from 'react';
import {
  Tag,
  Search,
  Plus,
  Edit2,
  TrendingUp,
  AlertCircle,
  Filter,
  Check,
  Save,
  Percent,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useRecicladora } from '../context/RecicladoraContext';
import { Material, MaterialCategory } from '../types';

const CATEGORIES: MaterialCategory[] = [
  'Metales Ferrosos',
  'Metales No Ferrosos',
  'Plásticos',
  'Cartón y Papel',
  'Electrónicos',
  'Vidrio',
  'Residuos Industriales',
];

export const CatalogTarifarioView: React.FC = () => {
  const { materials, updateMaterial, addMaterial } = useRecicladora();

  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New material form
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState<MaterialCategory>('Metales Ferrosos');
  const [newBuyStd, setNewBuyStd] = useState<number>(0);
  const [newBuyPref, setNewBuyPref] = useState<number>(0);
  const [newSellWholesale, setNewSellWholesale] = useState<number>(0);
  const [newTolerance, setNewTolerance] = useState<number>(2);
  const [newMinStock, setNewMinStock] = useState<number>(1000);

  // Filtered materials
  const filteredMaterials = materials.filter((m) => {
    const matchesCategory = selectedCategory === 'TODAS' || m.category === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) {
      updateMaterial(editingMaterial);
      setEditingMaterial(null);
    }
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addMaterial({
      name: newName.trim(),
      code: newCode.trim().toUpperCase() || `MAT-${Date.now().toString().slice(-4)}`,
      category: newCategory,
      buyPriceStandard: newBuyStd,
      buyPricePreferential: newBuyPref || newBuyStd * 1.08,
      sellPriceWholesale: newSellWholesale,
      stockKg: 0,
      processedStockKg: 0,
      moistureDeductionTolerance: newTolerance,
      minStockAlertKg: newMinStock,
      unit: 'KG',
    });

    setShowAddModal(false);
    setNewName('');
    setNewCode('');
    setNewBuyStd(0);
    setNewBuyPref(0);
    setNewSellWholesale(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Tag className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Catálogo de Materiales y Tarifario Dinámico
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Ajuste centralizado de precios de compra, venta mayorista y márgenes de ganancia
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-950 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Material</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por material, código..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quick summary stats */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>
              Materiales registrados: <strong className="text-white">{materials.length}</strong>
            </span>
            <span>•</span>
            <span>
              Filtrados: <strong className="text-emerald-400">{filteredMaterials.length}</strong>
            </span>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('TODAS')}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
              selectedCategory === 'TODAS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Todas las Categorías
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Tariff Table & Cards */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Código / Material</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3 text-right">Compra Estándar</th>
                <th className="py-3 px-3 text-right">Compra Preferencial</th>
                <th className="py-3 px-3 text-right">Venta Mayorista</th>
                <th className="py-3 px-3 text-right">Margen Bruto</th>
                <th className="py-3 px-3 text-center">Tol. Merma</th>
                <th className="py-3 px-3 text-right">Stock en Patio</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/50">
              {filteredMaterials.map((mat) => {
                const marginStd = mat.sellPriceWholesale - mat.buyPriceStandard;
                const marginPercent =
                  mat.sellPriceWholesale > 0
                    ? ((marginStd / mat.sellPriceWholesale) * 100).toFixed(1)
                    : '0';
                const isHealthyMargin = Number(marginPercent) >= 25;

                return (
                  <tr key={mat.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 font-bold border border-slate-700">
                          {mat.code}
                        </span>
                        <span className="font-semibold text-slate-100">{mat.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300">
                        {mat.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-200">
                      ${mat.buyPriceStandard.toFixed(2)}/kg
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-amber-300">
                      ${mat.buyPricePreferential.toFixed(2)}/kg
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-teal-300">
                      ${mat.sellPriceWholesale.toFixed(2)}/kg
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-mono">
                        <span className="font-bold text-slate-200">
                          +${marginStd.toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            isHealthyMargin
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          }`}
                        >
                          {marginPercent}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {mat.moistureDeductionTolerance}%
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={mat.stockKg <= mat.minStockAlertKg ? 'text-amber-400' : 'text-slate-200'}>
                        {mat.stockKg.toLocaleString()} kg
                      </span>
                      {mat.processedStockKg ? (
                        <span className="block text-[10px] text-emerald-400">
                          ({mat.processedStockKg.toLocaleString()} kg pacas)
                        </span>
                      ) : null}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setEditingMaterial(mat)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Modificar tarifas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Material Modal */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-base text-white">Actualizar Tarifas</h3>
                <p className="text-xs text-slate-400 font-mono">{editingMaterial.code} - {editingMaterial.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMaterial(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Precio Compra Estándar (Al público / Recolector) ($/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editingMaterial.buyPriceStandard}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      buyPriceStandard: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Precio Compra Preferencial (Empresas / Talleres frecuentes) ($/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editingMaterial.buyPricePreferential}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      buyPricePreferential: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-amber-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Precio Venta Mayorista (Fundidora / Molino) ($/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editingMaterial.sellPriceWholesale}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      sellPriceWholesale: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-teal-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tolerancia Merma Estándar (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={editingMaterial.moistureDeductionTolerance}
                    onChange={(e) =>
                      setEditingMaterial({
                        ...editingMaterial,
                        moistureDeductionTolerance: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Alerta Stock Mínimo (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingMaterial.minStockAlertKg}
                    onChange={(e) =>
                      setEditingMaterial({
                        ...editingMaterial,
                        minStockAlertKg: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Live calculated margin in modal */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Margen Bruto Proyectado:</span>
                <span className="font-mono font-bold text-emerald-400">
                  +$
                  {(
                    editingMaterial.sellPriceWholesale - editingMaterial.buyPriceStandard
                  ).toFixed(2)}{' '}
                  / kg (
                  {(
                    ((editingMaterial.sellPriceWholesale - editingMaterial.buyPriceStandard) /
                      (editingMaterial.sellPriceWholesale || 1)) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
                >
                  Guardar Tarifas
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMaterial(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-base text-white">Registrar Nuevo Material</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nombre del Material *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Cobre Troquelado / Polipropileno Negro"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MaterialCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Código Interno</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="Ej. CU-03"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">P. Compra Std</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newBuyStd || ''}
                    onChange={(e) => setNewBuyStd(parseFloat(e.target.value) || 0)}
                    placeholder="$0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">P. Compra Pref</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newBuyPref || ''}
                    onChange={(e) => setNewBuyPref(parseFloat(e.target.value) || 0)}
                    placeholder="$0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">P. Venta Mayor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newSellWholesale || ''}
                    onChange={(e) => setNewSellWholesale(parseFloat(e.target.value) || 0)}
                    placeholder="$0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono text-teal-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tolerancia Merma (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newTolerance}
                    onChange={(e) => setNewTolerance(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Alerta Stock Mín (kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
                >
                  Registrar Material
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
