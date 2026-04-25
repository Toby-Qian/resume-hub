"use client";
import { useEffect } from "react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  /** "danger" = red button (destructive), "primary" = blue. */
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onClose: () => void;
}

/** Generic confirm dialog. Replaces native confirm() so we can:
 *   - Show a clear destructive (red) button for irreversible actions.
 *   - Hint at undo as a recovery path.
 *   - Get consistent styling.                                            */
export function ConfirmModal({ open, title, message, confirmLabel, cancelLabel, tone = "primary", onConfirm, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onConfirm]);
  if (!open) return null;

  const confirmCls = tone === "danger"
    ? "bg-rose-600 hover:bg-rose-700 border-rose-600 text-white shadow-sm"
    : "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-sm";
  const headerIcon = tone === "danger" ? "⚠" : "?";
  const headerCls  = tone === "danger" ? "from-rose-500 to-orange-500" : "from-blue-500 to-indigo-600";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm no-print"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-sm w-[92%] p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-9 h-9 shrink-0 rounded-full bg-gradient-to-br ${headerCls} grid place-items-center text-white text-lg shadow-sm`}>
            {headerIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="text-[0.78rem] text-gray-600 mt-1 leading-relaxed">{message}</div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${confirmCls}`}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
