"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable } from "./shared";

export default function Minimal({ resume }: TemplateProps) {
  const b = resume.basics;
  const Row = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="resume-section grid grid-cols-[110px_1fr] gap-4 mb-5">
      <div className="text-[0.75em] uppercase tracking-widest text-gray-400 pt-1">{title}</div>
      <div className="space-y-3">{children}</div>
    </section>
  );
  return (
    <div style={{ padding: "var(--pad)" }}>
      <Draggable name="header" as="header" className="mb-8 flex items-center gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-[2.4em] font-light"><E path="basics.name">{b.name}</E></h1>
          <div className="text-[1em] text-gray-500 mt-1"><E path="basics.label">{b.label}</E></div>
        </div>
        <Avatar basics={b} size={80} rounded="sm" />
      </Draggable>

      <Row title="Contact">
        <div className="text-[0.9em] text-gray-700 space-y-0.5">
          <div><E path="basics.email">{b.email}</E></div>
          <div><E path="basics.phone">{b.phone}</E></div>
          <div><E path="basics.location">{b.location}</E></div>
          <div><E path="basics.website">{b.website}</E></div>
        </div>
      </Row>

      <Row title="About">
        <Draggable name="summary"><p className="text-[0.95em]"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>
      </Row>

      {resume.work.length > 0 && (
        <Row title="Work">
          {resume.work.map((w, i) => (
            <div key={w.id} className={itemCls(w)}>
              <div className="text-[0.95em]"><b><E path={`work.${i}.position`}>{w.position}</E></b> at <E path={`work.${i}.company`}>{w.company}</E> <span className="text-gray-400">· {range(w.startDate, w.endDate)}</span></div>
              <ul className="list-[circle] ml-5 text-[0.9em] text-gray-700">
                {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
              </ul>
            </div>
          ))}
        </Row>
      )}

      {resume.education.length > 0 && (
        <Row title="Edu">
          {resume.education.map((e, i) => (
            <div key={e.id} className={itemCls(e, "text-[0.9em]")}>
              <b><E path={`education.${i}.institution`}>{e.institution}</E></b> — <E path={`education.${i}.studyType`}>{e.studyType}</E>, <E path={`education.${i}.area`}>{e.area}</E> <span className="text-gray-400">· {range(e.startDate, e.endDate)}</span>
            </div>
          ))}
        </Row>
      )}

      {resume.projects.length > 0 && (
        <Row title="Projects">
          {resume.projects.map((p, i) => (
            <div key={p.id} className={itemCls(p, "text-[0.9em]")}>
              <b><E path={`projects.${i}.name`}>{p.name}</E></b> — <span className="text-gray-600"><E path={`projects.${i}.description`} multiline>{p.description}</E></span>
            </div>
          ))}
        </Row>
      )}

      {resume.skills.length > 0 && (
        <Row title="Skills">
          {resume.skills.map((s, i) => (
            <div key={s.id} className={itemCls(s, "text-[0.9em]")}><b><E path={`skills.${i}.name`}>{s.name}</E></b> — {s.keywords.join(", ")}</div>
          ))}
        </Row>
      )}

      {resume.awards.length > 0 && (
        <Row title="Awards">
          {resume.awards.map((a, i) => (
            <div key={a.id} className={itemCls(a, "text-[0.9em]")}><b><E path={`awards.${i}.title`}>{a.title}</E></b> — <E path={`awards.${i}.awarder`}>{a.awarder}</E> <span className="text-gray-400"><E path={`awards.${i}.date`}>{a.date}</E></span></div>
          ))}
        </Row>
      )}

      {resume.languages.length > 0 && (
        <Row title="Lang">
          <div className="text-[0.9em]">{resume.languages.map((l, i) => `${l.language} (${l.fluency})`).join(" · ")}</div>
        </Row>
      )}
    </div>
  );
}
