import React, { useState } from "react";
import { useSaaS } from "../contexts/SaaSContext";
import { Quote, QuoteItem, QuoteItemType } from "../types";
import { 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  User, 
  Printer, 
  Send, 
  X,
  FileCheck,
  ChevronRight,
  Database,
  ArrowRight,
  MessageSquare,
  Edit
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuoteGeneratorProps {
  setActiveTab?: (tab: string) => void;
}

export const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ setActiveTab }) => {
  const { quotes, inventory, workOrders, addQuote, updateQuote, updateQuoteStatus, deleteQuote, addActivity, addWorkOrder } = useSaaS();

  // Create Quote Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [taxRate, setTaxRate] = useState("8");
  const [selectedWOId, setSelectedWOId] = useState("");

  // Items in active creation form
  const [formItems, setFormItems] = useState<Omit<QuoteItem, "id">[]>([]);
  
  // Single Item creation line state
  const [itemType, setItemType] = useState<QuoteItemType>("part");
  const [selectedPartSku, setSelectedPartSku] = useState("");
  const [customPartName, setCustomPartName] = useState("");
  const [partPrice, setPartPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [laborName, setLaborName] = useState("");
  const [laborHours, setLaborHours] = useState("1.0");
  const [laborRate, setLaborRate] = useState("120");

  // Edit Quote Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editVehicleModel, setEditVehicleModel] = useState("");
  const [editTaxRate, setEditTaxRate] = useState("8");
  const [editFormItems, setEditFormItems] = useState<QuoteItem[]>([]);

  // Inspection/Preview Quote State
  const [inspectedQuoteId, setInspectedQuoteId] = useState<string | null>(null);

  const activeInspectedQuote = quotes.find(q => q.id === inspectedQuoteId) || null;

  // WhatsApp Share State
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");

  const handleOpenWhatsAppDialog = () => {
    if (!activeInspectedQuote) return;
    const matchingWO = workOrders.find(
      wo => wo.customerName.toLowerCase() === activeInspectedQuote.customerName.toLowerCase()
    );
    // Remove formatting like parentheses, spaces, and hyphens for a clean number
    const formattedPhone = matchingWO ? matchingWO.phone.replace(/\D/g, "") : "";
    setWhatsappPhone(formattedPhone);
    setIsWhatsAppOpen(true);
  };

  // Convert to Work Order Modal State
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [convertLicensePlate, setConvertLicensePlate] = useState("");
  const [convertPhone, setConvertPhone] = useState("");
  const [convertPriority, setConvertPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [convertNotes, setConvertNotes] = useState("");

  const handleOpenConvertDialog = () => {
    if (!activeInspectedQuote) return;
    const matchingWO = workOrders.find(
      wo => wo.customerName.toLowerCase() === activeInspectedQuote.customerName.toLowerCase()
    );
    setConvertPhone(matchingWO ? matchingWO.phone : "");
    setConvertLicensePlate(matchingWO ? matchingWO.licensePlate : "");
    setConvertPriority("Medium");
    setConvertNotes(`Ordem de serviço gerada a partir do orçamento aprovado ${activeInspectedQuote.id}.`);
    setIsConvertOpen(true);
  };

  const handleConvertQuoteToWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInspectedQuote) return;

    // Build the checklist items from the quote items
    const checklist = activeInspectedQuote.items.map(item => {
      if (item.type === "part") {
        return `Substituir/Instalar: ${item.name} (Qtd: ${item.quantity})`;
      } else {
        return `Executar: ${item.name} (${item.laborHours}h)`;
      }
    });

    const totals = calculateTotals(activeInspectedQuote.items, activeInspectedQuote.taxRate);

    // Call addWorkOrder
    addWorkOrder({
      customerName: activeInspectedQuote.customerName,
      vehicleModel: activeInspectedQuote.vehicleModel,
      licensePlate: convertLicensePlate || "S/P",
      phone: convertPhone || "(00) 00000-0000",
      serviceType: activeInspectedQuote.items.map(item => item.name).join(", ").substring(0, 80) || "Serviço Geral",
      status: "Received",
      priority: convertPriority,
      totalCost: totals.total,
      notes: convertNotes,
      checklist
    });

    setIsConvertOpen(false);
    
    // Redirect to repair pipeline if setActiveTab is available
    if (setActiveTab) {
      setActiveTab("pipeline");
    }
  };

  // Status mapping
  const statusTranslations: Record<string, string> = {
    Approved: "Aprovado",
    Sent: "Enviado",
    Draft: "Rascunho"
  };

  // Add Item Line to creation/edit list
  const handleAddLineItem = () => {
    let newItem: Omit<QuoteItem, "id">;
    if (itemType === "part") {
      if (selectedPartSku === "custom") {
        if (!customPartName || !partPrice) return;
        newItem = {
          name: customPartName,
          quantity: parseInt(quantity) || 1,
          unitPrice: parseFloat(partPrice) || 0,
          laborHours: 0,
          laborRate: 0,
          type: "part"
        };
        setCustomPartName("");
        setPartPrice("");
      } else {
        const inventoryPart = inventory.find(p => p.sku === selectedPartSku);
        if (!inventoryPart) return;
        newItem = {
          name: inventoryPart.name,
          quantity: parseInt(quantity) || 1,
          unitPrice: inventoryPart.price,
          laborHours: 0,
          laborRate: 0,
          type: "part"
        };
      }
      setSelectedPartSku("");
    } else {
      if (!laborName) return;
      newItem = {
        name: laborName,
        quantity: 1,
        unitPrice: 0,
        laborHours: parseFloat(laborHours) || 1,
        laborRate: parseFloat(laborRate) || 120,
        type: "labor"
      };
      setLaborName("");
      setLaborHours("1.0");
    }
    setQuantity("1");

    if (isEditOpen) {
      setEditFormItems([...editFormItems, { ...newItem, id: `qi-${Date.now()}` }]);
    } else {
      setFormItems([...formItems, newItem]);
    }
  };

  const handleRemoveLineItem = (index: number) => {
    if (isEditOpen) {
      setEditFormItems(editFormItems.filter((_, idx) => idx !== index));
    } else {
      setFormItems(formItems.filter((_, idx) => idx !== index));
    }
  };

  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !vehicleModel || formItems.length === 0) return;

    addQuote({
      customerName,
      vehicleModel,
      taxRate: (parseFloat(taxRate) || 0) / 100,
      items: formItems
    });

    // Reset Quote Creation Form
    setCustomerName("");
    setVehicleModel("");
    setTaxRate("8");
    setSelectedWOId("");
    setFormItems([]);
    setIsCreateOpen(false);
  };

  const handleOpenEditModal = () => {
    if (!activeInspectedQuote) return;
    setEditCustomerName(activeInspectedQuote.customerName);
    setEditVehicleModel(activeInspectedQuote.vehicleModel);
    setEditTaxRate(String(activeInspectedQuote.taxRate * 100));
    setEditFormItems(activeInspectedQuote.items);
    setIsEditOpen(true);
  };

  const handleUpdateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInspectedQuote || !editCustomerName || !editVehicleModel || editFormItems.length === 0) return;

    updateQuote(activeInspectedQuote.id, {
      customerName: editCustomerName,
      vehicleModel: editVehicleModel,
      taxRate: (parseFloat(editTaxRate) || 0) / 100,
      items: editFormItems
    });

    setIsEditOpen(false);
  };

  // Calculations Helper
  const calculateTotals = (itemsList: Omit<QuoteItem, "id">[], rateTax: number) => {
    const partsCost = itemsList
      .filter(item => item.type === "part")
      .reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    const laborCost = itemsList
      .filter(item => item.type === "labor")
      .reduce((sum, item) => sum + (item.laborHours * item.laborRate), 0);

    const subtotal = partsCost + laborCost;
    const taxAmount = subtotal * rateTax;
    const total = subtotal + taxAmount;

    return { partsCost, laborCost, subtotal, taxAmount, total };
  };

  const currentFormTotals = calculateTotals(formItems, (parseFloat(taxRate) || 0) / 100);
  const currentEditFormTotals = calculateTotals(editFormItems, (parseFloat(editTaxRate) || 0) / 100);

  return (
    <div className="space-y-6">
      
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Gerador de Orçamentos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gere orçamentos detalhados, gerencie o status de aprovação de clientes, associe peças e calcule impostos automaticamente.
          </p>
        </div>
        
        <button
          onClick={() => {
            setFormItems([]);
            if (workOrders && workOrders.length > 0) {
              const latestClient = workOrders[0];
              setCustomerName(latestClient.customerName);
              const vehicleDetails = latestClient.licensePlate && latestClient.licensePlate !== "S/P" 
                ? `${latestClient.vehicleModel} (${latestClient.licensePlate})` 
                : latestClient.vehicleModel;
              setVehicleModel(vehicleDetails);
              setSelectedWOId(latestClient.id);
            } else {
              setCustomerName("");
              setVehicleModel("");
              setSelectedWOId("");
            }
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
          id="btn-create-estimate"
        >
          <Plus className="h-4 w-4" />
          Criar Novo Orçamento
        </button>
      </div>

      {/* Grid: Quotes List & Active Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Estimates List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              Histórico de Orçamentos
            </h3>

            <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
              {quotes.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 text-center text-slate-400 text-xs rounded-xl">
                  Nenhum orçamento ativo registrado ainda.
                </div>
              ) : (
                quotes.map(quote => {
                  const totals = calculateTotals(quote.items, quote.taxRate);
                  const isSelected = quote.id === inspectedQuoteId;

                  let statusBadge = "bg-slate-100 text-slate-600 border-slate-200";
                  if (quote.status === "Approved") statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-150";
                  if (quote.status === "Sent") statusBadge = "bg-blue-50 text-blue-700 border-blue-150";

                  return (
                    <div
                      key={quote.id}
                      onClick={() => setInspectedQuoteId(quote.id)}
                      className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex justify-between items-center ${
                        isSelected 
                          ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900" 
                          : "bg-white border-slate-150 hover:bg-slate-50/40"
                      }`}
                      id={`estimate-row-${quote.id}`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-indigo-600 uppercase">
                            {quote.id}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.25 rounded-sm border ${statusBadge}`}>
                            {statusTranslations[quote.status] || quote.status}
                          </span>
                        </div>
                        
                        <p className="font-bold text-slate-900 truncate">
                          {quote.customerName}
                        </p>
                        
                        <p className="text-[10px] text-slate-400 truncate font-medium">
                          {quote.vehicleModel}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0 ml-4 flex items-center gap-2">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">
                            R$ {totals.total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono">
                            {quote.dateCreated}
                          </p>
                        </div>
                        <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isSelected ? "translate-x-0.5" : ""}`} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quote Sheet Preview */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {activeInspectedQuote ? (
              <motion.div
                key={activeInspectedQuote.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6"
                id="invoice-preview-sheet"
              >
                {/* Print Title header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-indigo-600 tracking-wider">ORÇAMENTO DE SERVIÇO OFICIAL</span>
                    <h3 className="text-lg font-bold text-slate-950 font-sans">{activeInspectedQuote.customerName}</h3>
                    <p className="text-xs text-slate-400 font-medium">Veículo: {activeInspectedQuote.vehicleModel}</p>
                  </div>

                  <div className="text-right text-xs">
                    <p className="font-mono text-slate-800 font-bold">{activeInspectedQuote.id}</p>
                    <p className="text-slate-400 font-mono text-[10px] mt-1">Gerado em: {activeInspectedQuote.dateCreated}</p>
                  </div>
                </div>

                {/* Items Sheet table */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">Itens do Orçamento</h4>
                  
                  <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30 divide-y divide-slate-100 text-xs">
                    {activeInspectedQuote.items.map((item, index) => (
                      <div key={item.id} className="p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <div className="space-y-0.5 min-w-0 pr-4">
                          <p className="font-semibold text-slate-800 leading-snug truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">
                            {item.type === "part" ? "Peça de Reposição" : `Mão de Obra Mecânica (${item.laborHours}h @ R$ ${item.laborRate}/h)`}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0 font-bold text-slate-950">
                          {item.type === "part" ? (
                            `R$ ${(item.unitPrice * item.quantity).toFixed(2)}`
                          ) : (
                            `R$ ${(item.laborHours * item.laborRate).toFixed(2)}`
                          )}
                          {item.type === "part" && item.quantity > 1 && (
                            <span className="text-[9px] text-slate-400 font-medium block">Qtd: {item.quantity}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary calculation totals block */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs font-sans">
                  {(() => {
                    const math = calculateTotals(activeInspectedQuote.items, activeInspectedQuote.taxRate);
                    return (
                      <>
                        <div className="flex justify-between text-slate-500 font-medium">
                          <span>Total de Peças</span>
                          <span>R$ {math.partsCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-medium">
                          <span>Total de Mão de Obra</span>
                          <span>R$ {math.laborCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-medium border-b border-slate-200/60 pb-2">
                          <span>Subtotal</span>
                          <span>R$ {math.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-medium">
                          <span>ISS / Encargos ({(activeInspectedQuote.taxRate * 100).toFixed(0)}%)</span>
                          <span>R$ {math.taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                          <span>Valor Total do Orçamento</span>
                          <span>R$ {math.total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Footer and interactive Status change actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => {
                      if (confirm(`Excluir permanentemente o orçamento ${activeInspectedQuote.id}?`)) {
                        deleteQuote(activeInspectedQuote.id);
                        setInspectedQuoteId(null);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir Orçamento
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenEditModal}
                      className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="Adicionar mais serviços ou alterar itens deste orçamento"
                      id="btn-edit-quote"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar Orçamento
                    </button>

                    <button
                      onClick={handleOpenWhatsAppDialog}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border border-emerald-500"
                      title="Enviar via WhatsApp"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Enviar WhatsApp
                    </button>

                    {activeInspectedQuote.status === "Draft" && (
                      <button
                        onClick={() => updateQuoteStatus(activeInspectedQuote.id, "Sent")}
                        className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-250"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Marcar Enviado
                      </button>
                    )}

                    {activeInspectedQuote.status !== "Approved" ? (
                      <button
                        onClick={() => updateQuoteStatus(activeInspectedQuote.id, "Approved")}
                        className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <FileCheck className="h-3.5 w-3.5" />
                        Aprovar
                      </button>
                    ) : (
                      <button
                        onClick={handleOpenConvertDialog}
                        className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Converter este Orçamento em Ordem de Serviço"
                        id="btn-convert-to-os"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Gerar OS
                      </button>
                    )}

                    <button
                      onClick={() => window.print()}
                      className="h-9 w-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer border border-slate-200"
                      title="Imprimir Via Física"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 h-[400px] flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800 text-sm">Aguardando Seleção de Orçamento</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Selecione um orçamento na lista à esquerda para revisar os cálculos detalhados, atualizar status ou imprimir a via física do cliente.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Slide-out Panel: Create Quote Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 z-10 flex flex-col max-h-[90vh]"
              id="quote-create-modal"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 text-slate-800">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <div>
                    <h3 className="font-bold text-base text-slate-950">Rascunhar Novo Orçamento</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Associe peças do estoque ou adicione mão de obra qualificada para compor os valores.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveQuote} className="flex-1 overflow-y-auto p-5 space-y-5">
                
                {/* Pull from registered client selection */}
                {workOrders && workOrders.length > 0 && (
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 font-sans">
                    <div className="flex items-center gap-2 text-indigo-950">
                      <User className="h-4 w-4 text-indigo-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Vincular Cliente Cadastrado</p>
                        <p className="text-[10px] text-slate-500">Selecione uma Ordem de Serviço para carregar os dados de veículo e cliente automaticamente.</p>
                      </div>
                    </div>
                    <select
                      value={selectedWOId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedWOId(val);
                        if (val === "custom" || val === "") {
                          setCustomerName("");
                          setVehicleModel("");
                        } else {
                          const wo = workOrders.find(w => w.id === val);
                          if (wo) {
                            setCustomerName(wo.customerName);
                            setVehicleModel(wo.licensePlate && wo.licensePlate !== "S/P" 
                              ? `${wo.vehicleModel} (${wo.licensePlate})` 
                              : wo.vehicleModel);
                          }
                        }
                      }}
                      className="text-xs border border-indigo-200 rounded-lg px-2.5 py-1.5 bg-white text-indigo-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 max-w-xs sm:w-auto w-full font-semibold cursor-pointer"
                    >
                      <option value="custom">-- Digitar Manualmente / Limpar --</option>
                      {workOrders.map(wo => (
                        <option key={wo.id} value={wo.id}>
                          {wo.customerName} - {wo.vehicleModel} ({wo.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 border-b border-slate-100 pb-4 font-sans">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Cliente *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Richard Hendricks"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição do Veículo *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Porsche Taycan 2021 (Branco)"
                      value={vehicleModel}
                      onChange={e => setVehicleModel(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alíquota de Encargos / Impostos (%)</label>
                    <input 
                      type="number" 
                      placeholder="8"
                      value={taxRate}
                      onChange={e => setTaxRate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Line Item Adder */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3.5">
                  <div className="flex gap-4 border-b border-slate-200/40 pb-2">
                    <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="itemType" 
                        checked={itemType === "part"}
                        onChange={() => setItemType("part")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Peça do Estoque
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="itemType" 
                        checked={itemType === "labor"}
                        onChange={() => setItemType("labor")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Mão de Obra / Serviço
                    </label>
                  </div>

                  {/* If choosing Part */}
                  {itemType === "part" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Selecionar Código SKU</label>
                        <select
                          value={selectedPartSku}
                          onChange={e => setSelectedPartSku(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white"
                        >
                          <option value="">-- Selecione Peça Cadastrada --</option>
                          <option value="custom">-- Adicionar Peça Avulsa --</option>
                          {inventory.map(p => (
                            <option key={p.id} value={p.sku}>{p.name} (R$ {p.price})</option>
                          ))}
                        </select>
                      </div>

                      {selectedPartSku === "custom" ? (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Nome da Peça Avulsa</label>
                            <input 
                              type="text" 
                              placeholder="Ex: Escapamento esportivo customizado"
                              value={customPartName}
                              onChange={e => setCustomPartName(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Preço de Revenda (R$)</label>
                            <input 
                              type="number" 
                              placeholder="125"
                              value={partPrice}
                              onChange={e => setPartPrice(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="md:col-span-2 text-xs text-slate-500 flex items-center bg-white p-2.5 rounded-lg border border-slate-200/65">
                          <Database className="h-4 w-4 mr-2 text-indigo-500 animate-none" />
                          {selectedPartSku ? (
                            <span>A peça selecionada carregará o valor cadastrado de revenda automaticamente.</span>
                          ) : (
                            <span>Selecione uma peça cadastrada no almoxarifado para preencher o valor automaticamente.</span>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Quantidade</label>
                        <input 
                          type="number" 
                          placeholder="1"
                          value={quantity}
                          onChange={e => setQuantity(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    /* If choosing Labor */
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição do Serviço / Mão de Obra</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Alinhamento e balanceamento computadorizado"
                          value={laborName}
                          onChange={e => setLaborName(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Horas Estimadas</label>
                        <input 
                          type="number" 
                          step="0.25"
                          placeholder="1.5"
                          value={laborHours}
                          onChange={e => setLaborHours(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Valor da Hora (R$)</label>
                        <input 
                          type="number" 
                          placeholder="120"
                          value={laborRate}
                          onChange={e => setLaborRate(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="inline-flex items-center gap-1.5 bg-slate-900 text-white font-semibold py-1.5 px-3 rounded-lg text-[11px] hover:bg-slate-800 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar Item
                    </button>
                  </div>
                </div>

                {/* Form Sheet Table preview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Itens Rascunhados</h4>
                  {formItems.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-xs">
                      O orçamento está atualmente vazio. Utilize o formulário acima para adicionar itens.
                    </div>
                  ) : (
                    <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                      {formItems.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white hover:bg-slate-50 flex justify-between items-center">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-widest font-sans">
                              {item.type === "part" ? `Peça • R$ ${item.unitPrice} cada` : `Mão de Obra • ${item.laborHours}h @ R$ ${item.laborRate}/h`}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-bold text-slate-900">
                              {item.type === "part" ? (
                                `R$ ${(item.unitPrice * item.quantity).toFixed(2)}`
                              ) : (
                                `R$ ${(item.laborHours * item.laborRate).toFixed(2)}`
                              )}
                              {item.type === "part" && item.quantity > 1 && (
                                <span className="text-[9px] text-slate-400 font-medium block text-right">Qtd: {item.quantity}</span>
                              )}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(idx)}
                              className="text-rose-500 hover:bg-rose-50 h-6 w-6 rounded-full flex items-center justify-center cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total box display */}
                {formItems.length > 0 && (
                  <div className="p-3 bg-indigo-50/20 border border-indigo-100/40 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-600">Total Provisório do Rascunho (com impostos):</span>
                    <strong className="text-indigo-900 text-sm font-extrabold">
                      R$ {currentFormTotals.total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={formItems.length === 0}
                    className="bg-slate-900 text-white hover:bg-slate-800 py-2 px-5 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    Confirmar e Gerar Orçamento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-out Panel: Edit Quote Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 z-10 flex flex-col max-h-[90vh]"
              id="quote-edit-modal"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 text-slate-800">
                  <Edit className="h-5 w-5 text-indigo-500" />
                  <div>
                    <h3 className="font-bold text-base text-slate-950">Editar Orçamento</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Adicione ou remova peças e serviços para atualizar o orçamento.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleUpdateQuote} className="flex-1 overflow-y-auto p-5 space-y-5">
                
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 border-b border-slate-100 pb-4 font-sans">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Cliente *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Richard Hendricks"
                      value={editCustomerName}
                      onChange={e => setEditCustomerName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição do Veículo *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Porsche Taycan 2021 (Branco)"
                      value={editVehicleModel}
                      onChange={e => setEditVehicleModel(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alíquota de Encargos / Impostos (%)</label>
                    <input 
                      type="number" 
                      placeholder="8"
                      value={editTaxRate}
                      onChange={e => setEditTaxRate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Line Item Adder */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3.5">
                  <div className="flex gap-4 border-b border-slate-200/40 pb-2">
                    <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="editItemType" 
                        checked={itemType === "part"}
                        onChange={() => setItemType("part")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Peça do Estoque
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="editItemType" 
                        checked={itemType === "labor"}
                        onChange={() => setItemType("labor")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Mão de Obra / Serviço
                    </label>
                  </div>

                  {/* If choosing Part */}
                  {itemType === "part" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Selecionar Código SKU</label>
                        <select
                          value={selectedPartSku}
                          onChange={e => setSelectedPartSku(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white"
                        >
                          <option value="">-- Selecione Peça Cadastrada --</option>
                          <option value="custom">-- Adicionar Peça Avulsa --</option>
                          {inventory.map(p => (
                            <option key={p.id} value={p.sku}>{p.name} (R$ {p.price})</option>
                          ))}
                        </select>
                      </div>

                      {selectedPartSku === "custom" ? (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Nome da Peça Avulsa</label>
                            <input 
                              type="text" 
                              placeholder="Ex: Escapamento esportivo customizado"
                              value={customPartName}
                              onChange={e => setCustomPartName(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Preço de Revenda (R$)</label>
                            <input 
                              type="number" 
                              placeholder="125"
                              value={partPrice}
                              onChange={e => setPartPrice(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="md:col-span-2 text-xs text-slate-500 flex items-center bg-white p-2.5 rounded-lg border border-slate-200/65">
                          <Database className="h-4 w-4 mr-2 text-indigo-500 animate-none" />
                          {selectedPartSku ? (
                            <span>A peça selecionada carregará o valor cadastrado de revenda automaticamente.</span>
                          ) : (
                            <span>Selecione uma peça cadastrada no almoxarifado para preencher o valor automaticamente.</span>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Quantidade</label>
                        <input 
                          type="number" 
                          placeholder="1"
                          value={quantity}
                          onChange={e => setQuantity(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    /* If choosing Labor */
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição do Serviço / Mão de Obra</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Alinhamento e balanceamento computadorizado"
                          value={laborName}
                          onChange={e => setLaborName(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Horas Estimadas</label>
                        <input 
                          type="number" 
                          step="0.25"
                          placeholder="1.5"
                          value={laborHours}
                          onChange={e => setLaborHours(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Valor da Hora (R$)</label>
                        <input 
                          type="number" 
                          placeholder="120"
                          value={laborRate}
                          onChange={e => setLaborRate(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="inline-flex items-center gap-1.5 bg-slate-900 text-white font-semibold py-1.5 px-3 rounded-lg text-[11px] hover:bg-slate-800 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar Item ao Orçamento
                    </button>
                  </div>
                </div>

                {/* Form Sheet Table preview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Itens Atuais do Orçamento</h4>
                  {editFormItems.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-xs">
                      O orçamento está atualmente vazio. Utilize o formulário acima para adicionar itens.
                    </div>
                  ) : (
                    <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                      {editFormItems.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white hover:bg-slate-50 flex justify-between items-center">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-widest font-sans">
                              {item.type === "part" ? `Peça • R$ ${item.unitPrice} cada` : `Mão de Obra • ${item.laborHours}h @ R$ ${item.laborRate}/h`}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-bold text-slate-900">
                              {item.type === "part" ? (
                                `R$ ${(item.unitPrice * item.quantity).toFixed(2)}`
                              ) : (
                                `R$ ${(item.laborHours * item.laborRate).toFixed(2)}`
                              )}
                              {item.type === "part" && item.quantity > 1 && (
                                <span className="text-[9px] text-slate-400 font-medium block text-right">Qtd: {item.quantity}</span>
                              )}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(idx)}
                              className="text-rose-500 hover:bg-rose-50 h-6 w-6 rounded-full flex items-center justify-center cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total box display */}
                {editFormItems.length > 0 && (
                  <div className="p-3 bg-indigo-50/20 border border-indigo-100/40 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-600">Total Atualizado (com encargos):</span>
                    <strong className="text-indigo-900 text-sm font-extrabold">
                      R$ {currentEditFormTotals.total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={editFormItems.length === 0}
                    className="bg-indigo-600 text-white hover:bg-indigo-500 py-2 px-5 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    Atualizar Orçamento para Cliente
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WhatsApp Share Modal */}
      <AnimatePresence>
        {isWhatsAppOpen && activeInspectedQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWhatsAppOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 z-10 flex flex-col"
              id="whatsapp-share-modal"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
                <div className="flex items-center gap-2 text-emerald-800">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-950">Enviar Orçamento via WhatsApp</h3>
                    <p className="text-[10px] text-emerald-700">Envie o resumo do orçamento para o cliente em um clique.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsWhatsAppOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-emerald-100/50 flex items-center justify-center text-slate-400 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp do Cliente (Apenas Números com DDD)</label>
                  <input 
                    type="tel" 
                    placeholder="Ex: 11999991234"
                    value={whatsappPhone}
                    onChange={e => setWhatsappPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono animate-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">O número deve incluir o DDD (Exemplo: 11999991234). Não use parênteses ou traços no link final.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Prévia da Mensagem</label>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-[11px] text-slate-600 font-sans whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                    {(() => {
                      const math = calculateTotals(activeInspectedQuote.items, activeInspectedQuote.taxRate);
                      return `Olá *${activeInspectedQuote.customerName}*! Segue o resumo do seu orçamento:\n\n` +
                        `🚗 *Veículo*: ${activeInspectedQuote.vehicleModel}\n` +
                        `📋 *Orçamento*: ${activeInspectedQuote.id}\n\n` +
                        `*Serviços & Peças*:\n` +
                        activeInspectedQuote.items.map(item => {
                          const detail = item.type === "part" ? `Qtd: ${item.quantity} x R$ ${item.unitPrice.toFixed(2)}` : `${item.laborHours}h @ R$ ${item.laborRate.toFixed(2)}/h`;
                          const value = item.type === "part" ? item.unitPrice * item.quantity : item.laborHours * item.laborRate;
                          return `• ${item.name}: *R$ ${value.toFixed(2)}* (${detail})`;
                        }).join("\n") +
                        `\n\n💰 *Subtotal*: R$ ${math.subtotal.toFixed(2)}` +
                        `\n📈 *Taxas/ISS*: R$ ${math.taxAmount.toFixed(2)}` +
                        `\n⭐ *Valor Total*: R$ ${math.total.toFixed(2)}` +
                        `\n\nPara aprovar ou tirar dúvidas, por favor entre em contato conosco! Obrigado pela preferência.\n\n_AutoFlow - Serviços Automotivos_`;
                    })()}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsWhatsAppOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      // Format clean phone number: remove non-digits
                      const cleanPhone = whatsappPhone.replace(/\D/g, "");
                      const math = calculateTotals(activeInspectedQuote.items, activeInspectedQuote.taxRate);
                      const msg = `Olá *${activeInspectedQuote.customerName}*! Segue o resumo do seu orçamento:\n\n` +
                        `🚗 *Veículo*: ${activeInspectedQuote.vehicleModel}\n` +
                        `📋 *Orçamento*: ${activeInspectedQuote.id}\n\n` +
                        `*Serviços & Peças*:\n` +
                        activeInspectedQuote.items.map(item => {
                          const detail = item.type === "part" ? `Qtd: ${item.quantity} x R$ ${item.unitPrice.toFixed(2)}` : `${item.laborHours}h @ R$ ${item.laborRate.toFixed(2)}/h`;
                          const value = item.type === "part" ? item.unitPrice * item.quantity : item.laborHours * item.laborRate;
                          return `• ${item.name}: *R$ ${value.toFixed(2)}* (${detail})`;
                        }).join("\n") +
                        `\n\n💰 *Subtotal*: R$ ${math.subtotal.toFixed(2)}` +
                        `\n📈 *Taxas/ISS*: R$ ${math.taxAmount.toFixed(2)}` +
                        `\n⭐ *Valor Total*: R$ ${math.total.toFixed(2)}` +
                        `\n\nPara aprovar ou tirar dúvidas, por favor entre em contato conosco! Obrigado pela preferência.\n\n_AutoFlow - Serviços Automotivos_`;
                      
                      const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
                      window.open(url, "_blank");
                      
                      // Also update status to Sent
                      updateQuoteStatus(activeInspectedQuote.id, "Sent");
                      addActivity("quote", "success", `Orçamento ${activeInspectedQuote.id} enviado via WhatsApp para ${activeInspectedQuote.customerName}.`);
                      setIsWhatsAppOpen(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Abrir WhatsApp e Enviar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Convert to Work Order Modal */}
      <AnimatePresence>
        {isConvertOpen && activeInspectedQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConvertOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 z-10 flex flex-col"
              id="convert-quote-modal"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50">
                <div className="flex items-center gap-2 text-indigo-800">
                  <FileCheck className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-950">Gerar Ordem de Serviço</h3>
                    <p className="text-[10px] text-indigo-700">Preencha os detalhes para iniciar o serviço na oficina.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsConvertOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-indigo-100/50 flex items-center justify-center text-slate-400 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleConvertQuoteToWorkOrder} className="p-5 space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Cliente</label>
                  <input 
                    type="text" 
                    disabled
                    value={activeInspectedQuote.customerName}
                    className="w-full border border-slate-100 bg-slate-50 text-slate-500 rounded-lg px-3 py-1.5 text-xs font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Veículo</label>
                  <input 
                    type="text" 
                    disabled
                    value={activeInspectedQuote.vehicleModel}
                    className="w-full border border-slate-100 bg-slate-50 text-slate-500 rounded-lg px-3 py-1.5 text-xs font-medium cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Placa do Veículo *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: ABC1D23"
                      value={convertLicensePlate}
                      onChange={e => setConvertLicensePlate(e.target.value.toUpperCase())}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone de Contato *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: (11) 99999-1234"
                      value={convertPhone}
                      onChange={e => setConvertPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridade do Serviço *</label>
                  <select
                    value={convertPriority}
                    onChange={e => setConvertPriority(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white"
                  >
                    <option value="Low">Baixa</option>
                    <option value="Medium">Média</option>
                    <option value="High">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Observações / Instruções Internas</label>
                  <textarea 
                    rows={2}
                    placeholder="Observações adicionais..."
                    value={convertNotes}
                    onChange={e => setConvertNotes(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-sans resize-none"
                  />
                </div>

                {/* Modal Actions */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConvertOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Gerar OS e Ir para Pipeline
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
