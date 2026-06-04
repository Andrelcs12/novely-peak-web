import { useEffect, useState } from "react";
import { Check, Flame, Loader2, Sparkles } from "lucide-react";

// 1. Tipagem espelhando o modelo de dados do seu backend para Hábitos
interface HabitResponse {
  id: string; // UUID
  userId: string;
  name: string;
  streak: number; // Histórico de consistência computado (dias seguidos)
  completedToday: boolean; // Estado binário para o dia atual
}

interface TabStatus {
  type: "idle" | "loading" | "success" | "error";
  message: string;
}

export default function HabitosPage() {
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [status, setStatus] = useState<TabStatus>({ type: "idle", message: "" });
  const [loadingHabits, setLoadingHabits] = useState(true);

  // ID e Base URL idênticos ao ecossistema do Novely
  const USER_ID = "a3b84f2c-1234-5678-abcd-ef1234567890";
  const API_BASE_URL = "http://localhost:8080/api/habits";

  // GET - Sincronização de Entrada: Recupera o checklist de hábitos do usuário
  useEffect(() => {
    async function fetchHabits() {
      try {
        const response = await fetch(`${API_BASE_URL}/user/${USER_ID}`);
        if (!response.ok) throw new Error();
        const data: HabitResponse[] = await response.json();
        setHabits(data);
      } catch (err) {
        console.error(err);
        // Fallback idêntico para desenvolvimento no localhost fora da extensão do Chrome
        if (typeof chrome === "undefined" || !chrome.tabs) {
          setHabits([
            { id: "h1", userId: USER_ID, name: "Deep Work (Mínimo 4h)", streak: 12, completedToday: true },
            { id: "h2", userId: USER_ID, name: "Treinar na Academia (Gym)", streak: 5, completedToday: false },
            { id: "h3", userId: USER_ID, name: "Estudo de Idiomas (Francês)", streak: 0, completedToday: false },
          ]);
        } else {
          setStatus({ type: "error", message: "Não foi possível carregar seus hábitos." });
        }
      } finally {
        setLoadingHabits(false);
      }
    }
    fetchHabits();
  }, []);

  // POST/PATCH Toggle - Interação Binária Otimista
  const handleToggleHabit = async (id: string, currentCompleted: boolean, currentStreak: number) => {
    const nextCompleted = !currentCompleted;
    
    // Cálculo local do streak para feedback visual instantâneo
    const nextStreak = nextCompleted 
      ? currentStreak + 1 
      : Math.max(0, currentStreak - 1);

    // 1. Atualização Otimista na Interface
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completedToday: nextCompleted, streak: nextStreak } : h))
    );
    setStatus({ type: "idle", message: "" });

    try {
      // Dispara o evento para a API computar o histórico de consistência no PostgreSQL
      // Usando o padrão de PATCH para alteração parcial de estado (/api/habits/{id}/toggle)
      const response = await fetch(`${API_BASE_URL}/${id}/toggle?userId=${USER_ID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error();
      
      // Opcional: Atualizar com o dado real retornado pelo servidor (caso o servidor altere o streak diferentemente)
      const updatedHabit: HabitResponse = await response.json();
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? updatedHabit : h))
      );
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Erro ao sincronizar hábito. Revertendo..." });
      
      // 2. Reversão Imediata em caso de falha de rede/servidor
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, completedToday: currentCompleted, streak: currentStreak } : h))
      );
    }
  };

  return (
    <div className="flex flex-col h-full justify-between gap-3 text-slate-200">
      
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        {/* SUB-CABEÇALHO */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Sparkles size={13} className="text-violet-500" />
            CONSISTÊNCIA DIÁRIA
          </div>
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono font-bold">
            {habits.filter(h => h.completedToday).length}/{habits.length} feitos
          </span>
        </div>

        {/* LISTAGEM COM ROLAGEM ISOLADA */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
          {loadingHabits ? (
            <div className="h-28 flex items-center justify-center text-slate-500 gap-2 text-xs">
              <Loader2 size={14} className="animate-spin" />
              Buscando rotinas no Postgres...
            </div>
          ) : habits.length === 0 ? (
            <div className="h-28 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-900 rounded-xl">
              <span className="text-lg mb-1">⚡</span>
              <p className="text-xs text-slate-400 font-medium">Nenhum hábito ativo.</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Configure suas rotinas no painel web do Novely.</p>
            </div>
          ) : (
            habits.map((habit) => {
              const isDone = habit.completedToday;
              return (
                <div
                  key={habit.id}
                  onClick={() => handleToggleHabit(habit.id, habit.completedToday, habit.streak)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isDone
                      ? "bg-emerald-950/10 border-emerald-500/20 text-slate-300"
                      : "bg-slate-900 border-slate-800/80 text-slate-200 hover:border-slate-700 hover:bg-slate-900/80"
                  }`}
                >
                  {/* Lado Esquerdo: Info do Hábito */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div 
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all flex-shrink-0 ${
                        isDone 
                          ? "bg-emerald-500 border-emerald-400 text-slate-950 scale-100" 
                          : "border-slate-700 bg-slate-950/40"
                      }`}
                    >
                      {isDone && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span className={`text-xs font-medium truncate pr-2 ${isDone ? "text-emerald-400/90" : ""}`}>
                      {habit.name}
                    </span>
                  </div>

                  {/* Lado Direito: Streak Counter (Contador de fogo) */}
                  <div 
                    className={`flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                      habit.streak > 0
                        ? isDone
                          ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                          : "bg-slate-950/60 border-slate-800 text-orange-500/70"
                        : "bg-slate-950/20 border-transparent text-slate-600"
                    }`}
                  >
                    <Flame size={11} className={habit.streak > 0 ? "animate-pulse" : ""} />
                    {habit.streak}d
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FEEDBACK DE ERRO */}
      {status.message && (
        <div
          className={`text-center rounded-xl px-3 py-1.5 text-[11px] border transition-all ${
            status.type === "error"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
              : "bg-slate-900 border-slate-800 text-slate-400"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}