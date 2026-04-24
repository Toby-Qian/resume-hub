"use client";
import { TemplateProps, range, itemCls, Avatar } from "./shared";

/**
 * Two-column layout with a soft tinted sidebar. Feels lighter than
 * cn-creative (which uses a full accent block) — good for designers,
 * PMs, marketers who want visual interest without shouting.
 */
export default function Elegant({ resume }: TemplateProps) {
  const b = resume.basics;
  const SideH = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-[0.75em] font-bold uppercase tracking-[0.18em] mb-2 mt-5 first:mt-0"
      style={{ color: "var(--resume-accent)" }}>
      {children}
    </h3>
  );
  const MainH = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[1em] font-bold mb-2 mt-5 first:mt-0 pb-1 border-b-2"
      style={{ borderColor: "var(--resume-accent)" }}>
      {children}
    </h2>
  );
  return (
    <div className="grid grid-cols-[34%_1fr]" style={{ minHeight: "inherit" }}>
      <aside
        style={{
          background: "color-mix(in srgb, var(--resume-accent) 10%, white)",
          borderRight: "1px solid color-mix(in srgb, var(--resume-accent) 25%, white)",
          padding: "var(--pad)",
        }}
      >
        {b.showAvatar && b.avatar && (
          <div className="mb-4"><Avatar basics={b} size={112} /></div>
        )}
        <h1 className="text-[1.8em] font-bold leading-tight" style={{ color: "var(--resume-accent)" }}>{b.name}</h1>
        <div className="text-[0.95em] text-gray-700 mt-1">{b.label}</div>

        <SideH>Contact</SideH>
        <div className="text-[0.83em] text-gray-700 space-y-1">
          {b.email && <div>✉ {b.email}</div>}
          {b.phone && <div>☎ {b.phone}</div>}
          {b.location && <div>📍 {b.location}</div>}
          {b.website && <div className="break-all">🔗 {b.website}</div>}
        </div>

        {resume.skills.length > 0 && (
          <>
            <SideH>Skills</SideH>
            {resume.skills.map((s) => (
              <div key={s.id} className={itemCls(s, "text-[0.83em] mb-2")}>
                <div className="font-semibold text-gray-800">{s.name}</div>
                <div className="text-gray-600">{s.keywords.join(" · ")}</div>
              </div>
            ))}
          </>
        )}

        {resume.languages.length > 0 && (
          <>
            <SideH>Languages</SideH>
            {resume.languages.map((l) => (
              <div key={l.id} className={itemCls(l, "text-[0.83em]")}>
                {l.language} · <span className="text-gray-600">{l.fluency}</span>
              </div>
            ))}
          </>
        )}

        {resume.awards.length > 0 && (
          <>
            <SideH>Awards</SideH>
            {resume.awards.map((a) => (
              <div key={a.id} className={itemCls(a, "text-[0.83em] mb-1")}>
                <div className="font-semibold">{a.title}</div>
                <div className="text-gray-600">{a.awarder} · {a.date}</div>
              </div>
            ))}
          </>
        )}
      </aside>

      <main style={{ padding: "var(--pad)" }}>
        {b.summary && (
          <>
            <MainH>About</MainH>
            <p className="text-[0.94em] text-gray-800 leading-relaxed">{b.summary}</p>
          </>
        )}

        {resume.work.length > 0 && (
          <>
            <MainH>Experience</MainH>
            {resume.work.map((w) => (
              <div key={w.id} className={itemCls(w, "mb-4 text-[0.92em]")}>
                <div className="flex justify-between items-baseline">
                  <div><b>{w.position}</b> · <span className="text-gray-700">{w.company}</span></div>
                  <div className="text-[0.85em] text-gray-500">{range(w.startDate, w.endDate)}</div>
                </div>
                {w.location && <div className="text-[0.82em] text-gray-500">{w.location}</div>}
                <ul className="list-disc ml-5 mt-1">
                  {w.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            ))}
          </>
        )}

        {resume.projects.length > 0 && (
          <>
            <MainH>Projects</MainH>
            {resume.projects.map((p) => (
              <div key={p.id} className={itemCls(p, "mb-3 text-[0.92em]")}>
                <div className="flex justify-between items-baseline">
                  <div><b>{p.name}</b>{p.url && <span className="text-[0.82em] text-gray-500"> — {p.url}</span>}</div>
                  <div className="text-[0.85em] text-gray-500">{range(p.startDate, p.endDate)}</div>
                </div>
                <div className="text-gray-700">{p.description}</div>
                {p.highlights.filter(Boolean).length > 0 && (
                  <ul className="list-disc ml-5 mt-1">
                    {p.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {resume.education.length > 0 && (
          <>
            <MainH>Education</MainH>
            {resume.education.map((e) => (
              <div key={e.id} className={itemCls(e, "mb-2 text-[0.92em]")}>
                <div className="flex justify-between items-baseline">
                  <div><b>{e.institution}</b> · {e.studyType}, {e.area}</div>
                  <div className="text-[0.85em] text-gray-500">{range(e.startDate, e.endDate)}</div>
                </div>
                {e.score && <div className="text-[0.85em] text-gray-600">{e.score}</div>}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
