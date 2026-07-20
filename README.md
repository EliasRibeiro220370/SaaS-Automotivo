# AutoFlow: Automotive CRM & AI Copilot SaaS Showcase

AutoFlow is a high-fidelity, full-stack Mini-SaaS showcase designed for modern automotive workshops, mechanics, detailing studios, and dealership repair bays. Built with a responsive React (Vite) frontend, Tailwind CSS, and an Express server integrated with the server-side `@google/genai` Gemini AI engine.

## 🌟 Key Functional Modules

1. **Operations Analytics Desk (Dashboard)**: High-level KPI meters tracking active work orders, settled revenue, low-stock spare parts, and interactive workshop activity feeds.
2. **Interactive Repair Pipeline (Kanban Board)**: Track and route vehicle statuses through standard repair stages (Receiving Intake, Diagnostics, Active Lift, Quality Audit, Ready for Pickup). Manage individual check sheets, repair notes, and target costs.
3. **AI-Powered Diagnostics Assistant**: Consult an AI expert powered by server-side Gemini 3.5 Flash. Supply vehicle symptoms and OBD-II codes to receive a detailed, structured diagnostic report with probable root causes, labor estimates, specific replacement parts, and actionable technician guides. Export AI estimates directly to quote sheets with one-click!
4. **AI Customer Advisor**: Draft polished, empathetic, or concise customer status updates with adjustable communication tones (Professional, Friendly, Urgent, Reassuring) to reduce back-and-forth client communication.
5. **Inventory Room Manager**: Manage active parts catalog stocks, supplier brands, shelf bin mapping, and wholesale markup margins with real-time stock deductions and safe-threshold alarms.
6. **Quote Estimate Builder**: Dynamically subtotal parts and hourly labor fees, automatically calculate state tax offsets, approve client estimates, and output professional print-ready customer invoices.

---

## 🛠️ Full-Stack Technical Stack

- **Frontend Core**: React 19, TypeScript, Vite
- **Animations & Routing**: Motion (f.k.a. Framer Motion) for staggered entries and fluid tab transitions.
- **Data Visualizations**: Recharts for interactive operational pipeline bar graphs.
- **Backend Core**: Node.js Express server to shield Gemini API calls securely.
- **AI Integration**: `@google/genai` TypeScript SDK executing server-side prompts.
- **Persistence**: `localStorage` cache synchronization to prevent data loss on browser refresh.

---

## 📂 Project Architecture

```
/
├── server.ts              # Full-Stack Express Server (API routes & static client serving)
├── package.json           # Application dependencies and build config scripts
├── .env.example           # Shared environment variable keys
├── index.html             # Main entry mounting point
├── src/
│   ├── App.tsx            # Main shell with desktop sidebars and responsive panels
│   ├── main.tsx           # React mounting entry
│   ├── index.css          # Tailwind imports, typography, and custom styles
│   ├── types/
│   │   └── index.ts       # Shared TypeScript schemas (WorkOrders, Parts, Quotes, etc.)
│   ├── contexts/
│   │   └── SaaSContext.tsx# State engine providing mock data and localStorage sync
│   ├── services/
│   │   └── api.ts         # Server-side API connectors for AI actions
│   └── pages/
│       ├── Dashboard.tsx  # Analytics charts and activity trackers
│       ├── RepairPipeline.tsx # Kanban job boards and mechanical check sheets
│       ├── AiCopilot.tsx  # AI diagnostics and service writer sheets
│       ├── InventoryHub.tsx# Part bins, safety margins, and restocking
│       └── QuoteGenerator.tsx # Billing line subtotals and printing previews
```

---

## 🚀 Running locally

### 1. Configure Secrets
Ensure you copy `.env.example` to `.env` and configure your API key:
```env
GEMINI_API_KEY="your_api_key_here"
```

### 2. Development Execution
Boots Express on Port 3000 alongside the active Vite development middleware:
```bash
npm run dev
```

### 3. Production Bundling & Build
Transpiles and bundles both the frontend static assets and the server-side entrypoint into a standalone `dist/server.cjs` via `esbuild`:
```bash
npm run build
npm start
```
