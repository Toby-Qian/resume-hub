"use client";
import { useStore } from "@/lib/store";
import { templates } from "@/templates";

export function Preview() {
  const { resume, template, theme } = useStore();
  const Tpl = templates[template];
  return (
    <div
      className={`paper print-area density-${theme.density}`}
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
  );
}
