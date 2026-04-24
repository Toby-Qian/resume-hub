"use client";
import { TemplateProps, range, itemCls, Avatar } from "./shared";

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
      <header className="flex items-start gap-5 mb-4 pb-3 border-b border-gray-200">
        <div className="flex-1 min-w-0">
          <h1 className="text-[2em] font-bold" style={{ color: "var(--resume-accent)" }}>{b.name}</h1>
          <div className="text-[1em] text-gray-700">{b.label}</div>
          <div className="text-[0.82em] text-gray-600 mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
            {b.email && <span>✉ {b.email}</span>}
            {b.phone && <span>☎ {b.phone}</span>}
            {b.location && <span>📍 {b.location}</span>}
            {b.website && <span>🔗 {b.website}</span>}
          </div>
        </div>
        <Avatar basics={b} size={96} />
      </header>
      {b.summary && <p className="text-[0.93em] text-gray-800 mb-2">{b.summary}</p>}

      {resume.education.length > 0 && (
        <><H>Education</H>
          {resume.education.map((e) => (
            <Row key={e.id} breakBefore={(e as any).breakBefore}
              left={<><b>{e.institution}</b> — {e.studyType}, {e.area}</>}
              right={range(e.startDate, e.endDate)}>
              {e.score && <div className="text-[0.88em] text-gray-600">{e.score}</div>}
              {e.courses && e.courses.length > 0 && (
                <div className="text-[0.82em] text-gray-500">{e.courses.join(" · ")}</div>
              )}
            </Row>
          ))}
        </>
      )}

      {resume.work.length > 0 && (
        <><H>Research & Appointments</H>
          {resume.work.map((w) => (
            <Row key={w.id} breakBefore={(w as any).breakBefore}
              left={<><b>{w.position}</b> · <span className="text-gray-700">{w.company}</span>{w.location && <span className="text-gray-500"> · {w.location}</span>}</>}
              right={range(w.startDate, w.endDate)}>
              <ul className="list-disc ml-5 mt-1 text-[0.9em]">
                {w.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </Row>
          ))}
        </>
      )}

      {resume.projects.length > 0 && (
        <><H>Publications & Projects</H>
          {resume.projects.map((p) => (
            <Row key={p.id} breakBefore={(p as any).breakBefore}
              left={<><b>{p.name}</b>{p.url && <span className="text-[0.82em] text-gray-500"> — {p.url}</span>}</>}
              right={range(p.startDate, p.endDate)}>
              {p.description && <div className="text-[0.9em] text-gray-700">{p.description}</div>}
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
            {resume.awards.map((a) => (
              <li key={a.id} className={itemCls(a)}>
                <b>{a.title}</b> · {a.awarder} · <span className="text-gray-500">{a.date}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="grid grid-cols-2 gap-x-6 mt-1">
        {resume.skills.length > 0 && (
          <div><H>Skills</H>
            <div className="text-[0.88em] space-y-0.5">
              {resume.skills.map((s) => (
                <div key={s.id} className={itemCls(s)}><b>{s.name}:</b> {s.keywords.join(", ")}</div>
              ))}
            </div>
          </div>
        )}
        {resume.languages.length > 0 && (
          <div><H>Languages</H>
            <div className="text-[0.88em]">
              {resume.languages.map((l) => `${l.language} (${l.fluency})`).join(" · ")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
