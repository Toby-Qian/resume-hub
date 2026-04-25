"use client";
import { useRef } from "react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "@/lib/toast";

/** Shown at the top of the Editor pane when the resume is essentially
 *  blank (no name + no items in any section). Three CTAs, plus a hint
 *  pointing to the gallery tab.                                         */
export function EmptyState() {
  const { resume, lang, loadSample, setResume } = useStore();
  const L = t(lang);
  const E = (L as any).empty ?? {};
  const fileRef = useRef<HTMLInputElement>(null);

  const isEmpty =
    !resume.basics.name?.trim() &&
    resume.work.length === 0 &&
    resume.education.length === 0 &&
    resume.projects.length === 0 &&
    resume.skills.length === 0 &&
    resume.awards.length === 0 &&
    resume.languages.length === 0;

  if (!isEmpty) return null;

  const onImport = async (f: File) => {
    try {
      const obj = JSON.parse(await f.text());
      if (!obj || typeof obj !== "object" || !("basics" in obj)) throw new Error("invalid");
      setResume(obj);
      toast.success(L.toast.imported);
    } catch {
      toast.error(L.toast.importError);
    }
  };

  return (
    <div className="mb-4 p-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center text-white text-sm shadow-sm">
          ✨
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-800">
            {E.title ?? "从这里开始"}
          </div>
          <div className="text-[0.7rem] text-gray-500">
            {E.sub ?? "选一个起点 — 也可以直接在下方填写"}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        <button
          onClick={() => { loadSample(lang); toast.success(L.toast.sampleLoaded); }}
          className="text-left px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-2.5"
        >
          <span className="text-base">📋</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-800">
              {E.loadSample ?? "加载示例数据"}
            </div>
            <div className="text-[0.65rem] text-gray-400">
              {E.loadSampleSub ?? "用一份完整简历做参考"}
            </div>
          </div>
          <span className="text-gray-300 text-xs">→</span>
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="text-left px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-2.5"
        >
          <span className="text-base">📥</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-800">
              {E.importJson ?? "导入 JSON"}
            </div>
            <div className="text-[0.65rem] text-gray-400">
              {E.importJsonSub ?? "JSON Resume 规范 / 之前导出的文件"}
            </div>
          </div>
          <span className="text-gray-300 text-xs">→</span>
        </button>
        <div className="text-[0.7rem] text-gray-500 mt-1 px-1">
          {E.galleryHint ?? "或在顶部「模板画廊」浏览 500+ GitHub 模板"}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImport(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
