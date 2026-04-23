"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import templatesData from "@/data/templates.json";

type Row = {
  full_name: string; name: string; owner: string; html_url: string;
  description: string; stars: number; forks: number; language: string | null;
  topics: string[]; license: string | null; stack: string; lang: string;
  screenshot_guess: string; homepage: string | null;
};

const STACKS = ["all", "html", "latex", "typst", "markdown", "docx", "other"];
const LANGS = ["all", "zh", "en", "mixed"];

export function Gallery() {
  const { lang } = useStore();
  const L = t(lang);
  const [stack, setStack] = useState("all");
  const [flang, setFLang] = useState("all");
  const [q, setQ] = useState("");
  const rows = (templatesData as any).templates as Row[];

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (stack !== "all" && r.stack !== stack) return false;
      if (flang !== "all" && r.lang !== flang) return false;
      if (q && !`${r.full_name} ${r.description}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    }).slice(0, 300);
  }, [rows, stack, flang, q]);

  const Pill = ({ active, onClick, children }: any) => (
    <button onClick={onClick}
      className={`px-2.5 py-1 text-xs rounded-full border ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50 border-gray-300"}`}>
      {children}
    </button>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold">{L.gallery.title}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {L.gallery.sub} · {(templatesData as any).count} 个 / items
      </p>

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <span className="text-xs text-gray-500">{L.gallery.filterStack}:</span>
        {STACKS.map((s) => <Pill key={s} active={stack === s} onClick={() => setStack(s)}>{s}</Pill>)}
        <span className="text-xs text-gray-500 ml-2">{L.gallery.filterLang}:</span>
        {LANGS.map((s) => <Pill key={s} active={flang === s} onClick={() => setFLang(s)}>{(L.gallery as any)[s] ?? s}</Pill>)}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search..."
          className="ml-auto border rounded px-3 py-1.5 text-xs w-56" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <a key={r.full_name} href={r.html_url} target="_blank" rel="noreferrer"
            className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md hover:border-blue-400 transition">
            <div className="flex justify-between items-start">
              <div className="font-semibold text-sm truncate pr-2">{r.full_name}</div>
              <div className="text-xs text-amber-600 whitespace-nowrap">★ {r.stars.toLocaleString()}</div>
            </div>
            <div className="text-xs text-gray-500 line-clamp-2 mt-1 min-h-[32px]">{r.description || "—"}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{r.stack}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{r.lang}</span>
              {r.license && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{r.license}</span>}
              {r.language && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{r.language}</span>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
