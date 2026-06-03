import { useEffect, useState } from "react";

interface TabStatus {
  type: "idle" | "loading" | "success" | "error";
  message: string;
}

function App() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [categoryName, setCategoryName] = useState("Dev");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<TabStatus>({
    type: "idle",
    message: "",
  });

  const USER_ID = "a3b84f2c-1234-5678-abcd-ef1234567890";
  const API_URL = `http://localhost:8080/api/users/${USER_ID}/links`;

  useEffect(() => {
    if (chrome?.tabs) {
      chrome.tabs.query(
        { active: true, currentWindow: true },
        (tabs) => {
          const tab = tabs[0];
          if (tab?.title) setTitle(tab.title);
          if (tab?.url) setUrl(tab.url);
        }
      );
    }
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !url.trim()) {
      setStatus({ type: "error", message: "Título e URL são obrigatórios." });
      return;
    }

    setStatus({ type: "loading", message: "Salvando no Peak..." });

    const payload = {
      title,
      url,
      categoryName,
      notes: notes ? [notes] : ["Salvo via Novely Saver"],
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus({ type: "success", message: "✓ Link salvo com sucesso" });
        setNotes("");
      } else {
        setStatus({ type: "error", message: "Erro ao salvar o link." });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Servidor offline." });
    }
  };

  return (
    <div className="w-[390px] min-h-[580px] bg-slate-950 text-white p-5 font-sans">

      {/* CABEÇALHO */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">

          <div
            className="rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/40"
            style={{ width: 44, height: 44, flexShrink: 0 }}
          >
            <img
              src="/logoback.png"
              alt="Novely"
              style={{ width: 24, height: 24, objectFit: "contain", display: "block" }}
            />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Novely Saver
            </h1>
            <p className="text-xs text-slate-400">
              Capture links instantaneamente
            </p>
          </div>
        </div>

        <div className="text-[10px] px-2 py-1 rounded-full border border-slate-800 text-slate-500">
          v1.0
        </div>
      </div>

      {/* PRÉVIA DA PÁGINA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 mb-5">
        <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">
          Página Atual
        </p>
        <h2 className="text-sm font-semibold text-slate-100 line-clamp-2">
          {title || "Carregando..."}
        </h2>
        <p className="text-[11px] text-slate-500 truncate mt-2">
          {url}
        </p>
      </div>

      {/* FORMULÁRIO */}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">
            Categoria
          </label>
          <input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-3 text-sm outline-none transition"
            placeholder="Ex: Backend"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">
            Anotações
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Por que você está salvando isso?"
            className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-3 text-sm outline-none resize-none transition"
          />
        </div>

        {/* ETIQUETAS */}
        <div className="flex gap-2 flex-wrap">
          {["Dev", "Frontend", "Backend", "UI", "Inspiração"].map((tag) => (
            <button
              key={tag}
              onClick={() => setCategoryName(tag)}
              className={`px-3 py-1.5 rounded-full border text-xs transition ${
                categoryName === tag
                  ? "bg-violet-600/20 border-violet-500 text-violet-300"
                  : "bg-slate-900 border-slate-800 hover:border-violet-500 text-slate-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* STATUS */}
      {status.message && (
        <div
          className={`mt-5 rounded-xl px-4 py-3 text-sm border ${
            status.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : status.type === "error"
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-slate-900 border-slate-800 text-slate-400"
          }`}
        >
          {status.message}
        </div>
      )}

      {/* BOTÃO */}
      <button
        onClick={handleSave}
        disabled={status.type === "loading"}
        className="mt-5 w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50 font-semibold text-sm shadow-xl shadow-violet-900/40 transition-all active:scale-[0.98]"
      >
        {status.type === "loading" ? "Salvando..." : "Salvar no Peak"}
      </button>
    </div>
  );
}

export default App;