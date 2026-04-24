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
      <div className="text-[0.7rem] text-gray-400 mt-2 mb-4 px-4 text-center max-w-[794px] no-print space-y-0.5">
        <div>{(L.preview as any).editHint ?? "点击任意文字即可在预览中直接编辑；悬停文本区块左侧可拖动整段位置"}</div>
        <div>{L.preview.pageHint}</div>
      </div>
    </div>
  );
}
