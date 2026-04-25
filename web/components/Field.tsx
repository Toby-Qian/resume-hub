"use client";
import { ChangeEvent, useState } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  requiredMessage?: string;
  validate?: (v: string) => string | null;   // returns error message or null
}

export function Field({ label, value, onChange, textarea, placeholder, rows = 3, required, requiredMessage, validate }: Props) {
  const [touched, setTouched] = useState(false);
  const v = value || "";

  let error: string | null = null;
  if (touched) {
    if (required && !v.trim()) error = requiredMessage || "";
    else if (validate) error = validate(v);
  }
  const hasError = !!error;

  const baseCls = "w-full border rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none transition-all placeholder:text-gray-300";
  const borderCls = hasError
    ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-rose-50/50"
    : "border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  const common = {
    value: v,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    onBlur: () => setTouched(true),
    placeholder,
    className: `${baseCls} ${borderCls}`,
  };
  return (
    <label className="block mb-2">
      <span className="block text-[0.75rem] font-medium text-gray-600 mb-0.5">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </span>
      {textarea ? <textarea rows={rows} {...common} /> : <input type="text" {...common} />}
      {hasError && error && (
        <span className="block text-[0.7rem] text-rose-600 mt-0.5">{error}</span>
      )}
    </label>
  );
}
