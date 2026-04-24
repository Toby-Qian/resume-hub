"use client";
import { useRef, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { ResumeNote } from "@/lib/schema";

/**
 * NotesLayer — an absolutely-positioned overlay that sits on top of the
 * rendered template inside .paper. It renders every `resume.notes` entry as
 * a free-floating text box the user can:
 *   - edit inline (contentEditable)
 *   - drag by its header
 *   - resize via bottom-right corner
 *   - delete via × button
 *   - restyle (font size, bold, align) via a popover toolbar on focus
 *
 * Notes print as-is (text stays, chrome hidden via `.no-print` + CSS).
 */
export function NotesLayer() {
  const notes = useStore((s) => s.resume.notes) || [];
  if (notes.length === 0) return null;
  return (
    <>
      {notes.map((n) => (
        <NoteBox key={n.id} note={n} />
      ))}
    </>
  );
}

function NoteBox({ note }: { note: ResumeNote }) {
  const { updateNote, removeNote } = useStore();
  const bodyRef = useRef<HTMLDivElement>(null);
  const editing = useRef(false);
  const [focused, setFocused] = useState(false);

  // Keep DOM text in sync only when not actively editing, to preserve caret.
  useEffect(() => {
    if (!bodyRef.current || editing.current) return;
    if (bodyRef.current.textContent !== note.text) {
      bodyRef.current.textContent = note.text;
    }
  }, [note.text]);

  // ---- Drag ---------------------------------------------------------------
  const dragState = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const onDragDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
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
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ---- Resize (bottom-right corner) --------------------------------------
  const resizeState = useRef<{ sx: number; w: number } | null>(null);
  const onResizeDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    resizeState.current = { sx: e.clientX, w: note.width };
    const onMove = (ev: MouseEvent) => {
      if (!resizeState.current) return;
      updateNote(note.id, {
        width: Math.max(80, Math.round(resizeState.current.w + (ev.clientX - resizeState.current.sx))),
      });
    };
    const onUp = () => {
      resizeState.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ---- Text commit --------------------------------------------------------
  const commit = () => {
    const v = bodyRef.current?.textContent ?? "";
    if (v !== note.text) updateNote(note.id, { text: v });
  };

  const fontSize = note.fontSize ?? 14;
  const isEmpty = !note.text;

  return (
    <div
      className="resume-note"
      style={{
        position: "absolute",
        left: note.x,
        top: note.y,
        width: note.width,
        zIndex: 5,
      }}
      onMouseEnter={(e) => e.currentTarget.classList.add("hovered")}
      onMouseLeave={(e) => e.currentTarget.classList.remove("hovered")}
    >
      {/* Chrome — hidden unless hovered/focused, and always hidden in print. */}
      <div className="note-chrome no-print" style={{ display: focused ? "flex" : undefined }}>
        <button
          type="button"
          className="note-handle"
          onMouseDown={onDragDown}
          title="拖动 / drag"
          aria-label="drag note"
        >⋮⋮</button>
        <button
          type="button"
          className="note-btn"
          onClick={() => updateNote(note.id, { bold: !note.bold })}
          title="粗体 / bold"
          style={{ fontWeight: note.bold ? 700 : 400 }}
        >B</button>
        <button
          type="button"
          className="note-btn"
          onClick={() => {
            const next = (note.align === "left" || !note.align)
              ? "center" : note.align === "center" ? "right" : "left";
            updateNote(note.id, { align: next });
          }}
          title={`对齐: ${note.align ?? "left"}`}
        >
          {note.align === "center" ? "≡" : note.align === "right" ? "⇥" : "⇤"}
        </button>
        <label className="note-size" title="字号 / font size">
          <input
            type="number"
            min={8}
            max={72}
            value={fontSize}
            onChange={(e) => updateNote(note.id, { fontSize: Math.max(8, Math.min(72, Number(e.target.value) || 14)) })}
          />
        </label>
        <button
          type="button"
          className="note-btn note-del"
          onClick={() => removeNote(note.id)}
          title="删除 / delete"
          aria-label="delete note"
        >×</button>
      </div>

      <div
        ref={bodyRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        className={`note-body ${isEmpty ? "empty" : ""}`}
        style={{
          fontSize,
          fontWeight: note.bold ? 700 : 400,
          color: note.color ?? "inherit",
          background: note.bg ?? "transparent",
          textAlign: note.align ?? "left",
          minHeight: fontSize * 1.5,
        }}
        onFocus={() => { editing.current = true; setFocused(true); }}
        onBlur={() => { editing.current = false; setFocused(false); commit(); }}
      />

      <button
        type="button"
        className="note-resize no-print"
        onMouseDown={onResizeDown}
        title="拖动调整宽度 / drag to resize"
        aria-label="resize note"
      />
    </div>
  );
}
