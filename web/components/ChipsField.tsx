"use client";
import { KeyboardEvent, useState } from "react";

interface Props {
  label: string;
  /** Current chips (the model). */
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  /** Hint shown under the input (e.g. "Enter / 逗号 添加"). */
  hint?: string;
}

/**
 * Tag-style multi-value input. Type a value and press `Enter`, `,`, or `;` to
 * commit it as a chip. `Backspace` on an empty input removes the last chip.
 * The whole row is clickable to focus the inline `<input>`. Pasting a comma /
 * newline-separated string splits into multiple chips at once.
 */
export function ChipsField({ label, value, onChange, placeholder, hint }: Props) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const parts = raw
      .split(/[,;\n\r、，；]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const seen = new Set(value.map((v) => v.toLowerCase()));
    const next = [...value];
    for (const p of parts) {
      const k = p.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      next.push(p);
    }
    onChange(next);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      commit(draft);
      return;
    }
    if (e.key === "Backspace" && draft === "" && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <label className="block mb-2">
      <span className="block text-[0.75rem] font-medium text-gray-600 mb-0.5">{label}</span>
      <div
        className="w-full border rounded-lg px-1.5 py-1 text-sm bg-white border-gray-200 hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all flex flex-wrap gap-1 cursor-text"
        onClick={(e) => {
          // Focus the inline input when clicking empty space inside the box.
          const t = e.target as HTMLElement;
          if (t.tagName !== "INPUT" && t.tagName !== "BUTTON") {
            const input = (e.currentTarget as HTMLElement).querySelector("input");
            input?.focus();
          }
        }}
      >
        {value.map((chip, i) => (
          <span
            key={`${chip}-${i}`}
            className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[0.78rem] leading-none"
          >
            <span className="max-w-[14rem] truncate">{chip}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeAt(i); }}
              className="w-4 h-4 grid place-items-center rounded-full text-blue-500 hover:text-white hover:bg-blue-500 transition"
              title="移除 / remove"
              aria-label="remove tag"
            >×</button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => { if (draft.trim()) commit(draft); }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (/[,;\n、，；]/.test(text)) {
              e.preventDefault();
              commit((draft ? draft + "," : "") + text);
            }
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[6rem] outline-none text-sm bg-transparent placeholder:text-gray-300 px-1 py-0.5"
        />
      </div>
      {hint && <span className="block text-[0.65rem] text-gray-400 mt-0.5">{hint}</span>}
    </label>
  );
}
