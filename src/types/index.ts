export type WorkOrderStatus = "Received" | "Diagnostics" | "InProgress" | "QualityCheck" | "Ready";

export type Priority = "Low" | "Medium" | "High";

export interface ChecklistItem {
  id: string;
  task: string;
  done: boolean;
}

export interface WorkOrder {
  id: string;
  vehicleModel: string;
  customerName: string;
  licensePlate: string;
  phone: string;
  serviceType: string;
  status: WorkOrderStatus;
  priority: Priority;
  dateIn: string;
  dateOut?: string;
  totalCost: number;
  notes: string;
  checklist: ChecklistItem[];
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  cost: number;
  price: number;
  supplier: string;
  shelfLocation: string;
}

export type QuoteItemType = "part" | "labor";

export interface QuoteItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  laborHours: number;
  laborRate: number;
  type: QuoteItemType;
}

export interface Quote {
  id: string;
  customerName: string;
  vehicleModel: string;
  items: QuoteItem[];
  taxRate: number;
  dateCreated: string;
  status: "Draft" | "Sent" | "Approved" | "Rejected";
}

export type ActivityCategory = "repair" | "inventory" | "ai" | "quote" | "system";
export type ActivityType = "info" | "success" | "warning";

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: ActivityType;
  category: ActivityCategory;
  text: string;
}

export interface DiagnosticCause {
  title: string;
  description: string;
  urgency: "Immediate Action" | "Inspect Soon" | "Monitor" | string;
}

export interface DiagnosticResult {
  summary: string;
  severity: "Low" | "Medium" | "High" | string;
  possibleCauses: DiagnosticCause[];
  diagnosticSteps: string[];
  estimatedTime: string;
  suggestedParts: string[];
}
