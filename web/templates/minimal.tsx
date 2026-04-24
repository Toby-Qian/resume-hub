"use client";
import { TemplateProps, range, itemCls, Avatar } from "./shared";

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
      <header className="mb-8 flex items-center gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-[2.4em] font-light">{b.name}</h1>
          <div className="text-[1em] text-gray-500 mt-1">{b.label}</div>
        </div>
        <Avatar basics={b} size={80} rounded="sm" />
      </header>

      <Row title="Contact">
        <div className="text-[0.9em] text-gray-700 space-y-0.5">
          {b.email && <div>{b.email}</div>}
          {b.phone && <div>{b.phone}</div>}
          {b.location && <div>{b.location}</div>}
          {b.website && <div>{b.website}</div>}
        </div>
      </Row>

      {b.summary && (
        <Row title="About">
          <p className="text-[0.95em]">{b.summary}</p>
        </Row>
      )}

      {resume.work.length > 0 && (
        <Row title="Work">
          {resume.work.map((w) => (
            <div key={w.id} className={itemCls(w)}>
              <div className="text-[0.95em]"><b>{w.position}</b> at {w.company} <span className="text-gray-400">· {range(w.startDate, w.endDate)}</span></div>
              <ul className="list-[circle] ml-5 text-[0.9em] text-gray-700">
                {w.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          ))}
        </Row>
      )}

      {resume.education.length > 0 && (
        <Row title="Edu">
          {resume.education.map((e) => (
            <div key={e.id} className={itemCls(e, "text-[0.9em]")}>
              <b>{e.institution}</b> — {e.studyType}, {e.area} <span className="text-gray-400">· {range(e.startDate, e.endDate)}</span>
            </div>
          ))}
        </Row>
      )}

      {resume.projects.length > 0 && (
        <Row title="Projects">
          {resume.projects.map((p) => (
            <div key={p.id} className={itemCls(p, "text-[0.9em]")}>
              <b>{p.name}</b> — <span className="text-gray-600">{p.description}</span>
            </div>
          ))}
        </Row>
      )}

      {resume.skills.length > 0 && (
        <Row title="Skills">
          {resume.skills.map((s) => (
            <div key={s.id} className={itemCls(s, "text-[0.9em]")}><b>{s.name}</b> — {s.keywords.join(", ")}</div>
          ))}
        </Row>
      )}

      {resume.awards.length > 0 && (
        <Row title="Awards">
          {resume.awards.map((a) => (
            <div key={a.id} className={itemCls(a, "text-[0.9em]")}><b>{a.title}</b> — {a.awarder} <span className="text-gray-400">{a.date}</span></div>
          ))}
        </Row>
      )}

      {resume.languages.length > 0 && (
        <Row title="Lang">
          <div className="text-[0.9em]">{resume.languages.map((l) => `${l.language} (${l.fluency})`).join(" · ")}</div>
        </Row>
      )}
    </div>
  );
}
