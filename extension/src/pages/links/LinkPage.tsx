import { useEffect, useState } from 'react';
import { FileText, Link2, Save, Loader2 } from "lucide-react";

interface TabStatus {
  type: "idle" | "loading" | "success" | "error";
  message: string;
}

export default function LinkPage() {
  const [title, setTitle] = useState(() => {
    if (typeof chrome !== "undefined" && chrome.tabs) return "";
    return "Como Organizar Sua Rotina Diária Efetivamente";
  });

  const [url, setUrl] = useState(() => {
    if (typeof chrome !== "undefined" && chrome.tabs) return "";
    return "https://exemplo.com/produtividade-pessoal";
  });

  const [categoryName, setCategoryName] = useState("Geral");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<TabStatus>({
    type: "idle",
    message: "",
  });

  const USER_ID = "a3b84f2c-1234-5678-abcd-ef1234567890";
  const API_URL = `http://localhost:8080/api/users/${USER_ID}/links`;

  const isQuickNote = url.trim() === "";
  const globalCategories = ["Geral", "Trabalho", "Estudos", "Ideias", "Lazer"];

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab && tab.id) {
          if (tab.title) setTitle(tab.title);
          if (tab.url) setUrl(tab.url);

          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              return document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null;
            }
          }, (results) => {
            if (results && results[0]?.result) {
              setImageUrl(results[0].result);
            }
          });
        }
      });
    }
  }, []);

  const handleSave = async () => {
    if (!isQuickNote && !url.trim()) {
      setStatus({ type: "error", message: "A URL é obrigatória no modo captura." });
      return;
    }
    if (isQuickNote && !title.trim() && !notes.trim()) {
      setStatus({ type: "error", message: "Insira um título ou anotação para a nota." });
      return;
    }

    setStatus({ type: "loading", message: "Salvando no Peak..." });

    const payload = {
      title: title.trim() || "Nota Rápida sem Título",
      url: isQuickNote ? null : url.trim(),
      categoryName,
      imageUrl,
      notes: notes.trim() ? [notes.trim()] : ["Salvo via Novely Saver"],
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus({
          type: "success",
          message: isQuickNote ? "✓ Nota salva na Inbox!" : "✓ Link salvo com sucesso",
        });
        setNotes("");
        if (isQuickNote) setTitle("");
      } else {
        setStatus({ type: "error", message: `Erro da API (${response.status}).` });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Servidor offline ou erro de rede." });
    }
  };

  return (
    <div className="flex flex-col h-full justify-between gap-3 text-slate-200">
      
      {/* CARD DA PÁGINA ATUAL / MODO */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-inner">
        <div className="flex items-center justify-between ">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            {isQuickNote ? "Texto Livre" : "Metadados da Aba"}
          </p>
          <div className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium transition-colors ${
            isQuickNote ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
          }`}>
            {isQuickNote ? <FileText size={10} /> : <Link2 size={10} />}
            {isQuickNote ? "Nota Rápida" : "Modo Link"}
          </div>
        </div>
        
        <input 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do link ou da nota..."
          className="w-full bg-transparent font-semibold text-sm text-slate-100 outline-none border-b border-transparent focus:border-slate-700 pb-1 text-ellipsis"
        />

        <input 
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Sem URL (Salvando como Nota de Inbox)..."
          className="w-full bg-transparent text-[11px] text-slate-400 truncate mt-1.5 outline-none font-mono border-b border-transparent focus:border-slate-800 pb-0.5"
        />
      </div>
      
      {/* FORMULÁRIO DE ENTRADA */}
      <div className="flex-1 space-y-3">
        {/* SELEÇÃO DE CATEGORIA */}
        <div>
          <label className="text-[11px] font-medium text-slate-400 mb-1 block">
            Categoria Selecionada: <span className="text-purple-400 font-semibold">{categoryName}</span>
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {globalCategories.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setCategoryName(tag)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                  categoryName === tag
                    ? "bg-purple-600/20 border-purple-500 text-purple-300 font-medium"
                    : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-400"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* ANOTAÇÕES */}
        <div className="flex flex-col flex-1">
          <label className="text-[11px] font-medium text-slate-400 mb-1 block">
            Anotações / Contexto
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione um comentário ou insight importante..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs outline-none resize-none transition text-slate-200"
          />
        </div>
      </div>

      {/* FOOTER DA PÁGINA (STATUS + SUBMIT) */}
      <div className="pt-1">
        {status.message && (
          <div
            className={`text-center rounded-xl px-3 py-2 text-xs border transition-all ${
              status.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : status.type === "error"
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            {status.message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={status.type === "loading"}
          className="mt-2 w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 font-semibold text-xs shadow-md shadow-purple-900/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer text-white"
        >
          {status.type === "loading" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {status.type === "loading" ? "Salvando..." : "Salvar no Peak"}
        </button>
      </div>

    </div>
  );
}