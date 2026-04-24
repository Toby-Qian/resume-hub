"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable } from "./shared";

/**
 * Modern academic: sans-serif, colored accent rules, left-aligned headers
 * with date in the right gutter. Clean enough for industry-adjacent
 * research roles without losing the "CV" feel.
 */
export default function AcademicModern({ resume }: TemplateProps) {
  const b = resume.basics;
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[0.82em] font-bold uppercase tracking-[0.22em] mt-5 mb-2 pb-1"
      style={{ color: "var(--resume-accent)", borderBottom: "2px solid var(--resume-accent)" }}>
      {children}
    </h2>
  );
  const Row = ({ left, right, children, breakBefore }: any) => (
    <div className={`resume-item ${breakBefore ? "page-break-before" : ""} mb-3`}>
      <div className="flex justify-between items-baseline text-[0.93em]">
        <div>{left}</div>
        <div className="text-[0.85em] text-gray-500 whitespace-nowrap ml-3">{right}</div>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ padding: "var(--pad)" }}>
      <Draggable name="header" as="header" className="flex items-start gap-5 mb-4 pb-3 border-b border-gray-200">
        <div className="flex-1 min-w-0">
          <h1 className="text-[2em] font-bold" style={{ color: "var(--resume-accent)" }}><E path="basics.name">{b.name}</E></h1>
          <div className="text-[1em] text-gray-700"><E path="basics.label">{b.label}</E></div>
          <div className="text-[0.82em] text-gray-600 mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
            <span>✉ <E path="basics.email">{b.email}</E></span>
            <span>☎ <E path="basics.phone">{b.phone}</E></span>
            <span>📍 <E path="basics.location">{b.location}</E></span>
            <span>🔗 <E path="basics.website">{b.website}</E></span>
          </div>
        </div>
        <Avatar basics={b} size={96} />
      </Draggable>
      <Draggable name="summary"><p className="text-[0.93em] text-gray-800 mb-2"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>

      {resume.education.length > 0 && (
        <><H>Education</H>
          {resume.education.map((e, i) => (
            <Row key={e.id} breakBefore={(e as any).breakBefore}
              left={<><b><E path={`education.${i}.institution`}>{e.institution}</E></b> — <E path={`education.${i}.studyType`}>{e.studyType}</E>, <E path={`education.${i}.area`}>{e.area}</E></>}
              right={range(e.startDate, e.endDate)}>
              {e.score && <div className="text-[0.88em] text-gray-600"><E path={`education.${i}.score`}>{e.score}</E></div>}
              {e.courses && e.courses.length > 0 && (
                <div className="text-[0.82em] text-gray-500">{e.courses.join(" · ")}</div>
              )}
            </Row>
          ))}
        </>
      )}

      {resume.work.length > 0 && (
        <><H>Research & Appointments</H>
          {resume.work.map((w, i) => (
            <Row key={w.id} breakBefore={(w as any).breakBefore}
              left={<><b><E path={`work.${i}.position`}>{w.position}</E></b> · <span className="text-gray-700"><E path={`work.${i}.company`}>{w.company}</E></span>{w.location && <span className="text-gray-500"> · <E path={`work.${i}.location`}>{w.location}</E></span>}</>}
              right={range(w.startDate, w.endDate)}>
              <ul className="list-disc ml-5 mt-1 text-[0.9em]">
                {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
              </ul>
            </Row>
          ))}
        </>
      )}

      {resume.projects.length > 0 && (
        <><H>Publications & Projects</H>
          {resume.projects.map((p, i) => (
            <Row key={p.id} breakBefore={(p as any).breakBefore}
              left={<><b><E path={`projects.${i}.name`}>{p.name}</E></b>{p.url && <span className="text-[0.82em] text-gray-500"> — <E path={`projects.${i}.url`}>{p.url}</E></span>}</>}
              right={range(p.startDate, p.endDate)}>
              {p.description && <div className="text-[0.9em] text-gray-700"><E path={`projects.${i}.description`} multiline>{p.description}</E></div>}
              {p.keywords && p.keywords.length > 0 && (
                <div className="text-[0.82em] text-gray-500 mt-0.5">{p.keywords.join(" · ")}</div>
              )}
            </Row>
          ))}
        </>
      )}

      {resume.awards.length > 0 && (
        <><H>Honors & Grants</H>
          <ul className="list-disc ml-5 text-[0.9em] space-y-0.5">
            {resume.awards.map((a, i) => (
              <li key={a.id} className={itemCls(a)}>
                <b><E path={`awards.${i}.title`}>{a.title}</E></b> · <E path={`awards.${i}.awarder`}>{a.awarder}</E> · <span className="text-gray-500"><E path={`awards.${i}.date`}>{a.date}</E></span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="grid grid-cols-2 gap-x-6 mt-1">
        {resume.skills.length > 0 && (
          <div><H>Skills</H>
            <div className="text-[0.88em] space-y-0.5">
              {resume.skills.map((s, i) => (
                <div key={s.id} className={itemCls(s)}><b><E path={`skills.${i}.name`}>{s.name}</E>:</b> {s.keywords.join(", ")}</div>
              ))}
            </div>
          </div>
        )}
        {resume.languages.length > 0 && (
          <div><H>Languages</H>
            <div className="text-[0.88em]">
              {resume.languages.map((l, i) => `${l.language} (${l.fluency})`).join(" · ")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
