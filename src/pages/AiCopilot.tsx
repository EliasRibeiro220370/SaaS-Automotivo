import React, { useState } from "react";
import { aiService } from "../services/api";
import { useSaaS } from "../contexts/SaaSContext";
import { DiagnosticResult, Priority } from "../types";
import { 
  Sparkles, 
  Wrench, 
  MessageSquare, 
  AlertTriangle, 
  Loader2, 
  CheckCircle, 
  ArrowRight, 
  Copy, 
  Check, 
  HelpCircle,
  FileText,
  ShieldAlert,
  FolderPlus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const AiCopilot: React.FC = () => {
  const { addActivity, addQuote, addWorkOrder } = useSaaS();

  // Active sub-tab
  const [copilotView, setCopilotView] = useState<"diagnose" | "advisor">("diagnose");

  // --- Diagnostic State ---
  const [vehicleModel, setVehicleModel] = useState("Toyota RAV4 AWD 2018");
  const [symptoms, setSymptoms] = useState("Motor engasgando ou tremendo ao acelerar forte, marcha lenta irregular ao parar no semáforo, luz de injeção eletrônica piscando.");
  const [obdCode, setObdCode] = useState("P0300");
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [diagnoseError, setDiagnoseError] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [hasExported, setHasExported] = useState(false);

  // --- Advisor State ---
  const [jobTitle, setJobTitle] = useState("Substituição de Pastilhas de Freio Dianteiras Desgastadas");
  const [currentStatus, setCurrentStatus] = useState("Concluído e Testado com Segurança");
  const [serviceDetails, setServiceDetails] = useState("Substituímos as pastilhas de freio dianteiras por pastilhas de cerâmica premium, realizamos a retífica dos discos de freio, fizemos a sangria de fluido e efetuamos teste de rodagem de 5 km. Os ruídos sumiram e o pedal está firme.");
  const [tone, setTone] = useState("Professional");
  const [isDrafting, setIsDrafting] = useState(false);
  const [communicationDraft, setCommunicationDraft] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // --- Offline Presets in Portuguese ---
  const handleLoadPreset = (preset: "misfire" | "overheating" | "sensors") => {
    setDiagnoseError(null);
    if (preset === "misfire") {
      setVehicleModel("Toyota RAV4 AWD 2018");
      setSymptoms("Motor trepidando forte sob aceleração pesada, marcha lenta instável no semáforo, odor de combustível, luz de injeção eletrônica piscando.");
      setObdCode("P0300 / P0301");
    } else if (preset === "overheating") {
      setVehicleModel("Chevrolet Cruze 2016");
      setSymptoms("Temperatura do motor subindo extremamente rápido. Ventoinha do radiador rodando constantemente na velocidade máxima. Ar quente do painel sopra frio.");
      setObdCode("P0128");
    } else {
      setVehicleModel("Honda Civic 2015");
      setSymptoms("Fumaça escura saindo pelo escapamento ao dar partida. Consumo elevado de combustível. Motor sem força em subidas.");
      setObdCode("P0135");
    }
  };

  const loadPresetResult = (preset: "misfire" | "overheating" | "sensors") => {
    let mockResult: DiagnosticResult;
    
    if (preset === "misfire") {
      mockResult = {
        summary: "Falha de ignição aleatória nos cilindros do motor causada provavelmente por desgaste excessivo das bobinas ou velas de ignição carbonizadas.",
        severity: "High",
        possibleCauses: [
          { title: "Velas de Ignição Desgastadas", description: "Eletrodos corroídos ou com acúmulo de fuligem impedindo a propagação adequada da centelha nos cilindros 1 e 3.", urgency: "Inspecionar Breve" },
          { title: "Bobina de Ignição Defeituosa", description: "Fuga de alta tensão ou curto interno na Bobina de Ignição do cilindro 1 causando ciclos incompletos de queima.", urgency: "Ação Imediata" },
          { title: "Entrada de Ar Falso / Vácuo", description: "Pequena trinca nas mangueiras do respiro de vácuo (PCV) admitindo ar não medido e desregulando a mistura.", urgency: "Monitorar" }
        ],
        diagnosticSteps: [
          "Conectar o scanner de diagnóstico live-data e monitorar o contador de falhas de combustão nos cilindros 1 e 3.",
          "Inverter a Bobina de Ignição do cilindro 1 com a do cilindro 2 e verificar se a falha migra no scanner.",
          "Remover e inspecionar as velas de ignição dos cilindros 1 e 3 em busca de eletrodo derretido ou umidade de combustível.",
          "Realizar teste de fumaça na admissão para verificar vazamentos de vácuo nas juntas do coletor."
        ],
        estimatedTime: "1.0 - 1.5 horas",
        suggestedParts: ["Jogo de Velas de Ignição NGK Iridium", "Bobina de Ignição OEM de Reposição"]
      };
    } else if (preset === "overheating") {
      mockResult = {
        summary: "Válvula termostática do motor travada na posição fechada, impedindo o fluxo do líquido de arrefecimento para o radiador.",
        severity: "High",
        possibleCauses: [
          { title: "Válvula Termostática Travada", description: "Falha mecânica do atuador bimetálico interno de cera, impedindo a abertura da válvula de circulação principal.", urgency: "Ação Imediata" },
          { title: "Bolhas de Ar no Sistema", description: "Ar retido no cabeçote impedindo o contato térmico adequado e gerando leituras incorretas de temperatura.", urgency: "Inspecionar Breve" },
          { title: "Rotor da Bomba de Água Desgastado", description: "Pás internas da bomba desgastadas por corrosão, reduzindo o fluxo de líquido sob rotações mais elevadas.", urgency: "Inspecionar Breve" }
        ],
        diagnosticSteps: [
          "Verificar a diferença de temperatura entre a mangueira superior e inferior do radiador usando termômetro de mira laser.",
          "Executar procedimento de sangria mecânica do sistema de arrefecimento para remover bolsões de ar.",
          "Retirar a válvula termostática e testar em recipiente com água quente para confirmar o limite de abertura física."
        ],
        estimatedTime: "1.5 - 2.5 horas",
        suggestedParts: ["Válvula Termostática Completa com Carcaça", "Líquido de Arrefecimento Pronto para Uso (Aditivo + Água Desmineralizada)"]
      };
    } else {
      mockResult = {
        summary: "Falha elétrica no circuito interno do aquecedor do sensor de oxigênio primário (Sonda Lambda - Sensor 1, Banco 1).",
        severity: "Medium",
        possibleCauses: [
          { title: "Resistência do Aquecedor Rompida", description: "O filamento de aquecimento interno da sonda queimou, atrasando a leitura correta dos gases em marcha lenta.", urgency: "Inspecionar Breve" },
          { title: "Fiação ou Conector Derretido", description: "Chicote elétrico encostou no coletor de escape quente, causando derretimento e aterrando a fiação de sinal.", urgency: "Ação Imediata" },
          { title: "Sonda Carbonizada (Fuligem)", description: "Camada densa de carvão isola as células de medição de oxigênio gerando leituras lentas no gráfico do scanner.", urgency: "Monitorar" }
        ],
        diagnosticSteps: [
          "Desconectar o conector do Sensor de Oxigênio e medir a resistência interna do aquecedor com o multímetro (esperado: 5-15 ohms).",
          "Verificar o estado físico dos fusíveis do aquecedor (geralmente fusível de 10A na caixa do motor).",
          "Analisar o gráfico de oscilação em milivolts no scanner para monitorar o tempo de resposta do sensor (deve flutuar rápido entre 100mV e 900mV)."
        ],
        estimatedTime: "0.5 - 1.0 hora",
        suggestedParts: ["Sensor de Oxigênio Denso (Sonda Lambda Primária)", "Capa Térmica Protetora para Fiação"]
      };
    }

    setDiagnosticResult(mockResult);
    setCheckedSteps({});
    setHasExported(false);
    addActivity("ai", "success", `Carregado modelo de diagnóstico offline para ${vehicleModel}.`);
  };

  // --- API Call: Diagnose Vehicle ---
  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms && !obdCode) return;

    setIsDiagnosing(true);
    setDiagnosticResult(null);
    setDiagnoseError(null);
    setHasExported(false);

    try {
      const result = await aiService.diagnoseVehicle({
        vehicleModel,
        symptoms,
        obdCode
      });
      setDiagnosticResult(result);
      setCheckedSteps({});
      addActivity("ai", "success", `Diagnóstico gerado com sucesso via Gemini para ${vehicleModel || "veículo"}.`);
    } catch (err: any) {
      console.error(err);
      setDiagnoseError(err.message || "Ocorreu um erro na análise. Tente novamente.");
      addActivity("ai", "warning", "O modelo Gemini falhou ao rodar. Ativando simulador local.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  // --- API Call: Draft Message ---
  const handleDraftMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !currentStatus) return;

    setIsDrafting(true);
    setCommunicationDraft("");
    setDraftError(null);
    setIsCopied(false);

    try {
      const result = await aiService.draftCustomerMessage({
        jobTitle,
        currentStatus,
        details: serviceDetails,
        tone
      });
      setCommunicationDraft(result.draft);
      addActivity("ai", "success", "Mensagem para cliente gerada com sucesso via inteligência Gemini.");
    } catch (err: any) {
      console.error(err);
      setDraftError("Não foi possível conectar ao servidor de IA. Fornecendo rascunho offline alternativo de alta qualidade.");
      
      const offlineDraft = `Olá! Aqui é da equipe de atendimento AutoFlow.
Passando para trazer uma atualização rápida sobre o serviço "${jobTitle}":

Status do Veículo: ${currentStatus}
Detalhes do Reparo: ${serviceDetails}

Prezamos pela transparência no andamento do seu veículo. Caso tenha alguma dúvida ou queira agendar a retirada, por favor responda a esta mensagem ou ligue diretamente para nós.

Atenciosamente,
Seu Consultor Técnico`;
      setCommunicationDraft(offlineDraft);
      addActivity("ai", "info", "Rascunho de aviso gerado localmente pelo simulador offline.");
    } finally {
      setIsDrafting(false);
    }
  };

  // --- Actions ---
  const handleToggleStep = (index: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleCopyDraft = () => {
    if (communicationDraft) {
      navigator.clipboard.writeText(communicationDraft);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      addActivity("system", "info", "Mensagem de atualização copiada para a área de transferência.");
    }
  };

  // Export diagnostic results to a Quote Draft in our state context
  const handleExportToQuote = () => {
    if (!diagnosticResult) return;

    const items: any[] = [];
    
    // Add labor lines
    const hours = parseFloat(diagnosticResult.estimatedTime) || 1.5;
    items.push({
      name: `Mão de Obra de Diagnóstico e Correção: ${diagnosticResult.summary}`,
      quantity: 1,
      unitPrice: 0,
      laborHours: hours,
      laborRate: 130,
      type: "labor"
    });

    // Add suggested parts lines
    diagnosticResult.suggestedParts.forEach(part => {
      items.push({
        name: part,
        quantity: 1,
        unitPrice: 85, // estimated default price
        laborHours: 0,
        laborRate: 0,
        type: "part"
      });
    });

    addQuote({
      customerName: "Orçamento de Diagnóstico IA",
      vehicleModel: vehicleModel || "Carro Analisado",
      items,
      taxRate: 0.08
    });

    setHasExported(true);
    addActivity("quote", "success", `Ficha de diagnóstico IA exportada diretamente para Orçamentos.`);
  };

  // Quick export to active intake
  const handleExportToIntake = () => {
    if (!diagnosticResult) return;

    addWorkOrder({
      customerName: "Cliente Diagnóstico IA",
      vehicleModel: vehicleModel || "Carro Analisado",
      licensePlate: "IA-TEMP",
      phone: "(11) 98888-8888",
      serviceType: `Análise IA: ${diagnosticResult.summary}`,
      status: "Diagnostics",
      priority: diagnosticResult.severity === "High" ? "High" : "Medium",
      totalCost: 150 + (diagnosticResult.suggestedParts.length * 85),
      notes: `Notas do Copiloto IA: ${diagnosticResult.summary}. Nível de Gravidade: ${diagnosticResult.severity}. Tempo de Mão de Obra Estimado: ${diagnosticResult.estimatedTime}`,
      checklist: diagnosticResult.diagnosticSteps
    });

    setHasExported(true);
    addActivity("repair", "success", `Nova Ordem de Serviço criada diretamente com dados de Diagnóstico IA para ${vehicleModel}.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-indigo-600" />
          Copiloto IA da Oficina
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Acesse diagnósticos técnicos avançados e crie atualizações para clientes utilizando inteligência artificial.
        </p>
      </div>

      {/* Nav Tabs */}
      <div className="flex border-b border-slate-100 max-w-sm">
        <button
          onClick={() => setCopilotView("diagnose")}
          className={`flex-1 text-center py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            copilotView === "diagnose"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Wrench className="h-4 w-4" />
            Diagnóstico Virtual por IA
          </span>
        </button>
        <button
          onClick={() => setCopilotView("advisor")}
          className={`flex-1 text-center py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            copilotView === "advisor"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Rascunho do Consultor
          </span>
        </button>
      </div>

      {/* VIEW 1: DIAGNOSTIC ASSISTANT */}
      {copilotView === "diagnose" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form Side */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Dados do Diagnóstico</h3>
              
              <form onSubmit={handleDiagnose} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição do Veículo *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Toyota RAV4 AWD 2018"
                    value={vehicleModel}
                    onChange={e => setVehicleModel(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Código de Falha OBD-II (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: P0300 ou deixe em branco"
                    value={obdCode}
                    onChange={e => setObdCode(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sintomas, Barulhos ou Falhas Relatadas *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Descreva falhas ao acelerar, cheiros, ruídos de suspensão ou luzes piscando..."
                    value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isDiagnosing}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-75"
                >
                  {isDiagnosing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Consultando Cérebro IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Rodar Análise por IA
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Presets and Sandbox Section */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cenários Prontos para Teste</h4>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                Carregue simulações comuns de oficina para testar a ferramenta instantaneamente.
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => { handleLoadPreset("misfire"); loadPresetResult("misfire"); }}
                  className="w-full text-left p-2.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200/60 text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                >
                  <span>1. Falha de Ignição / Cilindros (P0300)</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => { handleLoadPreset("overheating"); loadPresetResult("overheating"); }}
                  className="w-full text-left p-2.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200/60 text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                >
                  <span>2. Superaquecimento / Termostática (P0128)</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => { handleLoadPreset("sensors"); loadPresetResult("sensors"); }}
                  className="w-full text-left p-2.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200/60 text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                >
                  <span>3. Sonda Lambda / Consumo Alto (P0135)</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Report Display Side */}
          <div className="lg:col-span-7">
            
            {/* If loading and empty */}
            {isDiagnosing && (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 relative">
                  <Wrench className="h-6 w-6 animate-spin" />
                  <span className="absolute -top-1 -right-1 h-4.5 w-4.5 bg-indigo-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold animate-pulse">IA</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">Processando Base de Conhecimento de IA</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Correlacionando parâmetros mecânicos, mapeando códigos de erro e projetando procedimentos adequados de reparo...
                  </p>
                </div>
              </div>
            )}

            {/* Error handling with instructions & local load button */}
            {!diagnosticResult && !isDiagnosing && diagnoseError && (
              <div className="bg-amber-50/50 rounded-2xl border border-amber-200/60 p-6 space-y-4 text-xs text-amber-800">
                <div className="flex gap-2.5">
                  <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-900 text-sm">Processamento Remoto em Espera</h4>
                    <p className="leading-relaxed text-amber-800">
                      Não foi possível realizar a chamada de API. Isso geralmente ocorre quando a variável <strong>GEMINI_API_KEY</strong> de chaves secretas ainda não foi fornecida nas opções do sistema.
                    </p>
                    <p className="text-[11px] text-amber-700 font-medium">
                      Você pode inserir sua própria chave de forma segura no painel superior <strong>Secrets</strong> na interface do AI Studio.
                    </p>
                  </div>
                </div>

                <div className="border-t border-amber-200/40 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <span className="font-semibold text-amber-900 text-[11px]">Deseja rodar uma simulação offline imediata do preset mecânico?</span>
                  <button
                    onClick={() => loadPresetResult("misfire")}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer shadow-xs"
                  >
                    Simular Falha de Ignição
                  </button>
                </div>
              </div>
            )}

            {/* If empty and not loading */}
            {!diagnosticResult && !isDiagnosing && !diagnoseError && (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 h-[550px] flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800 text-sm">Aguardando Parâmetros de Diagnóstico</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Preencha o formulário à esquerda e clique em analisar, ou utilize um dos cenários prontos de teste rápido para gerar a ficha de manutenção.
                  </p>
                </div>
              </div>
            )}

            {/* Active Report Output */}
            {diagnosticResult && !isDiagnosing && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-5"
                id="ai-diagnostic-report-output"
              >
                {/* Header Title bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">Ficha Técnica de Diagnóstico por IA</span>
                    <h3 className="text-base font-bold text-slate-900 font-sans mt-0.5">{vehicleModel}</h3>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium">Gravidade:</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      diagnosticResult.severity === "High" 
                        ? "bg-rose-50 text-rose-700 border-rose-200" 
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {diagnosticResult.severity === "High" ? "Alta" : diagnosticResult.severity === "Medium" ? "Média" : "Baixa"}
                    </span>
                  </div>
                </div>

                {/* Summary box */}
                <div className="p-3.5 bg-indigo-50/20 border border-indigo-100/40 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                    Laudo e Hipótese de Diagnóstico
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed pl-5.5">
                    {diagnosticResult.summary}
                  </p>
                </div>

                {/* Possible Causes List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Causas Raiz Prováveis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {diagnosticResult.possibleCauses.map((cause, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-slate-150/80 bg-slate-50/50 space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase font-sans">CAUSA #0{idx+1}</span>
                        <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{cause.title}</h5>
                        <p className="text-[10px] text-slate-500 leading-normal line-clamp-3">{cause.description}</p>
                        <span className="text-[9px] font-bold text-indigo-600 block pt-1">{cause.urgency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Diagnostic Checklist */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Roteiro de Solução e Testes</h4>
                    <span className="text-[10px] text-slate-400 font-medium">Marque as etapas efetuadas</span>
                  </div>

                  <div className="space-y-2.5">
                    {diagnosticResult.diagnosticSteps.map((step, idx) => {
                      const isChecked = !!checkedSteps[idx];
                      return (
                        <div 
                          key={idx}
                          onClick={() => handleToggleStep(idx)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isChecked 
                              ? "bg-emerald-50/40 border-emerald-150 text-slate-500 line-through decoration-slate-300" 
                              : "bg-white border-slate-150 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {isChecked ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-400 font-bold font-mono">
                                {idx+1}
                              </div>
                            )}
                          </div>
                          <span className="leading-tight">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Estimated Parts & Time and Export Actions */}
                <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Tempo de Trabalho Estimado</p>
                    <p className="text-xs font-bold text-slate-800">{diagnosticResult.estimatedTime}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {diagnosticResult.suggestedParts.map((part, i) => (
                        <span key={i} className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={handleExportToQuote}
                      disabled={hasExported}
                      className={`flex-1 md:flex-initial text-xs font-semibold py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        hasExported 
                          ? "bg-slate-50 text-slate-400 border-slate-150" 
                          : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                      }`}
                      title="Exportar esta ficha técnica diretamente como orçamento"
                    >
                      <FolderPlus className="h-4 w-4" />
                      {hasExported ? "Orçamento Criado" : "Exportar Orçamento"}
                    </button>

                    <button
                      onClick={handleExportToIntake}
                      disabled={hasExported}
                      className="flex-1 md:flex-initial bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold py-2 px-3.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Wrench className="h-4 w-4" />
                      Adicionar ao Pátio
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: ADVISOR COMMUNICATION */}
      {copilotView === "advisor" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Inputs Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Gerador de Comunicados</h3>
            
            <form onSubmit={handleDraftMessage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Serviço Realizado *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Troca de Pastilhas de Freio"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status de Entrega / Veículo *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Pronto para retirada"
                    value={currentStatus}
                    onChange={e => setCurrentStatus(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tom de Comunicação</label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Professional">Profissional & Técnico (Padrão)</option>
                  <option value="Friendly">Amigável & Entusiasmado (Oficina Humana)</option>
                  <option value="Direct">Direto e Curto (Ideal para WhatsApp / SMS)</option>
                  <option value="Reassuring">Seguro & Tranquilizador (Alta Confiança)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detalhes Técnicos / Peças Trocadas</label>
                <textarea 
                  rows={5}
                  placeholder="Ex: Substituímos o sensor O2 primário. Velas novas calibradas com torque de 20Nm. Limpeza de erros da central realizada com sucesso."
                  value={serviceDetails}
                  onChange={e => setServiceDetails(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isDrafting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-75"
              >
                {isDrafting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando Rascunho do Comunicado...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    Gerar Mensagem para Cliente
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Outputs Card */}
          <div className="flex flex-col justify-between h-full space-y-4">
            
            {/* Display Draft */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex-1 flex flex-col justify-between min-h-[350px]">
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Quadro de Mensagens</h3>
                    <p className="text-[10px] text-slate-400">Pronto para copiar e colar nos canais de chat.</p>
                  </div>
                  
                  {communicationDraft && (
                    <button
                      onClick={handleCopyDraft}
                      className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[10px] font-semibold transition-all cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copiar Texto
                        </>
                      )}
                    </button>
                  )}
                </div>

                {draftError && (
                  <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg leading-relaxed">
                    {draftError}
                  </p>
                )}

                {communicationDraft ? (
                  <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl flex-1 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap select-text h-full overflow-y-auto">
                    {communicationDraft}
                  </div>
                ) : (
                  <div className="flex-1 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-xs text-slate-400 font-medium">Aguardando dados para elaboração.</p>
                    <p className="text-[10px] text-slate-400 max-w-xs mt-0.5">Clique em "Gerar Mensagem para Cliente" para visualizar o rascunho formatado.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Helper Tip */}
            <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-150/20 text-[11px] text-slate-600 leading-relaxed">
              <strong>Dica do Consultor:</strong> Enviar comunicados transparentes com detalhes técnicos mastigados aumenta a confiança do cliente, diminui em até 40% o número de ligações cobrando andamento e gera avaliações 5 estrelas pós-retirada.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
