import React, { useState } from "react";
import { useSaaS } from "../contexts/SaaSContext";
import { 
  WorkOrderStatus, 
  WorkOrder, 
  Priority,
  ChecklistItem 
} from "../types";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckSquare, 
  Square, 
  Clock, 
  User, 
  Phone, 
  Tag, 
  Trash2, 
  Plus, 
  X,
  FileText,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const COLUMNS: { id: WorkOrderStatus; title: string; color: string; bg: string; text: string }[] = [
  { id: "Received", title: "Entrada / Recebido", color: "border-blue-200", bg: "bg-blue-50/40", text: "text-blue-700" },
  { id: "Diagnostics", title: "Box de Diagnóstico", color: "border-amber-200", bg: "bg-amber-50/40", text: "text-amber-800" },
  { id: "InProgress", title: "Elevador / Execução", color: "border-orange-200", bg: "bg-orange-50/40", text: "text-orange-800" },
  { id: "QualityCheck", title: "Filtro de Qualidade", color: "border-purple-200", bg: "bg-purple-50/40", text: "text-purple-800" },
  { id: "Ready", title: "Pronto para Entrega", color: "border-emerald-200", bg: "bg-emerald-50/40", text: "text-emerald-800" }
];

interface RepairPipelineProps {
  isCreateModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;
}

export const RepairPipeline: React.FC<RepairPipelineProps> = ({ isCreateModalOpen, setCreateModalOpen }) => {
  const { 
    workOrders, 
    updateWorkOrderStatus, 
    updateWorkOrderChecklist, 
    deleteWorkOrder, 
    addWorkOrder 
  } = useSaaS();

  // Selected work order for inspection
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Form states for creating a new job
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newLicensePlate, setNewLicensePlate] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newServiceType, setNewServiceType] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("Medium");
  const [newTotalCost, setNewTotalCost] = useState("350");
  const [newNotes, setNewNotes] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [newChecklist, setNewChecklist] = useState<string[]>([
    "Vistoria de entrada e fotos do veículo",
    "Conectar scanner de diagnóstico OBD-II",
    "Realizar inspeção visual preventiva"
  ]);

  const selectedJob = workOrders.find(wo => wo.id === selectedJobId) || null;

  // Translation helpers for Priority badges
  const priorityTranslation: Record<Priority, string> = {
    High: "Alta",
    Medium: "Média",
    Low: "Baixa"
  };

  // Move helpers
  const moveJobLeft = (id: string, currentStatus: WorkOrderStatus) => {
    const statusOrder: WorkOrderStatus[] = ["Received", "Diagnostics", "InProgress", "QualityCheck", "Ready"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex > 0) {
      updateWorkOrderStatus(id, statusOrder[currentIndex - 1]);
    }
  };

  const moveJobRight = (id: string, currentStatus: WorkOrderStatus) => {
    const statusOrder: WorkOrderStatus[] = ["Received", "Diagnostics", "InProgress", "QualityCheck", "Ready"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex < statusOrder.length - 1) {
      updateWorkOrderStatus(id, statusOrder[currentIndex + 1]);
    }
  };

  // Add custom checklist item to temporary list
  const handleAddTempChecklist = () => {
    if (checklistInput.trim()) {
      setNewChecklist([...newChecklist, checklistInput.trim()]);
      setChecklistInput("");
    }
  };

  const handleRemoveTempChecklist = (idx: number) => {
    setNewChecklist(newChecklist.filter((_, i) => i !== idx));
  };

  // Create Work Order
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleModel || !newCustomerName || !newServiceType) return;

    addWorkOrder({
      vehicleModel: newVehicleModel,
      customerName: newCustomerName,
      licensePlate: newLicensePlate || "N/D",
      phone: newPhone || "(11) 90000-0000",
      serviceType: newServiceType,
      status: "Received",
      priority: newPriority,
      totalCost: parseFloat(newTotalCost) || 0,
      notes: newNotes,
      checklist: newChecklist
    });

    // Reset Form
    setNewVehicleModel("");
    setNewCustomerName("");
    setNewLicensePlate("");
    setNewPhone("");
    setNewServiceType("");
    setNewPriority("Medium");
    setNewTotalCost("350");
    setNewNotes("");
    setNewChecklist([
      "Vistoria de entrada e fotos do veículo",
      "Conectar scanner de diagnóstico OBD-II",
      "Realizar inspeção visual preventiva"
    ]);
    setCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Control Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Fluxo de Reparos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Painel Kanban de serviços mecânicos em tempo real. Controle o direcionamento de pátio e monitore etapas.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
          id="btn-new-work-order-pipeline"
        >
          <Plus className="h-4 w-4" />
          Registrar Entrada
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 overflow-x-auto pb-6" id="repair-kanban-board">
        {COLUMNS.map(col => {
          const columnJobs = workOrders.filter(wo => wo.status === col.id);

          return (
            <div 
              key={col.id} 
              className={`rounded-2xl border ${col.color} ${col.bg} p-4 min-w-[280px] flex flex-col h-[650px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                <span className={`text-sm font-bold ${col.text} flex items-center gap-1.5`}>
                  <span className="h-2 w-2 rounded-full bg-current"></span>
                  {col.title}
                </span>
                <span className="text-xs bg-white border border-slate-100 shadow-2xs font-mono text-slate-500 font-bold px-2 py-0.5 rounded-full">
                  {columnJobs.length}
                </span>
              </div>

              {/* Jobs Container */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 scrollbar-thin">
                {columnJobs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-200/60 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400">Nenhum carro neste setor</p>
                  </div>
                ) : (
                  columnJobs.map(job => {
                    const doneTasks = job.checklist.filter(c => c.done).length;
                    const totalTasks = job.checklist.length;
                    const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

                    let priorityColor = "bg-slate-100 text-slate-700 border-slate-200";
                    if (job.priority === "High") priorityColor = "bg-rose-50 text-rose-700 border-rose-150";
                    if (job.priority === "Medium") priorityColor = "bg-amber-50 text-amber-700 border-amber-150";

                    return (
                      <motion.div
                        layoutId={`job-card-${job.id}`}
                        key={job.id}
                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:shadow-md transition-shadow cursor-pointer relative group flex flex-col justify-between h-44"
                        onClick={() => setSelectedJobId(job.id)}
                        id={`job-card-${job.id}`}
                      >
                        {/* Upper Section */}
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                              {job.id}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${priorityColor}`}>
                              {priorityTranslation[job.priority] || job.priority}
                            </span>
                          </div>
                          
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {job.vehicleModel}
                          </h4>
                          
                          <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                            {job.serviceType}
                          </p>
                        </div>

                        {/* Middle Progress */}
                        <div className="space-y-1 mt-2">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                            <span>Checklist de tarefas</span>
                            <span>{doneTasks}/{totalTasks} ({progressPercent}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                progressPercent === 100 ? "bg-emerald-500" : "bg-indigo-500"
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Lower Navigation & Mechanics */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2">
                          <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">
                            {job.customerName}
                          </span>
                          
                          {/* Navigation buttons to change status step by step */}
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            {col.id !== "Received" && (
                              <button
                                onClick={() => moveJobLeft(job.id, job.status)}
                                className="h-5 w-5 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-100 text-slate-500 cursor-pointer"
                                title="Mover para Esquerda"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                            )}
                            
                            {col.id !== "Ready" && (
                              <button
                                onClick={() => moveJobRight(job.id, job.status)}
                                className="h-5 w-5 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-100 text-slate-500 cursor-pointer"
                                title="Mover para Direita"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-out Panel: Detailed Job Inspection Drawer */}
      <AnimatePresence>
        {selectedJob && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJobId(null)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Drawer */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 p-6 flex flex-col h-full overflow-hidden border-l border-slate-100"
              id="job-inspector-drawer"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    ORDEM DE ENTRADA {selectedJob.id}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-sans mt-1">
                    Ficha de Inspeção do Serviço
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedJobId(null)}
                  className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-thin">
                
                {/* Vehicle & Customer Bio */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <h4 className="font-bold text-slate-950 text-sm">{selectedJob.vehicleModel}</h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{selectedJob.customerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{selectedJob.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Tag className="h-3.5 w-3.5 text-slate-400" />
                      <span>Placa: <strong className="font-mono text-slate-800">{selectedJob.licensePlate}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Job Specs */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Especificações</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-slate-100 rounded-lg bg-white">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Mão de Obra / Serviço</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedJob.serviceType}</p>
                    </div>
                    <div className="p-3 border border-slate-100 rounded-lg bg-white">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Custo Estimado (R$)</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">R$ {selectedJob.totalCost}</p>
                    </div>
                  </div>
                </div>

                {/* Checklist Tracker */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Checklist Operacional</h5>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {selectedJob.checklist.filter(c => c.done).length} de {selectedJob.checklist.length} Concluídos
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedJob.checklist.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => updateWorkOrderChecklist(selectedJob.id, item.id, !item.done)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          item.done 
                            ? "bg-slate-50/50 border-slate-200 text-slate-500 line-through decoration-slate-300" 
                            : "bg-white border-slate-150 text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {item.done ? (
                            <CheckSquare className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        <span className="leading-tight">{item.task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mechanical Intake Notes */}
                {selectedJob.notes && (
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Observações de Entrada / Sintomas</h5>
                    <div className="p-3 bg-indigo-50/30 border border-indigo-100/40 rounded-lg text-xs text-slate-700 leading-relaxed">
                      {selectedJob.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Action Bar */}
              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    if (confirm(`Excluir permanentemente o registro de entrada ${selectedJob.id}?`)) {
                      deleteWorkOrder(selectedJob.id);
                      setSelectedJobId(null);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Descartar Registro
                </button>
                
                <button
                  onClick={() => setSelectedJobId(null)}
                  className="flex-1 bg-slate-900 text-white hover:bg-slate-800 py-2.5 px-4 rounded-xl text-xs font-semibold shadow-xs text-center cursor-pointer"
                >
                  Salvar e Fechar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slide-out Panel: Create Job Form Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateModalOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 z-10 flex flex-col max-h-[90vh]"
              id="create-job-modal"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 text-slate-800">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <div>
                    <h3 className="font-bold text-base text-slate-950">Novo Registro de Entrada de Veículo</h3>
                    <p className="text-[11px] text-slate-500">Cadastre a entrada de um veículo, configure os sintomas e monte o checklist inicial.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCreateModalOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateJob} className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* Section 1: Customer Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">1. Identificação do Cliente e Veículo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo do Cliente *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Roberto Carlos"
                        value={newCustomerName}
                        onChange={e => setNewCustomerName(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone de Contato</label>
                      <input 
                        type="tel" 
                        placeholder="Ex: (11) 99876-5432"
                        value={newPhone}
                        onChange={e => setNewPhone(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição do Veículo *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Honda Civic Sport LXR 2.0 (Prata)"
                        value={newVehicleModel}
                        onChange={e => setNewVehicleModel(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Placa do Veículo</label>
                      <input 
                        type="text" 
                        placeholder="Ex: ABC-1234 / ABC1D23"
                        value={newLicensePlate}
                        onChange={e => setNewLicensePlate(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Service Details */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">2. Detalhes de Serviço e Valores</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Serviço / Mão de Obra Principal *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Substituição da Suspensão Dianteira e Amortecedores"
                        value={newServiceType}
                        onChange={e => setNewServiceType(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Custo Inicial Estimado (R$) *</label>
                      <input 
                        type="number" 
                        required
                        placeholder="Ex: 450"
                        value={newTotalCost}
                        onChange={e => setNewTotalCost(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridade de Urgência</label>
                      <select
                        value={newPriority}
                        onChange={e => setNewPriority(e.target.value as Priority)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 animate-none"
                      >
                        <option value="Low">Baixa (Manutenção agendada)</option>
                        <option value="Medium">Média (Reparo corretivo geral)</option>
                        <option value="High">Alta (Pane urgente / Emergência)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Sintomas Descritos e Observações de Entrada</label>
                      <textarea
                        rows={2}
                        placeholder="Sintoma relatado pelo cliente, barulhos metálicos, oscilações..."
                        value={newNotes}
                        onChange={e => setNewNotes(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Checklists */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">3. Montador de Checklist Operacional</h4>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Adicionar tarefa personalizada (Ex: Sangria do óleo hidráulico)"
                      value={checklistInput}
                      onChange={e => setChecklistInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddTempChecklist(); } }}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTempChecklist}
                      className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>

                  {newChecklist.length === 0 ? (
                    <div className="p-3 border border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-xs">
                      Nenhuma tarefa adicionada ainda. O checklist de serviço começará vazio.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto bg-slate-50 p-2.5 border border-slate-100 rounded-lg">
                      {newChecklist.map((task, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 p-1.5 bg-white border border-slate-100 rounded-md text-xs text-slate-700">
                          <span className="truncate flex-1 font-medium">{idx + 1}. {task}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTempChecklist(idx)}
                            className="text-rose-500 hover:bg-rose-50 h-5 w-5 rounded-full flex items-center justify-center cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    className="bg-slate-900 text-white hover:bg-slate-800 py-2 px-5 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Confirmar Entrada e Iniciar
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
