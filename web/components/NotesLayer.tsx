"use client";
import { useRef, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { ResumeNote } from "@/lib/schema";

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
  const { updateNote, removeNote, beginBatch, endBatch } = useStore();
  const bodyRef = useRef<HTMLDivElement>(null);
  const editing = useRef(false);
  const [focused, setFocused] = useState(false);
  const isImage = note.kind === "image";

  useEffect(() => {
    if (!bodyRef.current || editing.current || isImage) return;
    if (bodyRef.current.textContent !== note.text) {
      bodyRef.current.textContent = note.text;
    }
  }, [note.text, isImage]);

  // ---- Drag --------------------------------------------------------------
  const dragState = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const onDragDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
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
      <div className="note-chrome no-print" style={{ display: focused ? "flex" : undefined }}>
        <button type="button" className="note-handle" onMouseDown={onDragDown}
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
        <button type="button" className="note-btn note-del"
          onClick={() => removeNote(note.id)}
          title="删除 / delete" aria-label="delete note">×</button>
      </div>

      {isImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={note.src}
          alt=""
          draggable={false}
          className="note-image"
          style={{
            width: "100%",
            height: note.height ?? "auto",
            objectFit: "cover",
            display: "block",
            userSelect: "none",
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
          onFocus={() => { editing.current = true; setFocused(true); }}
          onBlur={() => { editing.current = false; setFocused(false); commit(); }}
        />
      )}

      <button type="button" className="note-resize no-print"
        onMouseDown={onResizeDown}
        title="拖动调整大小 / drag to resize" aria-label="resize note" />
    </div>
  );
}
