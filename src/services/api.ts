import { DiagnosticResult } from "../types";

export interface DiagnoseRequest {
  vehicleModel: string;
  symptoms: string;
  obdCode: string;
}

export interface CommunicateRequest {
  jobTitle: string;
  currentStatus: string;
  details: string;
  tone: string;
}

export const aiService = {
  /**
   * Generates a detailed virtual mechanical diagnostic report from vehicle symptoms and OBD codes.
   */
  async diagnoseVehicle(params: DiagnoseRequest): Promise<DiagnosticResult> {
    const response = await fetch("/api/gemini/diagnose", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || errData.details || "Failed to perform diagnostic analysis.");
    }

    return response.json();
  },

  /**
   * Drafts a polite, readable status update or summary for the vehicle owner.
   */
  async draftCustomerMessage(params: CommunicateRequest): Promise<{ draft: string }> {
    const response = await fetch("/api/gemini/communicate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || errData.details || "Failed to draft customer message.");
    }

    return response.json();
  },
};
