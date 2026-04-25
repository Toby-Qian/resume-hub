"use client";
import { useRef, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { ExportMenu } from "./ExportMenu";
import { Completeness } from "./Completeness";
import { ConfirmModal } from "./ConfirmModal";

export function Toolbar() {
  const { lang, setLang, loadSample, reset, resume, setResume, undo, redo, past, future } = useStore();
  const L = t(lang);
  const fileRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl+Y redo — but only when the
  // event is NOT originating from a contentEditable / input (so typing Ctrl+Z
  // inside a field still works as native browser undo there).
  // Ctrl/Cmd+S: ALWAYS export to PDF (preventDefault swallows the browser's
  // "save page as" dialog even while a field is focused — that's the expected
  // behavior for a resume editor).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "s") { e.preventDefault(); window.print(); return; }
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.isContentEditable || tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA")) return;
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
  const [resetOpen, setResetOpen] = useState(false);
  const doReset = () => {
    reset();
    toast.info(L.toast.reset);
  };
  const onLoadSample = () => {
    loadSample(lang);
    toast.success(L.toast.sampleLoaded);
  };

  const Btn = ({ onClick, children, primary, icon }: any) => (
    <button onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
        primary
          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-sm"
          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"}`}>
      {icon && <span className="text-[0.85em] opacity-80">{icon}</span>}
      {children}
    </button>
  );

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return (
    <div className="space-y-2 no-print">
    <Completeness />
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden mr-1">
        <button onClick={undo} disabled={!canUndo}
          title={`${(L.actions as any).undo ?? "撤销"} (Ctrl+Z)`}
          className={`text-xs px-2 py-1.5 transition ${canUndo ? "text-gray-700 hover:bg-gray-50" : "text-gray-300 cursor-not-allowed"}`}>
          ↶
        </button>
        <span className="w-px h-4 bg-gray-200" />
        <button onClick={redo} disabled={!canRedo}
          title={`${(L.actions as any).redo ?? "重做"} (Ctrl+Shift+Z)`}
          className={`text-xs px-2 py-1.5 transition ${canRedo ? "text-gray-700 hover:bg-gray-50" : "text-gray-300 cursor-not-allowed"}`}>
          ↷
        </button>
      </div>
      <Btn onClick={onLoadSample} icon="✨">{L.actions.loadSample}</Btn>
      <Btn onClick={() => fileRef.current?.click()} icon="↑">{L.actions.importJson}</Btn>
      <Btn onClick={onExport} icon="↓">{L.actions.exportJson}</Btn>
      <Btn onClick={() => setResetOpen(true)} icon="✕">{L.actions.reset}</Btn>
      <ExportMenu />
      <div className="ml-auto inline-flex items-center bg-gray-100 rounded-lg p-0.5">
        <button onClick={() => setLang("zh")}
          className={`text-xs px-2.5 py-1 rounded-md transition-all ${lang === "zh" ? "bg-white text-gray-900 shadow-sm font-medium" : "text-gray-500 hover:text-gray-900"}`}>中</button>
        <button onClick={() => setLang("en")}
          className={`text-xs px-2.5 py-1 rounded-md transition-all ${lang === "en" ? "bg-white text-gray-900 shadow-sm font-medium" : "text-gray-500 hover:text-gray-900"}`}>EN</button>
      </div>
      <input ref={fileRef} type="file" accept="application/json" className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImport(f);
          e.target.value = "";
        }} />
    </div>
    <ConfirmModal
      open={resetOpen}
      title={(L.actions as any).reset ?? "清空"}
      message={(L.form as any).confirmReset}
      confirmLabel={(L.actions as any).reset ?? "清空"}
      cancelLabel={(L.form as any).cancel ?? "取消"}
      tone="danger"
      onConfirm={doReset}
      onClose={() => setResetOpen(false)}
    />
    </div>
  );
}
