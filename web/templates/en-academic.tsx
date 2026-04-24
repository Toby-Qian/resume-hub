"use client";
import { TemplateProps, range, itemCls, Avatar } from "./shared";

export default function ENAcademic({ resume }: TemplateProps) {
  const b = resume.basics;
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[0.82em] uppercase tracking-[0.2em] font-bold mt-5 mb-2 pb-1 border-b border-gray-400">{children}</h2>
  );
  return (
    <div style={{ padding: "var(--pad)", fontFamily: "var(--resume-font-serif)" }}>
      <header className="text-center mb-3">
        {b.showAvatar && b.avatar && (
          <div className="flex justify-center mb-2"><Avatar basics={b} size={88} rounded="full" /></div>
        )}
        <h1 className="text-[2.2em] font-bold">{b.name}</h1>
        <div className="text-[0.9em] text-gray-700 mt-1">
          {[b.location, b.phone, b.email, b.website].filter(Boolean).join(" · ")}
        </div>
      </header>
      {b.summary && <p className="text-[0.95em] text-justify">{b.summary}</p>}

      {resume.education.length > 0 && (
        <>
          <H>Education</H>
          {resume.education.map((e) => (
            <div key={e.id} className={itemCls(e, "mb-2 text-[0.95em]")}>
              <div className="flex justify-between">
                <div><i>{e.institution}</i></div>
                <div>{range(e.startDate, e.endDate)}</div>
              </div>
              <div>{e.studyType}, {e.area}{e.score ? `. ${e.score}` : ""}</div>
            </div>
          ))}
        </>
      )}

      {resume.work.length > 0 && (
        <>
          <H>Research & Work Experience</H>
          {resume.work.map((w) => (
            <div key={w.id} className={itemCls(w, "mb-3 text-[0.95em]")}>
              <div className="flex justify-between">
                <div><b>{w.position}</b>, <i>{w.company}</i></div>
                <div>{range(w.startDate, w.endDate)}</div>
              </div>
              <ul className="list-disc ml-5 mt-1">
                {w.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.projects.length > 0 && (
        <>
          <H>Publications & Projects</H>
          {resume.projects.map((p) => (
            <div key={p.id} className={itemCls(p, "mb-2 text-[0.95em]")}>
              <div className="flex justify-between">
                <div><b>{p.name}</b></div>
                <div>{range(p.startDate, p.endDate)}</div>
              </div>
              <div>{p.description}</div>
              {p.url && <div className="text-[0.85em] text-gray-600">{p.url}</div>}
            </div>
          ))}
        </>
      )}

      {resume.awards.length > 0 && (
        <>
          <H>Honors & Awards</H>
          <ul className="list-disc ml-5 text-[0.95em]">
            {resume.awards.map((a) => (
              <li key={a.id} className={itemCls(a)}><b>{a.title}</b>, {a.awarder} ({a.date}){a.summary && `. ${a.summary}`}</li>
            ))}
          </ul>
        </>
      )}

      {resume.skills.length > 0 && (
        <>
          <H>Technical Skills</H>
          <div className="text-[0.93em] space-y-0.5">
            {resume.skills.map((s) => (
              <div key={s.id} className={itemCls(s)}><b>{s.name}:</b> {s.keywords.join(", ")}</div>
            ))}
          </div>
        </>
      )}

      {resume.languages.length > 0 && (
        <>
          <H>Languages</H>
          <div className="text-[0.93em]">{resume.languages.map((l) => `${l.language} (${l.fluency})`).join("; ")}</div>
        </>
      )}
    </div>
  );
}
