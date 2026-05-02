"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "@/lib/toast";
import { validateAndNormalize } from "@/lib/validateResume";
import { jsonResumeToResume, isJsonResumeNative } from "@/lib/jsonresume";

/** Window-level drag-and-drop overlay for importing resume JSON files.
 *  Listens on `document` so the user can drop anywhere on the page; renders
 *  a full-screen translucent overlay only while a file is actually being
 *  dragged in. Reuses the same import pipeline as Toolbar / EmptyState
 *  (auto-detects native JSON Resume vs Resume Hub schema).               */
export function FileDropZone() {
  const { lang, setResume } = useStore();
  const L = t(lang);
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Track nested dragenter/leave events with a counter — child elements fire
    // their own enter/leave as the cursor moves around, which would otherwise
    // make the overlay flicker. Only the outermost transition matters.
    let depth = 0;

    const containsFile = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes("Files");

    const onEnter = (e: DragEvent) => {
      if (!containsFile(e)) return;
      depth++;
      if (depth === 1) setActive(true);
    };
    const onLeave = (e: DragEvent) => {
      if (!containsFile(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setActive(false);
    };
    const onOver = (e: DragEvent) => {
      // preventDefault is required to allow `drop` to fire later.
      if (containsFile(e)) e.preventDefault();
    };
    const onDrop = async (e: DragEvent) => {
      if (!containsFile(e)) return;
      e.preventDefault();
      depth = 0;
      setActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      // Accept .json or any text/json mime — be generous since OSes vary.
      if (!/\.json$/i.test(file.name) && !/json/i.test(file.type)) {
        toast.error(L.toast.importError ?? "Invalid JSON");
        return;
      }
      try {
        const obj = JSON.parse(await file.text());
        const resume = isJsonResumeNative(obj)
          ? jsonResumeToResume(obj)
          : validateAndNormalize(obj);
        setResume(resume);
        toast.success(L.toast.imported ?? "Imported");
      } catch {
        toast.error(L.toast.importError ?? "Invalid JSON");
      }
    };

    document.addEventListener("dragenter", onEnter);
    document.addEventListener("dragleave", onLeave);
    document.addEventListener("dragover", onOver);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("dragenter", onEnter);
      document.removeEventListener("dragleave", onLeave);
      document.removeEventListener("dragover", onOver);
      document.removeEventListener("drop", onDrop);
    };
  }, [L, setResume]);

  if (!active) return null;
  return (
    <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center bg-blue-500/10 backdrop-blur-sm">
      <div className="rounded-2xl border-2 border-dashed border-blue-500 bg-white/95 px-8 py-6 shadow-2xl text-center">
        <div className="text-3xl mb-2">📥</div>
        <div className="text-sm font-semibold text-gray-800">
          {L.dropzone?.title ?? "松开即可导入 JSON"}
        </div>
        <div className="text-[0.7rem] text-gray-500 mt-1">
          {L.dropzone?.sub ?? "支持本应用导出的 JSON · 也支持 jsonresume.org 原生格式"}
        </div>
      </div>
    </div>
  );
}
