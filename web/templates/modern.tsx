"use client";
import { TemplateProps, Section, range, itemCls } from "./shared";

export default function Modern({ resume }: TemplateProps) {
  const b = resume.basics;
  return (
    <div style={{ padding: "var(--pad)" }}>
      <header className="mb-6">
        <h1 className="text-[2em] font-bold" style={{ color: "var(--resume-accent)" }}>{b.name}</h1>
        <div className="text-[1.05em] text-gray-700 mt-1">{b.label}</div>
        <div className="text-[0.85em] text-gray-600 mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {b.email && <span>✉ {b.email}</span>}
          {b.phone && <span>☎ {b.phone}</span>}
          {b.location && <span>📍 {b.location}</span>}
          {b.website && <span>🔗 {b.website}</span>}
        </div>
        {b.summary && <p className="mt-3 text-[0.95em] text-gray-800">{b.summary}</p>}
      </header>

      {resume.work.length > 0 && (
        <Section title="Experience" accent>
          {resume.work.map((w) => (
            <div key={w.id} className={itemCls(w)}>
              <div className="flex justify-between items-baseline">
                <div className="font-semibold">{w.position} · <span className="font-normal">{w.company}</span></div>
                <div className="text-[0.85em] text-gray-500">{range(w.startDate, w.endDate)}</div>
              </div>
              {w.location && <div className="text-[0.8em] text-gray-500">{w.location}</div>}
              <ul className="list-disc ml-5 mt-1 text-[0.92em]">
                {w.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {resume.projects.length > 0 && (
        <Section title="Projects" accent>
          {resume.projects.map((p) => (
            <div key={p.id} className={itemCls(p)}>
              <div className="flex justify-between items-baseline">
                <div className="font-semibold">{p.name}</div>
                <div className="text-[0.85em] text-gray-500">{range(p.startDate, p.endDate)}</div>
              </div>
              {p.description && <div className="text-[0.9em] text-gray-700">{p.description}</div>}
              {p.highlights.length > 0 && (
                <ul className="list-disc ml-5 mt-1 text-[0.92em]">
                  {p.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              )}
              {p.keywords && p.keywords.length > 0 && (
                <div className="text-[0.82em] text-gray-500 mt-1">{p.keywords.join(" · ")}</div>
              )}
            </div>
          ))}
        </Section>
      )}

      {resume.education.length > 0 && (
        <Section title="Education" accent>
          {resume.education.map((e) => (
            <div key={e.id} className={itemCls(e)}>
              <div className="flex justify-between items-baseline">
                <div className="font-semibold">{e.institution}</div>
                <div className="text-[0.85em] text-gray-500">{range(e.startDate, e.endDate)}</div>
              </div>
              <div className="text-[0.9em]">{e.studyType} · {e.area}{e.score ? ` · ${e.score}` : ""}</div>
              {e.courses && e.courses.length > 0 && (
                <div className="text-[0.82em] text-gray-500 mt-1">{e.courses.join(" · ")}</div>
              )}
            </div>
          ))}
        </Section>
      )}

      {resume.skills.length > 0 && (
        <Section title="Skills" accent>
          {resume.skills.map((s) => (
            <div key={s.id} className={itemCls(s, "text-[0.92em]")}>
              <span className="font-semibold">{s.name}</span>
              {s.level && <span className="text-gray-500"> · {s.level}</span>}
              {s.keywords.length > 0 && <span className="text-gray-700"> — {s.keywords.join(", ")}</span>}
            </div>
          ))}
        </Section>
      )}

      {resume.awards.length > 0 && (
        <Section title="Awards" accent>
          {resume.awards.map((a) => (
            <div key={a.id} className={itemCls(a, "text-[0.92em]")}>
              <span className="font-semibold">{a.title}</span>
              <span className="text-gray-500"> · {a.awarder} · {a.date}</span>
              {a.summary && <div className="text-gray-700">{a.summary}</div>}
            </div>
          ))}
        </Section>
      )}

      {resume.languages.length > 0 && (
        <Section title="Languages" accent>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[0.92em]">
            {resume.languages.map((l) => (
              <div key={l.id} className={itemCls(l)}><span className="font-semibold">{l.language}</span> · <span className="text-gray-600">{l.fluency}</span></div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
