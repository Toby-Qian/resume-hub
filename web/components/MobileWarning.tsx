"use client";
import { useEffect, useState } from "react";

/**
 * Soft mobile-warning modal. The editor is genuinely unusable on phones —
 * the three-pane layout, drag-to-position notes, and PDF print dialog all
 * fall apart on touch + small screens. Rather than try to make it work,
 * we surface a friendly "open this on a desktop" notice on first visit
 * (and any time the viewport drops below the cutoff again).
 *
 * Behaviours:
 *  - Triggers when window width < 900px OR a coarse pointer is reported
 *    (so iPad-in-landscape, which is wider than 900 but still touch-only,
 *    sees the prompt too).
 *  - User can dismiss for the current session (sessionStorage key).
 *  - If the user explicitly opted to "use anyway", we skip the prompt for
 *    the rest of the session but still flag the body with a class so we
 *    can layer in any mobile-specific style nudges later.
 *  - SSR-safe: only mounts after the first effect, so Next.js's static
 *    export doesn't trip on `window`.
 */
const STORAGE_KEY = "proj4-resume:mobile-prompt-dismissed";

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  const narrow = window.innerWidth < 900;
  const coarse = typeof window.matchMedia === "function"
    ? window.matchMedia("(pointer: coarse)").matches
    : false;
  return narrow || coarse;
}

export function MobileWarning() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"zh" | "en">("zh");

  useEffect(() => {
    // Pick a language guess from the persisted store (without importing it,
    // to keep this component independent — it has to render before zustand
    // hydrates, otherwise SSR markup mismatches).
    try {
      const raw = localStorage.getItem("proj4-resume");
      if (raw) {
        const parsed = JSON.parse(raw);
        const l = parsed?.state?.lang;
        if (l === "en" || l === "zh") setLang(l);
      } else if (navigator.language && /^en/i.test(navigator.language)) {
        setLang("en");
      }
    } catch { /* localStorage may be blocked — fall through to default */ }

    if (sessionStorage.getItem(STORAGE_KEY)) return;
    if (isMobileViewport()) setOpen(true);

    const onResize = () => {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      if (isMobileViewport()) setOpen(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!open) return null;

  const dismiss = (remember: boolean) => {
    if (remember) sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const T = lang === "en" ? {
    title: "Best on a desktop",
    body: "This résumé editor uses a three-pane layout with drag-to-arrange and PDF print — all of which work poorly on phones. We recommend opening this site on a laptop or desktop browser instead.",
    bullet1: "🖱️ Drag, snap-to-align, and multi-select need a real cursor",
    bullet2: "📄 The PDF export uses the browser's print dialog (limited on mobile)",
    bullet3: "👁️ The A4 / Letter preview is too wide to read on a phone",
    later: "Continue anyway",
    dismiss: "Got it, don't show again",
    sub: "💡 Tip: copy the URL and open it on a computer — your data stays on this device, so anything you started will sync over via JSON export only.",
  } : {
    title: "建议用电脑打开",
    body: "这是一个三栏布局的简历编辑器，需要拖拽排版和浏览器打印对话框来导出 PDF — 这些在手机上体验都不好。建议你换到笔记本或台式机的浏览器打开本网站。",
    bullet1: "🖱️ 拖动 / 吸附对齐 / 多选都需要真正的鼠标",
    bullet2: "📄 PDF 导出走浏览器打印对话框，移动端能力有限",
    bullet3: "👁️ A4 / Letter 预览在手机屏幕上太宽，看不全",
    later: "我先看看",
    dismiss: "知道了，本次不再提醒",
    sub: "💡 小贴士：复制网址到电脑浏览器打开 — 数据只存在本机，电脑上是空白的，可以用「导出 JSON」把手机上填的搬过去。",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-warning-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.55)", backdropFilter: "blur(4px)" }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-3xl mb-1" aria-hidden>💻</div>
          <h2 id="mobile-warning-title" className="text-lg font-bold text-gray-900">
            {T.title}
          </h2>
        </div>
        <div className="px-5 py-4 space-y-3 text-[0.92rem] text-gray-700">
          <p>{T.body}</p>
          <ul className="space-y-1 text-[0.88rem] text-gray-600 pl-1">
            <li>{T.bullet1}</li>
            <li>{T.bullet2}</li>
            <li>{T.bullet3}</li>
          </ul>
          <p className="text-[0.82rem] text-gray-500 bg-gray-50 rounded-md p-2">{T.sub}</p>
        </div>
        <div className="px-5 py-3 border-t bg-gray-50 flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => dismiss(false)}
            className="px-3 py-1.5 rounded-lg text-[0.88rem] text-gray-600 hover:bg-gray-100 transition"
          >
            {T.later}
          </button>
          <button
            type="button"
            onClick={() => dismiss(true)}
            className="px-3 py-1.5 rounded-lg text-[0.88rem] bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
          >
            {T.dismiss}
          </button>
        </div>
      </div>
    </div>
  );
}
