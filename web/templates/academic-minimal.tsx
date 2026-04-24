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
          {resume.education.map((e) => (
            <div key={e.id} className={itemCls(e)}>
              <div><i>{e.institution}</i>, {e.studyType}, {e.area} <span className="text-gray-500">· {range(e.startDate, e.endDate)}</span></div>
              {e.score && <div className="text-gray-600 text-[0.9em]">{e.score}</div>}
            </div>
          ))}
        </Row>
      )}

      {resume.work.length > 0 && (
        <Row label="Positions">
          {resume.work.map((w) => (
            <div key={w.id} className={itemCls(w)}>
              <div><b>{w.position}</b>, <i>{w.company}</i> <span className="text-gray-500">· {range(w.startDate, w.endDate)}</span></div>
              <ul className="list-[square] ml-5 text-[0.95em]">
                {w.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
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
              <b>{p.name}</b>
              {p.description && <span>. {p.description}</span>}
              {(p.startDate || p.endDate) && <span className="text-gray-500"> · {range(p.startDate, p.endDate)}</span>}
            </div>
          ))}
        </Row>
      )}

      {resume.awards.length > 0 && (
        <Row label="Honors">
          {resume.awards.map((a) => (
            <div key={a.id} className={itemCls(a)}>
              <b>{a.title}</b>, {a.awarder} <span className="text-gray-500">· {a.date}</span>
            </div>
          ))}
        </Row>
      )}

      {resume.skills.length > 0 && (
        <Row label="Skills">
          {resume.skills.map((s) => (
            <div key={s.id} className={itemCls(s)}><b>{s.name}</b> — <span className="text-gray-700">{s.keywords.join(", ")}</span></div>
          ))}
        </Row>
      )}

      {resume.languages.length > 0 && (
        <Row label="Languages">
          <div>{resume.languages.map((l) => `${l.language} (${l.fluency})`).join(" · ")}</div>
        </Row>
      )}
    </div>
  );
}
