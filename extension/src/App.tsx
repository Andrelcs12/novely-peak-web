import { useState } from "react";
import { Link2, CheckSquare, Droplets, Timer } from "lucide-react";
import LinkPage from "./pages/links/LinkPage";
import TarefasPage from "./pages/tasks/TarefasPage";
import HabitosPage from "./pages/habits/HabitosPage";
import PomodoroPage from "./pages/pomodoro/PomodoroPage";

type TabType = "link" | "tarefas" | "habitos" | "foco";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("link");

  // Roteamento dinâmico por Estado (SPA Context)
  const renderPage = () => {
    switch (activeTab) {
      case "link":
        return <LinkPage />;
      case "tarefas":
        return <TarefasPage />;
      case "habitos":
        return <HabitosPage />;
      case "foco":
        return <PomodoroPage />;
      default:
        return <LinkPage />;
    }
  };

  return (
    <div className="w-[360px] h-[480px] bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden">
      
      {/* CABEÇALHO ESTÁTICO DE STATUS */}
      <div className="p-4 bg-slate-900/40 border-b border-slate-900/80 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Caixa do Logo com Roxo Sólido da Identidade */}
          <div
            className="rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/30 border border-purple-500/20"
            style={{ width: 36, height: 36, flexShrink: 0 }}
          >
            <img
              src="/logo.png"
              alt="Novely"
              style={{ width: 20, height: 20, objectFit: "contain", display: "block" }}
            />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-slate-100 uppercase">Novely Saver</h1>
            <p className="text-[10px] text-slate-400 font-medium">Um clique, controle total</p>
          </div>
        </div>
        <div className="text-[9px] px-2 py-0.5 rounded-md border border-slate-800 bg-slate-900 text-slate-500 font-mono font-bold">
          v1.0.0
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO ROLÁVEL ISOLADA */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-950 custom-scrollbar">
        {renderPage()}
      </div>

      {/* BARRA DE NAVEGAÇÃO INFERIOR FIXA */}
      <div className="h-14 bg-slate-900/90 border-t border-slate-900 grid grid-cols-4 items-center justify-items-center px-1 backdrop-blur-sm">
        
        {/* ABA: link */}
        <button
          onClick={() => setActiveTab("link")}
          className={`flex flex-col items-center justify-center w-full h-full transition-all gap-1 cursor-pointer active:scale-95 ${
            activeTab === "link" 
              ? "text-purple-400 font-semibold drop-shadow-[0_0_6px_rgba(147,51,234,0.4)]" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Link2 size={16} strokeWidth={activeTab === "link" ? 2.5 : 2} />
          <span className="text-[9px] tracking-wide">Links</span>
        </button>

        {/* ABA: TAREFAS */}
        <button
          onClick={() => setActiveTab("tarefas")}
          className={`flex flex-col items-center justify-center w-full h-full transition-all gap-1 cursor-pointer active:scale-95 ${
            activeTab === "tarefas" 
              ? "text-purple-400 font-semibold drop-shadow-[0_0_6px_rgba(147,51,234,0.4)]" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <CheckSquare size={16} strokeWidth={activeTab === "tarefas" ? 2.5 : 2} />
          <span className="text-[9px] tracking-wide">Tarefas</span>
        </button>

        {/* ABA: HÁBITOS */}
        <button
          onClick={() => setActiveTab("habitos")}
          className={`flex flex-col items-center justify-center w-full h-full transition-all gap-1 cursor-pointer active:scale-95 ${
            activeTab === "habitos" 
              ? "text-purple-400 font-semibold drop-shadow-[0_0_6px_rgba(147,51,234,0.4)]" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Droplets size={16} strokeWidth={activeTab === "habitos" ? 2.5 : 2} />
          <span className="text-[9px] tracking-wide">Hábitos</span>
        </button>

        {/* ABA: FOCO */}
        <button
          onClick={() => setActiveTab("foco")}
          className={`flex flex-col items-center justify-center w-full h-full transition-all gap-1 cursor-pointer active:scale-95 ${
            activeTab === "foco" 
              ? "text-purple-400 font-semibold drop-shadow-[0_0_6px_rgba(147,51,234,0.4)]" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Timer size={16} strokeWidth={activeTab === "foco" ? 2.5 : 2} />
          <span className="text-[9px] tracking-wide">Foco</span>
        </button>
      </div>

    </div>
  );
}

export default App;