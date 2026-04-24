"use client";
import { useStore } from "@/lib/store";
import { templates } from "@/templates";
import { t } from "@/lib/i18n";

export function Preview() {
  const { resume, template, theme, lang } = useStore();
  const L = t(lang);
  const Tpl = templates[template];
  return (
    <div className="flex flex-col items-center">
      <div
        className={`paper paper-flow print-area density-${theme.density}`}
        style={{
          ["--resume-accent" as any]: theme.accent,
          ["--resume-font-sans" as any]: theme.fontSans,
          ["--resume-font-serif" as any]: theme.fontSerif,
          ["--resume-font-scale" as any]: String(theme.fontScale),
          fontFamily: "var(--resume-font-sans)",
        }}
      >
        <Tpl resume={resume} />
      </div>
      <div className="text-[0.7rem] text-gray-400 mt-2 mb-4 px-4 text-center max-w-[794px] no-print">
        {L.preview.pageHint}
      </div>
    </div>
  );
}
