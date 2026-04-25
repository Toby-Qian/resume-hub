"use client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { templates } from "@/templates";
import { t } from "@/lib/i18n";
import { NotesLayer } from "./NotesLayer";
import { toast } from "@/lib/toast";

export function Preview() {
  const { resume, template, theme, lang, addNote, addImageNote } = useStore();
  const L = t(lang);
  const Tpl = templates[template];
  const imgRef = useRef<HTMLInputElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [zoom, setZoom] = useState(1); // 0.4 ~ 1.5
  const setZoomClamped = (z: number) => setZoom(Math.max(0.4, Math.min(1.5, z)));

  const onPickImage = async (f: File) => {
    if (f.size > 800 * 1024) { toast.error(L.form.avatarTooLarge); return; }
    const reader = new FileReader();
    reader.onload = () => addImageNote(reader.result as string);
    reader.readAsDataURL(f);
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
          if (file.size > 800 * 1024) {
            toast.error(L.form.avatarTooLarge);
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            addImageNote(reader.result as string);
            toast.success((L.preview as any).pastedImage ?? "已粘贴图片");
          };
          reader.readAsDataURL(file);
          e.preventDefault();
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
  const [paperH, setPaperH] = useState(1123);
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPaperH(el.scrollHeight || el.offsetHeight || 1123));
    ro.observe(el);
    setPaperH(el.scrollHeight || el.offsetHeight || 1123);
    return () => ro.disconnect();
  }, []);

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
          width: 794 * zoom,
          height: paperH * zoom,
        }}
      >
        <div
          ref={paperRef}
          className={`paper paper-flow print-area density-${theme.density}`}
          style={{
            ["--resume-accent" as any]: theme.accent,
            ["--resume-font-sans" as any]: theme.fontSans,
            ["--resume-font-serif" as any]: theme.fontSerif,
            ["--resume-font-scale" as any]: String(theme.fontScale),
            fontFamily: "var(--resume-font-sans)",
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          <Tpl resume={resume} />
          <NotesLayer />
        </div>
      </div>
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
