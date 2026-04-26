"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable, useSectionLabels } from "./shared";

/**
 * Two-column layout with a soft tinted sidebar. Feels lighter than
 * cn-creative (which uses a full accent block) — good for designers,
 * PMs, marketers who want visual interest without shouting.
 */
export default function Elegant({ resume }: TemplateProps) {
  const b = resume.basics;
  const L = useSectionLabels();
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
        <Draggable name="header">
          <h1 className="text-[1.8em] font-bold leading-tight" style={{ color: "var(--resume-accent)" }}><E path="basics.name">{b.name}</E></h1>
          <div className="text-[0.95em] text-gray-700 mt-1"><E path="basics.label">{b.label}</E></div>
        </Draggable>

        <SideH>{L.contact}</SideH>
        <div className="text-[0.83em] text-gray-700 space-y-1">
          <div>✉ <E path="basics.email">{b.email}</E></div>
          <div>☎ <E path="basics.phone">{b.phone}</E></div>
          <div>📍 <E path="basics.location">{b.location}</E></div>
          <div className="break-all">🔗 <E path="basics.website">{b.website}</E></div>
        </div>

        {resume.skills.length > 0 && (
          <>
            <SideH>{L.skills}</SideH>
            {resume.skills.map((s, i) => (
              <div key={s.id} className={itemCls(s, "text-[0.83em] mb-2")}>
                <div className="font-semibold text-gray-800"><E path={`skills.${i}.name`}>{s.name}</E></div>
                <div className="text-gray-600">{s.keywords.join(" · ")}</div>
              </div>
            ))}
          </>
        )}

        {resume.languages.length > 0 && (
          <>
            <SideH>{L.languages}</SideH>
            {resume.languages.map((l, i) => (
              <div key={l.id} className={itemCls(l, "text-[0.83em]")}>
                <E path={`languages.${i}.language`}>{l.language}</E> · <span className="text-gray-600"><E path={`languages.${i}.fluency`}>{l.fluency}</E></span>
              </div>
            ))}
          </>
        )}

        {resume.awards.length > 0 && (
          <>
            <SideH>{L.awards}</SideH>
            {resume.awards.map((a, i) => (
              <div key={a.id} className={itemCls(a, "text-[0.83em] mb-1")}>
                <div className="font-semibold"><E path={`awards.${i}.title`}>{a.title}</E></div>
                <div className="text-gray-600"><E path={`awards.${i}.awarder`}>{a.awarder}</E> · <E path={`awards.${i}.date`}>{a.date}</E></div>
              </div>
            ))}
          </>
        )}
      </aside>

      <main style={{ padding: "var(--pad)" }}>
        <Draggable name="summary">
          <MainH>{L.about}</MainH>
          <p className="text-[0.94em] text-gray-800 leading-relaxed"><E path="basics.summary" multiline>{b.summary}</E></p>
        </Draggable>

        {resume.work.length > 0 && (
          <>
            <MainH>{L.experience}</MainH>
            {resume.work.map((w, i) => (
              <div key={w.id} className={itemCls(w, "mb-4 text-[0.92em]")}>
                <div className="flex justify-between items-baseline">
                  <div><b><E path={`work.${i}.position`}>{w.position}</E></b> · <span className="text-gray-700"><E path={`work.${i}.company`}>{w.company}</E></span></div>
                  <div className="text-[0.85em] text-gray-500">{range(w.startDate, w.endDate)}</div>
                </div>
                {w.location && <div className="text-[0.82em] text-gray-500"><E path={`work.${i}.location`}>{w.location}</E></div>}
                <ul className="list-disc ml-5 mt-1">
                  {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
                </ul>
              </div>
            ))}
          </>
        )}

        {resume.projects.length > 0 && (
          <>
            <MainH>{L.projects}</MainH>
            {resume.projects.map((p, i) => (
              <div key={p.id} className={itemCls(p, "mb-3 text-[0.92em]")}>
                <div className="flex justify-between items-baseline">
                  <div><b><E path={`projects.${i}.name`}>{p.name}</E></b>{p.url && <span className="text-[0.82em] text-gray-500"> — <E path={`projects.${i}.url`}>{p.url}</E></span>}</div>
                  <div className="text-[0.85em] text-gray-500">{range(p.startDate, p.endDate)}</div>
                </div>
                <div className="text-gray-700"><E path={`projects.${i}.description`} multiline>{p.description}</E></div>
                {p.highlights.filter(Boolean).length > 0 && (
                  <ul className="list-disc ml-5 mt-1">
                    {p.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`projects.${i}.highlights.${j}`}>{h}</E></li>)}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {resume.education.length > 0 && (
          <>
            <MainH>{L.education}</MainH>
            {resume.education.map((e, i) => (
              <div key={e.id} className={itemCls(e, "mb-2 text-[0.92em]")}>
                <div className="flex justify-between items-baseline">
                  <div><b><E path={`education.${i}.institution`}>{e.institution}</E></b> · <E path={`education.${i}.studyType`}>{e.studyType}</E>, <E path={`education.${i}.area`}>{e.area}</E></div>
                  <div className="text-[0.85em] text-gray-500">{range(e.startDate, e.endDate)}</div>
                </div>
                {e.score && <div className="text-[0.85em] text-gray-600"><E path={`education.${i}.score`}>{e.score}</E></div>}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
