"use client";
import { useStore, defaultTheme, ThemeTokens } from "@/lib/store";
import { t } from "@/lib/i18n";
import { templateList } from "@/templates";

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
  const { template, setTemplate, theme, setTheme, lang } = useStore();
  const L = t(lang);
  const S = (L as any).style ?? {};
  const onResetTheme = () => setTheme({ ...defaultTheme });

  return (
    <div className="space-y-5 text-sm">
      <div>
        <div className="text-xs font-semibold uppercase text-gray-500 mb-2">Template</div>
        <div className="grid grid-cols-2 gap-2">
          {templateList.map((id) => (
            <button
              key={id}
              onClick={() => setTemplate(id)}
              className={`text-left px-3 py-2 rounded border text-xs ${
                template === id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {L.templates[id]}
            </button>
          ))}
        </div>
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

      <div>
        <div className="text-xs font-semibold uppercase text-gray-500 mb-2">
          {L.theme.fontScale} — {theme.fontScale.toFixed(2)}
        </div>
        <input type="range" min={0.85} max={1.2} step={0.01} value={theme.fontScale}
          onChange={(e) => setTheme({ fontScale: Number(e.target.value) })} className="w-full" />
      </div>
    </div>
  );
}
