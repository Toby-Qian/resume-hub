"use client";
import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { templates, templateList } from "@/templates";
import { t } from "@/lib/i18n";
import type { TemplateId } from "@/lib/store";

/**
 * Template grid with on-hover live previews. Each text button stays
 * compact (so the right-side StylePanel doesn't blow up vertically),
 * but hovering renders a real, miniaturized version of the template
 * filled with the user's actual resume data. This is much more useful
 * than a static png because the user sees how *their* content lands
 * in each template.
 *
 * Performance: only the hovered card materializes its template (one at
 * a time). The rest stay as text-only buttons.
 */
const PREVIEW_W = 260;          // px on screen
const PAPER_W   = 794;          // template's intrinsic width
const SCALE = PREVIEW_W / PAPER_W; // ~0.327

export function TemplateGrid() {
  const { template, setTemplate, theme, lang, resume } = useStore();
  const L = t(lang);
  const [hoverId, setHoverId] = useState<TemplateId | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Reposition the popup so it always fits in viewport (prefers left of grid).
  useEffect(() => {
    if (!hoverId || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    // Place popup to the LEFT of the StylePanel (it's the rightmost pane).
    const popupW = PREVIEW_W + 24;
    const popupH = PREVIEW_W * (1123 / PAPER_W) + 24;
    const left = Math.max(8, r.left - popupW - 12);
    const top  = Math.min(window.innerHeight - popupH - 12, Math.max(8, r.top));
    setPopupPos({ top, left });
  }, [hoverId]);

  return (
    <div ref={wrapRef} className="grid grid-cols-2 gap-2 relative">
      {templateList.map((id) => (
        <button
          key={id}
          onClick={() => setTemplate(id)}
          onMouseEnter={() => setHoverId(id)}
          onMouseLeave={() => setHoverId((c) => (c === id ? null : c))}
          onFocus={() => setHoverId(id)}
          onBlur={() => setHoverId(null)}
          className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
            template === id
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="truncate">{L.templates[id]}</span>
            <span className="text-[0.6rem] text-gray-300 group-hover:text-blue-400">👁</span>
          </div>
        </button>
      ))}

      {/* Floating preview popup */}
      {hoverId && popupPos && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
          style={{
            top: popupPos.top,
            left: popupPos.left,
            width: PREVIEW_W + 24,
            padding: 12,
          }}
        >
          <div className="text-[0.7rem] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <span className="text-blue-500">👁</span>
            {L.templates[hoverId]}
          </div>
          <div
            className="rounded-md overflow-hidden border border-gray-100 bg-white"
            style={{
              width: PREVIEW_W,
              height: PREVIEW_W * (1123 / PAPER_W),
            }}
          >
            <div
              style={{
                transform: `scale(${SCALE})`,
                transformOrigin: "top left",
                width: PAPER_W,
                /* Same paper variables as Preview.tsx */
                ["--resume-accent" as any]: theme.accent,
                ["--resume-font-sans" as any]: theme.fontSans,
                ["--resume-font-serif" as any]: theme.fontSerif,
                ["--resume-font-scale" as any]: String(theme.fontScale),
                fontFamily: "var(--resume-font-sans)",
              }}
              className={`paper density-${theme.density}`}
            >
              {(() => {
                const Tpl = templates[hoverId];
                return <Tpl resume={resume} />;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
