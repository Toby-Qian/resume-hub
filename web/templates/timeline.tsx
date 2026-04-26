"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable, useSectionLabels } from "./shared";

/**
 * Vertical timeline: each work/project entry has a dot on the left with a
 * connecting line; the date sits in a fixed-width gutter. Reads well when
 * experience progression is the story you want to tell.
 */
export default function Timeline({ resume }: TemplateProps) {
  const b = resume.basics;
  const L = useSectionLabels();
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[0.86em] font-bold uppercase tracking-[0.18em] mt-5 mb-3 first:mt-2"
      style={{ color: "var(--resume-accent)" }}>
      {children}
    </h2>
  );
  // Gutter width holds the date; the dot sits on the right edge of the gutter.
  const GUTTER = "96px";

  const Node = ({ date, children, breakBefore }: { date: string; children: React.ReactNode; breakBefore?: boolean }) => (
    <div className={`resume-item ${breakBefore ? "page-break-before" : ""} grid gap-3 mb-4`}
      style={{ gridTemplateColumns: `${GUTTER} 1fr` }}>
      <div className="text-[0.8em] text-gray-500 text-right pt-0.5 whitespace-nowrap">{date}</div>
      <div className="relative pl-4 border-l-2" style={{ borderColor: "var(--resume-accent)" }}>
        <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full"
          style={{ background: "var(--resume-accent)" }} aria-hidden />
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ padding: "var(--pad)" }}>
      <Draggable name="header" as="header" className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-200">
        <Avatar basics={b} size={84} />
        <div className="min-w-0 flex-1">
          <h1 className="text-[2em] font-bold" style={{ color: "var(--resume-accent)" }}><E path="basics.name">{b.name}</E></h1>
          <div className="text-[1em] text-gray-700"><E path="basics.label">{b.label}</E></div>
          <div className="text-[0.82em] text-gray-600 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            <span>✉ <E path="basics.email">{b.email}</E></span>
            <span>☎ <E path="basics.phone">{b.phone}</E></span>
            <span>📍 <E path="basics.location">{b.location}</E></span>
            <span>🔗 <E path="basics.website">{b.website}</E></span>
          </div>
        </div>
      </Draggable>
      <Draggable name="summary"><p className="text-[0.93em] text-gray-800 mb-2"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>

      {resume.work.length > 0 && (
        <>
          <H>{L.experience}</H>
          {resume.work.map((w, i) => (
            <Node key={w.id} date={range(w.startDate, w.endDate)} breakBefore={(w as any).breakBefore}>
              <div className="text-[0.93em]"><b><E path={`work.${i}.position`}>{w.position}</E></b> · <span className="text-gray-700"><E path={`work.${i}.company`}>{w.company}</E></span></div>
              {w.location && <div className="text-[0.8em] text-gray-500"><E path={`work.${i}.location`}>{w.location}</E></div>}
              <ul className="list-disc ml-5 mt-1 text-[0.9em]">
                {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
              </ul>
            </Node>
          ))}
        </>
      )}

      {resume.projects.length > 0 && (
        <>
          <H>{L.projects}</H>
          {resume.projects.map((p, i) => (
            <Node key={p.id} date={range(p.startDate, p.endDate)} breakBefore={(p as any).breakBefore}>
              <div className="text-[0.93em]"><b><E path={`projects.${i}.name`}>{p.name}</E></b></div>
              {p.description && <div className="text-[0.88em] text-gray-700"><E path={`projects.${i}.description`} multiline>{p.description}</E></div>}
              {p.highlights.filter(Boolean).length > 0 && (
                <ul className="list-disc ml-5 mt-1 text-[0.88em]">
                  {p.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`projects.${i}.highlights.${j}`}>{h}</E></li>)}
                </ul>
              )}
              {p.keywords && p.keywords.length > 0 && (
                <div className="text-[0.8em] text-gray-500 mt-0.5">{p.keywords.join(" · ")}</div>
              )}
            </Node>
          ))}
        </>
      )}

      {resume.education.length > 0 && (
        <>
          <H>{L.education}</H>
          {resume.education.map((e, i) => (
            <Node key={e.id} date={range(e.startDate, e.endDate)} breakBefore={(e as any).breakBefore}>
              <div className="text-[0.93em]"><b><E path={`education.${i}.institution`}>{e.institution}</E></b></div>
              <div className="text-[0.88em]"><E path={`education.${i}.studyType`}>{e.studyType}</E> · <E path={`education.${i}.area`}>{e.area}</E>{e.score ? ` · ${e.score}` : ""}</div>
            </Node>
          ))}
        </>
      )}

      {resume.skills.length > 0 && (
        <>
          <H>{L.skills}</H>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[0.88em]">
            {resume.skills.map((s, i) => (
              <div key={s.id} className={itemCls(s)}>
                <b><E path={`skills.${i}.name`}>{s.name}</E></b>
                {s.keywords.length > 0 && <span className="text-gray-600"> — {s.keywords.join(", ")}</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {(resume.awards.length > 0 || resume.languages.length > 0) && (
        <>
          <H>{`${L.honorsAndAwards} & ${L.languages}`}</H>
          <div className="text-[0.88em] space-y-0.5">
            {resume.awards.map((a, i) => (
              <div key={a.id} className={itemCls(a)}><b><E path={`awards.${i}.title`}>{a.title}</E></b> · <E path={`awards.${i}.awarder`}>{a.awarder}</E> · <span className="text-gray-500"><E path={`awards.${i}.date`}>{a.date}</E></span></div>
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
