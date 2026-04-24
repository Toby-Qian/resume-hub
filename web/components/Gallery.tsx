"use client";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import templatesData from "@/data/templates.json";

// Rewrite relative URLs inside README to point at raw.githubusercontent /
// github.com so inline images and links keep working when we render the README
// out-of-context on our own domain.
function resolveUrl(url: string, fullName: string, branch: string, kind: "img" | "link"): string {
  if (/^(https?:|data:|mailto:|#)/i.test(url)) return url;
  const clean = url.replace(/^\.?\/+/, "");
  if (kind === "img") return `https://raw.githubusercontent.com/${fullName}/${branch}/${clean}`;
  return `https://github.com/${fullName}/blob/${branch}/${clean}`;
}

// naive markdown-ish -> html: just enough to make a README readable inline
// without pulling a markdown lib. Escapes HTML, then bolds/italics/code/links.
function renderReadme(md: string, fullName: string, branch: string): string {
  let s = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  s = s.replace(/```([\s\S]*?)```/g, (_m, code) => `<pre class="bg-gray-100 p-2 rounded text-xs overflow-x-auto">${code}</pre>`);
  s = s.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-xs">$1</code>');
  s = s.replace(/^### (.+)$/gm, '<h3 class="font-semibold mt-3 text-sm">$1</h3>');
  s = s.replace(/^## (.+)$/gm, '<h2 class="font-semibold mt-3 text-base">$1</h2>');
  s = s.replace(/^# (.+)$/gm, '<h1 class="font-bold mt-3 text-lg">$1</h1>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  s = s.replace(/\*([^*\n]+)\*/g, '<i>$1</i>');
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) =>
    `<img alt="${alt}" src="${resolveUrl(url, fullName, branch, "img")}" class="max-w-full my-2 rounded" loading="lazy" />`);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) =>
    `<a href="${resolveUrl(url, fullName, branch, "link")}" target="_blank" rel="noreferrer" class="text-blue-600 underline">${text}</a>`);
  s = s.replace(/\n{2,}/g, "</p><p class=\"my-2\">");
  return `<p class="my-2">${s}</p>`;
}

type Row = {
  full_name: string; name: string; owner: string; html_url: string;
  description: string; stars: number; forks: number; language: string | null;
  topics: string[]; license: string | null; stack: string; lang: string;
  screenshot_guess: string; homepage: string | null;
  default_branch?: string;
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

function PreviewModal({ row, onClose, L }: { row: Row; onClose: () => void; L: any }) {
  const [tab, setTab] = useState<"demo" | "readme">(row.homepage ? "demo" : "readme");
  const [readme, setReadme] = useState<string | null>(null);
  const [readmeBranch, setReadmeBranch] = useState<string>(row.default_branch || "main");
  const [readmeErr, setReadmeErr] = useState(false);

  useEffect(() => {
    if (tab !== "readme" || readme !== null || readmeErr) return;
    const tryFetch = async () => {
      const branches = Array.from(new Set([row.default_branch || "main", "main", "master"]));
      const names = ["README.md", "readme.md", "Readme.md", "README.MD"];
      for (const b of branches) {
        for (const n of names) {
          try {
            const r = await fetch(`https://raw.githubusercontent.com/${row.full_name}/${b}/${n}`);
            if (r.ok) {
              const text = await r.text();
              setReadme(text.slice(0, 20000));
              setReadmeBranch(b);
              return;
            }
          } catch { /* try next */ }
        }
      }
      setReadmeErr(true);
    };
    tryFetch();
  }, [tab, readme, readmeErr, row]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const overleaf = `https://www.overleaf.com/clsi/import/github?url=${encodeURIComponent(row.html_url)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center sm:p-4" onClick={onClose}>
      <div className="bg-white shadow-2xl w-full h-full sm:h-auto sm:rounded-lg sm:max-w-5xl sm:max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between px-4 py-3 border-b">
          <div className="min-w-0">
            <div className="font-semibold truncate">{row.full_name}</div>
            <div className="text-xs text-gray-500 truncate">{row.description || "—"}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <a href={row.html_url} target="_blank" rel="noreferrer"
              className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50">
              {L.gallery.openOnGithub}
            </a>
            {row.stack === "latex" && (
              <a href={overleaf} target="_blank" rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700">
                {L.gallery.openInOverleaf}
              </a>
            )}
            <button onClick={onClose}
              className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50">
              {L.gallery.close}
            </button>
          </div>
        </header>
        <div className="flex items-center gap-1 px-4 pt-3 border-b bg-gray-50">
          {row.homepage && (
            <button onClick={() => setTab("demo")}
              className={`text-xs px-3 py-1.5 rounded-t ${tab === "demo" ? "bg-white border border-b-white border-gray-300" : "text-gray-500 hover:text-gray-800"}`}>
              {L.gallery.previewHomepage}
            </button>
          )}
          <button onClick={() => setTab("readme")}
            className={`text-xs px-3 py-1.5 rounded-t ${tab === "readme" ? "bg-white border border-b-white border-gray-300" : "text-gray-500 hover:text-gray-800"}`}>
            {L.gallery.previewReadme}
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {tab === "demo" && row.homepage ? (
            <div className="flex flex-col h-full min-h-[60vh]">
              <div className="px-4 py-2 bg-amber-50 text-amber-900 text-xs border-b border-amber-200 flex items-center justify-between gap-2">
                <span className="truncate">{row.homepage}</span>
                <a href={row.homepage} target="_blank" rel="noreferrer" className="underline whitespace-nowrap">
                  ↗ {L.gallery.openOnGithub.replace(/GitHub/i, "新标签页").replace(/Open on/i, "Open in")}
                </a>
              </div>
              <iframe src={row.homepage} className="w-full flex-1 min-h-[55vh]"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
            </div>
          ) : tab === "demo" ? (
            <div className="p-8 text-center text-sm text-gray-500">{L.gallery.previewNoPreview}</div>
          ) : readmeErr ? (
            <div className="p-8 text-center text-sm text-gray-500">{L.gallery.previewNoPreview}</div>
          ) : readme === null ? (
            <div className="p-8 text-center text-sm text-gray-500">{L.gallery.previewLoading}</div>
          ) : (
            <div className="p-6 prose prose-sm max-w-none text-[0.9em] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderReadme(readme, row.full_name, readmeBranch) }} />
          )}
        </div>
      </div>
    </div>
  );
}

export function Gallery() {
  const { lang } = useStore();
  const L = t(lang);
  const [stack, setStack] = useState("all");
  const [flang, setFLang] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<Row | null>(null);
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
                <button type="button" onClick={() => setPreview(r)} className="block text-left">
                  <Thumbnail row={r} />
                </button>
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
                    <button type="button" onClick={() => setPreview(r)}
                      className="flex-1 text-xs text-center px-2 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
                      {L.gallery.preview}
                    </button>
                    {r.stack === "latex" ? (
                      <a href={overleafUrl(r)} target="_blank" rel="noreferrer"
                        className="flex-1 text-xs text-center px-2 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition">
                        {L.gallery.openInOverleaf}
                      </a>
                    ) : null}
                    <a href={r.html_url} target="_blank" rel="noreferrer"
                      className="flex-none text-xs text-center px-2 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition">
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

      {preview && <PreviewModal row={preview} onClose={() => setPreview(null)} L={L} />}
    </div>
  );
}
