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
  updateQuote: (id: string, updatedQuote: Partial<Omit<Quote, "id" | "dateCreated">>) => void;
  updateQuoteStatus: (id: string, status: "Draft" | "Sent" | "Approved") => void;
  deleteQuote: (id: string) => void;
  addActivity: (category: ActivityLog["category"], type: ActivityLog["type"], text: string) => void;
  clearAllData: () => void;
}

const SaaSContext = createContext<SaaSContextType | undefined>(undefined);

// Initial Mock Datasets Localized in PT-BR
const initialWorkOrders: WorkOrder[] = [];

const initialInventory: Part[] = [
  { id: "P-01", name: "Pastilhas de Freio Cerâmicas de Alta Performance (Par Dianteiro)", sku: "BP-CER-F4", category: "Freios", quantity: 12, minQuantity: 4, cost: 45, price: 95, supplier: "ApexBrakes Inc", shelfLocation: "A-04" },
  { id: "P-02", name: "Vitrificador Nano Cerâmico Hidrofóbico (Frasco 1L)", sku: "CP-NANO-1L", category: "Estética", quantity: 3, minQuantity: 2, cost: 180, price: 350, supplier: "GlossBoss Supplies", shelfLocation: "D-12" },
  { id: "P-03", name: "Óleo de Motor Sintético 5W-30 (Galão 4.7L)", sku: "OIL-5W30-5Q", category: "Fluidos", quantity: 24, minQuantity: 6, cost: 18, price: 42, supplier: "OilCo Distrib", shelfLocation: "C-01" },
  { id: "P-04", name: "Vela de Ignição Laser Platinum NGK", sku: "SP-PLAT-NGK", category: "Ignição", quantity: 32, minQuantity: 10, cost: 4.5, price: 12, supplier: "AutoIgnite Ltd", shelfLocation: "B-03" },
  { id: "P-05", name: "Fluido de Freio Racing DOT 4 (500ml)", sku: "BF-DOT4-SRF", category: "Fluidos", quantity: 5, minQuantity: 5, cost: 28, price: 65, supplier: "ApexBrakes Inc", shelfLocation: "A-09" },
  { id: "P-06", name: "Filtro de Cabine HEPA de Carvão Ativado", sku: "FIL-HEPA-C", category: "Filtros", quantity: 2, minQuantity: 5, cost: 12, price: 28, supplier: "FilterTech Co", shelfLocation: "C-08" },
  { id: "P-07", name: "Bobina de Ignição de Alta Performance OEM", sku: "IC-COIL-OEM", category: "Ignição", quantity: 8, minQuantity: 4, cost: 35, price: 79, supplier: "AutoIgnite Ltd", shelfLocation: "B-14" }
];

const initialQuotes: Quote[] = [];

const initialActivities: ActivityLog[] = [
  { id: "act-1", timestamp: "2026-07-20T12:30:00Z", type: "info", category: "system", text: "Painel AutoFlow SaaS carregado com sucesso." },
  { id: "act-3", timestamp: "2026-07-20T10:15:00Z", type: "warning", category: "inventory", text: "Alerta de Estoque: Filtro de Cabine HEPA está abaixo do limite de segurança." }
];

export const SaaSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const stored = localStorage.getItem("autoflow_work_orders");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.filter((wo: any) => wo.licensePlate !== "KYC2961");
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [inventory, setInventory] = useState<Part[]>(() => {
    const stored = localStorage.getItem("autoflow_inventory");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return initialInventory;
      }
    }
    return initialInventory;
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const stored = localStorage.getItem("autoflow_quotes");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.filter((q: any) => !q.vehicleModel.includes("KYC2961") && q.customerName !== "Elias Ribeiro");
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const stored = localStorage.getItem("autoflow_activities");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.filter((act: any) => !act.text.includes("KYC2961") && !act.text.includes("Elias Ribeiro"));
      } catch (e) {
        return initialActivities;
      }
    }
    return initialActivities;
  });

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem("autoflow_work_orders", JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem("autoflow_inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("autoflow_quotes", JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem("autoflow_activities", JSON.stringify(activities));
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

  const updateQuote = (id: string, updatedQuoteFields: Partial<Omit<Quote, "id" | "dateCreated">>) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === id) {
        addActivity("quote", "info", `Orçamento ${id} atualizado com novas informações/serviços.`);
        const itemsWithIds = updatedQuoteFields.items 
          ? updatedQuoteFields.items.map((item, idx) => ({
              ...item,
              id: item.id || `qi-${Date.now()}-${idx}`
            }))
          : q.items;
        return {
          ...q,
          ...updatedQuoteFields,
          items: itemsWithIds
        };
      }
      return q;
    }));
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
      updateQuote,
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
