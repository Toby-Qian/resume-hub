"use client";
import { useStore } from "@/lib/store";
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

export function StylePanel() {
  const { template, setTemplate, theme, setTheme, lang } = useStore();
  const L = t(lang);

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

      <div>
        <div className="text-xs font-semibold uppercase text-gray-500 mb-2">{L.theme.accent}</div>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((c) => (
            <button key={c} onClick={() => setTheme({ accent: c })}
              className={`w-7 h-7 rounded-full border-2 ${theme.accent === c ? "border-gray-800" : "border-white"}`}
              style={{ background: c }} aria-label={c} />
          ))}
          <input type="color" value={theme.accent} onChange={(e) => setTheme({ accent: e.target.value })}
            className="w-7 h-7 border rounded cursor-pointer" />
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
