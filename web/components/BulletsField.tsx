"use client";
import { KeyboardEvent, useState } from "react";

interface Props {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  hint?: string;
}

/**
 * Editable list of bullet points (one per row), with per-row reorder + delete.
 * Replaces the previous "one big textarea, newline-separated" UX:
 *   - Each line is its own focusable row → much clearer than counting newlines.
 *   - Drag handle ⋮⋮ on each row reorders via HTML5 DnD; arrow keys also work
 *     when a row's input is focused (Alt+Up / Alt+Down).
 *   - "+" button adds a new empty row that auto-focuses.
 *   - Pressing Enter in any row adds a new row right after.
 *   - Empty rows are stripped on persistence so blanks don't bleed into PDF.
 */
export function BulletsField({ label, value, onChange, placeholder, hint }: Props) {
  // Render even when value is undefined — guard.
  const items = value || [];
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const update = (idx: number, v: string) => {
    const next = items.slice();
    next[idx] = v;
    onChange(next);
  };
  const add = (afterIdx?: number) => {
    const next = items.slice();
    if (afterIdx === undefined) next.push("");
    else next.splice(afterIdx + 1, 0, "");
    onChange(next);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return;
    const next = items.slice();
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add(idx);
      // Auto-focus the new row on next paint.
      requestAnimationFrame(() => {
        const inputs = (e.currentTarget.closest(".bullets-list") as HTMLElement | null)
          ?.querySelectorAll<HTMLInputElement>("input.bullet-row-input");
        inputs?.[idx + 1]?.focus();
      });
      return;
    }
    if (e.key === "Backspace" && (e.currentTarget as HTMLInputElement).value === "" && items.length > 1) {
      e.preventDefault();
      remove(idx);
      requestAnimationFrame(() => {
        const inputs = (e.currentTarget.closest(".bullets-list") as HTMLElement | null)
          ?.querySelectorAll<HTMLInputElement>("input.bullet-row-input");
        inputs?.[Math.max(0, idx - 1)]?.focus();
      });
      return;
    }
    if (e.altKey && e.key === "ArrowUp") {
      e.preventDefault();
      move(idx, idx - 1);
      return;
    }
    if (e.altKey && e.key === "ArrowDown") {
      e.preventDefault();
      move(idx, idx + 1);
      return;
    }
  };

  return (
    <label className="block mb-2">
      <span className="block text-[0.75rem] font-medium text-gray-600 mb-0.5">{label}</span>
      <div className="bullets-list space-y-1">
        {items.length === 0 ? (
          <button
            type="button"
            onClick={() => add()}
            className="w-full text-left text-[0.78rem] text-gray-400 border border-dashed border-gray-200 rounded-lg px-2.5 py-2 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/40 transition"
          >
            + {placeholder ?? label}
          </button>
        ) : (
          items.map((row, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/x-bullet-idx", String(i));
                e.dataTransfer.effectAllowed = "move";
                setDraggingIdx(i);
              }}
              onDragEnd={() => setDraggingIdx(null)}
              onDragOver={(e) => {
                if (!e.dataTransfer.types.includes("text/x-bullet-idx")) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                const el = e.currentTarget as HTMLElement;
                const rect = el.getBoundingClientRect();
                const top = e.clientY < rect.top + rect.height / 2;
                el.classList.add("drop-indicator");
                el.classList.toggle("drop-indicator-top", top);
                el.classList.toggle("drop-indicator-bottom", !top);
              }}
              onDragLeave={(e) => {
                (e.currentTarget as HTMLElement).classList.remove(
                  "drop-indicator", "drop-indicator-top", "drop-indicator-bottom"
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                const el = e.currentTarget as HTMLElement;
                el.classList.remove("drop-indicator", "drop-indicator-top", "drop-indicator-bottom");
                const from = Number(e.dataTransfer.getData("text/x-bullet-idx"));
                if (Number.isNaN(from)) return;
                const rect = el.getBoundingClientRect();
                const top = e.clientY < rect.top + rect.height / 2;
                let to = i + (top ? 0 : 1);
                if (from < to) to -= 1;
                move(from, to);
              }}
              className={`group flex items-center gap-1.5 rounded-lg border px-1.5 py-1 transition ${
                draggingIdx === i ? "opacity-40" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span
                className="text-gray-300 group-hover:text-amber-500 cursor-grab active:cursor-grabbing select-none text-sm leading-none px-0.5"
                title="拖动重排 / drag to reorder · Alt+↑/↓"
              >⋮⋮</span>
              <span className="text-blue-400 text-xs select-none">•</span>
              <input
                type="text"
                value={row}
                onChange={(e) => update(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(e, i)}
                placeholder={placeholder}
                className="bullet-row-input flex-1 outline-none text-sm bg-transparent placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                title="删除 / remove"
                className="text-gray-300 hover:text-rose-600 text-[0.7rem] opacity-0 group-hover:opacity-100 transition px-1"
                aria-label="remove bullet"
              >✕</button>
            </div>
          ))
        )}
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => add()}
            className="text-[0.7rem] text-blue-600 hover:text-blue-700 hover:underline px-2 py-0.5"
          >+ 新增</button>
        )}
      </div>
      {hint && <span className="block text-[0.65rem] text-gray-400 mt-0.5">{hint}</span>}
    </label>
  );
}
