import React, { useState } from "react";
import { SaaSProvider, useSaaS } from "./contexts/SaaSContext";
import { Dashboard } from "./pages/Dashboard";
import { RepairPipeline } from "./pages/RepairPipeline";
import { AiCopilot } from "./pages/AiCopilot";
import { InventoryHub } from "./pages/InventoryHub";
import { QuoteGenerator } from "./pages/QuoteGenerator";
import { 
  Wrench, 
  Layers, 
  Sparkles, 
  Package, 
  FileText, 
  LogOut, 
  Clock, 
  Menu, 
  X,
  RefreshCw,
  Gauge,
  Sliders,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const { clearAllData, addActivity } = useSaaS();

  const handleResetDb = () => {
    if (confirm("Tem certeza que deseja restaurar o banco de dados da oficina para os valores padrão de demonstração? Quaisquer modificações personalizadas feitas serão redefinidas.")) {
      clearAllData();
      addActivity("system", "info", "Banco de dados demonstrativo da oficina restaurado.");
    }
  };

  // Nav menu items translated
  const menuItems = [
    { id: "dashboard", label: "Painel Analítico", icon: Gauge },
    { id: "pipeline", label: "Fluxo de Reparos", icon: Layers },
    { id: "copilot", label: "Copiloto IA", icon: Sparkles },
    { id: "inventory", label: "Estoque de Peças", icon: Package },
    { id: "quotes", label: "Orçamentos e Faturas", icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased">
      
      {/* Top Mobile Header bar */}
      <header className="lg:hidden bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-indigo-400" />
          <span className="font-extrabold tracking-tight text-sm font-sans uppercase">
            AutoFlow SaaS
          </span>
        </div>
        
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-9 w-9 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-200 cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Main Fullscreen Layout wrapper */}
      <div className="flex-1 flex flex-row h-full">
        
        {/* LEFT SIDEBAR PANEL (Desktop only) */}
        <aside className="hidden lg:flex flex-col justify-between w-64 bg-slate-900 text-slate-300 border-r border-slate-850 p-5 sticky top-0 h-screen select-none z-20">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-2 px-1 pb-4 border-b border-slate-800">
              <div className="h-9 w-9 bg-indigo-600/25 text-indigo-400 flex items-center justify-center rounded-xl border border-indigo-500/20 shadow-xs">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <span className="font-extrabold text-slate-100 font-sans tracking-tight text-base block">
                  AutoFlow CRM
                </span>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                  Copiloto SaaS v1.2
                </span>
              </div>
            </div>

            {/* Menu Nav Links */}
            <nav className="space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? "bg-indigo-600 text-white shadow-xs font-extrabold" 
                        : "hover:bg-slate-800 hover:text-white"
                    }`}
                    id={`sidebar-link-${item.id}`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer Controls */}
          <div className="space-y-3 border-t border-slate-800 pt-5">
            <button
              onClick={handleResetDb}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-amber-500 text-slate-400 transition-all cursor-pointer"
              title="Restaurar banco de dados para os padrões de demonstração"
              id="sidebar-btn-reset"
            >
              <RefreshCw className="h-4.5 w-4.5" />
              Restaurar Base Demo
            </button>
            
            <div className="px-3 py-1.5 bg-slate-950/40 rounded-xl border border-slate-850/50 text-[10px] text-slate-400 font-medium leading-relaxed flex flex-col gap-0.5">
              <span>Status: <strong className="text-emerald-400">Ativo</strong></span>
              <span>Porta: <strong className="font-mono text-slate-300">3000</strong></span>
            </div>

            {/* Elias Ribeiro Footer attribution */}
            <div className="pt-2 px-3 text-[10px] text-slate-500 border-t border-slate-800/50 text-center font-medium leading-normal">
              Direitos reservados <br />
              <strong className="text-slate-400 font-bold">Elias Ribeiro</strong>
            </div>
          </div>
        </aside>

        {/* MOBILE DROPDOWN NAVIGATION */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden bg-slate-900 border-b border-slate-800 absolute top-14 left-0 right-0 z-30 shadow-xl flex flex-col p-4 space-y-1.5"
            >
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive 
                        ? "bg-indigo-600 text-white shadow-xs" 
                        : "text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.label}
                  </button>
                );
              })}
              
              <div className="border-t border-slate-800 pt-3 mt-2 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      handleResetDb();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-amber-500"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Restaurar Base Demo
                  </button>
                  <span className="text-[10px] font-mono text-slate-500">Porta 3000 Ativa</span>
                </div>
                
                <div className="text-center text-[9px] text-slate-500 font-medium">
                  Direitos reservados Elias Ribeiro
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN BODY AREA CONTAINER */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
          
          {/* Top Info status bar (Desktop only) */}
          <section className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-white px-8 py-3.5 select-none shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Turno de Trabalho: <strong className="text-slate-700">08:00 - 18:00</strong>
              </span>
              <span className="h-4 w-px bg-slate-200"></span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Status do Dia: <strong className="text-emerald-600">Oficina Ativa</strong>
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-md border border-slate-200/50">
              DATA UTC: {new Date().toISOString().split("T")[0]}
            </div>
          </section>

          {/* PAGE CONTENT SWITCH (with route visual layout animations!) */}
          <div className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {activeTab === "dashboard" && (
                  <Dashboard 
                    setActiveTab={setActiveTab} 
                    openCreateJobModal={() => {
                      setActiveTab("pipeline");
                      setCreateModalOpen(true);
                    }} 
                  />
                )}
                {activeTab === "pipeline" && (
                  <RepairPipeline 
                    isCreateModalOpen={isCreateModalOpen}
                    setCreateModalOpen={setCreateModalOpen}
                  />
                )}
                {activeTab === "copilot" && <AiCopilot />}
                {activeTab === "inventory" && <InventoryHub />}
                {activeTab === "quotes" && <QuoteGenerator />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SaaSProvider>
      <AppContent />
    </SaaSProvider>
  );
}
