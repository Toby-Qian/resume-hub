"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable, useSectionLabels } from "./shared";

export default function CNCreative({ resume }: TemplateProps) {
  const b = resume.basics;
  const L = useSectionLabels();
  return (
    <div className="grid grid-cols-[35%_1fr]" style={{ minHeight: "inherit" }}>
      <aside style={{ background: "var(--resume-accent)", color: "white", padding: "var(--pad)" }}>
        {b.showAvatar && b.avatar && (
          <div className="mb-4"><Avatar basics={b} size={110} rounded="full" className="ring-2 ring-white/60" /></div>
        )}
        <Draggable name="header">
          <h1 className="text-[2em] font-bold leading-tight"><E path="basics.name">{b.name}</E></h1>
          <div className="text-[0.95em] opacity-90 mt-1"><E path="basics.label">{b.label}</E></div>
        </Draggable>
        <div className="h-px bg-white/40 my-4" />
        <div className="text-[0.85em] space-y-1 opacity-95">
          <div>📱 <E path="basics.phone">{b.phone}</E></div>
          <div>✉ <E path="basics.email">{b.email}</E></div>
          <div>📍 <E path="basics.location">{b.location}</E></div>
          <div>🔗 <E path="basics.website">{b.website}</E></div>
        </div>
        {resume.skills.length > 0 && (
          <>
            <div className="mt-6 mb-2 font-semibold tracking-wider text-[0.85em]">{L.skills}</div>
            {resume.skills.map((s, i) => (
              <div key={s.id} className={itemCls(s, "text-[0.85em] mb-2")}>
                <div className="font-semibold"><E path={`skills.${i}.name`}>{s.name}</E></div>
                <div className="opacity-90">{s.keywords.join(" · ")}</div>
              </div>
            ))}
          </>
        )}
        {resume.languages.length > 0 && (
          <>
            <div className="mt-6 mb-2 font-semibold tracking-wider text-[0.85em]">{L.languages}</div>
            {resume.languages.map((l, i) => (
              <div key={l.id} className={itemCls(l, "text-[0.85em]")}><E path={`languages.${i}.language`}>{l.language}</E> · <E path={`languages.${i}.fluency`}>{l.fluency}</E></div>
            ))}
          </>
        )}
      </aside>

      <main style={{ padding: "var(--pad)" }}>
        <Draggable name="summary"><p className="text-[0.95em] mb-5 text-gray-800"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>

        {resume.work.length > 0 && (
          <section className="resume-section mb-5">
            <h2 className="text-[1em] font-bold mb-2" style={{ color: "var(--resume-accent)" }}>{L.experience}</h2>
            {resume.work.map((w, i) => (
              <div key={w.id} className={itemCls(w, "mb-3 text-[0.92em]")}>
                <div className="flex justify-between"><b><E path={`work.${i}.company`}>{w.company}</E> · <E path={`work.${i}.position`}>{w.position}</E></b><span className="text-gray-500">{range(w.startDate, w.endDate)}</span></div>
                <ul className="list-disc ml-5 mt-1">
                  {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
                </ul>
              </div>
            ))}
          </section>
        )}

        {resume.projects.length > 0 && (
          <section className="resume-section mb-5">
            <h2 className="text-[1em] font-bold mb-2" style={{ color: "var(--resume-accent)" }}>{L.projects}</h2>
            {resume.projects.map((p, i) => (
              <div key={p.id} className={itemCls(p, "mb-3 text-[0.92em]")}>
                <div className="flex justify-between"><b><E path={`projects.${i}.name`}>{p.name}</E></b><span className="text-gray-500">{range(p.startDate, p.endDate)}</span></div>
                <div className="text-gray-700"><E path={`projects.${i}.description`} multiline>{p.description}</E></div>
                <ul className="list-disc ml-5">
                  {p.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`projects.${i}.highlights.${j}`}>{h}</E></li>)}
                </ul>
              </div>
            ))}
          </section>
        )}

        {resume.education.length > 0 && (
          <section className="resume-section mb-5">
            <h2 className="text-[1em] font-bold mb-2" style={{ color: "var(--resume-accent)" }}>{L.education}</h2>
            {resume.education.map((e, i) => (
              <div key={e.id} className={itemCls(e, "text-[0.92em] mb-1")}>
                <div className="flex justify-between"><b><E path={`education.${i}.institution`}>{e.institution}</E></b><span className="text-gray-500">{range(e.startDate, e.endDate)}</span></div>
                <div><E path={`education.${i}.studyType`}>{e.studyType}</E> · <E path={`education.${i}.area`}>{e.area}</E>{e.score ? ` · ${e.score}` : ""}</div>
              </div>
            ))}
          </section>
        )}

        {resume.awards.length > 0 && (
          <section className="resume-section">
            <h2 className="text-[1em] font-bold mb-2" style={{ color: "var(--resume-accent)" }}>{L.awards}</h2>
            <ul className="list-disc ml-5 text-[0.92em]">
              {resume.awards.map((a, i) => (
                <li key={a.id} className={itemCls(a)}><b><E path={`awards.${i}.title`}>{a.title}</E></b> · <E path={`awards.${i}.awarder`}>{a.awarder}</E> · <E path={`awards.${i}.date`}>{a.date}</E></li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
