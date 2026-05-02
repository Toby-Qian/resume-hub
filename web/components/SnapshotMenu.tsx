"use client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "@/lib/toast";

/** Named restore-point manager. Lives next to the import/export buttons in
 *  the Toolbar. Snapshots are persisted in the same localStorage blob as the
 *  rest of the editor — see store.ts SNAPSHOT_LIMIT for the cap. */
export function SnapshotMenu() {
  const { lang, snapshots, saveSnapshot, restoreSnapshot, deleteSnapshot, renameSnapshot } = useStore();
  const L = t(lang);
  const S = L.snapshots ?? {};
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Same outside-click + Esc dismissal as ExportMenu.
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

  return (
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
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-40 p-3 text-xs"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="font-semibold text-gray-700 text-[11px] uppercase tracking-wider">
                {S.title ?? "Snapshots"}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                {S.hint ?? ""}
              </div>
            </div>
            <span className="shrink-0 text-[10px] text-gray-400 mt-0.5">
              {(S.capHint ?? "{n} / {max}")
                .replace("{n}", String(snapshots.length))
                .replace("{max}", String(SNAPSHOT_LIMIT))}
            </span>
          </div>

          <button
            onClick={onSave}
            title={(S.saveHint ?? "").replace("{n}", String(SNAPSHOT_LIMIT))}
            className="w-full text-xs px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
          >
            <span className="text-[0.9em]">＋</span>
            {S.save ?? "Save snapshot"}
          </button>

          <div className="mt-3 max-h-72 overflow-y-auto -mx-1 px-1">
            {snapshots.length === 0 ? (
              <div className="text-[11px] text-gray-400 py-3 text-center leading-snug">
                {S.empty ?? "No snapshots yet"}
              </div>
            ) : (
              <ul className="space-y-1">
                {snapshots.map((s) => (
                  <li key={s.id} className="group rounded border border-gray-100 hover:border-gray-200 p-2 transition">
                    <div className="flex items-center gap-1.5 mb-1">
                      <button
                        onDoubleClick={() => onRename(s.id, s.name)}
                        title={S.rename ?? "Rename"}
                        className="flex-1 min-w-0 text-left text-[12px] font-medium text-gray-800 truncate hover:text-emerald-700"
                      >
                        {s.name}
                      </button>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onRestore(s.id)}
                        className="flex-1 text-[11px] px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                      >
                        ↺ {S.restore ?? "Restore"}
                      </button>
                      <button
                        onClick={() => onRename(s.id, s.name)}
                        className="text-[11px] px-2 py-1 rounded text-gray-500 hover:bg-gray-50 transition"
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
        </div>
      )}
    </div>
  );
}
