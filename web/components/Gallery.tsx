"use client";
import { useEffect, useMemo, useState } from "react";
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
const PAGE_SIZE = 50;

const hueFrom = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
};

const initials = (full: string) => {
  const parts = full.split(/[\/\-_ ]+/).filter(Boolean);
  const chars = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
  return chars || "?";
};

function Thumbnail({ row }: { row: Row }) {
  const ogUrl = `https://opengraph.githubassets.com/1/${row.full_name}`;
  const [err, setErr] = useState(false);
  const hue = hueFrom(row.full_name);
  if (err) {
    return (
      <div
        className="aspect-[2/1] w-full rounded-t-lg flex items-center justify-center text-white text-2xl font-bold"
        style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 45%), hsl(${(hue + 40) % 360} 60% 35%))` }}
        aria-hidden
      >
        {initials(row.full_name)}
      </div>
    );
  }
  return (
    <img
      src={ogUrl}
      loading="lazy"
      alt=""
      className="aspect-[2/1] w-full object-cover rounded-t-lg bg-gray-100"
      onError={() => setErr(true)}
    />
  );
}

export function Gallery() {
  const { lang } = useStore();
  const L = t(lang);
  const [stack, setStack] = useState("all");
  const [flang, setFLang] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const rows = (templatesData as any).templates as Row[];

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (stack !== "all" && r.stack !== stack) return false;
      if (flang !== "all" && r.lang !== flang) return false;
      if (q && !`${r.full_name} ${r.description}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [rows, stack, flang, q]);

  // Reset pagination whenever filters change
  useEffect(() => { setPage(1); }, [stack, flang, q]);

  const shown = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = shown.length < filtered.length;

  const clearFilters = () => { setStack("all"); setFLang("all"); setQ(""); };

  const Pill = ({ active, onClick, children }: any) => (
    <button onClick={onClick}
      className={`px-2.5 py-1 text-xs rounded-full border ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50 border-gray-300"}`}>
      {children}
    </button>
  );

  const overleafUrl = (r: Row) =>
    `https://www.overleaf.com/clsi/import/github?url=${encodeURIComponent(r.html_url)}`;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold">{L.gallery.title}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {L.gallery.sub} · {(templatesData as any).count} items
      </p>

      <div className="flex flex-wrap gap-2 items-center mb-2">
        <span className="text-xs text-gray-500">{L.gallery.filterStack}:</span>
        {STACKS.map((s) => <Pill key={s} active={stack === s} onClick={() => setStack(s)}>{s}</Pill>)}
      </div>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <span className="text-xs text-gray-500">{L.gallery.filterLang}:</span>
        {LANGS.map((s) => <Pill key={s} active={flang === s} onClick={() => setFLang(s)}>{(L.gallery as any)[s] ?? s}</Pill>)}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L.gallery.search}
          className="ml-auto border rounded px-3 py-1.5 text-xs w-full sm:w-72" />
      </div>

      <div className="text-xs text-gray-500 mb-3">
        {L.gallery.showing.replace("{shown}", shown.length.toString()).replace("{total}", filtered.length.toString())}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-5xl mb-3" aria-hidden>🗂️</div>
          <div className="text-sm text-gray-600 mb-3">{L.gallery.empty}</div>
          <button onClick={clearFilters}
            className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">
            {L.gallery.clearFilters}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((r) => (
              <div key={r.full_name}
                className="border border-gray-200 rounded-lg bg-white hover:shadow-md hover:border-blue-400 transition overflow-hidden flex flex-col">
                <a href={r.html_url} target="_blank" rel="noreferrer" className="block">
                  <Thumbnail row={r} />
                </a>
                <div className="p-3 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <a href={r.html_url} target="_blank" rel="noreferrer"
                      className="font-semibold text-sm truncate pr-2 hover:text-blue-600">
                      {r.full_name}
                    </a>
                    <div className="text-xs text-amber-600 whitespace-nowrap">★ {r.stars.toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2 mt-1 min-h-[32px]">{r.description || "—"}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{r.stack}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{r.lang}</span>
                    {r.license && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{r.license}</span>}
                    {r.language && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{r.language}</span>}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    {r.stack === "latex" ? (
                      <a href={overleafUrl(r)} target="_blank" rel="noreferrer"
                        className="flex-1 text-xs text-center px-2 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition">
                        {L.gallery.openInOverleaf}
                      </a>
                    ) : null}
                    <a href={r.html_url} target="_blank" rel="noreferrer"
                      className={`${r.stack === "latex" ? "flex-none" : "flex-1"} text-xs text-center px-2 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition`}>
                      {L.gallery.openOnGithub}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 text-center">
              <button onClick={() => setPage((p) => p + 1)}
                className="text-xs px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50">
                {L.gallery.loadMore}（{filtered.length - shown.length}）
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
