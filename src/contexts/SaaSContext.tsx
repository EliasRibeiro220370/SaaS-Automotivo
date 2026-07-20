import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  WorkOrder, 
  Part, 
  Quote, 
  ActivityLog, 
  WorkOrderStatus, 
  Priority,
  ChecklistItem,
  QuoteItem
} from "../types";

interface SaaSContextType {
  workOrders: WorkOrder[];
  inventory: Part[];
  quotes: Quote[];
  activities: ActivityLog[];
  addWorkOrder: (wo: Omit<WorkOrder, "id" | "checklist" | "dateIn"> & { checklist?: string[] }) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus) => void;
  updateWorkOrderChecklist: (woId: string, itemId: string, done: boolean) => void;
  deleteWorkOrder: (id: string) => void;
  addPart: (part: Omit<Part, "id">) => void;
  restockPart: (id: string, qty: number) => void;
  usePartInService: (sku: string, qty: number) => boolean;
  addQuote: (quote: Omit<Quote, "id" | "dateCreated" | "status"> & { items: Omit<QuoteItem, "id">[] }) => void;
  updateQuoteStatus: (id: string, status: "Draft" | "Sent" | "Approved") => void;
  deleteQuote: (id: string) => void;
  addActivity: (category: ActivityLog["category"], type: ActivityLog["type"], text: string) => void;
  clearAllData: () => void;
}

const SaaSContext = createContext<SaaSContextType | undefined>(undefined);

// Initial Mock Datasets Localized in PT-BR
const initialWorkOrders: WorkOrder[] = [
  {
    id: "OS-101",
    vehicleModel: "2021 Ford Mustang GT (Preto Shadow)",
    customerName: "Alex Mercer",
    licensePlate: "GT-FAST1",
    phone: "(11) 98765-4321",
    serviceType: "Inspeção de Desempenho e Sistema de Freio",
    status: "InProgress",
    priority: "High",
    dateIn: "2026-07-19",
    totalCost: 450,
    notes: "Cliente relatou ruídos ao frear em baixas velocidades e pedal de freio borrachudo. Verificar desgaste das pastilhas e pinças.",
    checklist: [
      { id: "c1", task: "Realizar teste de rodagem para confirmar ruído nos freios", done: true },
      { id: "c2", task: "Medir espessura das pastilhas de freio dianteiras e traseiras", done: true },
      { id: "c3", task: "Substituir pastilhas de freio gastas e sangrar o sistema", done: false },
      { id: "c4", task: "Realizar teste de segurança na estrada pós-instalação", done: false },
    ]
  },
  {
    id: "OS-102",
    vehicleModel: "2019 Tesla Model 3 (Branco Pérola)",
    customerName: "Sarah Connor",
    licensePlate: "E-DRIVE9",
    phone: "(21) 91234-5678",
    serviceType: "Limpeza do Líquido de Arrefecimento da Bateria e Sincronização de Software",
    status: "Diagnostics",
    priority: "Medium",
    dateIn: "2026-07-20",
    totalCost: 320,
    notes: "Manutenção programada para verificação do sistema térmico da bateria. Verificar lentidão ocasional na tela central.",
    checklist: [
      { id: "c5", task: "Executar diagnóstico completo do sistema de arrefecimento via OBD", done: true },
      { id: "c6", task: "Inspecionar mangueiras de arrefecimento em busca de microfissuras", done: false },
      { id: "c7", task: "Drenar e substituir o fluido de arrefecimento da bateria", done: false },
    ]
  },
  {
    id: "OS-103",
    vehicleModel: "2022 Porsche Macan GTS (Vermelho Carmine)",
    customerName: "David Vance",
    licensePlate: "P-GTS911",
    phone: "(31) 98888-7777",
    serviceType: "Polimento Técnico e Aplicação de Vitrificador Cerâmico (3 anos)",
    status: "QualityCheck",
    priority: "Low",
    dateIn: "2026-07-18",
    totalCost: 1250,
    notes: "Descontaminação completa da pintura, correção de pintura em múltiplas etapas e aplicação de proteção cerâmica premium.",
    checklist: [
      { id: "c8", task: "Lavagem detalhada e descontaminação com clay bar", done: true },
      { id: "c9", task: "Correção de pintura (Etapa de Corte e Refino)", done: true },
      { id: "c10", task: "Aplicação de dupla camada de vitrificador nano cerâmico", done: true },
      { id: "c11", task: "Cura do revestimento sob lâmpadas de calor infravermelho", done: true },
      { id: "c12", task: "Inspeção final sob luzes LED especiais de detalhamento", done: false },
    ]
  },
  {
    id: "OS-104",
    vehicleModel: "2018 Toyota RAV4 AWD (Prata Metálico)",
    customerName: "Elena Rostova",
    licensePlate: "RAV-4WD7",
    phone: "(41) 97777-6666",
    serviceType: "Diagnóstico de Falha de Ignição no Motor",
    status: "Received",
    priority: "High",
    dateIn: "2026-07-20",
    totalCost: 180,
    notes: "Marcha lenta irregular e luz de injeção piscando. Cliente afirma que o carro treme na aceleração. Obter códigos OBD.",
    checklist: [
      { id: "c13", task: "Conectar scanner OBD-II e ler códigos de falha", done: false },
      { id: "c14", task: "Inspecionar velas de ignição e bobinas", done: false },
      { id: "c15", task: "Verificar mangueiras de vácuo contra vazamentos", done: false },
    ]
  },
  {
    id: "OS-105",
    vehicleModel: "2020 Honda Civic Type R (Branco Championship)",
    customerName: "Marcus Vance",
    licensePlate: "R-09822",
    phone: "(11) 99999-8888",
    serviceType: "Preparação para Track Day: Óleo, Fluido de Freio e Alinhamento",
    status: "Ready",
    priority: "Medium",
    dateIn: "2026-07-17",
    dateOut: "2026-07-20",
    totalCost: 580,
    notes: "Preparação pré-pista. Realizar alinhamento personalizado de alta performance, trocar fluido de freio por Castrol SRF.",
    checklist: [
      { id: "c16", task: "Drenar e reabastecer óleo do motor com Motul 0W-40", done: true },
      { id: "c17", task: "Substituir fluido de freio por fluido de corrida de alta temperatura", done: true },
      { id: "c18", task: "Realizar alinhamento agressivo para pista", done: true },
      { id: "c19", task: "Verificar torque de todos os parafusos da suspensão", done: true },
    ]
  }
];

const initialInventory: Part[] = [
  { id: "P-01", name: "Pastilhas de Freio Cerâmicas de Alta Performance (Par Dianteiro)", sku: "BP-CER-F4", category: "Freios", quantity: 12, minQuantity: 4, cost: 45, price: 95, supplier: "ApexBrakes Inc", shelfLocation: "A-04" },
  { id: "P-02", name: "Vitrificador Nano Cerâmico Hidrofóbico (Frasco 1L)", sku: "CP-NANO-1L", category: "Estética", quantity: 3, minQuantity: 2, cost: 180, price: 350, supplier: "GlossBoss Supplies", shelfLocation: "D-12" },
  { id: "P-03", name: "Óleo de Motor Sintético 5W-30 (Galão 4.7L)", sku: "OIL-5W30-5Q", category: "Fluidos", quantity: 24, minQuantity: 6, cost: 18, price: 42, supplier: "OilCo Distrib", shelfLocation: "C-01" },
  { id: "P-04", name: "Vela de Ignição Laser Platinum NGK", sku: "SP-PLAT-NGK", category: "Ignição", quantity: 32, minQuantity: 10, cost: 4.5, price: 12, supplier: "AutoIgnite Ltd", shelfLocation: "B-03" },
  { id: "P-05", name: "Fluido de Freio Racing DOT 4 (500ml)", sku: "BF-DOT4-SRF", category: "Fluidos", quantity: 5, minQuantity: 5, cost: 28, price: 65, supplier: "ApexBrakes Inc", shelfLocation: "A-09" },
  { id: "P-06", name: "Filtro de Cabine HEPA de Carvão Ativado", sku: "FIL-HEPA-C", category: "Filtros", quantity: 2, minQuantity: 5, cost: 12, price: 28, supplier: "FilterTech Co", shelfLocation: "C-08" },
  { id: "P-07", name: "Bobina de Ignição de Alta Performance OEM", sku: "IC-COIL-OEM", category: "Ignição", quantity: 8, minQuantity: 4, cost: 35, price: 79, supplier: "AutoIgnite Ltd", shelfLocation: "B-14" }
];

const initialQuotes: Quote[] = [
  {
    id: "Q-1001",
    customerName: "Alex Mercer",
    vehicleModel: "2021 Ford Mustang GT",
    taxRate: 0.08,
    dateCreated: "2026-07-19",
    status: "Approved",
    items: [
      { id: "qi1", name: "Pastilhas de Freio Cerâmicas de Alta Performance (Par Dianteiro)", quantity: 1, unitPrice: 95, laborHours: 0, laborRate: 0, type: "part" },
      { id: "qi2", name: "Fluido de Freio e Purga Completa", quantity: 1, unitPrice: 40, laborHours: 0, laborRate: 0, type: "part" },
      { id: "qi3", name: "Mão de Obra de Instalação de Pastilhas de Freio", quantity: 1, unitPrice: 0, laborHours: 1.5, laborRate: 140, type: "labor" },
      { id: "qi4", name: "Diagnóstico Avançado do Sistema de Freios", quantity: 1, unitPrice: 0, laborHours: 0.75, laborRate: 140, type: "labor" }
    ]
  },
  {
    id: "Q-1002",
    customerName: "Elena Rostova",
    vehicleModel: "2018 Toyota RAV4 AWD",
    taxRate: 0.08,
    dateCreated: "2026-07-20",
    status: "Draft",
    items: [
      { id: "qi5", name: "Vela de Ignição Laser Platinum NGK", quantity: 4, unitPrice: 12, laborHours: 0, laborRate: 0, type: "part" },
      { id: "qi6", name: "Filtro de Ar de Motor OEM - Substituição", quantity: 1, unitPrice: 22, laborHours: 0, laborRate: 0, type: "part" },
      { id: "qi7", name: "Mão de Obra de Troca e Diagnóstico de Velas/Bobinas", quantity: 1, unitPrice: 0, laborHours: 1.25, laborRate: 120, type: "labor" }
    ]
  }
];

const initialActivities: ActivityLog[] = [
  { id: "act-1", timestamp: "2026-07-20T12:30:00Z", type: "info", category: "system", text: "Painel AutoFlow SaaS carregado com sucesso." },
  { id: "act-2", timestamp: "2026-07-20T11:45:00Z", type: "success", category: "repair", text: "Ordem de Serviço OS-105 marcada como PRONTA para o Civic Type R de Marcus Vance." },
  { id: "act-3", timestamp: "2026-07-20T10:15:00Z", type: "warning", category: "inventory", text: "Alerta de Estoque: Filtro de Cabine HEPA está abaixo do limite de segurança (restam apenas 2 unidades)." },
  { id: "act-4", timestamp: "2026-07-20T09:00:00Z", type: "success", category: "quote", text: "O orçamento Q-1001 para Alex Mercer foi APROVADO." },
];

export const SaaSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [inventory, setInventory] = useState<Part[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Load from local storage or set defaults
  useEffect(() => {
    const storedWorkOrders = localStorage.getItem("autoflow_work_orders");
    const storedInventory = localStorage.getItem("autoflow_inventory");
    const storedQuotes = localStorage.getItem("autoflow_quotes");
    const storedActivities = localStorage.getItem("autoflow_activities");

    if (storedWorkOrders) setWorkOrders(JSON.parse(storedWorkOrders));
    else setWorkOrders(initialWorkOrders);

    if (storedInventory) setInventory(JSON.parse(storedInventory));
    else setInventory(initialInventory);

    if (storedQuotes) setQuotes(JSON.parse(storedQuotes));
    else setQuotes(initialQuotes);

    if (storedActivities) setActivities(JSON.parse(storedActivities));
    else setActivities(initialActivities);
  }, []);

  // Sync back to local storage
  useEffect(() => {
    if (workOrders.length > 0) localStorage.setItem("autoflow_work_orders", JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    if (inventory.length > 0) localStorage.setItem("autoflow_inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    if (quotes.length > 0) localStorage.setItem("autoflow_quotes", JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    if (activities.length > 0) localStorage.setItem("autoflow_activities", JSON.stringify(activities));
  }, [activities]);

  // Logging utility
  const addActivity = (category: ActivityLog["category"], type: ActivityLog["type"], text: string) => {
    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      category,
      text
    };
    setActivities(prev => [newAct, ...prev.slice(0, 49)]); // keep last 50
  };

  // Work Orders Operations
  const addWorkOrder = (wo: Omit<WorkOrder, "id" | "checklist" | "dateIn"> & { checklist?: string[] }) => {
    const nextId = `OS-${100 + workOrders.length + 1}`;
    
    const checklistItems: ChecklistItem[] = (wo.checklist || []).map((task, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      task,
      done: false
    }));

    const newWO: WorkOrder = {
      ...wo,
      id: nextId,
      dateIn: new Date().toISOString().split("T")[0],
      checklist: checklistItems
    };

    setWorkOrders(prev => [newWO, ...prev]);
    addActivity("repair", "success", `Nova Ordem de Serviço ${nextId} criada para ${wo.customerName} (${wo.vehicleModel}).`);
  };

  const updateWorkOrderStatus = (id: string, status: WorkOrderStatus) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === id) {
        const isNowReady = status === "Ready";
        const translatedStatusMap: Record<WorkOrderStatus, string> = {
          Received: "Recebida",
          Diagnostics: "Diagnóstico",
          InProgress: "Em Execução",
          QualityCheck: "Auditoria de Qualidade",
          Ready: "Pronto para Retirada"
        };
        const text = `Ordem de Serviço ${id} atualizada do status '${translatedStatusMap[wo.status] || wo.status}' para '${translatedStatusMap[status] || status}'.`;
        addActivity("repair", isNowReady ? "success" : "info", text);
        return {
          ...wo,
          status,
          dateOut: isNowReady ? new Date().toISOString().split("T")[0] : wo.dateOut
        };
      }
      return wo;
    }));
  };

  const updateWorkOrderChecklist = (woId: string, itemId: string, done: boolean) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId) {
        const updatedChecklist = wo.checklist.map(item => {
          if (item.id === itemId) {
            return { ...item, done };
          }
          return item;
        });
        return { ...wo, checklist: updatedChecklist };
      }
      return wo;
    }));
  };

  const deleteWorkOrder = (id: string) => {
    setWorkOrders(prev => prev.filter(wo => wo.id !== id));
    addActivity("repair", "warning", `Ordem de Serviço ${id} excluída.`);
  };

  // Inventory Operations
  const addPart = (part: Omit<Part, "id">) => {
    const nextId = `P-${String(inventory.length + 1).padStart(2, "0")}`;
    const newPart: Part = { ...part, id: nextId };
    setInventory(prev => [...prev, newPart]);
    addActivity("inventory", "success", `Adicionada nova peça ${newPart.name} (SKU: ${part.sku}) no escaninho ${part.shelfLocation}.`);
  };

  const restockPart = (id: string, qty: number) => {
    setInventory(prev => prev.map(part => {
      if (part.id === id) {
        const newQty = part.quantity + qty;
        addActivity("inventory", "success", `Reabastecimento de ${part.name}: Adicionadas ${qty} unidades. Estoque atual: ${newQty}.`);
        return { ...part, quantity: newQty };
      }
      return part;
    }));
  };

  const usePartInService = (sku: string, qty: number): boolean => {
    let success = false;
    setInventory(prev => {
      const partIndex = prev.findIndex(p => p.sku === sku);
      if (partIndex === -1) return prev;
      const part = prev[partIndex];
      if (part.quantity < qty) {
        addActivity("inventory", "warning", `Estoque insuficiente para ${part.name} (SKU: ${sku}). Necessário: ${qty}, Disponível: ${part.quantity}.`);
        return prev;
      }
      success = true;
      const updated = [...prev];
      updated[partIndex] = {
        ...part,
        quantity: part.quantity - qty
      };
      
      addActivity("inventory", "info", `Deduzidas ${qty} unidades de ${part.name} para ordem de serviço.`);
      
      // Safety threshold alarm
      if (part.quantity - qty <= part.minQuantity) {
        addActivity("inventory", "warning", `Alerta de estoque baixo: ${part.name} está no limite de segurança ou abaixo (${part.quantity - qty} restantes).`);
      }
      
      return updated;
    });
    return success;
  };

  // Quotes Operations
  const addQuote = (quote: Omit<Quote, "id" | "dateCreated" | "status"> & { items: Omit<QuoteItem, "id">[] }) => {
    const nextId = `Q-${1000 + quotes.length + 1}`;
    const itemsWithIds: QuoteItem[] = quote.items.map((item, idx) => ({
      ...item,
      id: `qi-${Date.now()}-${idx}`
    }));

    const newQuote: Quote = {
      ...quote,
      id: nextId,
      items: itemsWithIds,
      dateCreated: new Date().toISOString().split("T")[0],
      status: "Draft"
    };

    setQuotes(prev => [newQuote, ...prev]);
    addActivity("quote", "info", `Novo Orçamento/Estimativa ${nextId} criado para ${quote.customerName}.`);
  };

  const updateQuoteStatus = (id: string, status: "Draft" | "Sent" | "Approved") => {
    setQuotes(prev => prev.map(q => {
      if (q.id === id) {
        const statusMap = {
          Draft: "Rascunho",
          Sent: "Enviado",
          Approved: "Aprovado"
        };
        addActivity("quote", status === "Approved" ? "success" : "info", `Orçamento ${id} atualizado para status '${statusMap[status]}'.`);
        return { ...q, status };
      }
      return q;
    }));
  };

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
    addActivity("quote", "warning", `Orçamento ${id} removido.`);
  };

  const clearAllData = () => {
    localStorage.removeItem("autoflow_work_orders");
    localStorage.removeItem("autoflow_inventory");
    localStorage.removeItem("autoflow_quotes");
    localStorage.removeItem("autoflow_activities");
    setWorkOrders(initialWorkOrders);
    setInventory(initialInventory);
    setQuotes(initialQuotes);
    setActivities(initialActivities);
    addActivity("system", "info", "Banco de dados demonstrativo restaurado aos valores padrão.");
  };

  return (
    <SaaSContext.Provider value={{
      workOrders,
      inventory,
      quotes,
      activities,
      addWorkOrder,
      updateWorkOrderStatus,
      updateWorkOrderChecklist,
      deleteWorkOrder,
      addPart,
      restockPart,
      usePartInService,
      addQuote,
      updateQuoteStatus,
      deleteQuote,
      addActivity,
      clearAllData
    }}>
      {children}
    </SaaSContext.Provider>
  );
};

export const useSaaS = () => {
  const context = useContext(SaaSContext);
  if (!context) {
    throw new Error("useSaaS deve ser usado dentro de um SaaSProvider");
  }
  return context;
};
