"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable } from "./shared";

export default function ENAcademic({ resume }: TemplateProps) {
  const b = resume.basics;
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[0.82em] uppercase tracking-[0.2em] font-bold mt-5 mb-2 pb-1 border-b border-gray-400">{children}</h2>
  );
  return (
    <div style={{ padding: "var(--pad)", fontFamily: "var(--resume-font-serif)" }}>
      <Draggable name="header" as="header" className="text-center mb-3">
        {b.showAvatar && b.avatar && (
          <div className="flex justify-center mb-2"><Avatar basics={b} size={88} rounded="full" /></div>
        )}
        <h1 className="text-[2.2em] font-bold"><E path="basics.name">{b.name}</E></h1>
        <div className="text-[0.9em] text-gray-700 mt-1 flex flex-wrap justify-center gap-x-3">
          <E path="basics.location">{b.location}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.phone">{b.phone}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.email">{b.email}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.website">{b.website}</E>
        </div>
      </Draggable>
      <Draggable name="summary"><p className="text-[0.95em] text-justify"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>

      {resume.education.length > 0 && (
        <>
          <H>Education</H>
          {resume.education.map((e, i) => (
            <div key={e.id} className={itemCls(e, "mb-2 text-[0.95em]")}>
              <div className="flex justify-between">
                <div><i><E path={`education.${i}.institution`}>{e.institution}</E></i></div>
                <div>{range(e.startDate, e.endDate)}</div>
              </div>
              <div><E path={`education.${i}.studyType`}>{e.studyType}</E>, <E path={`education.${i}.area`}>{e.area}</E>{e.score ? `. ${e.score}` : ""}</div>
            </div>
          ))}
        </>
      )}

      {resume.work.length > 0 && (
        <>
          <H>Research & Work Experience</H>
          {resume.work.map((w, i) => (
            <div key={w.id} className={itemCls(w, "mb-3 text-[0.95em]")}>
              <div className="flex justify-between">
                <div><b><E path={`work.${i}.position`}>{w.position}</E></b>, <i><E path={`work.${i}.company`}>{w.company}</E></i></div>
                <div>{range(w.startDate, w.endDate)}</div>
              </div>
              <ul className="list-disc ml-5 mt-1">
                {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.projects.length > 0 && (
        <>
          <H>Publications & Projects</H>
          {resume.projects.map((p, i) => (
            <div key={p.id} className={itemCls(p, "mb-2 text-[0.95em]")}>
              <div className="flex justify-between">
                <div><b><E path={`projects.${i}.name`}>{p.name}</E></b></div>
                <div>{range(p.startDate, p.endDate)}</div>
              </div>
              <div><E path={`projects.${i}.description`} multiline>{p.description}</E></div>
              {p.url && <div className="text-[0.85em] text-gray-600"><E path={`projects.${i}.url`}>{p.url}</E></div>}
            </div>
          ))}
        </>
      )}

      {resume.awards.length > 0 && (
        <>
          <H>Honors & Awards</H>
          <ul className="list-disc ml-5 text-[0.95em]">
            {resume.awards.map((a, i) => (
              <li key={a.id} className={itemCls(a)}><b><E path={`awards.${i}.title`}>{a.title}</E></b>, <E path={`awards.${i}.awarder`}>{a.awarder}</E> (<E path={`awards.${i}.date`}>{a.date}</E>){a.summary && `. ${a.summary}`}</li>
            ))}
          </ul>
        </>
      )}

      {resume.skills.length > 0 && (
        <>
          <H>Technical Skills</H>
          <div className="text-[0.93em] space-y-0.5">
            {resume.skills.map((s, i) => (
              <div key={s.id} className={itemCls(s)}><b><E path={`skills.${i}.name`}>{s.name}</E>:</b> {s.keywords.join(", ")}</div>
            ))}
          </div>
        </>
      )}

      {resume.languages.length > 0 && (
        <>
          <H>Languages</H>
          <div className="text-[0.93em]">{resume.languages.map((l, i) => `${l.language} (${l.fluency})`).join("; ")}</div>
        </>
      )}
    </div>
  );
}
