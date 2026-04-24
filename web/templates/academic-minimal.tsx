"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable } from "./shared";

/**
 * Minimalist academic: no color, purely typographic hierarchy. Small-caps
 * section labels in the left gutter, content in a wide right column.
 * Reads like a well-typeset monograph.
 */
export default function AcademicMinimal({ resume }: TemplateProps) {
  const b = resume.basics;
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <section className="resume-section grid grid-cols-[100px_1fr] gap-5 mb-4">
      <div className="text-[0.72em] uppercase tracking-[0.25em] text-gray-500 pt-1">{label}</div>
      <div className="text-[0.92em] space-y-2">{children}</div>
    </section>
  );
  return (
    <div style={{ padding: "var(--pad)", fontFamily: "var(--resume-font-serif)" }}>
      <Draggable name="header" as="header" className="mb-6 flex items-start gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-[2.3em] font-light tracking-tight"><E path="basics.name">{b.name}</E></h1>
          <div className="text-[1em] text-gray-600 italic"><E path="basics.label">{b.label}</E></div>
          <div className="text-[0.8em] text-gray-600 mt-2 flex flex-wrap gap-x-2">
            <E path="basics.email">{b.email}</E>
            <span className="text-gray-400">·</span>
            <E path="basics.phone">{b.phone}</E>
            <span className="text-gray-400">·</span>
            <E path="basics.location">{b.location}</E>
            <span className="text-gray-400">·</span>
            <E path="basics.website">{b.website}</E>
          </div>
        </div>
        <Avatar basics={b} size={80} />
      </Draggable>

      <Row label="Profile">
        <Draggable name="summary"><p className="italic"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>
      </Row>

      {resume.education.length > 0 && (
        <Row label="Education">
          {resume.education.map((e, i) => (
            <div key={e.id} className={itemCls(e)}>
              <div><i><E path={`education.${i}.institution`}>{e.institution}</E></i>, <E path={`education.${i}.studyType`}>{e.studyType}</E>, <E path={`education.${i}.area`}>{e.area}</E> <span className="text-gray-500">· {range(e.startDate, e.endDate)}</span></div>
              {e.score && <div className="text-gray-600 text-[0.9em]"><E path={`education.${i}.score`}>{e.score}</E></div>}
            </div>
          ))}
        </Row>
      )}

      {resume.work.length > 0 && (
        <Row label="Positions">
          {resume.work.map((w, i) => (
            <div key={w.id} className={itemCls(w)}>
              <div><b><E path={`work.${i}.position`}>{w.position}</E></b>, <i><E path={`work.${i}.company`}>{w.company}</E></i> <span className="text-gray-500">· {range(w.startDate, w.endDate)}</span></div>
              <ul className="list-[square] ml-5 text-[0.95em]">
                {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
              </ul>
            </div>
          ))}
        </Row>
      )}

      {resume.projects.length > 0 && (
        <Row label="Publications">
          {resume.projects.map((p, i) => (
            <div key={p.id} className={itemCls(p)}>
              <span className="text-gray-500 mr-1">{i + 1}.</span>
              <b><E path={`projects.${i}.name`}>{p.name}</E></b>
              {p.description && <span>. <E path={`projects.${i}.description`} multiline>{p.description}</E></span>}
              {(p.startDate || p.endDate) && <span className="text-gray-500"> · {range(p.startDate, p.endDate)}</span>}
            </div>
          ))}
        </Row>
      )}

      {resume.awards.length > 0 && (
        <Row label="Honors">
          {resume.awards.map((a, i) => (
            <div key={a.id} className={itemCls(a)}>
              <b><E path={`awards.${i}.title`}>{a.title}</E></b>, <E path={`awards.${i}.awarder`}>{a.awarder}</E> <span className="text-gray-500">· <E path={`awards.${i}.date`}>{a.date}</E></span>
            </div>
          ))}
        </Row>
      )}

      {resume.skills.length > 0 && (
        <Row label="Skills">
          {resume.skills.map((s, i) => (
            <div key={s.id} className={itemCls(s)}><b><E path={`skills.${i}.name`}>{s.name}</E></b> — <span className="text-gray-700">{s.keywords.join(", ")}</span></div>
          ))}
        </Row>
      )}

      {resume.languages.length > 0 && (
        <Row label="Languages">
          <div>{resume.languages.map((l, i) => `${l.language} (${l.fluency})`).join(" · ")}</div>
        </Row>
      )}
    </div>
  );
}
