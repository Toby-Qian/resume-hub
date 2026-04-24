"use client";
import { useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import type { ResumeNote } from "@/lib/schema";

export function NotesLayer() {
  const notes = useStore((s) => s.resume.notes) || [];
  const selectedId = useStore((s) => s.selectedNoteId);
  const selectNote = useStore((s) => s.selectNote);
  const duplicateNote = useStore((s) => s.duplicateNote);
  const removeNote = useStore((s) => s.removeNote);
  const updateNote = useStore((s) => s.updateNote);

  // ---- Global interactions bound to whichever note is selected ---------
  useEffect(() => {
    if (notes.length === 0) return;
    // Click outside any note → deselect
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
    // Keyboard shortcuts while a note is selected (but not while the user is
    // typing inside its contentEditable body).
    const onKey = (e: KeyboardEvent) => {
      const sId = useStore.getState().selectedNoteId;
      if (!sId) return;
      const tgt = e.target as HTMLElement | null;
      const isEditingText = !!(tgt && (tgt.isContentEditable || tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA"));
      // Delete / Backspace on selection (when not typing)
      if (!isEditingText && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault(); removeNote(sId); return;
      }
      // Ctrl/Cmd+D duplicate
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d" && !isEditingText) {
        e.preventDefault(); duplicateNote(sId); return;
      }
      // Arrow keys nudge (Shift = 10px). Work even while typing? No — respect typing.
      if (!isEditingText && e.key.startsWith("Arrow")) {
        const step = e.shiftKey ? 10 : 1;
        const n = (useStore.getState().resume.notes || []).find((x) => x.id === sId);
        if (!n) return;
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
        <NoteBox key={n.id} note={n} selected={selectedId === n.id} onSelect={() => selectNote(n.id)} />
      ))}
    </>
  );
}

function NoteBox({ note, selected, onSelect }: { note: ResumeNote; selected: boolean; onSelect: () => void }) {
  const { updateNote, removeNote, beginBatch, endBatch, duplicateNote, reorderNote } = useStore();
  const bodyRef = useRef<HTMLDivElement>(null);
  const editing = useRef(false);
  const isImage = note.kind === "image";

  useEffect(() => {
    if (!bodyRef.current || editing.current || isImage) return;
    if (bodyRef.current.textContent !== note.text) {
      bodyRef.current.textContent = note.text;
    }
  }, [note.text, isImage]);

  // ---- Drag (attachable to any element that should initiate move) -------
  const dragState = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    beginBatch();
    dragState.current = { sx: e.clientX, sy: e.clientY, ox: note.x, oy: note.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      updateNote(note.id, {
        x: Math.max(0, Math.round(dragState.current.ox + (ev.clientX - dragState.current.sx))),
        y: Math.max(0, Math.round(dragState.current.oy + (ev.clientY - dragState.current.sy))),
      });
    };
    const onUp = () => {
      dragState.current = null;
      endBatch();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ---- Resize ------------------------------------------------------------
  const resizeState = useRef<{ sx: number; sy: number; w: number; h: number } | null>(null);
  const onResizeDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
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

  // Alt+mousedown anywhere on a text note's body also drags (so users can
  // move the note without having to aim at the 4px border).
  const onBodyMouseDown = (e: React.MouseEvent) => {
    if (e.altKey) startDrag(e);
  };

  const fontSize = note.fontSize ?? 14;
  const isEmpty = !note.text;

  return (
    <div
      className={`resume-note ${selected ? "selected" : ""} ${isImage ? "is-image" : "is-text"}`}
      style={{
        position: "absolute",
        left: note.x,
        top: note.y,
        width: note.width,
        zIndex: selected ? 20 : 5,
      }}
      onMouseDown={(e) => {
        // Clicking on the frame (not body, not controls) selects + optionally starts drag.
        if ((e.target as HTMLElement).closest(".note-body,.note-chrome,.note-resize,.note-image")) return;
        startDrag(e);
      }}
    >
      <div className="note-chrome no-print">
        <button type="button" className="note-handle" onMouseDown={startDrag}
          title="拖动 / drag" aria-label="drag note">⋮⋮</button>
        {!isImage && (
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
        <button type="button" className="note-btn"
          onClick={() => reorderNote(note.id, "front")}
          title="置顶 / bring to front">⇡</button>
        <button type="button" className="note-btn"
          onClick={() => reorderNote(note.id, "back")}
          title="置底 / send to back">⇣</button>
        <button type="button" className="note-btn"
          onClick={() => duplicateNote(note.id)}
          title="复制 / duplicate (Ctrl+D)">⎘</button>
        <button type="button" className="note-btn note-del"
          onClick={() => removeNote(note.id)}
          title="删除 / delete (Del)" aria-label="delete note">×</button>
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
            cursor: "move",
          }}
        />
      ) : (
        <div
          ref={bodyRef}
          contentEditable
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
          }}
          onMouseDown={onBodyMouseDown}
          onFocus={() => { editing.current = true; onSelect(); }}
          onBlur={() => { editing.current = false; commit(); }}
        />
      )}

      <button type="button" className="note-resize no-print"
        onMouseDown={onResizeDown}
        title="拖动调整大小 / drag to resize" aria-label="resize note" />
    </div>
  );
}
