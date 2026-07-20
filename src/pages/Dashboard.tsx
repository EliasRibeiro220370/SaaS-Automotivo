import React from "react";
import { useSaaS } from "../contexts/SaaSContext";
import { 
  Wrench, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Plus, 
  ArrowRight, 
  CheckCircle, 
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  openCreateJobModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, openCreateJobModal }) => {
  const { workOrders, inventory, activities } = useSaaS();

  // Calculation of KPIs
  const activeJobs = workOrders.filter(wo => wo.status !== "Ready");
  const completedJobs = workOrders.filter(wo => wo.status === "Ready");
  
  const totalRevenue = workOrders
    .filter(wo => wo.status === "Ready")
    .reduce((sum, wo) => sum + wo.totalCost, 0);

  const lowStockParts = inventory.filter(p => p.quantity <= p.minQuantity);

  // Chart 1: Pipeline Distribution
  const statusCounts = {
    Received: 0,
    Diagnostics: 0,
    InProgress: 0,
    QualityCheck: 0,
    Ready: 0
  };
  
  workOrders.forEach(wo => {
    if (statusCounts[wo.status] !== undefined) {
      statusCounts[wo.status]++;
    }
  });

  const pipelineData = [
    { name: "Recebido", count: statusCounts.Received, fill: "#3b82f6" }, 
    { name: "Diagnóstico", count: statusCounts.Diagnostics, fill: "#eab308" }, 
    { name: "Execução", count: statusCounts.InProgress, fill: "#f97316" }, 
    { name: "Qualidade", count: statusCounts.QualityCheck, fill: "#8b5cf6" }, 
    { name: "Pronto", count: statusCounts.Ready, fill: "#10b981" }, 
  ];

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header and Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Métricas da Oficina
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Painel operacional em tempo real, inteligência de peças e filas de diagnósticos ativos.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab("copilot")}
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-xs border border-indigo-100 cursor-pointer"
            id="btn-ai-quick-consult"
          >
            <Sparkles className="h-4 w-4" />
            Copiloto Diagnóstico IA
          </button>
          
          <button
            onClick={openCreateJobModal}
            className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
            id="btn-create-job-dash"
          >
            <Plus className="h-4 w-4" />
            Nova Ordem de Serviço
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Active Jobs */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow"
          id="kpi-active-jobs"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reparos em Andamento</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{activeJobs.length}</span>
              <span className="text-xs text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded-sm">No Pátio</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wrench className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Card 2: Completed revenue */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow"
          id="kpi-revenue"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Faturamento Realizado</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-sm">+12%</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Card 3: Completed Units */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow"
          id="kpi-completed"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Veículos Entregues</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{completedJobs.length}</span>
              <span className="text-xs text-slate-500 font-medium">Este mês</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Card 4: Inventory Alerts */}
        <motion.div 
          variants={itemVariants}
          className={`p-5 rounded-2xl border shadow-xs flex items-center justify-between hover:shadow-md transition-shadow ${
            lowStockParts.length > 0 
              ? "bg-amber-50/50 border-amber-200/60" 
              : "bg-white border-slate-100"
          }`}
          id="kpi-low-stock"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">SKUs de Baixo Estoque</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${lowStockParts.length > 0 ? "text-amber-700" : "text-slate-900"}`}>
                {lowStockParts.length}
              </span>
              {lowStockParts.length > 0 && (
                <span className="text-xs text-amber-700 font-medium bg-amber-100 px-1.5 py-0.5 rounded-sm">Repor</span>
              )}
            </div>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
            lowStockParts.length > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400"
          }`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
        </motion.div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar Chart: Service Workflow Pipeline */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 flex flex-col"
          id="chart-pipeline"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-slate-400" />
                Fluxo do Processo de Serviços
              </h3>
              <p className="text-xs text-slate-500">Distribuição das ordens de serviço ativas nos setores da oficina.</p>
            </div>
            <button 
              onClick={() => setActiveTab("pipeline")}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer font-sans"
            >
              Gerenciar Fluxo <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" tickLine={false} />
                <YAxis allowDecimals={false} fontSize={11} stroke="#94a3b8" tickLine={false} />
                <Tooltip 
                  cursor={{ fill: "rgba(148, 163, 184, 0.05)" }}
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Small Pie Chart / Low Stock visual list */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between"
          id="low-stock-panel"
        >
          <div>
            <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Estoque de Peças Críticas
            </h3>
            <p className="text-xs text-slate-500 mb-4">Itens no limite de segurança ou abaixo do mínimo exigido.</p>
          </div>

          {lowStockParts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-slate-800">Estoque 100% regulado</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Nenhuma reposição crítica necessária.</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-48 pr-1">
              {lowStockParts.slice(0, 4).map(part => (
                <div key={part.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{part.name}</p>
                    <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <span>SKU: {part.sku}</span> • <span>Prateleira: {part.shelfLocation}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-sm">
                      {part.quantity} / {part.minQuantity}
                    </span>
                    <p className="text-[9px] text-slate-400 mt-0.5">unidades</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-100 pt-3 mt-3">
            <button
              onClick={() => setActiveTab("inventory")}
              className="w-full text-center text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              Ver Almoxarifado <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid: Recent Activity Feed & Quick Diagnosis Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Workshop Operations Feed */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 flex flex-col justify-between"
          id="activity-log-feed"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-400" />
                Atividades da Oficina em Tempo Real
              </h3>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Conexão Ativa
              </span>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center">Nenhum registro encontrado.</p>
              ) : (
                activities.slice(0, 5).map(log => {
                  let badgeColor = "bg-blue-50 text-blue-700 border-blue-100";
                  if (log.type === "success") badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                  if (log.type === "warning") badgeColor = "bg-amber-50 text-amber-700 border-amber-100";

                  const translatedCategory: Record<string, string> = {
                    repair: "reparo",
                    inventory: "estoque",
                    ai: "copiloto ia",
                    quote: "orçamento",
                    system: "sistema"
                  };

                  return (
                    <div key={log.id} className="flex items-start gap-3 text-xs leading-relaxed">
                      <div className={`mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${badgeColor}`}>
                        {translatedCategory[log.category] || log.category}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800">{log.text}</p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {new Date(log.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4">
            <p className="text-[10px] text-slate-400 text-center">
              Estado sincronizado automaticamente na persistência do navegador.
            </p>
          </div>
        </motion.div>

        {/* AI Copilot Teaser Box */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between"
          id="ai-copilot-teaser"
        >
          <div className="space-y-2">
            <div className="h-9 w-9 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center rounded-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg font-sans">Assistente de Mecânica por IA</h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed">
              Enfrentando um código de erro complexo ou falha atípica? Insira os sintomas e os códigos OBD-II no motor Gemini e receba o plano de ação passo a passo.
            </p>
          </div>

          <div className="space-y-3 mt-6">
            <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-[11px] text-indigo-100">
              <span className="font-mono text-indigo-300">Exemplo P0300:</span> "Toyota RAV4 2018 com oscilações de rotação e falhas de combustão aleatórias..."
            </div>
            
            <button
              onClick={() => setActiveTab("copilot")}
              className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              Consultar Copiloto <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
