"use client";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

/** Lightweight resume-completeness gauge.
 *  Heuristic: weight a handful of signals that visibly improve a resume.
 *  Each missing signal contributes to suggestions in the tooltip.            */
function score(resume: ReturnType<typeof useStore.getState>["resume"]) {
  const checks: { ok: boolean; weight: number; key: string }[] = [
    { key: "name",    weight: 10, ok: !!resume.basics.name?.trim() },
    { key: "label",   weight: 5,  ok: !!resume.basics.label?.trim() },
    { key: "email",   weight: 8,  ok: !!resume.basics.email?.trim() },
    { key: "phone",   weight: 5,  ok: !!resume.basics.phone?.trim() },
    { key: "location",weight: 4,  ok: !!resume.basics.location?.trim() },
    { key: "summary", weight: 8,  ok: (resume.basics.summary?.trim().length ?? 0) > 30 },
    { key: "avatar",  weight: 3,  ok: !!resume.basics.avatar },
    { key: "work",    weight: 18, ok: resume.work.length > 0 && resume.work.some((w) => w.highlights?.some((h) => h.trim())) },
    { key: "education", weight: 12, ok: resume.education.length > 0 },
    { key: "projects",weight: 12, ok: resume.projects.length > 0 && resume.projects.some((p) => p.description?.trim() || p.highlights?.some((h) => h.trim())) },
    { key: "skills",  weight: 10, ok: resume.skills.length > 0 },
    { key: "awards",  weight: 3,  ok: resume.awards.length > 0 },
    { key: "languages", weight: 2, ok: resume.languages.length > 0 },
  ];
  const total = checks.reduce((a, c) => a + c.weight, 0);
  const got = checks.reduce((a, c) => a + (c.ok ? c.weight : 0), 0);
  const pct = Math.round((got / total) * 100);
  const missing = checks.filter((c) => !c.ok).map((c) => c.key);
  return { pct, missing };
}

export function Completeness() {
  const resume = useStore((s) => s.resume);
  const lang = useStore((s) => s.lang);
  const L = t(lang);
  const C = (L as any).completeness ?? {};
  const { pct, missing } = score(resume);

  const tone =
    pct >= 85 ? { bar: "bg-emerald-500", txt: "text-emerald-700", chip: "bg-emerald-50 border-emerald-200" }
    : pct >= 60 ? { bar: "bg-blue-500",    txt: "text-blue-700",    chip: "bg-blue-50 border-blue-200" }
    : pct >= 35 ? { bar: "bg-amber-500",   txt: "text-amber-700",   chip: "bg-amber-50 border-amber-200" }
    :             { bar: "bg-rose-500",    txt: "text-rose-700",    chip: "bg-rose-50 border-rose-200" };

  const labels: Record<string, { zh: string; en: string }> = {
    name: { zh: "姓名", en: "Name" },
    label: { zh: "职位/头衔", en: "Headline" },
    email: { zh: "邮箱", en: "Email" },
    phone: { zh: "电话", en: "Phone" },
    location: { zh: "城市", en: "Location" },
    summary: { zh: "30字以上的简介", en: "Summary > 30 chars" },
    avatar: { zh: "头像", en: "Photo" },
    work: { zh: "工作经历(含要点)", en: "Work (with bullets)" },
    education: { zh: "教育背景", en: "Education" },
    projects: { zh: "项目(含描述)", en: "Projects (with details)" },
    skills: { zh: "技能", en: "Skills" },
    awards: { zh: "荣誉", en: "Awards" },
    languages: { zh: "语言", en: "Languages" },
  };
  const tip = missing.length === 0
    ? (C.complete ?? "✅ 简历各部分都填齐啦")
    : `${C.missing ?? "建议补充："}\n• ` + missing.map((k) => labels[k]?.[lang] || k).join("\n• ");

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[0.7rem] ${tone.chip}`}
      title={tip}
    >
      <span className={`font-semibold ${tone.txt}`}>{pct}%</span>
      <div className="w-20 h-1.5 rounded-full bg-white/70 overflow-hidden">
        <div className={`h-full ${tone.bar} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`hidden md:inline text-gray-500`}>
        {C.label ?? "完成度"}
      </span>
    </div>
  );
}
