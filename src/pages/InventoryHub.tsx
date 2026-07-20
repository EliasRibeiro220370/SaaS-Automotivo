import React, { useState } from "react";
import { useSaaS } from "../contexts/SaaSContext";
import { Part } from "../types";
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  MapPin, 
  PlusCircle, 
  Folder, 
  CornerDownRight, 
  X,
  Truck,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const InventoryHub: React.FC = () => {
  const { inventory, addPart, restockPart, activities } = useSaaS();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Add Part Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Braking");
  const [quantity, setQuantity] = useState("10");
  const [minQuantity, setMinQuantity] = useState("3");
  const [cost, setCost] = useState("25");
  const [price, setPrice] = useState("55");
  const [supplier, setSupplier] = useState("");
  const [shelfLocation, setShelfLocation] = useState("");

  // Quick Restock State
  const [restockPartId, setRestockPartId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState("5");

  const activeRestockPart = inventory.find(p => p.id === restockPartId) || null;

  // Filter Categories
  const categories = ["All", "Braking", "Detailing", "Fluids", "Ignition", "Filters"];

  const categoryTranslations: Record<string, string> = {
    All: "Todos",
    Braking: "Sistemas de Freio",
    Detailing: "Estética e Detalhes",
    Fluids: "Fluidos e Lubrificantes",
    Ignition: "Sistema de Ignição",
    Filters: "Filtros e Retentores"
  };

  // Filtered list
  const filteredInventory = inventory.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          part.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          part.shelfLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || part.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !supplier) return;

    addPart({
      name,
      sku: sku.toUpperCase(),
      category,
      quantity: parseInt(quantity) || 0,
      minQuantity: parseInt(minQuantity) || 0,
      cost: parseFloat(cost) || 0,
      price: parseFloat(price) || 0,
      supplier,
      shelfLocation: shelfLocation.toUpperCase() || "A-01"
    });

    // Reset Form
    setName("");
    setSku("");
    setCategory("Braking");
    setQuantity("10");
    setMinQuantity("3");
    setCost("25");
    setPrice("55");
    setSupplier("");
    setShelfLocation("");
    setIsAddOpen(false);
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockPartId) return;

    restockPart(restockPartId, parseInt(restockAmount) || 1);
    setRestockPartId(null);
    setRestockAmount("5");
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Almoxarifado e Estoque
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Controle peças de reposição, audite prateleiras, configure alertas de nível mínimo e monitore margens de lucro.
          </p>
        </div>
        
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
          id="btn-register-part"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Nova Peça
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input 
            type="text" 
            placeholder="Buscar por nome, SKU ou prateleira..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1.5 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                selectedCategory === cat 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {categoryTranslations[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="py-3.5 px-5">Detalhes da Peça</th>
                <th className="py-3.5 px-5">Categoria</th>
                <th className="py-3.5 px-5">Localização / Box</th>
                <th className="py-3.5 px-5">Custo e Preço (Revenda)</th>
                <th className="py-3.5 px-5 text-center">Quantidade</th>
                <th className="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-5 text-center text-slate-400">
                    Nenhuma peça localizada nas gavetas de armazenamento.
                  </td>
                </tr>
              ) : (
                filteredInventory.map(part => {
                  const isLowStock = part.quantity <= part.minQuantity;
                  const profitMargin = part.price - part.cost;
                  const marginPercent = Math.round((profitMargin / part.price) * 100);

                  return (
                    <tr key={part.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & SKU */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 leading-snug">{part.name}</p>
                          <p className="font-mono text-[10px] text-indigo-600 font-bold">SKU: {part.sku}</p>
                        </div>
                      </td>
                      
                      {/* Category */}
                      <td className="py-4 px-5 text-slate-600 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Folder className="h-3 w-3 text-slate-400" />
                          {categoryTranslations[part.category] || part.category}
                        </span>
                      </td>

                      {/* Storage location */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {part.shelfLocation}
                        </span>
                      </td>

                      {/* Margin */}
                      <td className="py-4 px-5 text-slate-600">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800">
                            Custo: <strong className="text-rose-600 font-medium">R$ {part.cost}</strong> • Venda: <strong className="text-emerald-600 font-medium">R$ {part.price}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium font-sans">
                            Lucro: +R$ {profitMargin.toFixed(0)} ({marginPercent}%)
                          </p>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-full ${
                            isLowStock 
                              ? "bg-rose-50 text-rose-700 font-black animate-pulse" 
                              : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {part.quantity}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-1">Mín. Seguro: {part.minQuantity}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setRestockPartId(part.id)}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 font-bold px-2.5 py-1.5 rounded-lg border border-indigo-150 transition-all cursor-pointer"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          Repor Estoque
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Panel: Register Part Drawer */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 z-10 flex flex-col"
              id="register-part-modal"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 text-slate-800">
                  <Package className="h-5 w-5 text-indigo-500" />
                  <div>
                    <h3 className="font-bold text-base text-slate-950">Cadastrar Peça de Reposição</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Insira uma nova peça no estoque, defina o local físico e valores de custo/revenda.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreatePart} className="p-5 space-y-4 font-sans">
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Peça / Descrição do Produto *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Michelin Pilot Sport 4S (245/40R19)"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Código SKU da Peça *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: PNEU-MPS4S-19"
                      value={sku}
                      onChange={e => setSku(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 animate-none"
                    >
                      <option value="Braking">Sistemas de Freio</option>
                      <option value="Detailing">Estética e Detalhes</option>
                      <option value="Fluids">Fluidos e Lubrificantes</option>
                      <option value="Filters">Filtros e Retentores</option>
                      <option value="Ignition">Sistema de Ignição</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Quantidade Inicial</label>
                    <input 
                      type="number" 
                      placeholder="10"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estoque Mínimo de Segurança</label>
                    <input 
                      type="number" 
                      placeholder="3"
                      value={minQuantity}
                      onChange={e => setMinQuantity(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preço de Custo (R$) *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="180"
                      value={cost}
                      onChange={e => setCost(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preço de Venda (R$) *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="260"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Marca / Fornecedor *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Michelin Brasil"
                      value={supplier}
                      onChange={e => setSupplier(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Prateleira / Localização Física</label>
                    <input 
                      type="text" 
                      placeholder="Ex: C-11"
                      value={shelfLocation}
                      onChange={e => setShelfLocation(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    className="bg-slate-900 text-white hover:bg-slate-800 py-2 px-5 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Salvar Peça no Estoque
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dialog Panel: Quick Restock Modal */}
      <AnimatePresence>
        {activeRestockPart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setRestockPartId(null)}
              className="fixed inset-0 bg-black"
            />

            {/* Dialog Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 z-10 p-5 space-y-4"
              id="quick-restock-dialog"
            >
              <div className="flex items-center gap-2 text-indigo-600 pb-1 border-b border-slate-100">
                <Truck className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-sm font-sans">Registrar Nova Remessa</h3>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900">{activeRestockPart.name}</p>
                <p className="text-slate-400 font-mono text-[10px]">SKU: {activeRestockPart.sku} | Marca: {activeRestockPart.supplier}</p>
              </div>

              <form onSubmit={handleRestock} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantidade Entregue (unidades)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="5"
                    value={restockAmount}
                    onChange={e => setRestockAmount(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setRestockPartId(null)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Confirmar Entrada
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
