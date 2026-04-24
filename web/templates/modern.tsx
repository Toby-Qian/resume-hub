"use client";
import { TemplateProps, Section, range, itemCls, Avatar, E, Draggable } from "./shared";

export default function Modern({ resume }: TemplateProps) {
  const b = resume.basics;
  return (
    <div style={{ padding: "var(--pad)" }}>
      <Draggable name="header" as="header" className="mb-6 flex items-start gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-[2em] font-bold" style={{ color: "var(--resume-accent)" }}><E path="basics.name">{b.name}</E></h1>
          <div className="text-[1.05em] text-gray-700 mt-1"><E path="basics.label">{b.label}</E></div>
          <div className="text-[0.85em] text-gray-600 mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span>✉ <E path="basics.email">{b.email}</E></span>
            <span>☎ <E path="basics.phone">{b.phone}</E></span>
            <span>📍 <E path="basics.location">{b.location}</E></span>
            <span>🔗 <E path="basics.website">{b.website}</E></span>
          </div>
          <p className="mt-3 text-[0.95em] text-gray-800"><E path="basics.summary" multiline>{b.summary}</E></p>
        </div>
        <Avatar basics={b} size={96} />
      </Draggable>

      {resume.work.length > 0 && (
        <Section title="Experience" accent>
          {resume.work.map((w, i) => (
            <div key={w.id} className={itemCls(w)}>
              <div className="flex justify-between items-baseline">
                <div className="font-semibold"><E path={`work.${i}.position`}>{w.position}</E> · <span className="font-normal"><E path={`work.${i}.company`}>{w.company}</E></span></div>
                <div className="text-[0.85em] text-gray-500">{range(w.startDate, w.endDate)}</div>
              </div>
              {w.location && <div className="text-[0.8em] text-gray-500"><E path={`work.${i}.location`}>{w.location}</E></div>}
              <ul className="list-disc ml-5 mt-1 text-[0.92em]">
                {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {resume.projects.length > 0 && (
        <Section title="Projects" accent>
          {resume.projects.map((p, i) => (
            <div key={p.id} className={itemCls(p)}>
              <div className="flex justify-between items-baseline">
                <div className="font-semibold"><E path={`projects.${i}.name`}>{p.name}</E></div>
                <div className="text-[0.85em] text-gray-500">{range(p.startDate, p.endDate)}</div>
              </div>
              {p.description && <div className="text-[0.9em] text-gray-700"><E path={`projects.${i}.description`} multiline>{p.description}</E></div>}
              {p.highlights.length > 0 && (
                <ul className="list-disc ml-5 mt-1 text-[0.92em]">
                  {p.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`projects.${i}.highlights.${j}`}>{h}</E></li>)}
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
          {resume.education.map((e, i) => (
            <div key={e.id} className={itemCls(e)}>
              <div className="flex justify-between items-baseline">
                <div className="font-semibold"><E path={`education.${i}.institution`}>{e.institution}</E></div>
                <div className="text-[0.85em] text-gray-500">{range(e.startDate, e.endDate)}</div>
              </div>
              <div className="text-[0.9em]"><E path={`education.${i}.studyType`}>{e.studyType}</E> · <E path={`education.${i}.area`}>{e.area}</E>{e.score ? ` · ${e.score}` : ""}</div>
              {e.courses && e.courses.length > 0 && (
                <div className="text-[0.82em] text-gray-500 mt-1">{e.courses.join(" · ")}</div>
              )}
            </div>
          ))}
        </Section>
      )}

      {resume.skills.length > 0 && (
        <Section title="Skills" accent>
          {resume.skills.map((s, i) => (
            <div key={s.id} className={itemCls(s, "text-[0.92em]")}>
              <span className="font-semibold"><E path={`skills.${i}.name`}>{s.name}</E></span>
              {s.level && <span className="text-gray-500"> · <E path={`skills.${i}.level`}>{s.level}</E></span>}
              {s.keywords.length > 0 && <span className="text-gray-700"> — {s.keywords.join(", ")}</span>}
            </div>
          ))}
        </Section>
      )}

      {resume.awards.length > 0 && (
        <Section title="Awards" accent>
          {resume.awards.map((a, i) => (
            <div key={a.id} className={itemCls(a, "text-[0.92em]")}>
              <span className="font-semibold"><E path={`awards.${i}.title`}>{a.title}</E></span>
              <span className="text-gray-500"> · <E path={`awards.${i}.awarder`}>{a.awarder}</E> · <E path={`awards.${i}.date`}>{a.date}</E></span>
              {a.summary && <div className="text-gray-700"><E path={`awards.${i}.summary`} multiline>{a.summary}</E></div>}
            </div>
          ))}
        </Section>
      )}

      {resume.languages.length > 0 && (
        <Section title="Languages" accent>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[0.92em]">
            {resume.languages.map((l, i) => (
              <div key={l.id} className={itemCls(l)}><span className="font-semibold"><E path={`languages.${i}.language`}>{l.language}</E></span> · <span className="text-gray-600"><E path={`languages.${i}.fluency`}>{l.fluency}</E></span></div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
