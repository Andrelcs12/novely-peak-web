import { useEffect, useState, useCallback } from "react";
import { Play, Square, RotateCcw, Timer, Bell, Loader2, Coffee } from "lucide-react";

// 1. Tipagem estrita para o estado do Timer
interface TimerState {
  timeLeft: number; // Em segundos
  isRunning: boolean;
  mode: "FOCUS" | "BREAK";
  sessionsCompleted: number;
}

interface ChromeMessage {
  type: string;
  state: TimerState;
}

export default function PomodoroPage() {
  const [timer, setTimer] = useState<TimerState>({
    timeLeft: 25 * 60,
    isRunning: false,
    mode: "FOCUS",
    sessionsCompleted: 0,
  });
  const [isSyncing, setIsSyncing] = useState(true);

  const USER_ID = "a3b84f2c-1234-5678-abcd-ef1234567890";

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 2. Sincronização Assíncrona para evitar Cascading Renders
  const updateFromBackground = useCallback(() => {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: "GET_TIMER_STATUS" }, (response: TimerState | undefined) => {
        if (response) {
          setTimer(response);
        }
        setIsSyncing(false);
      });
    } else {
      // Força a execução assíncrona no ambiente local para evitar o loop de setState síncrono no Effect
      setTimeout(() => {
        setIsSyncing(false);
      }, 0);
    }
  }, []);

  useEffect(() => {
    updateFromBackground();

    const listener = (message: ChromeMessage) => {
      if (message.type === "TIMER_TICK" && message.state) {
        setTimer(message.state);
      }
    };

    const hasChromeMessaging = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage;

    if (hasChromeMessaging) {
      chrome.runtime.onMessage.addListener(listener);
    }

    // O retorno da limpeza agora fica na raiz do Effect, sempre retornando uma função válida
    return () => {
      if (hasChromeMessaging) {
        chrome.runtime.onMessage.removeListener(listener);
      }
    };
  }, [updateFromBackground]);

  // 3. Comandos para o Background Script / Worker
  const sendTimerCommand = (command: "START" | "STOP" | "RESET") => {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: `TIMER_${command}`, userId: USER_ID });
    } else {
      // Simulador Local para Dev (Vite Localhost)
      if (command === "START") setTimer(p => ({ ...p, isRunning: true }));
      if (command === "STOP" || command === "RESET") setTimer(p => ({ ...p, isRunning: false, timeLeft: 25 * 60 }));
      console.warn(`[Novely Dev] Comando ${command} interceptado localmente.`);
    }
  };

  const totalTime = timer.mode === "FOCUS" ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timer.timeLeft) / totalTime) * 100;

  return (
    <div className="flex flex-col h-full justify-between gap-4 text-slate-200">
      
      <div className="flex flex-col gap-6 flex-1 items-center justify-center relative">
        {/* SUB-CABEÇALHO */}
        <div className="flex items-center justify-between w-full border-b border-slate-900 pb-2 absolute top-0 px-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Timer size={13} className="text-violet-500" />
            {timer.mode === "FOCUS" ? "MODO FOCO" : "DESCANSO"}
          </div>
          <div className="flex items-center gap-1 text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
            <Bell size={10} className="text-emerald-500" />
            NOTIFICAÇÕES ON
          </div>
        </div>

        {/* VISUALIZADOR DO TIMER */}
        <div className="relative flex items-center justify-center mt-12">
          <svg className="w-44 h-44 transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="80"
              stroke="currentColor"
              strokeWidth="5"
              fill="transparent"
              className="text-slate-900"
            />
            <circle
              cx="88"
              cy="88"
              r="80"
              stroke="currentColor"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={502.6}
              strokeDashoffset={502.6 - (502.6 * progress) / 100}
              className={`${timer.mode === "FOCUS" ? "text-violet-500" : "text-emerald-500"} transition-all duration-1000 ease-linear`}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute flex flex-col items-center justify-center">
            {isSyncing ? (
              <Loader2 size={28} className="text-slate-700 animate-spin" />
            ) : (
              <>
                <span className="text-4xl font-mono font-bold tracking-tighter text-slate-100">
                  {formatTime(timer.timeLeft)}
                </span>
                <span className="text-[9px] font-bold text-slate-500 mt-0.5 uppercase tracking-widest">
                  {timer.isRunning ? "Em curso" : "Pausado"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* CONTROLES */}
        <div className="flex items-center gap-4 mt-1">
          <button
            onClick={() => sendTimerCommand("RESET")}
            className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition-all active:scale-90 cursor-pointer"
            title="Reiniciar"
          >
            <RotateCcw size={16} />
          </button>

          {!timer.isRunning ? (
            <button
              onClick={() => sendTimerCommand("START")}
              className="w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-900/20 hover:bg-violet-500 transition-all active:scale-95 cursor-pointer"
            >
              <Play size={24} fill="currentColor" className="ml-0.5" />
            </button>
          ) : (
            <button
              onClick={() => sendTimerCommand("STOP")}
              className="w-14 h-14 rounded-full bg-slate-100 text-slate-950 flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-95 cursor-pointer"
            >
              <Square size={20} fill="currentColor" />
            </button>
          )}

          <div className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-700 cursor-not-allowed">
            <Coffee size={16} />
          </div>
        </div>
      </div>

      {/* FOOTER STATS */}
      <div className="bg-slate-950/50 border border-slate-900 rounded-xl p-2.5 flex justify-around">
        <div className="text-center">
          <p className="text-[9px] text-slate-500 uppercase font-bold">Sessões hoje</p>
          <p className="text-xs font-mono text-violet-400">{timer.sessionsCompleted}</p>
        </div>
        <div className="w-px bg-slate-900"></div>
        <div className="text-center">
          <p className="text-[9px] text-slate-500 uppercase font-bold">Total Focado</p>
          <p className="text-xs font-mono text-slate-300">{timer.sessionsCompleted * 25} min</p>
        </div>
      </div>
    </div>
  );
}