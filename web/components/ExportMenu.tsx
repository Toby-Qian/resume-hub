"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStore, PageSize } from "@/lib/store";
import { t } from "@/lib/i18n";
import { printResume } from "@/lib/printResume";
import { downloadMarkdown } from "@/lib/exportMarkdown";
import { toast } from "@/lib/toast";

/** A4 / Letter dropdown for the print/export action.
 *  - Click "导出 PDF" → fires window.print() with current setup.
 *  - Click the chevron → opens an options popover (rendered via portal so
 *    the editor pane's `overflow-y-auto` doesn't clip it).                  */
export function ExportMenu() {
  const { lang, pageSetup, setPageSetup, resume } = useStore();
  const doPrint = () => printResume(resume);
  const L = t(lang);
  const E = L.exportMenu ?? {};
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Pin popover under the toggle button. Recompute on scroll / resize while
  // open so the panel stays glued even as the layout shifts behind it.
  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return;
    const reposition = () => {
      const r = wrapRef.current!.getBoundingClientRect();
      const W = 320; // popover width (w-80) — keep in sync with className below
      const margin = 8;
      // Anchor right edge to button right edge by default; clamp into viewport
      // so narrow windows don't push the dialog off-screen on either side.
      let left = r.right - W;
      const maxLeft = window.innerWidth - W - margin;
      const minLeft = margin;
      if (left > maxLeft) left = maxLeft;
      if (left < minLeft) left = minLeft;
      setCoords({ top: r.bottom + 6, left });
    };
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (popRef.current?.contains(t)) return;
      setOpen(false);
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

  const popover = open && coords && typeof document !== "undefined" ? createPortal(
    <div
      ref={popRef}
      style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 100 }}
      className="popover-pop w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-3.5 text-xs"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="font-semibold text-gray-700 text-[11px] uppercase tracking-wider">
          {E.title ?? "导出设置"}
        </div>
        <button onClick={() => setOpen(false)}
          className="text-gray-300 hover:text-gray-600 text-base leading-none px-1"
          aria-label="close">×</button>
      </div>

      {/* Page size */}
      <div className="mb-3">
        <div className="text-gray-500 mb-1.5">{E.pageSize ?? "纸张大小"}</div>
        <div className="grid grid-cols-2 gap-1.5">
          {sizes.map((s) => (
            <button key={s.id}
              onClick={() => setPageSetup({ size: s.id })}
              className={`px-2.5 py-1.5 rounded-md border text-left transition ${
                pageSetup.size === s.id
                  ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                  : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Margin moved to the right-side Style panel */}
      <div className="mb-3 px-2.5 py-2 rounded-md bg-blue-50/50 border border-blue-100/70 text-[0.7rem] text-blue-800/80 leading-relaxed">
        💡 {E.marginMoved ?? "页边距已移到右侧「样式 → 页边距」面板，调整时实时预览。"}
      </div>

      {/* Toggles */}
      <label className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-gray-50 rounded px-1">
        <span className="text-gray-700">{E.pageNumbers ?? "显示页码"}</span>
        <input type="checkbox" checked={pageSetup.showPageNumbers}
          onChange={(e) => setPageSetup({ showPageNumbers: e.target.checked })}
          className="w-3.5 h-3.5 accent-blue-600" />
      </label>
      <label className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-gray-50 rounded px-1">
        <span className="text-gray-700">{E.footer ?? "页脚显示姓名+邮箱"}</span>
        <input type="checkbox" checked={pageSetup.showFooter}
          onChange={(e) => setPageSetup({ showFooter: e.target.checked })}
          className="w-3.5 h-3.5 accent-blue-600" />
      </label>

      <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400 leading-relaxed">
        {E.tip ?? "提示：在打印对话框里把「页边距」设为「无」、勾选「背景图形」可获得最佳还原效果。"}
      </div>

      <button
        onClick={() => { setOpen(false); doPrint(); }}
        className="mt-3 w-full text-xs px-3 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-sm"
      >
        {L.actions.print}
      </button>
      {/* Markdown export — useful for backups, sharing in PRs / READMEs. */}
      <button
        onClick={() => {
          setOpen(false);
          downloadMarkdown(resume, lang);
          toast.success(L.toast.markdownExported ?? "Markdown downloaded");
        }}
        className="mt-1.5 w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-1.5"
        title={E.markdownHint ?? "导出为 Markdown 文件（备份 / README / 粘贴到其它工具）"}
      >
        <span className="text-[0.85em] opacity-80">📝</span>
        {L.actions.exportMarkdown ?? "导出 Markdown"}
      </button>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div ref={wrapRef} className="relative inline-flex">
        <button
          onClick={doPrint}
          className="text-xs px-3 py-1.5 rounded-l-lg border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {L.actions.print}
        </button>
        <button
          onClick={() => setOpen((v) => !v)}
          title={E.options ?? "导出选项"}
          aria-label="export options"
          className={`text-xs px-2 py-1.5 rounded-r-lg border border-l-0 transition ${
            open
              ? "border-blue-700 bg-blue-700 text-white"
              : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          ▾
        </button>
      </div>
      {popover}
    </>
  );
}
