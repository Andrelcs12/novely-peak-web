import { useEffect, useState } from "react";
import { Plus, CheckSquare, Square, Loader2, Calendar } from "lucide-react";

// 1. Tipagem espelhando exatamente os Records do seu ResponseTaskDTO
interface TaskResponse {
  id: string; // UUID manipulado como string no front
  userId: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "DONE";
  links: string[] | null;
  dueDate: string | null; // ISO String
}

interface TabStatus {
  type: "idle" | "loading" | "success" | "error";
  message: string;
}

export default function TarefasPage() {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [status, setStatus] = useState<TabStatus>({ type: "idle", message: "" });
  const [loadingTasks, setLoadingTasks] = useState(true);

  // ID exatamente igual ao mockado no microsserviço
  const USER_ID = "a3b84f2c-1234-5678-abcd-ef1234567890";
  
  // URLs corrigidas para bater com as rotas reais do seu @RestController
  const API_BASE_URL = "http://localhost:8080/api/tasks";

  const isQuickNote = newTaskTitle.trim() === "";

  // GET - Busca as tarefas do usuário usando a rota real do seu controller
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch(`${API_BASE_URL}/user/${USER_ID}`);
        if (!response.ok) throw new Error();
        const data: TaskResponse[] = await response.json();

        // Regra do MVP: Filtrar no front-end para mostrar apenas o que vence hoje ou pendentes
        const hoje = new Date().toISOString().split("T")[0];
        const tarefasDeHoje = data.filter(task => {
          if (!task.dueDate) return true; // Se não tiver data, fica no backlog de hoje
          return task.dueDate.startsWith(hoje) || task.status === "PENDING";
        });

        setTasks(tarefasDeHoje);
      } catch (err) {
        console.error(err);
        if (typeof chrome === "undefined" || !chrome.tabs) {
          // Fallback idêntico ao seu modelo de dados para você não travar testando no localhost:5173
          setTasks([
            { id: "1", userId: USER_ID, title: "Review na Controller do Spring Boot", description: null, priority: "HIGH", status: "PENDING", links: null, dueDate: null },
            { id: "2", userId: USER_ID, title: "Mapear endpoints do Pomodoro", description: null, priority: "MEDIUM", status: "DONE", links: null, dueDate: null },
          ]);
        } else {
          setStatus({ type: "error", message: "Não foi possível carregar o backlog de hoje." });
        }
      } finally {
        setLoadingTasks(false);
      }
    }
    fetchTasks();
  }, []);

  // POST - Inserção Expressa alinhada com o RequestTaskDTO e o @RequestParam UUID userId
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isQuickNote) return;

    const originalTitle = newTaskTitle.trim();
    setNewTaskTitle(""); 
    setStatus({ type: "idle", message: "" });

    // Payload idêntico ao seu RequestTaskDTO Record
    const payload = {
      title: originalTitle,
      description: "Criado rapidamente via Novely Saver Extension",
      priority: "MEDIUM", // Padrão da model
      status: "PENDING",  // Começa como pendente
      links: [],
      dueDate: new Date().toISOString(), // Agenda para o momento atual do clique
      subtasks: []
    };

    try {
      // Passando o userId via RequestParam como a sua assinatura exige: @RequestParam UUID userId
      const response = await fetch(`${API_BASE_URL}?userId=${USER_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error();

      const createdTask: TaskResponse = await response.json();
      setTasks((prev) => [createdTask, ...prev]); 
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Falha ao criar tarefa na API." });
      setNewTaskTitle(originalTitle); 
    }
  };

  // PUT - Atualização Otimista mapeada para o seu endpoint @PutMapping("/{id}")
  const handleToggleTask = async (id: string, currentStatus: "PENDING" | "DONE") => {
    const nextStatus = currentStatus === "PENDING" ? "DONE" : "PENDING";

    const targetTask = tasks.find(t => t.id === id);
    if (!targetTask) return;

    // Atualização Otimista na Interface
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    const putPayload = {
      title: targetTask.title,
      description: targetTask.description,
      priority: targetTask.priority,
      status: nextStatus,
      links: targetTask.links || [],
      dueDate: targetTask.dueDate,
      subtasks: []
    };

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(putPayload),
      });

      if (!response.ok) throw new Error();
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Erro de sincronização. Revertendo..." });
      
      // Reversão imediata se o servidor der erro ou recusar
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: currentStatus } : t))
      );
    }
  };

  return (
    <div className="flex flex-col h-full justify-between gap-3 text-slate-200">
      
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        {/* SUB-CABEÇALHO */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Calendar size={13} className="text-purple-500" />
            FOCO DIÁRIO
          </div>
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono font-bold">
            {tasks.filter(t => t.status === "DONE").length}/{tasks.length} prontas
          </span>
        </div>

        {/* INSERÇÃO EXPRESSA */}
        <form onSubmit={handleAddTask} className="relative flex items-center">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Nova tarefa para hoje... (Enter)"
            className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl pl-3 pr-10 py-2.5 text-xs outline-none transition text-slate-100 placeholder-slate-500 shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 p-1.5 rounded-lg bg-slate-800 border border-slate-700/50 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            <Plus size={13} />
          </button>
        </form>

        {/* LISTAGEM COM ROLAGEM ISOLADA */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
          {loadingTasks ? (
            <div className="h-28 flex items-center justify-center text-slate-500 gap-2 text-xs">
              <Loader2 size={14} className="animate-spin text-purple-500" />
              Conectando na API Java...
            </div>
          ) : tasks.length === 0 ? (
            <div className="h-28 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-900 rounded-xl">
              <span className="text-lg mb-1">🎯</span>
              <p className="text-xs text-slate-400 font-medium">Nenhuma tarefa listada.</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Digite e dê Enter para salvar no Postgres.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const isDone = task.status === "DONE";
              return (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id, task.status)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isDone
                      ? "bg-slate-950/40 border-slate-900/60 text-slate-500"
                      : "bg-slate-900 border-slate-800/80 text-slate-200 hover:border-purple-900 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex-shrink-0 transition-transform active:scale-95">
                    {isDone ? (
                      <CheckSquare size={15} className="text-emerald-500" />
                    ) : (
                      <Square size={15} className="text-slate-500" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium truncate break-all transition-all ${
                      isDone ? "line-through text-slate-600 decoration-slate-700" : ""
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FEEDBACK DE STATUS / ERRO */}
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