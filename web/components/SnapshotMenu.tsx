"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "@/lib/toast";

/** Named restore-point manager. Lives next to the import/export buttons in
 *  the Toolbar. Snapshots are persisted in the same localStorage blob as the
 *  rest of the editor — see store.ts SNAPSHOT_LIMIT for the cap.
 *  Popover is rendered via portal so the editor pane's `overflow-y-auto`
 *  doesn't clip it. */
export function SnapshotMenu() {
  const { lang, snapshots, saveSnapshot, restoreSnapshot, deleteSnapshot, renameSnapshot } = useStore();
  const L = t(lang);
  const S = L.snapshots ?? {};
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return;
    const reposition = () => {
      const r = wrapRef.current!.getBoundingClientRect();
      setCoords({ top: r.bottom + 6, right: window.innerWidth - r.right });
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

  const onSave = () => {
    const prefix = S.defaultNamePrefix ?? "快照";
    const stamp = new Date().toLocaleString();
    saveSnapshot(`${prefix} · ${stamp}`);
    toast.success(L.toast.snapshotSaved ?? "Snapshot saved");
  };
  const onRestore = (id: string) => {
    if (!window.confirm(S.restoreConfirm ?? "Restore this snapshot?")) return;
    restoreSnapshot(id);
    toast.success(L.toast.snapshotRestored ?? "Snapshot restored");
    setOpen(false);
  };
  const onDelete = (id: string) => {
    if (!window.confirm(S.deleteConfirm ?? "Delete?")) return;
    deleteSnapshot(id);
    toast.info(L.toast.snapshotDeleted ?? "Snapshot deleted");
  };
  const onRename = (id: string, current: string) => {
    const next = window.prompt(S.renamePrompt ?? "New name", current);
    if (next == null) return;
    renameSnapshot(id, next);
  };

  // Cap from the store — pull a literal so the i18n template can show it.
  const SNAPSHOT_LIMIT = 12;

  const popover = open && coords && typeof document !== "undefined" ? createPortal(
    <div
      ref={popRef}
      style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 100 }}
      className="popover-pop w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-3.5 text-xs"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div>
          <div className="font-semibold text-gray-700 text-[11px] uppercase tracking-wider">
            {S.title ?? "Snapshots"}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5 leading-snug">
            {S.hint ?? ""}
          </div>
        </div>
        <span className="shrink-0 text-[10px] text-gray-400 mt-0.5 font-mono">
          {(S.capHint ?? "{n} / {max}")
            .replace("{n}", String(snapshots.length))
            .replace("{max}", String(SNAPSHOT_LIMIT))}
        </span>
      </div>

      <button
        onClick={onSave}
        title={(S.saveHint ?? "").replace("{n}", String(SNAPSHOT_LIMIT))}
        className="w-full text-xs px-3 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-1.5"
      >
        <span className="text-[0.95em]">＋</span>
        {S.save ?? "Save snapshot"}
      </button>

      <div className="mt-3 max-h-72 overflow-y-auto -mx-1 px-1">
        {snapshots.length === 0 ? (
          <div className="text-[11px] text-gray-400 py-4 text-center leading-snug">
            {S.empty ?? "No snapshots yet"}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {snapshots.map((s) => (
              <li key={s.id} className="group rounded-md border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 p-2 transition">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <button
                    onDoubleClick={() => onRename(s.id, s.name)}
                    title={S.rename ?? "Rename"}
                    className="flex-1 min-w-0 text-left text-[12px] font-medium text-gray-800 truncate hover:text-emerald-700"
                  >
                    {s.name}
                  </button>
                  <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onRestore(s.id)}
                    className="flex-1 text-[11px] px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition font-medium"
                  >
                    ↺ {S.restore ?? "Restore"}
                  </button>
                  <button
                    onClick={() => onRename(s.id, s.name)}
                    className="text-[11px] px-2 py-1 rounded text-gray-500 hover:bg-gray-100 transition"
                    title={S.rename ?? "Rename"}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="text-[11px] px-2 py-1 rounded text-rose-500 hover:bg-rose-50 transition"
                    title={S.delete ?? "Delete"}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div ref={wrapRef} className="relative inline-flex">
        <button
          onClick={() => setOpen((v) => !v)}
          title={S.hint ?? "Snapshots"}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
            open
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
          }`}
        >
          <span className="text-[0.85em] opacity-90">📸</span>
          {S.title ?? "快照"}
          {snapshots.length > 0 && (
            <span className={`ml-0.5 text-[0.65rem] px-1 rounded-full ${open ? "bg-white/25" : "bg-gray-100 text-gray-500"}`}>
              {snapshots.length}
            </span>
          )}
        </button>
      </div>
      {popover}
    </>
  );
}
