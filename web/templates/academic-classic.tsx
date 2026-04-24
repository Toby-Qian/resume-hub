"use client";
import { TemplateProps, range, itemCls, Avatar } from "./shared";

/**
 * The quintessential CV: serif body, "Curriculum Vitae" banner, centered
 * name, plain section headers with a thin rule. Low visual noise so the
 * content carries the weight. Inspired by Oxford / Cambridge academic CVs.
 */
export default function AcademicClassic({ resume }: TemplateProps) {
  const b = resume.basics;
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[0.95em] font-bold tracking-wide mt-5 mb-2 pb-1 border-b border-gray-500">
      {children}
    </h2>
  );
  return (
    <div style={{ padding: "var(--pad)", fontFamily: "var(--resume-font-serif)" }}>
      <div className="text-center text-[0.8em] tracking-[0.3em] uppercase text-gray-600 mb-2">
        Curriculum Vitae
      </div>
      <header className="text-center border-b-2 border-gray-700 pb-3 mb-4">
        {b.showAvatar && b.avatar && (
          <div className="flex justify-center mb-3"><Avatar basics={b} size={96} /></div>
        )}
        <h1 className="text-[2.1em] font-bold">{b.name}</h1>
        <div className="text-[0.95em] italic text-gray-700 mt-1">{b.label}</div>
        <div className="text-[0.82em] text-gray-600 mt-2">
          {[b.email, b.phone, b.location, b.website].filter(Boolean).join(" · ")}
        </div>
      </header>
      {b.summary && <p className="text-[0.92em] text-justify italic mb-3">{b.summary}</p>}

      {resume.education.length > 0 && (
        <><H>Education</H>
          {resume.education.map((e) => (
            <div key={e.id} className={itemCls(e, "mb-2 text-[0.93em]")}>
              <div className="flex justify-between">
                <div><i>{e.institution}</i> — {e.studyType}, {e.area}</div>
                <div className="text-gray-600">{range(e.startDate, e.endDate)}</div>
              </div>
              {e.score && <div className="text-gray-700">{e.score}</div>}
              {e.courses && e.courses.length > 0 && (
                <div className="text-[0.88em] text-gray-600 italic">Coursework: {e.courses.join("; ")}</div>
              )}
            </div>
          ))}
        </>
      )}

      {resume.work.length > 0 && (
        <><H>Academic Appointments</H>
          {resume.work.map((w) => (
            <div key={w.id} className={itemCls(w, "mb-3 text-[0.93em]")}>
              <div className="flex justify-between">
                <div><b>{w.position}</b>, <i>{w.company}</i>{w.location && ` — ${w.location}`}</div>
                <div className="text-gray-600">{range(w.startDate, w.endDate)}</div>
              </div>
              <ul className="list-disc ml-5 mt-0.5">
                {w.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.projects.length > 0 && (
        <><H>Publications & Research</H>
          {resume.projects.map((p, idx) => (
            <div key={p.id} className={itemCls(p, "mb-2 text-[0.92em]")}>
              <div>
                <span className="font-mono text-[0.85em] text-gray-600 mr-1">[{idx + 1}]</span>
                <b>{p.name}</b>
                {p.url && <span className="text-[0.85em] text-gray-600"> — {p.url}</span>}
                {(p.startDate || p.endDate) && <span className="text-gray-600"> ({range(p.startDate, p.endDate)})</span>}
              </div>
              {p.description && <div className="text-gray-700 pl-5">{p.description}</div>}
            </div>
          ))}
        </>
      )}

      {resume.awards.length > 0 && (
        <><H>Honors & Grants</H>
          <ul className="list-disc ml-5 text-[0.92em]">
            {resume.awards.map((a) => (
              <li key={a.id} className={itemCls(a)}>
                <b>{a.title}</b>, <i>{a.awarder}</i> ({a.date}){a.summary && `. ${a.summary}`}
              </li>
            ))}
          </ul>
        </>
      )}

      {resume.skills.length > 0 && (
        <><H>Technical Skills</H>
          <div className="text-[0.92em]">
            {resume.skills.map((s) => (
              <div key={s.id} className={itemCls(s)}><b>{s.name}:</b> {s.keywords.join(", ")}</div>
            ))}
          </div>
        </>
      )}

      {resume.languages.length > 0 && (
        <><H>Languages</H>
          <div className="text-[0.92em]">{resume.languages.map((l) => `${l.language} (${l.fluency})`).join("; ")}</div>
        </>
      )}
    </div>
  );
}
