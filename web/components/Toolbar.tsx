"use client";
import { useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "@/lib/toast";

export function Toolbar() {
  const { lang, setLang, loadSample, reset, resume, setResume, undo, redo, past, future } = useStore();
  const L = t(lang);
  const fileRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl+Y redo — but only when the
  // event is NOT originating from a contentEditable / input (so typing Ctrl+Z
  // inside a field still works as native browser undo there).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.isContentEditable || tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) { e.preventDefault(); useStore.getState().undo(); }
      else if ((k === "z" && e.shiftKey) || k === "y") { e.preventDefault(); useStore.getState().redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onImport = async (f: File) => {
    try {
      const obj = JSON.parse(await f.text());
      if (!obj || typeof obj !== "object" || !("basics" in obj)) {
        throw new Error("Not a resume JSON");
      }
      setResume(obj);
      toast.success(L.toast.imported);
    } catch {
      toast.error(L.toast.importError);
    }
  };
  const onExport = () => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${resume.basics.name || "resume"}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(L.toast.exported);
  };
  const onReset = () => {
    if (confirm(L.form.confirmReset)) {
      reset();
      toast.info(L.toast.reset);
    }
  };
  const onLoadSample = () => {
    loadSample(lang);
    toast.success(L.toast.sampleLoaded);
  };

  const Btn = ({ onClick, children, primary }: any) => (
    <button onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded border transition ${
        primary ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-white border-gray-300 hover:bg-gray-50"}`}>
      {children}
    </button>
  );

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
      <div className="flex items-center gap-1 mr-1">
        <button onClick={undo} disabled={!canUndo}
          title={`${(L.actions as any).undo ?? "撤销"} (Ctrl+Z)`}
          className={`text-xs px-2 py-1.5 rounded border transition ${canUndo ? "bg-white border-gray-300 hover:bg-gray-50" : "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"}`}>
          ↶
        </button>
        <button onClick={redo} disabled={!canRedo}
          title={`${(L.actions as any).redo ?? "重做"} (Ctrl+Shift+Z)`}
          className={`text-xs px-2 py-1.5 rounded border transition ${canRedo ? "bg-white border-gray-300 hover:bg-gray-50" : "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"}`}>
          ↷
        </button>
      </div>
      <Btn onClick={onLoadSample}>{L.actions.loadSample}</Btn>
      <Btn onClick={onReset}>{L.actions.reset}</Btn>
      <Btn onClick={() => fileRef.current?.click()}>{L.actions.importJson}</Btn>
      <Btn onClick={onExport}>{L.actions.exportJson}</Btn>
      <Btn onClick={() => window.print()} primary>{L.actions.print}</Btn>
      <div className="ml-auto flex items-center gap-1">
        <button onClick={() => setLang("zh")}
          className={`text-xs px-2 py-1 rounded ${lang === "zh" ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"}`}>中</button>
        <button onClick={() => setLang("en")}
          className={`text-xs px-2 py-1 rounded ${lang === "en" ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"}`}>EN</button>
      </div>
      <input ref={fileRef} type="file" accept="application/json" className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImport(f);
          e.target.value = "";
        }} />
    </div>
  );
}
