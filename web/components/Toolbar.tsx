"use client";
import { useRef } from "react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "@/lib/toast";

export function Toolbar() {
  const { lang, setLang, loadSample, reset, resume, setResume } = useStore();
  const L = t(lang);
  const fileRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
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
