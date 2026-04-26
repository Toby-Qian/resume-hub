"use client";
import { useStore } from "@/lib/store";
import type { ResumeNote } from "@/lib/schema";

const heightOf = (n: ResumeNote) => n.height ?? (n.kind === "image" ? n.width : 40);

/** Floating toolbar that appears when 2+ notes are selected. Positioned
 *  absolutely inside .paper above the union bounding box of the selection.
 *  Hidden during print. */
export function AlignToolbar() {
  const ids = useStore((s) => s.selectedNoteIds);
  const notes = useStore((s) => s.resume.notes) || [];
  const align = useStore((s) => s.alignNotes);
  const distribute = useStore((s) => s.distributeNotes);
  const removeNote = useStore((s) => s.removeNote);

  if (ids.length < 2) return null;
  const sel = notes.filter((n) => ids.includes(n.id));
  if (sel.length < 2) return null;

  const minLeft = Math.min(...sel.map((n) => n.x));
  const maxRight = Math.max(...sel.map((n) => n.x + n.width));
  const minTop = Math.min(...sel.map((n) => n.y));

  const centerX = (minLeft + maxRight) / 2;
  // Toolbar sits ~36px above the bbox top, clamped within paper.
  const top = Math.max(8, minTop - 38);

  const Btn = ({ onClick, title, children, danger }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`align-tb-btn ${danger ? "align-tb-danger" : ""}`}
    >
      {children}
    </button>
  );

  const canDistribute = sel.length >= 3;

  return (
    <div
      className="align-toolbar no-print"
      style={{
        position: "absolute",
        left: centerX,
        top,
        transform: "translateX(-50%)",
        zIndex: 40,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span className="align-tb-label">{sel.length}</span>
      <Btn onClick={() => align("left")} title="左对齐 / Align left">
        <Icon path="M3 3v18M7 6h12v3H7zM7 14h8v3H7z" />
      </Btn>
      <Btn onClick={() => align("centerH")} title="水平居中 / Center horizontally">
        <Icon path="M12 3v18M6 6h12v3H6zM8 14h8v3H8z" />
      </Btn>
      <Btn onClick={() => align("right")} title="右对齐 / Align right">
        <Icon path="M21 3v18M5 6h12v3H5zM9 14h8v3H9z" />
      </Btn>
      <span className="align-tb-sep" />
      <Btn onClick={() => align("top")} title="顶对齐 / Align top">
        <Icon path="M3 3h18M6 7v12h3V7zM14 7v8h3V7z" />
      </Btn>
      <Btn onClick={() => align("centerV")} title="垂直居中 / Center vertically">
        <Icon path="M3 12h18M6 6v12h3V6zM14 8v8h3V8z" />
      </Btn>
      <Btn onClick={() => align("bottom")} title="底对齐 / Align bottom">
        <Icon path="M3 21h18M6 5v12h3V5zM14 9v8h3V9z" />
      </Btn>
      {canDistribute && (
        <>
          <span className="align-tb-sep" />
          <Btn onClick={() => distribute("h")} title="水平等距 / Distribute horizontally">
            <Icon path="M3 3v18M21 3v18M9 8h2v8H9zM13 8h2v8h-2z" />
          </Btn>
          <Btn onClick={() => distribute("v")} title="垂直等距 / Distribute vertically">
            <Icon path="M3 3h18M3 21h18M8 9h8v2H8zM8 13h8v2H8z" />
          </Btn>
        </>
      )}
      <span className="align-tb-sep" />
      <Btn
        danger
        onClick={() => sel.forEach((n) => !n.locked && removeNote(n.id))}
        title="删除选中 / Delete selected (Del)"
      >
        ×
      </Btn>
    </div>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  );
}
