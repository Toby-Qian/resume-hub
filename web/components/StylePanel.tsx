"use client";
import { useStore, defaultTheme, ThemeTokens, normalizeMargin } from "@/lib/store";
import type { SectionKey } from "@/lib/schema";
import { t } from "@/lib/i18n";
import { TemplateGrid } from "./TemplatePreview";

const SECTION_KEYS: SectionKey[] = ["work", "education", "projects", "skills", "awards", "languages"];
const SECTION_ICONS: Record<SectionKey, string> = {
  work: "💼", education: "🎓", projects: "🚀", skills: "🛠", awards: "🏆", languages: "🌐",
};

const MARGIN_PRESETS: { mm: number; key: string }[] = [
  { mm: 0,  key: "marginNone" },
  { mm: 10, key: "marginNarrow" },
  { mm: 15, key: "marginNormal" },
  { mm: 20, key: "marginWide" },
];

const PRESETS = ["#2563eb", "#dc2626", "#059669", "#7c3aed", "#ea580c", "#0891b2", "#111827"];
const SANS = [
  "'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  "'Helvetica Neue', 'PingFang SC', sans-serif",
  "'system-ui', 'Microsoft YaHei', sans-serif",
  "'Noto Sans SC', sans-serif",
];
const SERIF = [
  "'Source Serif Pro', 'Source Han Serif SC', serif",
  "'Georgia', 'Source Han Serif SC', serif",
  "'EB Garamond', 'Noto Serif SC', serif",
];

/** Curated palette: one click sets accent + sans + serif to a cohesive set.   */
type Preset = { id: string; nameZh: string; nameEn: string; accent: string; sans: string; serif: string };
const THEME_PRESETS: Preset[] = [
  { id: "modern-blue",   nameZh: "现代蓝",   nameEn: "Modern Blue",   accent: "#2563eb", sans: SANS[0], serif: SERIF[0] },
  { id: "classic-black", nameZh: "经典黑",   nameEn: "Classic Black", accent: "#111827", sans: SANS[1], serif: SERIF[1] },
  { id: "academic-green",nameZh: "学院绿",   nameEn: "Academic Green",accent: "#065f46", sans: SANS[0], serif: SERIF[2] },
  { id: "bordeaux",      nameZh: "酒红",     nameEn: "Bordeaux",      accent: "#9f1239", sans: SANS[0], serif: SERIF[0] },
  { id: "warm-orange",   nameZh: "暖橙",     nameEn: "Warm Orange",   accent: "#c2410c", sans: SANS[2], serif: SERIF[1] },
  { id: "deep-purple",   nameZh: "深紫",     nameEn: "Deep Purple",   accent: "#5b21b6", sans: SANS[0], serif: SERIF[0] },
  { id: "cool-slate",    nameZh: "冷灰",     nameEn: "Cool Slate",    accent: "#475569", sans: SANS[1], serif: SERIF[0] },
  { id: "teal",          nameZh: "湖青",     nameEn: "Teal",          accent: "#0f766e", sans: SANS[0], serif: SERIF[0] },
];

function isMatchingPreset(theme: ThemeTokens, p: Preset) {
  return theme.accent.toLowerCase() === p.accent.toLowerCase()
    && theme.fontSans === p.sans
    && theme.fontSerif === p.serif;
}

export function StylePanel() {
  const { theme, setTheme, lang, pageSetup, setPageSetup,
          hiddenSections, toggleSectionVisibility } = useStore();
  const L = t(lang);
  const S = (L as any).style ?? {};
  const E = (L as any).exportMenu ?? {};
  const onResetTheme = () => setTheme({ ...defaultTheme });
  const currentMargin = normalizeMargin(pageSetup.margin);
  const setMargin = (mm: number) =>
    setPageSetup({ margin: Math.max(0, Math.min(30, Math.round(mm))) });

  return (
    <div className="space-y-5 text-sm">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase text-gray-500">Template</div>
          <span className="text-[0.6rem] text-gray-400">{S.hoverHint ?? "悬停可预览"}</span>
        </div>
        <TemplateGrid />
      </div>

      {/* Theme presets — accent + sans + serif in one click */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase text-gray-500">
            {S.presets ?? "配色预设"}
          </div>
          <button onClick={onResetTheme}
            className="text-[0.7rem] text-gray-400 hover:text-gray-700 transition"
            title={S.resetTheme ?? "重置为默认"}
          >
            ↺ {S.reset ?? "重置"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {THEME_PRESETS.map((p) => {
            const active = isMatchingPreset(theme, p);
            return (
              <button
                key={p.id}
                onClick={() => setTheme({ accent: p.accent, fontSans: p.sans, fontSerif: p.serif })}
                className={`group flex items-center gap-2 px-2 py-1.5 rounded border text-left transition ${
                  active ? "border-blue-500 bg-blue-50 ring-1 ring-blue-300" : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                }`}
                title={`${lang === "zh" ? p.nameZh : p.nameEn} · ${p.accent}`}
              >
                <span className="w-5 h-5 rounded-full shrink-0 ring-1 ring-black/10"
                      style={{ background: p.accent }} />
                <span className="text-[0.7rem] text-gray-700 truncate">
                  {lang === "zh" ? p.nameZh : p.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom accent picker (for users who want freedom beyond presets) */}
      <div>
        <div className="text-xs font-semibold uppercase text-gray-500 mb-2">
          {L.theme.accent} <span className="font-normal text-gray-400 normal-case">· {S.custom ?? "自定义"}</span>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {PRESETS.map((c) => (
            <button key={c} onClick={() => setTheme({ accent: c })}
              className={`w-7 h-7 rounded-full border-2 transition ${theme.accent.toLowerCase() === c.toLowerCase() ? "border-gray-800 scale-110" : "border-white hover:border-gray-300"}`}
              style={{ background: c }} aria-label={c} />
          ))}
          <input type="color" value={theme.accent} onChange={(e) => setTheme({ accent: e.target.value })}
            className="w-7 h-7 border rounded cursor-pointer" />
          <span className="text-[0.65rem] font-mono text-gray-400">{theme.accent}</span>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase text-gray-500 mb-2">{L.theme.fontSans}</div>
        <select value={theme.fontSans} onChange={(e) => setTheme({ fontSans: e.target.value })}
          className="w-full border rounded px-2 py-1.5 text-xs">
          {SANS.map((f) => <option key={f} value={f}>{f.split(",")[0].replace(/'/g, "")}</option>)}
        </select>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase text-gray-500 mb-2">{L.theme.fontSerif}</div>
        <select value={theme.fontSerif} onChange={(e) => setTheme({ fontSerif: e.target.value })}
          className="w-full border rounded px-2 py-1.5 text-xs">
          {SERIF.map((f) => <option key={f} value={f}>{f.split(",")[0].replace(/'/g, "")}</option>)}
        </select>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase text-gray-500 mb-2">{L.theme.density}</div>
        <div className="grid grid-cols-3 gap-1">
          {(["compact", "comfy", "spacious"] as const).map((d) => (
            <button key={d} onClick={() => setTheme({ density: d })}
              className={`text-xs py-1.5 rounded border ${theme.density === d ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300"}`}>
              {L.theme[`density_${d}` as const]}
            </button>
          ))}
        </div>
      </div>

      {/* Page margin (live-previewed via padding on .paper) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase text-gray-500">
            {E.margin ?? "页边距"}
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={30}
              step={1}
              value={currentMargin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-12 text-center text-[0.7rem] border border-gray-200 rounded px-1 py-0.5 font-mono focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <span className="text-[0.65rem] text-gray-400 font-mono">mm</span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={30}
          step={1}
          value={currentMargin}
          onChange={(e) => setMargin(Number(e.target.value))}
          className="w-full accent-blue-600 mb-1.5"
        />
        <div className="grid grid-cols-4 gap-1">
          {MARGIN_PRESETS.map((m) => (
            <button key={m.mm}
              onClick={() => setMargin(m.mm)}
              className={`px-1 py-1 rounded border text-[0.7rem] transition ${
                currentMargin === m.mm
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
              title={`${m.mm}mm`}
            >
              {E[m.key] ?? m.mm}
              <span className="ml-1 text-[0.6rem] text-gray-400 font-mono">{m.mm}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold uppercase text-gray-500 mb-2">
          {L.theme.fontScale} — {theme.fontScale.toFixed(2)}
        </div>
        <input type="range" min={0.85} max={1.2} step={0.01} value={theme.fontScale}
          onChange={(e) => setTheme({ fontScale: Number(e.target.value) })} className="w-full" />
      </div>

      {/* Line height — body & list-item line-height (unitless) ------------ */}
      <div>
        <div className="text-xs font-semibold uppercase text-gray-500 mb-2">
          {(L.theme as any).lineHeight ?? "行间距"} — {(theme.lineHeight ?? 1.55).toFixed(2)}
        </div>
        <input
          type="range"
          min={1.1}
          max={2.2}
          step={0.05}
          value={theme.lineHeight ?? 1.55}
          onChange={(e) => setTheme({ lineHeight: Number(e.target.value) })}
          className="w-full accent-blue-600"
        />
        <div className="grid grid-cols-4 gap-1 mt-1">
          {[1.2, 1.45, 1.7, 2.0].map((v) => (
            <button
              key={v}
              onClick={() => setTheme({ lineHeight: v })}
              className={`px-1 py-1 rounded border text-[0.7rem] transition ${
                Math.abs((theme.lineHeight ?? 1.55) - v) < 0.03
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            >
              {v.toFixed(2)}
            </button>
          ))}
        </div>
      </div>

      {/* Bullet style — controls every <ul> inside .paper ----------------- */}
      <div>
        <div className="text-xs font-semibold uppercase text-gray-500 mb-2">
          {(L.theme as any).bullet ?? "项目符号"}
        </div>
        <div className="grid grid-cols-5 gap-1">
          {([
            { id: "disc",   glyph: "•",  label: (L.theme as any).bulletDisc   ?? "圆点" },
            { id: "circle", glyph: "○",  label: (L.theme as any).bulletCircle ?? "空心" },
            { id: "square", glyph: "■",  label: (L.theme as any).bulletSquare ?? "方块" },
            { id: "dash",   glyph: "—",  label: (L.theme as any).bulletDash   ?? "破折号" },
            { id: "none",   glyph: "∅",  label: (L.theme as any).bulletNone   ?? "无" },
          ] as const).map((b) => {
            const active = (theme.bulletStyle ?? "disc") === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setTheme({ bulletStyle: b.id })}
                title={b.label}
                className={`flex flex-col items-center py-1.5 rounded border text-[0.65rem] transition ${
                  active
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                <span className="text-base leading-none mb-0.5" style={{ color: active ? "#2563eb" : "#374151" }}>
                  {b.glyph}
                </span>
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section visibility toggles — hide a section from the rendered
          resume without losing its data. Implemented by zeroing the
          array before passing to Tpl (see Preview.tsx).               */}
      <div>
        <div className="text-xs font-semibold uppercase text-gray-500 mb-2">
          {S.visibility ?? "节区可见性"}
        </div>
        <div className="space-y-1">
          {SECTION_KEYS.map((k) => {
            const visible = !hiddenSections.includes(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleSectionVisibility(k)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition ${
                  visible
                    ? "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                    : "border-gray-200 bg-gray-100/70 text-gray-400"
                }`}
                title={visible ? (S.hideSection ?? "隐藏") : (S.showSection ?? "显示")}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base leading-none">{SECTION_ICONS[k]}</span>
                  <span>{L.sections[k]}</span>
                </span>
                <span className={`text-[0.85em] ${visible ? "text-emerald-500" : "text-gray-400"}`}>
                  {visible ? "👁" : "✕"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
