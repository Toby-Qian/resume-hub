"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore, normalizeMargin } from "@/lib/store";
import { templates } from "@/templates";
import { t } from "@/lib/i18n";
import { NotesLayer } from "./NotesLayer";
import { toast } from "@/lib/toast";
import { compressToDataURL } from "@/lib/imageCompress";

/** Parse `#rrggbb` / `#rgb` / `rgb(r, g, b)` into "r, g, b" — used so
 *  templates can build rgba(...) tints as a fallback for browsers without
 *  CSS color-mix support (Safari < 16.4). */
function accentToRgbTriplet(c: string): string {
  if (!c) return "37, 99, 235";
  const s = c.trim();
  // #rgb / #rrggbb
  if (s.startsWith("#")) {
    let h = s.slice(1);
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) return `${r}, ${g}, ${b}`;
    }
  }
  // rgb(...) / rgba(...)
  const m = s.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (m) return `${m[1]}, ${m[2]}, ${m[3]}`;
  return "37, 99, 235";
}

/** Mix the accent toward black by `pct` (0–1). Used for the dark hero band
 *  in dark-card; rgba can't darken (only lighten over white). */
function darkenHex(c: string, pct: number): string {
  const trip = accentToRgbTriplet(c).split(",").map((x) => parseInt(x, 10));
  if (trip.length !== 3) return c;
  const [r, g, b] = trip.map((v) => Math.max(0, Math.min(255, Math.round(v * (1 - pct)))));
  return `rgb(${r}, ${g}, ${b})`;
}

export function Preview() {
  const { resume, template, theme, lang, addNote, addImageNote, addShapeNote, pageSetup, setPageSetup, hiddenSections } = useStore();
  // Boolean "open the second-page canvas". Persisted PageSetups from the
  // earlier numeric `extraPages` field are migrated by treating any positive
  // value as "second page on". The field stays a number in storage so we
  // don't churn the persisted shape, but the UI is a clean on/off toggle —
  // capped at 1 so we never grow past 2 pages.
  const secondPage = (Number((pageSetup as any).extraPages) || 0) > 0;
  // Apply visibility toggles by zeroing hidden section arrays. Templates
  // already gate sections on `array.length > 0`, so this hides them
  // without per-template changes.
  const renderedResume = useMemo(() => {
    if (!hiddenSections || hiddenSections.length === 0) return resume;
    const r: any = { ...resume };
    for (const k of hiddenSections) r[k] = [];
    return r as typeof resume;
  }, [resume, hiddenSections]);
  const L = t(lang);
  const Tpl = templates[template];
  const imgRef = useRef<HTMLInputElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [zoom, setZoom] = useState(1); // 0.4 ~ 1.5
  const setZoomClamped = (z: number) => setZoom(Math.max(0.4, Math.min(1.5, z)));

  // ---- Page geometry (A4 / Letter) -------------------------------------
  const pageW = pageSetup.size === "Letter" ? 816 : 794;
  const pageH = pageSetup.size === "Letter" ? 1056 : 1123;
  const marginMM = normalizeMargin(pageSetup.margin);

  // ---- Inject @page rules via a managed <style> in <head> ---------------
  // Doing this in JSX as an inline <style> means React re-writes the rule
  // text on every re-render, which Edge's print engine occasionally trips
  // on (the print dialog can freeze if it opens mid-rewrite). Writing once
  // per setting change to a stable element in <head> avoids the race.
  useEffect(() => {
    const ID = "resume-page-style";
    let el = document.getElementById(ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = ID;
      document.head.appendChild(el);
    }
    // We render the user's margin as padding on .paper itself (so it shows
    // in the live preview and on the PDF identically). Therefore the
    // physical @page margin stays 0 to avoid double-counting.
    el.textContent =
      `@page { size: ${pageSetup.size === "Letter" ? "letter" : "A4"}; margin: 0; }`;
  }, [pageSetup.size]);

  // ---- Reset zoom + hide screen-only chrome during print ----------------
  // Edge / Chromium can stall in print preview when the source DOM has a
  // CSS `transform: scale()` on a paginated container. We snapshot the
  // current zoom, force 1.0 for the duration of printing, and restore
  // afterwards. Listeners are cheap and only fire around print events.
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    const savedZoomRef = { current: 1 };
    const onBefore = () => {
      savedZoomRef.current = zoom;
      setPrinting(true);
      setZoom(1);
    };
    const onAfter = () => {
      setPrinting(false);
      setZoom(savedZoomRef.current);
    };
    window.addEventListener("beforeprint", onBefore);
    window.addEventListener("afterprint", onAfter);
    return () => {
      window.removeEventListener("beforeprint", onBefore);
      window.removeEventListener("afterprint", onAfter);
    };
  }, [zoom]);

  const onPickImage = async (f: File) => {
    try {
      const dataUrl = await compressToDataURL(f);
      addImageNote(dataUrl);
      // Quietly let the user know if we compressed (helps debug "image looks soft").
      if (f.size > 700 * 1024) {
        toast.success((L.toast as any).imageCompressed ?? `已自动压缩图片 (${(f.size / 1024 / 1024).toFixed(1)} MB → 已优化)`);
      }
    } catch {
      toast.error(L.form.avatarTooLarge);
    }
  };

  // ---- Clipboard image paste anywhere on the paper ----------------------
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      // Don't intercept paste while the user is typing inside an editable.
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.isContentEditable || tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA")) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === "file" && it.type.startsWith("image/")) {
          const file = it.getAsFile();
          if (!file) continue;
          e.preventDefault();
          (async () => {
            try {
              const dataUrl = await compressToDataURL(file);
              addImageNote(dataUrl);
              toast.success((L.preview as any).pastedImage ?? "已粘贴图片");
            } catch {
              toast.error(L.form.avatarTooLarge);
            }
          })();
          return;
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addImageNote, L.form.avatarTooLarge, L.preview]);

  // After zoom or content change, sync the wrapper's height so that the
  // surrounding layout reserves space for the post-scale paper footprint
  // (CSS transform doesn't affect layout flow).
  const [paperHpx, setPaperHpx] = useState(pageH);
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    const measure = () => setPaperHpx(el.scrollHeight || el.offsetHeight || pageH);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [pageH]);
  // Pages required by the natural flow content. Capped at 2 (we don't show
  // a 3rd canvas — overflow past page 2 is a content-trim signal, not a UI
  // affordance to add infinite pages).
  const autoPages = Math.min(2, Math.max(1, Math.ceil(paperHpx / pageH)));
  // If the user opened page 2, force a 2-page minimum so the canvas always
  // shows it as available — even when the resume body fits in one page.
  const totalPages = secondPage ? 2 : autoPages;
  const forcedMinHeightPx = secondPage ? pageH * 2 : undefined;

  // ---- Ctrl+wheel zoom on the paper area --------------------------------
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      // deltaY > 0 = wheel down = zoom out
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      setZoom((z) => Math.max(0.4, Math.min(1.5, z * factor)));
    };
    // {passive:false} so we can preventDefault the page scroll.
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Ctrl+0 reset, Ctrl+= zoom in, Ctrl+- zoom out (when not editing text)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const tgt = e.target as HTMLElement | null;
      const editing = !!(tgt && (tgt.isContentEditable || tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA"));
      if (editing) return;
      if (e.key === "0") { e.preventDefault(); setZoom(1); }
      else if (e.key === "=" || e.key === "+") { e.preventDefault(); setZoomClamped(zoom * 1.1); }
      else if (e.key === "-") { e.preventDefault(); setZoomClamped(zoom / 1.1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  // ---- ? to toggle keyboard help, Esc to close --------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const editing = !!(tgt && (tgt.isContentEditable || tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA"));
      if (!editing && e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault(); setShowHelp((v) => !v); return;
      }
      if (e.key === "Escape" && showHelp) { e.preventDefault(); setShowHelp(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showHelp]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex items-center gap-1.5 no-print rounded-full bg-white border border-gray-200 shadow-sm px-2 py-1.5">
        <button
          type="button"
          onClick={addNote}
          className="text-xs px-3 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition flex items-center gap-1"
          title={(L.preview as any).addNoteHint ?? "在简历上添加一个自由文本框"}
        >
          <span className="text-amber-600">＋</span>
          {(L.preview as any).addNote ?? "文本框"}
        </button>
        <button
          type="button"
          onClick={() => imgRef.current?.click()}
          className="text-xs px-3 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition flex items-center gap-1"
          title={(L.preview as any).addImageHint ?? "在简历上插入一张图片（可拖动、缩放）"}
        >
          <span className="text-amber-600">＋</span>
          {(L.preview as any).addImage ?? "图片"}
        </button>
        <input ref={imgRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onPickImage(f); e.target.value = ""; }} />
        <button
          type="button"
          onClick={() => addShapeNote("line")}
          className="text-xs px-2 py-1 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
          title={(L.preview as any).addLineHint ?? "插入分隔线"}
        >─</button>
        <button
          type="button"
          onClick={() => addShapeNote("rect")}
          className="text-xs px-2 py-1 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
          title={(L.preview as any).addRectHint ?? "插入矩形"}
        >▭</button>
        <button
          type="button"
          onClick={() => addShapeNote("circle")}
          className="text-xs px-2 py-1 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
          title={(L.preview as any).addCircleHint ?? "插入圆"}
        >○</button>
        <span className="w-px h-4 bg-gray-200 mx-1" />
        <button type="button" onClick={() => setZoomClamped(zoom / 1.1)}
          className="text-xs w-6 h-6 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition flex items-center justify-center"
          title={(L.preview as any).zoomOutHint ?? "缩小 (Ctrl+-)"} aria-label="zoom out">−</button>
        <button type="button" onClick={() => setZoom(1)}
          className="text-[0.65rem] px-2 h-6 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition font-mono w-12 text-center"
          title={(L.preview as any).zoomResetHint ?? "重置 (Ctrl+0)"}>{Math.round(zoom * 100)}%</button>
        <button type="button" onClick={() => setZoomClamped(zoom * 1.1)}
          className="text-xs w-6 h-6 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition flex items-center justify-center"
          title={(L.preview as any).zoomInHint ?? "放大 (Ctrl++)"} aria-label="zoom in">+</button>
        <span className="w-px h-4 bg-gray-200 mx-1" />
        <span
          className="text-[0.65rem] px-2 h-6 rounded-full border border-gray-200 bg-gray-50 text-gray-600 font-mono flex items-center gap-1"
          title={(L.preview as any).pageCountHint ?? "当前页数（按 A4 / Letter 计算）"}
        >
          <span className="text-gray-400">📄</span>
          <span>
            {((L.preview as any).pages ?? "{m} 页").replace("{m}", String(totalPages))}
          </span>
        </span>
        {/* Single second-page toggle — capped at 2. Active styling makes the
            current state obvious at a glance. */}
        <button
          type="button"
          onClick={() => setPageSetup({ extraPages: secondPage ? 0 : 1 } as any)}
          className={`text-xs h-6 px-2.5 rounded-full border transition flex items-center gap-1.5 ${
            secondPage
              ? "border-blue-500 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
              : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
          title={
            secondPage
              ? ((L.preview as any).disableSecondPageHint ?? "关闭第 2 页画布")
              : ((L.preview as any).enableSecondPageHint ?? "启用第 2 页画布 — 内容超出第 1 页时自动流到第 2 页，也可往上面拖文本框/图片/形状")
          }
          aria-pressed={secondPage}
        >
          {secondPage ? <span>✓</span> : <span className="text-blue-600">＋</span>}
          <span>
            {secondPage
              ? ((L.preview as any).secondPageOn ?? "第 2 页已启用")
              : ((L.preview as any).enableSecondPage ?? "启用第 2 页")}
          </span>
        </button>
        <span className="w-px h-4 bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          className="text-xs w-6 h-6 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition flex items-center justify-center"
          title={(L.preview as any).helpHint ?? "查看快捷键 (?)"}
          aria-label="show shortcuts"
        >
          ?
        </button>
      </div>
      <div
        ref={wrapRef}
        className="paper-zoom-wrap"
        style={{
          width: pageW * zoom,
          height: paperHpx * zoom,
        }}
      >
        <div
          ref={paperRef}
          className={`paper paper-flow print-area density-${theme.density} ${pageSetup.size === "Letter" ? "paper-letter" : ""}`}
          style={{
            ["--resume-accent" as any]: theme.accent,
            // Companion variables exposed to templates so they can build
            // tints/shades that work even when color-mix() is unavailable.
            ["--resume-accent-rgb" as any]: accentToRgbTriplet(theme.accent),
            ["--resume-accent-dark" as any]: darkenHex(theme.accent, 0.35),
            ["--resume-font-sans" as any]: theme.fontSans,
            ["--resume-font-serif" as any]: theme.fontSerif,
            ["--resume-font-scale" as any]: String(theme.fontScale),
            ["--resume-page-margin" as any]: `${marginMM}mm`,
            // Defaults guard against persisted themes that pre-date these
            // tokens being added (zustand persist won't auto-merge new fields).
            ["--resume-line-height" as any]: String(theme.lineHeight ?? 1.55),
            ["--resume-bullet" as any]:
              (theme.bulletStyle ?? "disc") === "dash" ? '"\\2014 \\00A0"' /* em dash + nbsp */
              : (theme.bulletStyle ?? "disc") === "none" ? '""'
              : (theme.bulletStyle ?? "disc") === "square" ? '"\\25A0\\00A0"' /* ■ */
              : (theme.bulletStyle ?? "disc") === "circle" ? '"\\25CB\\00A0"' /* ○ */
              : '"\\2022\\00A0"', /* • */
            ["--resume-bullet-indent" as any]:
              (theme.bulletStyle ?? "disc") === "none" ? "0" : "1.25em",
            // Independent bullet colour (falls back to the accent so legacy
            // resumes look identical until the user sets one explicitly).
            ["--resume-bullet-color" as any]: theme.bulletColor ?? theme.accent,
            ...(forcedMinHeightPx ? { minHeight: forcedMinHeightPx } : null),
            fontFamily: "var(--resume-font-sans)",
            padding: marginMM > 0 ? `${marginMM}mm` : undefined,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          <Tpl resume={renderedResume} />
          <NotesLayer />
          {/* Page break indicators (screen only). Skipped entirely during
              print so Edge's print engine doesn't traverse them. We also
              cap to 20 page-break ribbons just in case `paperHpx` ever
              gets stuck very large.                                      */}
          {!printing && (
            <>
              <div className="page-break-overlay" style={{ top: 0 }} aria-hidden>
                <span className="page-break-label page-break-label--page1">
                  {(L.preview as any).pageLabel?.replace("{n}", "1").replace("{m}", String(totalPages)) ?? `Page 1 / ${totalPages}`}
                </span>
              </div>
              {Array.from({ length: Math.min(20, Math.max(0, totalPages - 1)) }).map((_, i) => (
                <div
                  key={i}
                  className="page-break-overlay"
                  style={{ top: pageH * (i + 1) }}
                  aria-hidden
                >
                  <span className="page-break-label">
                    {(L.preview as any).pageLabel?.replace("{n}", String(i + 2)).replace("{m}", String(totalPages)) ?? `Page ${i + 2} / ${totalPages}`}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Print-only running footer (page numbers + name/email).
          Lives outside the .paper so position:fixed repeats per page.       */}
      {(pageSetup.showPageNumbers || pageSetup.showFooter) && (
        <div className="print-footer" aria-hidden>
          {pageSetup.showFooter && (
            <>
              {resume.basics.name && <span className="pf-name">{resume.basics.name}</span>}
              {resume.basics.email && <><span className="pf-sep">·</span><span>{resume.basics.email}</span></>}
              {pageSetup.showPageNumbers && <span className="pf-sep">·</span>}
            </>
          )}
          {pageSetup.showPageNumbers && <span className="pf-pages" />}
        </div>
      )}

      {/* @page rules are injected once via useEffect to <head> (see above)
          to avoid Edge's print preview hanging on JSX-driven re-injection. */}
      <div className="text-[0.7rem] text-gray-400 mt-2 mb-4 px-4 text-center max-w-[794px] no-print space-y-0.5">
        <div>{(L.preview as any).editHint ?? "点击任意文字即可在预览中直接编辑；悬停文本区块左侧可拖动整段位置"}</div>
        <div>{(L.preview as any).noteHint ?? "文本框 / 图片：点击选中，拖动或 Alt+拖移动，方向键微移，Delete 删除，Ctrl+D 复制"}</div>
        <div>{(L.preview as any).pasteHint ?? "Ctrl+V 直接粘贴剪贴板里的图片到画布；按 ? 查看全部快捷键"}</div>
        <div>{L.preview.pageHint}</div>
      </div>
      {showHelp && <HelpOverlay lang={lang} onClose={() => setShowHelp(false)} />}
    </div>
  );
}

function HelpOverlay({ lang, onClose }: { lang: "zh" | "en"; onClose: () => void }) {
  const zh = lang === "zh";
  const rows: Array<{ keys: string; desc: string; group?: string }> = [
    { group: zh ? "全局" : "Global",     keys: "Ctrl+Z",        desc: zh ? "撤销" : "Undo" },
    { group: zh ? "全局" : "Global",     keys: "Ctrl+Shift+Z",  desc: zh ? "重做" : "Redo" },
    { group: zh ? "全局" : "Global",     keys: "Ctrl+V",        desc: zh ? "粘贴剪贴板里的图片到简历画布" : "Paste image from clipboard onto the paper" },
    { group: zh ? "全局" : "Global",     keys: "Ctrl + 滚轮",   desc: zh ? "缩放预览画布（40% – 150%）" : "Zoom the preview canvas (40% – 150%)" },
    { group: zh ? "全局" : "Global",     keys: "Ctrl+0",        desc: zh ? "重置缩放为 100%" : "Reset zoom to 100%" },
    { group: zh ? "全局" : "Global",     keys: "Ctrl++ / Ctrl+-", desc: zh ? "放大 / 缩小" : "Zoom in / out" },
    { group: zh ? "全局" : "Global",     keys: "?",             desc: zh ? "显示 / 隐藏此面板" : "Toggle this panel" },
    { group: zh ? "全局" : "Global",     keys: "Esc",           desc: zh ? "关闭面板" : "Close this panel" },
    { group: zh ? "编辑器" : "Editor",   keys: zh ? "拖动 ⋮⋮" : "Drag ⋮⋮", desc: zh ? "调整工作 / 教育 / 项目等条目顺序" : "Reorder Work / Education / Projects entries" },
    { group: zh ? "选中文本框/图片" : "When a note is selected", keys: "拖动 / Drag", desc: zh ? "移动（自动吸附其它元素与页面中线，按 Shift 暂时不吸附）" : "Move with smart snapping (hold Shift to disable snap)" },
    { group: zh ? "选中文本框/图片" : "When a note is selected", keys: "Alt+拖动 / Alt+drag", desc: zh ? "在文本框正文上也能拖动" : "Drag from inside a text body" },
    { group: zh ? "选中文本框/图片" : "When a note is selected", keys: "↑ ↓ ← →",     desc: zh ? "微移 1px（按住 Shift 改为 10px）" : "Nudge 1px (Shift = 10px)" },
    { group: zh ? "选中文本框/图片" : "When a note is selected", keys: "Delete",       desc: zh ? "删除当前选中" : "Delete selected note" },
    { group: zh ? "选中文本框/图片" : "When a note is selected", keys: "Ctrl+D",       desc: zh ? "复制一份" : "Duplicate" },
    { group: zh ? "选中文本框/图片" : "When a note is selected", keys: "L",           desc: zh ? "锁定 / 解锁（锁定后不会被误拖）" : "Lock / unlock (locked notes ignore drag)" },
  ];

  // Group rows
  const groups: Record<string, typeof rows> = {};
  for (const r of rows) {
    const g = r.group || "";
    (groups[g] = groups[g] || []).push(r);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm no-print"
         onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-[92%] p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-base font-semibold text-gray-800">
            {zh ? "键盘快捷键" : "Keyboard shortcuts"}
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100"
            aria-label="close">×</button>
        </div>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {Object.entries(groups).map(([g, items]) => (
            <div key={g}>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">{g}</div>
              <ul className="space-y-1">
                {items.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs">
                    <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-700 whitespace-nowrap shrink-0">
                      {r.keys}
                    </kbd>
                    <span className="text-gray-700 leading-relaxed">{r.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
