"use client";
import { ChangeEvent } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
  rows?: number;
}

export function Field({ label, value, onChange, textarea, placeholder, rows = 3 }: Props) {
  const common = {
    value: value || "",
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder,
    className: "w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500",
  };
  return (
    <label className="block mb-2">
      <span className="block text-[0.75rem] font-medium text-gray-600 mb-0.5">{label}</span>
      {textarea ? <textarea rows={rows} {...common} /> : <input type="text" {...common} />}
    </label>
  );
}
