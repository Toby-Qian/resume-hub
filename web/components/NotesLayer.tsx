"use client";
import { useRef, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { ResumeNote } from "@/lib/schema";

/* A4 width @ 96dpi — kept in sync with `.paper { width: 794px }` in globals.css. */
const PAPER_W = 794;
const SNAP = 6; // px threshold

interface Guide { kind: "v" | "h"; pos: number }

export function NotesLayer() {
  const notes = useStore((s) => s.resume.notes) || [];
  const selectedId = useStore((s) => s.selectedNoteId);
  const selectNote = useStore((s) => s.selectNote);
  const duplicateNote = useStore((s) => s.duplicateNote);
  const removeNote = useStore((s) => s.removeNote);
  const updateNote = useStore((s) => s.updateNote);

  // Guides currently visible during a drag/resize (computed by NoteBox).
  const [guides, setGuides] = useState<Guide[]>([]);

  // ---- Global interactions bound to whichever note is selected ---------
  useEffect(() => {
    if (notes.length === 0) return;
    const onDocDown = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement | null;
      if (!tgt) return;
      if (!tgt.closest(".resume-note")) {
        const { selectedNoteId, selectNote } = useStore.getState();
        if (selectedNoteId !== null) selectNote(null);
      }
    };
    window.addEventListener("mousedown", onDocDown);
    return () => window.removeEventListener("mousedown", onDocDown);
  }, [notes.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const sId = useStore.getState().selectedNoteId;
      if (!sId) return;
      const tgt = e.target as HTMLElement | null;
      const isEditingText = !!(tgt && (tgt.isContentEditable || tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA"));
      const n = (useStore.getState().resume.notes || []).find((x) => x.id === sId);
      if (!n) return;
      // Locked notes ignore destructive / move shortcuts (lock guards the user).
      const locked = !!n.locked;
      if (!isEditingText && (e.key === "Delete" || e.key === "Backspace")) {
        if (locked) return;
        e.preventDefault(); removeNote(sId); return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d" && !isEditingText) {
        e.preventDefault(); duplicateNote(sId); return;
      }
      // L = toggle lock (mirrors common design-tool convention)
      if (!isEditingText && e.key.toLowerCase() === "l" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault(); updateNote(sId, { locked: !locked }); return;
      }
      if (!isEditingText && e.key.startsWith("Arrow")) {
        if (locked) return;
        const step = e.shiftKey ? 10 : 1;
        e.preventDefault();
        const patch: Partial<ResumeNote> = {};
        if (e.key === "ArrowLeft") patch.x = Math.max(0, n.x - step);
        if (e.key === "ArrowRight") patch.x = n.x + step;
        if (e.key === "ArrowUp") patch.y = Math.max(0, n.y - step);
        if (e.key === "ArrowDown") patch.y = n.y + step;
        updateNote(sId, patch);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [removeNote, duplicateNote, updateNote]);

  if (notes.length === 0) return null;
  return (
    <>
      {notes.map((n) => (
        <NoteBox
          key={n.id}
          note={n}
          allNotes={notes}
          selected={selectedId === n.id}
          onSelect={() => selectNote(n.id)}
          setGuides={setGuides}
        />
      ))}
      {guides.map((g, i) => (
        <div
          key={`${g.kind}-${g.pos}-${i}`}
          className="alignment-guide no-print"
          style={
            g.kind === "v"
              ? { left: g.pos, top: 0, bottom: 0, width: 1 }
              : { top: g.pos, left: 0, right: 0, height: 1 }
          }
        />
      ))}
    </>
  );
}

/** Pick the snap with smallest delta within SNAP px from a list of candidates. */
function pickSnap(value: number, candidates: number[]): { snap: number | null; delta: number } {
  let best: number | null = null;
  let bestDelta = SNAP + 1;
  for (const c of candidates) {
    const d = Math.abs(value - c);
    if (d < bestDelta) { bestDelta = d; best = c; }
  }
  return { snap: best, delta: bestDelta };
}

function NoteBox({
  note, allNotes, selected, onSelect, setGuides,
}: {
  note: ResumeNote;
  allNotes: ResumeNote[];
  selected: boolean;
  onSelect: () => void;
  setGuides: (g: Guide[]) => void;
}) {
  const { updateNote, removeNote, beginBatch, endBatch, duplicateNote, reorderNote } = useStore();
  const bodyRef = useRef<HTMLDivElement>(null);
  const editing = useRef(false);
  const isImage = note.kind === "image";
  const locked = !!note.locked;

  useEffect(() => {
    if (!bodyRef.current || editing.current || isImage) return;
    if (bodyRef.current.textContent !== note.text) {
      bodyRef.current.textContent = note.text;
    }
  }, [note.text, isImage]);

  // ---- Drag (with snap) -------------------------------------------------
  const dragState = useRef<{ sx: number; sy: number; ox: number; oy: number; w: number; h: number } | null>(null);
  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 0 || locked) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    beginBatch();
    const h = (note.height ?? bodyRef.current?.offsetHeight ?? 40);
    dragState.current = { sx: e.clientX, sy: e.clientY, ox: note.x, oy: note.y, w: note.width, h };

    // Build snap candidates ONCE per gesture (other notes' edges + paper edges + paper centerline).
    const others = allNotes.filter((n) => n.id !== note.id);
    const xCandidates = [0, PAPER_W / 2, PAPER_W];
    const yCandidates = [0];
    others.forEach((o) => {
      const oh = o.height ?? 40;
      xCandidates.push(o.x, o.x + o.width / 2, o.x + o.width);
      yCandidates.push(o.y, o.y + oh / 2, o.y + oh);
    });

    const onMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      let nx = Math.round(dragState.current.ox + (ev.clientX - dragState.current.sx));
      let ny = Math.round(dragState.current.oy + (ev.clientY - dragState.current.sy));
      const w = dragState.current.w;
      const h = dragState.current.h;

      const guides: Guide[] = [];
      // Try snapping any of {left, center, right} to xCandidates
      const xCandidatesForLeft = [
        { val: nx,           snap: pickSnap(nx, xCandidates) },
        { val: nx + w / 2,   snap: pickSnap(nx + w / 2, xCandidates) },
        { val: nx + w,       snap: pickSnap(nx + w, xCandidates) },
      ];
      const bestX = xCandidatesForLeft
        .filter((c) => c.snap.snap !== null)
        .sort((a, b) => a.snap.delta - b.snap.delta)[0];
      if (bestX && bestX.snap.snap !== null) {
        const adjust = bestX.snap.snap - bestX.val;
        nx += adjust;
        guides.push({ kind: "v", pos: bestX.snap.snap });
      }
      const xCandidatesForTop = [
        { val: ny,           snap: pickSnap(ny, yCandidates) },
        { val: ny + h / 2,   snap: pickSnap(ny + h / 2, yCandidates) },
        { val: ny + h,       snap: pickSnap(ny + h, yCandidates) },
      ];
      const bestY = xCandidatesForTop
        .filter((c) => c.snap.snap !== null)
        .sort((a, b) => a.snap.delta - b.snap.delta)[0];
      if (bestY && bestY.snap.snap !== null) {
        const adjust = bestY.snap.snap - bestY.val;
        ny += adjust;
        guides.push({ kind: "h", pos: bestY.snap.snap });
      }
      // Holding Shift bypasses snapping for fine-tuning.
      if (ev.shiftKey) {
        nx = Math.round(dragState.current.ox + (ev.clientX - dragState.current.sx));
        ny = Math.round(dragState.current.oy + (ev.clientY - dragState.current.sy));
        setGuides([]);
      } else {
        setGuides(guides);
      }
      updateNote(note.id, { x: Math.max(0, nx), y: Math.max(0, ny) });
    };
    const onUp = () => {
      dragState.current = null;
      endBatch();
      setGuides([]);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ---- Resize ------------------------------------------------------------
  const resizeState = useRef<{ sx: number; sy: number; w: number; h: number } | null>(null);
  const onResizeDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || locked) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    beginBatch();
    resizeState.current = { sx: e.clientX, sy: e.clientY, w: note.width, h: note.height ?? 0 };
    const onMove = (ev: MouseEvent) => {
      if (!resizeState.current) return;
      const patch: Partial<ResumeNote> = {
        width: Math.max(60, Math.round(resizeState.current.w + (ev.clientX - resizeState.current.sx))),
      };
      if (isImage) {
        patch.height = Math.max(60, Math.round(resizeState.current.h + (ev.clientY - resizeState.current.sy)));
      }
      updateNote(note.id, patch);
    };
    const onUp = () => {
      resizeState.current = null;
      endBatch();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const commit = () => {
    const v = bodyRef.current?.textContent ?? "";
    if (v !== note.text) updateNote(note.id, { text: v });
  };

  const onBodyMouseDown = (e: React.MouseEvent) => {
    if (e.altKey) startDrag(e);
  };

  const fontSize = note.fontSize ?? 14;
  const isEmpty = !note.text;

  return (
    <div
      className={`resume-note ${selected ? "selected" : ""} ${locked ? "locked" : ""} ${isImage ? "is-image" : "is-text"}`}
      style={{
        position: "absolute",
        left: note.x,
        top: note.y,
        width: note.width,
        zIndex: selected ? 20 : 5,
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest(".note-body,.note-chrome,.note-resize,.note-image")) return;
        startDrag(e);
      }}
    >
      <div className="note-chrome no-print">
        <button type="button" className="note-handle" onMouseDown={startDrag}
          title={locked ? "已锁定 / locked" : "拖动 / drag"} aria-label="drag note">⋮⋮</button>
        {!isImage && !locked && (
          <>
            <button type="button" className="note-btn"
              onClick={() => updateNote(note.id, { bold: !note.bold })}
              title="粗体 / bold" style={{ fontWeight: note.bold ? 700 : 400 }}>B</button>
            <button type="button" className="note-btn"
              onClick={() => updateNote(note.id, { italic: !note.italic })}
              title="斜体 / italic" style={{ fontStyle: note.italic ? "italic" : "normal" }}>I</button>
            <button type="button" className="note-btn"
              onClick={() => updateNote(note.id, { underline: !note.underline })}
              title="下划线 / underline" style={{ textDecoration: note.underline ? "underline" : "none" }}>U</button>
            <button type="button" className="note-btn"
              onClick={() => {
                const next = (note.align === "left" || !note.align)
                  ? "center" : note.align === "center" ? "right" : "left";
                updateNote(note.id, { align: next });
              }}
              title={`对齐: ${note.align ?? "left"}`}>
              {note.align === "center" ? "≡" : note.align === "right" ? "⇥" : "⇤"}
            </button>
            <label className="note-size" title="字号 / font size">
              <input type="number" min={8} max={96} value={fontSize}
                onChange={(e) => updateNote(note.id, { fontSize: Math.max(8, Math.min(96, Number(e.target.value) || 14)) })} />
            </label>
            <label className="note-color" title="文字颜色 / text color">
              <input type="color" value={note.color ?? "#111827"}
                onChange={(e) => updateNote(note.id, { color: e.target.value })} />
            </label>
          </>
        )}
        <span className="note-sep" />
        {!locked && (
          <>
            <button type="button" className="note-btn"
              onClick={() => reorderNote(note.id, "front")}
              title="置顶 / bring to front">⇡</button>
            <button type="button" className="note-btn"
              onClick={() => reorderNote(note.id, "back")}
              title="置底 / send to back">⇣</button>
            <button type="button" className="note-btn"
              onClick={() => duplicateNote(note.id)}
              title="复制 / duplicate (Ctrl+D)">⎘</button>
          </>
        )}
        <button type="button" className={`note-btn ${locked ? "note-locked-on" : ""}`}
          onClick={() => updateNote(note.id, { locked: !locked })}
          title={locked ? "解锁 / unlock (L)" : "锁定 / lock (L)"}>
          {locked ? "🔒" : "🔓"}
        </button>
        {!locked && (
          <button type="button" className="note-btn note-del"
            onClick={() => removeNote(note.id)}
            title="删除 / delete (Del)" aria-label="delete note">×</button>
        )}
      </div>

      {isImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={note.src}
          alt=""
          draggable={false}
          onMouseDown={startDrag}
          className="note-image"
          style={{
            width: "100%",
            height: note.height ?? "auto",
            objectFit: "cover",
            display: "block",
            userSelect: "none",
            cursor: locked ? "default" : "move",
          }}
        />
      ) : (
        <div
          ref={bodyRef}
          contentEditable={!locked}
          suppressContentEditableWarning
          spellCheck={false}
          className={`note-body ${isEmpty ? "empty" : ""}`}
          style={{
            fontSize,
            fontWeight: note.bold ? 700 : 400,
            fontStyle: note.italic ? "italic" : "normal",
            textDecoration: note.underline ? "underline" : "none",
            color: note.color ?? "inherit",
            background: note.bg ?? "transparent",
            textAlign: note.align ?? "left",
            minHeight: fontSize * 1.5,
            cursor: locked ? "default" : undefined,
          }}
          onMouseDown={onBodyMouseDown}
          onFocus={() => { editing.current = true; onSelect(); }}
          onBlur={() => { editing.current = false; commit(); }}
        />
      )}

      {!locked && (
        <button type="button" className="note-resize no-print"
          onMouseDown={onResizeDown}
          title="拖动调整大小 / drag to resize" aria-label="resize note" />
      )}
    </div>
  );
}
