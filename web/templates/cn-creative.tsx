"use client";
import { TemplateProps, range, itemCls, Avatar } from "./shared";

export default function CNCreative({ resume }: TemplateProps) {
  const b = resume.basics;
  return (
    <div className="grid grid-cols-[35%_1fr]" style={{ minHeight: "inherit" }}>
      <aside style={{ background: "var(--resume-accent)", color: "white", padding: "var(--pad)" }}>
        {b.showAvatar && b.avatar && (
          <div className="mb-4"><Avatar basics={b} size={110} rounded="full" className="ring-2 ring-white/60" /></div>
        )}
        <h1 className="text-[2em] font-bold leading-tight">{b.name}</h1>
        <div className="text-[0.95em] opacity-90 mt-1">{b.label}</div>
        <div className="h-px bg-white/40 my-4" />
        <div className="text-[0.85em] space-y-1 opacity-95">
          {b.phone && <div>📱 {b.phone}</div>}
          {b.email && <div>✉ {b.email}</div>}
          {b.location && <div>📍 {b.location}</div>}
          {b.website && <div>🔗 {b.website}</div>}
        </div>
        {resume.skills.length > 0 && (
          <>
            <div className="mt-6 mb-2 font-semibold tracking-wider text-[0.85em]">专业技能</div>
            {resume.skills.map((s) => (
              <div key={s.id} className={itemCls(s, "text-[0.85em] mb-2")}>
                <div className="font-semibold">{s.name}</div>
                <div className="opacity-90">{s.keywords.join(" · ")}</div>
              </div>
            ))}
          </>
        )}
        {resume.languages.length > 0 && (
          <>
            <div className="mt-6 mb-2 font-semibold tracking-wider text-[0.85em]">语言</div>
            {resume.languages.map((l) => (
              <div key={l.id} className={itemCls(l, "text-[0.85em]")}>{l.language} · {l.fluency}</div>
            ))}
          </>
        )}
      </aside>

      <main style={{ padding: "var(--pad)" }}>
        {b.summary && <p className="text-[0.95em] mb-5 text-gray-800">{b.summary}</p>}

        {resume.work.length > 0 && (
          <section className="resume-section mb-5">
            <h2 className="text-[1em] font-bold mb-2" style={{ color: "var(--resume-accent)" }}>工作经历</h2>
            {resume.work.map((w) => (
              <div key={w.id} className={itemCls(w, "mb-3 text-[0.92em]")}>
                <div className="flex justify-between"><b>{w.company} · {w.position}</b><span className="text-gray-500">{range(w.startDate, w.endDate)}</span></div>
                <ul className="list-disc ml-5 mt-1">
                  {w.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            ))}
          </section>
        )}

        {resume.projects.length > 0 && (
          <section className="resume-section mb-5">
            <h2 className="text-[1em] font-bold mb-2" style={{ color: "var(--resume-accent)" }}>项目经历</h2>
            {resume.projects.map((p) => (
              <div key={p.id} className={itemCls(p, "mb-3 text-[0.92em]")}>
                <div className="flex justify-between"><b>{p.name}</b><span className="text-gray-500">{range(p.startDate, p.endDate)}</span></div>
                <div className="text-gray-700">{p.description}</div>
                <ul className="list-disc ml-5">
                  {p.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            ))}
          </section>
        )}

        {resume.education.length > 0 && (
          <section className="resume-section mb-5">
            <h2 className="text-[1em] font-bold mb-2" style={{ color: "var(--resume-accent)" }}>教育背景</h2>
            {resume.education.map((e) => (
              <div key={e.id} className={itemCls(e, "text-[0.92em] mb-1")}>
                <div className="flex justify-between"><b>{e.institution}</b><span className="text-gray-500">{range(e.startDate, e.endDate)}</span></div>
                <div>{e.studyType} · {e.area}{e.score ? ` · ${e.score}` : ""}</div>
              </div>
            ))}
          </section>
        )}

        {resume.awards.length > 0 && (
          <section className="resume-section">
            <h2 className="text-[1em] font-bold mb-2" style={{ color: "var(--resume-accent)" }}>荣誉奖项</h2>
            <ul className="list-disc ml-5 text-[0.92em]">
              {resume.awards.map((a) => (
                <li key={a.id} className={itemCls(a)}><b>{a.title}</b> · {a.awarder} · {a.date}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
