"use client";
import { useEffect, useRef, useState } from "react";
import { useStore, PageSize, normalizeMargin } from "@/lib/store";
import { t } from "@/lib/i18n";

/** A4 / Letter dropdown for the print/export action.
 *  - Click "导出 PDF" → fires window.print() with current setup.
 *  - Click the chevron → opens an options popover.                            */
export function ExportMenu() {
  const { lang, pageSetup, setPageSetup } = useStore();
  const L = t(lang);
  const E = (L as any).exportMenu ?? {};
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const sizes: { id: PageSize; label: string }[] = [
    { id: "A4", label: "A4 · 210×297mm" },
    { id: "Letter", label: "Letter · 8.5×11in" },
  ];
  const marginPresets: { mm: number; label: string }[] = [
    { mm: 0,  label: E.marginNone   ?? "无" },
    { mm: 10, label: E.marginNarrow ?? "窄" },
    { mm: 15, label: E.marginNormal ?? "中" },
    { mm: 20, label: E.marginWide   ?? "宽" },
  ];
  const currentMargin = normalizeMargin(pageSetup.margin);
  const setMargin = (mm: number) =>
    setPageSetup({ margin: Math.max(0, Math.min(30, Math.round(mm))) });

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        onClick={() => window.print()}
        className="text-xs px-3 py-1.5 rounded-l border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        {L.actions.print}
      </button>
      <button
        onClick={() => setOpen((v) => !v)}
        title={E.options ?? "导出选项"}
        aria-label="export options"
        className={`text-xs px-2 py-1.5 rounded-r border border-l-0 transition ${
          open
            ? "border-blue-700 bg-blue-700 text-white"
            : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        ▾
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-40 p-3 text-xs"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="font-semibold text-gray-700 text-[11px] uppercase tracking-wider mb-1.5">
            {E.title ?? "导出设置"}
          </div>

          {/* Page size */}
          <div className="mb-3">
            <div className="text-gray-500 mb-1">{E.pageSize ?? "纸张大小"}</div>
            <div className="grid grid-cols-2 gap-1">
              {sizes.map((s) => (
                <button key={s.id}
                  onClick={() => setPageSetup({ size: s.id })}
                  className={`px-2 py-1.5 rounded border text-left transition ${
                    pageSetup.size === s.id
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Margin — preset chips + numeric input + slider */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="text-gray-500">{E.margin ?? "页边距"}</div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={1}
                  value={currentMargin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-12 text-center text-[0.7rem] border border-gray-200 rounded px-1 py-0.5 font-mono focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-[0.65rem] text-gray-400 font-mono">mm</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={currentMargin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full accent-blue-600 mb-1.5"
            />
            <div className="flex gap-1">
              {marginPresets.map((m) => (
                <button key={m.mm}
                  onClick={() => setMargin(m.mm)}
                  className={`flex-1 px-1 py-1 rounded border text-[0.7rem] transition ${
                    currentMargin === m.mm
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:bg-gray-50 text-gray-600"
                  }`}
                  title={`${m.mm}mm`}
                >
                  {m.label}
                  <span className="ml-1 text-[0.6rem] text-gray-400 font-mono">{m.mm}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <label className="flex items-center justify-between py-1.5 cursor-pointer">
            <span className="text-gray-700">{E.pageNumbers ?? "显示页码"}</span>
            <input type="checkbox" checked={pageSetup.showPageNumbers}
              onChange={(e) => setPageSetup({ showPageNumbers: e.target.checked })}
              className="w-3.5 h-3.5 accent-blue-600" />
          </label>
          <label className="flex items-center justify-between py-1.5 cursor-pointer border-t border-gray-100">
            <span className="text-gray-700">{E.footer ?? "页脚显示姓名+邮箱"}</span>
            <input type="checkbox" checked={pageSetup.showFooter}
              onChange={(e) => setPageSetup({ showFooter: e.target.checked })}
              className="w-3.5 h-3.5 accent-blue-600" />
          </label>

          <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400 leading-relaxed">
            {E.tip ?? "提示：在打印对话框里把「页边距」设为「无」、勾选「背景图形」可获得最佳还原效果。"}
          </div>

          <button
            onClick={() => { setOpen(false); window.print(); }}
            className="mt-2.5 w-full text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {L.actions.print}
          </button>
        </div>
      )}
    </div>
  );
}
