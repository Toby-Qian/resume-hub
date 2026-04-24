"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable } from "./shared";

/**
 * Single-column, tight-leading, small-type resume — built for senior
 * engineers / researchers with 1+ page of content who want to maximise
 * information density without feeling cramped. No section boxes, just
 * rule lines and hanging-indent dates.
 */
export default function Compact({ resume }: TemplateProps) {
  const b = resume.basics;
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[0.78em] font-bold uppercase tracking-[0.2em] mt-3 mb-1 pb-0.5 border-b border-gray-400">
      {children}
    </h2>
  );
  return (
    <div style={{ padding: "var(--pad)", lineHeight: 1.35 }}>
      <Draggable name="header" as="header" className="flex items-start gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-[1.9em] font-bold leading-tight"><E path="basics.name">{b.name}</E></h1>
          <div className="text-[0.9em] text-gray-700"><E path="basics.label">{b.label}</E></div>
          <div className="text-[0.78em] text-gray-600 mt-1 flex flex-wrap gap-x-2">
            <E path="basics.email">{b.email}</E>
            <span className="text-gray-400">·</span>
            <E path="basics.phone">{b.phone}</E>
            <span className="text-gray-400">·</span>
            <E path="basics.location">{b.location}</E>
            <span className="text-gray-400">·</span>
            <E path="basics.website">{b.website}</E>
          </div>
        </div>
        <Avatar basics={b} size={72} />
      </Draggable>
      <Draggable name="summary"><p className="text-[0.88em] text-gray-800 mb-1"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>

      {resume.work.length > 0 && (
        <>
          <H>Experience</H>
          {resume.work.map((w, i) => (
            <div key={w.id} className={itemCls(w, "text-[0.86em] mb-1.5")}>
              <div className="flex justify-between">
                <div><b><E path={`work.${i}.company`}>{w.company}</E></b> — <i><E path={`work.${i}.position`}>{w.position}</E></i>{w.location && <span className="text-gray-500"> · <E path={`work.${i}.location`}>{w.location}</E></span>}</div>
                <div className="text-gray-500 whitespace-nowrap">{range(w.startDate, w.endDate)}</div>
              </div>
              {w.highlights.filter(Boolean).length > 0 && (
                <ul className="list-[square] ml-4">
                  {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {resume.projects.length > 0 && (
        <>
          <H>Projects</H>
          {resume.projects.map((p, i) => (
            <div key={p.id} className={itemCls(p, "text-[0.86em] mb-1")}>
              <div className="flex justify-between">
                <div><b><E path={`projects.${i}.name`}>{p.name}</E></b>{p.description && <span className="text-gray-700"> — <E path={`projects.${i}.description`} multiline>{p.description}</E></span>}</div>
                <div className="text-gray-500 whitespace-nowrap">{range(p.startDate, p.endDate)}</div>
              </div>
              {p.highlights.filter(Boolean).length > 0 && (
                <ul className="list-[square] ml-4">
                  {p.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`projects.${i}.highlights.${j}`}>{h}</E></li>)}
                </ul>
              )}
              {p.keywords && p.keywords.length > 0 && (
                <div className="text-[0.8em] text-gray-500">{p.keywords.join(" · ")}</div>
              )}
            </div>
          ))}
        </>
      )}

      {resume.education.length > 0 && (
        <>
          <H>Education</H>
          {resume.education.map((e, i) => (
            <div key={e.id} className={itemCls(e, "text-[0.86em]")}>
              <div className="flex justify-between">
                <div><b><E path={`education.${i}.institution`}>{e.institution}</E></b> — <E path={`education.${i}.studyType`}>{e.studyType}</E>, <E path={`education.${i}.area`}>{e.area}</E>{e.score && <span className="text-gray-600"> · <E path={`education.${i}.score`}>{e.score}</E></span>}</div>
                <div className="text-gray-500 whitespace-nowrap">{range(e.startDate, e.endDate)}</div>
              </div>
            </div>
          ))}
        </>
      )}

      {resume.skills.length > 0 && (
        <>
          <H>Skills</H>
          <div className="text-[0.86em] space-y-0.5">
            {resume.skills.map((s, i) => (
              <div key={s.id} className={itemCls(s)}>
                <b><E path={`skills.${i}.name`}>{s.name}</E>{s.level && ` (${s.level})`}:</b> {s.keywords.join(", ")}
              </div>
            ))}
          </div>
        </>
      )}

      {(resume.awards.length > 0 || resume.languages.length > 0) && (
        <>
          <H>Honors & Languages</H>
          <div className="text-[0.85em] space-y-0.5">
            {resume.awards.map((a, i) => (
              <div key={a.id} className={itemCls(a)}>
                <b><E path={`awards.${i}.title`}>{a.title}</E></b> · <E path={`awards.${i}.awarder`}>{a.awarder}</E> · <span className="text-gray-500"><E path={`awards.${i}.date`}>{a.date}</E></span>
              </div>
            ))}
            {resume.languages.length > 0 && (
              <div>{resume.languages.map((l, i) => `${l.language} (${l.fluency})`).join(" · ")}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
