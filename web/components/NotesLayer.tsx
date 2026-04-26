"use client";
import { useRef, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { ResumeNote } from "@/lib/schema";
import { AlignToolbar } from "./AlignToolbar";

/* A4 width @ 96dpi — kept in sync with `.paper { width: 794px }` in globals.css. */
const PAPER_W = 794;
const SNAP = 6; // px threshold

interface Guide { kind: "v" | "h"; pos: number }

const heightOf = (n: ResumeNote) => n.height ?? (n.kind === "image" ? n.width : 40);

export function NotesLayer() {
  const notes = useStore((s) => s.resume.notes) || [];
  const selectedIds = useStore((s) => s.selectedNoteIds);
  const selectNote = useStore((s) => s.selectNote);
  const selectNotes = useStore((s) => s.selectNotes);
  const toggleNoteSelection = useStore((s) => s.toggleNoteSelection);
  const duplicateNote = useStore((s) => s.duplicateNote);
  const removeNote = useStore((s) => s.removeNote);
  const updateNote = useStore((s) => s.updateNote);
  const nudgeSelection = useStore((s) => s.nudgeSelection);

  // Guides currently visible during a drag/resize (computed by NoteBox).
  const [guides, setGuides] = useState<Guide[]>([]);
  // Marquee rectangle (paper-relative). null when not actively box-selecting.
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // ---- Marquee box-select (drag on empty paper area) -------------------
  useEffect(() => {
    const onPaperDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const tgt = e.target as HTMLElement | null;
      if (!tgt) return;
      // Start a marquee only when the user clicks the paper background itself,
      // not a note, the chrome, or any flow-content interactive element.
      const paper = tgt.closest(".paper") as HTMLElement | null;
      if (!paper) return;
      // Bail when the click landed on a note, an interactive control, or any
      // template body text — marquee should only originate from blank paper
      // regions so it never steals focus from inline editing.
      if (tgt.closest(
        ".resume-note,.note-chrome,a,button,input,textarea,[contenteditable='true']," +
        "h1,h2,h3,h4,h5,h6,p,span,li,strong,em,time,td,th,code,pre,img,svg"
      )) return;

      const rect = paper.getBoundingClientRect();
      // Account for CSS transform: scale() on .paper.
      const scale = rect.width / paper.offsetWidth || 1;
      const startX = (e.clientX - rect.left) / scale;
      const startY = (e.clientY - rect.top) / scale;

      let moved = false;
      const onMove = (ev: MouseEvent) => {
        const x = (ev.clientX - rect.left) / scale;
        const y = (ev.clientY - rect.top) / scale;
        const m = {
          x: Math.min(startX, x),
          y: Math.min(startY, y),
          w: Math.abs(x - startX),
          h: Math.abs(y - startY),
        };
        if (m.w > 4 || m.h > 4) moved = true;
        setMarquee(m);
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        if (moved) {
          // Hit-test all notes against the final marquee.
          const m = (marqueeRef.current);
          if (m) {
            const hits = (useStore.getState().resume.notes || []).filter((n) => {
              const h = heightOf(n);
              return !(n.x + n.width < m.x || n.x > m.x + m.w || n.y + h < m.y || n.y > m.y + m.h);
            });
            useStore.getState().selectNotes(hits.map((n) => n.id));
          }
        } else {
          // Plain click on background → clear selection.
          useStore.getState().selectNote(null);
        }
        setMarquee(null);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };
    window.addEventListener("mousedown", onPaperDown);
    return () => window.removeEventListener("mousedown", onPaperDown);
  }, []);
  // Mirror marquee state into a ref so the mouseup closure sees the latest box.
  const marqueeRef = useRef<typeof marquee>(null);
  useEffect(() => { marqueeRef.current = marquee; }, [marquee]);

  // ---- Global keyboard interactions for current selection --------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ids = useStore.getState().selectedNoteIds;
      if (ids.length === 0) return;
      const tgt = e.target as HTMLElement | null;
      const isEditingText = !!(tgt && (tgt.isContentEditable || tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA"));
      const allNotes = useStore.getState().resume.notes || [];
      const sel = allNotes.filter((n) => ids.includes(n.id));
      const anyLocked = sel.some((n) => n.locked);

      // Ctrl+A inside paper area → select all notes
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a" && !isEditingText) {
        if (allNotes.length > 0) {
          e.preventDefault();
          useStore.getState().selectNotes(allNotes.map((n) => n.id));
        }
        return;
      }

      // Single-selection-only shortcuts (lock toggle / format) target the lead.
      const lead = sel[sel.length - 1];

      if (!isEditingText && (e.key === "Delete" || e.key === "Backspace")) {
        if (anyLocked && sel.length === 1) return;
        e.preventDefault();
        for (const n of sel) {
          if (!n.locked) removeNote(n.id);
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d" && !isEditingText) {
        e.preventDefault();
        for (const n of sel) duplicateNote(n.id);
        return;
      }
      if (!isEditingText && e.key.toLowerCase() === "l" && !e.ctrlKey && !e.metaKey && !e.altKey && lead) {
        e.preventDefault();
        updateNote(lead.id, { locked: !lead.locked });
        return;
      }
      if (!isEditingText && e.key.startsWith("Arrow")) {
        const step = e.shiftKey ? 10 : 1;
        let dx = 0, dy = 0;
        if (e.key === "ArrowLeft") dx = -step;
        if (e.key === "ArrowRight") dx = step;
        if (e.key === "ArrowUp") dy = -step;
        if (e.key === "ArrowDown") dy = step;
        if (dx || dy) {
          e.preventDefault();
          nudgeSelection(dx, dy);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [removeNote, duplicateNote, updateNote, nudgeSelection]);

  if (notes.length === 0 && !marquee) return null;
  return (
    <>
      {notes.map((n) => (
        <NoteBox
          key={n.id}
          note={n}
          allNotes={notes}
          selected={selectedIds.includes(n.id)}
          isLead={selectedIds[selectedIds.length - 1] === n.id}
          multiSelected={selectedIds.length > 1 && selectedIds.includes(n.id)}
          onSelect={(shift) => {
            if (shift) toggleNoteSelection(n.id);
            else selectNote(n.id);
          }}
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
      {marquee && (
        <div
          className="marquee-box no-print"
          style={{
            position: "absolute",
            left: marquee.x,
            top: marquee.y,
            width: marquee.w,
            height: marquee.h,
            pointerEvents: "none",
            zIndex: 30,
          }}
          aria-hidden
        />
      )}
      {selectedIds.length >= 2 && <AlignToolbar />}
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
  note, allNotes, selected, isLead, multiSelected, onSelect, setGuides,
}: {
  note: ResumeNote;
  allNotes: ResumeNote[];
  selected: boolean;
  isLead: boolean;
  multiSelected: boolean;
  onSelect: (shift: boolean) => void;
  setGuides: (g: Guide[]) => void;
}) {
  const { updateNote, removeNote, beginBatch, endBatch, duplicateNote, reorderNote } = useStore();
  const bodyRef = useRef<HTMLDivElement>(null);
  const editing = useRef(false);
  const isImage = note.kind === "image";
  const isShape = note.kind === "shape";
  const locked = !!note.locked;

  useEffect(() => {
    if (!bodyRef.current || editing.current || isImage || isShape) return;
    if (bodyRef.current.textContent !== note.text) {
      bodyRef.current.textContent = note.text;
    }
  }, [note.text, isImage, isShape]);

  // ---- Drag (with snap, group-aware) -----------------------------------
  const dragState = useRef<{ sx: number; sy: number; group: { id: string; ox: number; oy: number }[] } | null>(null);
  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 0 || locked) return;
    e.preventDefault();
    e.stopPropagation();

    // Selection rules: shift+click toggles into selection without dragging
    // (we still let drag start in case the user intends to shift-drag), and
    // a click on a not-yet-selected note replaces selection with just it.
    const { selectedNoteIds, selectNotes } = useStore.getState();
    const alreadySelected = selectedNoteIds.includes(note.id);
    if (e.shiftKey) {
      if (!alreadySelected) {
        selectNotes([...selectedNoteIds, note.id]);
      }
    } else if (!alreadySelected) {
      onSelect(false);
    }

    beginBatch();

    // Build the moving group from the latest selection (which may have just
    // been mutated synchronously above).
    const liveSel = useStore.getState().selectedNoteIds;
    const groupIds = liveSel.includes(note.id) ? liveSel : [note.id];
    const groupNotes = allNotes.filter((n) => groupIds.includes(n.id) && !n.locked);
    dragState.current = {
      sx: e.clientX,
      sy: e.clientY,
      group: groupNotes.map((n) => ({ id: n.id, ox: n.x, oy: n.y })),
    };

    // Snap candidates: paper edges + centerline + non-selected notes' edges.
    const others = allNotes.filter((n) => !groupIds.includes(n.id));
    const xCandidates = [0, PAPER_W / 2, PAPER_W];
    const yCandidates = [0];
    others.forEach((o) => {
      const oh = heightOf(o);
      xCandidates.push(o.x, o.x + o.width / 2, o.x + o.width);
      yCandidates.push(o.y, o.y + oh / 2, o.y + oh);
    });

    // Use the lead note's box as the reference frame for snapping.
    const refW = note.width;
    const refH = heightOf(note);

    const onMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      let dx = ev.clientX - dragState.current.sx;
      let dy = ev.clientY - dragState.current.sy;

      const guides: Guide[] = [];
      if (!ev.shiftKey) {
        // Try snapping any of {left, center, right} of the LEAD's projected
        // position to xCandidates; same for vertical.
        const leadX = note.x + dx;
        const leadY = note.y + dy;
        const xTries = [
          { val: leadX,            snap: pickSnap(leadX, xCandidates) },
          { val: leadX + refW / 2, snap: pickSnap(leadX + refW / 2, xCandidates) },
          { val: leadX + refW,     snap: pickSnap(leadX + refW, xCandidates) },
        ];
        const bestX = xTries.filter((c) => c.snap.snap !== null).sort((a, b) => a.snap.delta - b.snap.delta)[0];
        if (bestX && bestX.snap.snap !== null) {
          dx += bestX.snap.snap - bestX.val;
          guides.push({ kind: "v", pos: bestX.snap.snap });
        }
        const yTries = [
          { val: leadY,            snap: pickSnap(leadY, yCandidates) },
          { val: leadY + refH / 2, snap: pickSnap(leadY + refH / 2, yCandidates) },
          { val: leadY + refH,     snap: pickSnap(leadY + refH, yCandidates) },
        ];
        const bestY = yTries.filter((c) => c.snap.snap !== null).sort((a, b) => a.snap.delta - b.snap.delta)[0];
        if (bestY && bestY.snap.snap !== null) {
          dy += bestY.snap.snap - bestY.val;
          guides.push({ kind: "h", pos: bestY.snap.snap });
        }
        setGuides(guides);
      } else {
        setGuides([]);
      }

      // Apply the (possibly snapped) delta to every member of the drag group.
      for (const g of dragState.current.group) {
        const nx = Math.max(0, Math.round(g.ox + dx));
        const ny = Math.max(0, Math.round(g.oy + dy));
        updateNote(g.id, { x: nx, y: ny });
      }
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
    onSelect(false);
    beginBatch();
    resizeState.current = { sx: e.clientX, sy: e.clientY, w: note.width, h: note.height ?? 0 };
    const onMove = (ev: MouseEvent) => {
      if (!resizeState.current) return;
      const patch: Partial<ResumeNote> = {
        width: Math.max(isShape && note.shape === "line" ? 20 : 60,
          Math.round(resizeState.current.w + (ev.clientX - resizeState.current.sx))),
      };
      if (isImage || isShape) {
        const minH = isShape && note.shape === "line" ? 1 : 20;
        patch.height = Math.max(minH, Math.round(resizeState.current.h + (ev.clientY - resizeState.current.sy)));
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

  // ---- Shape rendering -------------------------------------------------
  const shapeElement = isShape ? (
    <div
      className="note-shape"
      onMouseDown={startDrag}
      style={{
        width: "100%",
        height: note.height ?? (note.shape === "line" ? 2 : 80),
        background: note.bg && note.bg !== "transparent" ? note.bg
                    : note.shape === "line" ? (note.color ?? "#111827") : "transparent",
        border: note.shape !== "line" && note.borderColor
          ? `${note.borderWidth ?? 2}px solid ${note.borderColor}`
          : "none",
        borderRadius: note.shape === "circle" ? "50%" : note.shape === "rect" ? 4 : 0,
        cursor: locked ? "default" : "move",
        userSelect: "none",
      }}
    />
  ) : null;

  return (
    <div
      className={`resume-note ${selected ? "selected" : ""} ${multiSelected ? "multi-selected" : ""} ${isLead && multiSelected ? "lead" : ""} ${locked ? "locked" : ""} ${isImage ? "is-image" : isShape ? "is-shape" : "is-text"}`}
      style={{
        position: "absolute",
        left: note.x,
        top: note.y,
        width: note.width,
        height: isShape ? (note.height ?? (note.shape === "line" ? 2 : 80)) : undefined,
        zIndex: selected ? 20 : 5,
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest(".note-body,.note-chrome,.note-resize,.note-image,.note-shape")) return;
        startDrag(e);
      }}
    >
      {/* Chrome — only show on the lead/single selection to avoid clutter when many are selected. */}
      {(!multiSelected || isLead) && (
        <div className="note-chrome no-print">
          <button type="button" className="note-handle" onMouseDown={startDrag}
            title={locked ? "已锁定 / locked" : "拖动 / drag"} aria-label="drag note">⋮⋮</button>
          {!isImage && !isShape && !locked && (
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
          {isShape && !locked && (
            <>
              <label className="note-color" title="填充 / fill">
                <input type="color" value={note.bg && note.bg !== "transparent" ? note.bg : "#ffffff"}
                  onChange={(e) => updateNote(note.id, { bg: e.target.value })} />
              </label>
              <label className="note-color" title="描边 / border">
                <input type="color" value={note.borderColor ?? "#2563eb"}
                  onChange={(e) => updateNote(note.id, { borderColor: e.target.value })} />
              </label>
              <button type="button" className="note-btn"
                onClick={() => updateNote(note.id, { bg: "transparent" })}
                title="无填充 / no fill">⌀</button>
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
      )}

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
      ) : isShape ? (
        shapeElement
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
          onFocus={() => { editing.current = true; onSelect(false); }}
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
