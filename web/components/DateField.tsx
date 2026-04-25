"use client";
import { ChangeEvent } from "react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

/**
 * Smart date input for resume start/end dates.
 *
 * - Renders as <input type="month"> (browser-native YYYY-MM picker).
 * - For end-date use, an "至今 / Present" checkbox writes the literal
 *   string "Present" (matches the existing convention used across the
 *   templates' `range()` helper).
 * - We round-trip values: anything that doesn't parse as YYYY-MM
 *   (legacy "2023.5", "May 2023", etc.) falls back to a free-text input
 *   so users with old data don't suddenly lose anything. They can switch
 *   to the picker by clearing the field.
 */

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** When true, expose the "至今" toggle next to the input. */
  allowPresent?: boolean;
}

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const PRESENT_VALUES = ["present", "至今", "现在", "now"];

const isPresent = (v: string) => PRESENT_VALUES.includes(v.trim().toLowerCase());
const isMonthFmt = (v: string) => !v || MONTH_RE.test(v);

export function DateField({ label, value, onChange, allowPresent }: Props) {
  const lang = useStore((s) => s.lang);
  const L = t(lang);
  const presentLabel = lang === "zh" ? "至今" : "Present";
  const presentChecked = isPresent(value);
  const usePicker = !presentChecked && isMonthFmt(value);

  return (
    <label className="block mb-2">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[0.75rem] font-medium text-gray-600">{label}</span>
        {allowPresent && (
          <label className="flex items-center gap-1 text-[0.7rem] text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
            <input
              type="checkbox"
              className="accent-blue-600 w-3 h-3"
              checked={presentChecked}
              onChange={(e) => onChange(e.target.checked ? "Present" : "")}
            />
            <span>{presentLabel}</span>
          </label>
        )}
      </div>
      {presentChecked ? (
        <input
          type="text"
          value={presentLabel}
          disabled
          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-gray-50 text-gray-500"
        />
      ) : usePicker ? (
        <input
          type="month"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white hover:border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          placeholder="2023-05"
        />
      ) : (
        // Legacy free-text fallback for unparseable values; clearing it
        // switches the input back to the month picker on next focus.
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-amber-200 bg-amber-50/50 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
          placeholder="2023-05"
          title={lang === "zh" ? "格式不是 YYYY-MM；清空后可使用月份选择器" : "Not YYYY-MM format; clear to use the month picker"}
        />
      )}
    </label>
  );
}
